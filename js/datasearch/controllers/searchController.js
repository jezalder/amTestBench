(function () {
    'use strict';

    angular.module('datasearch.controllers').controller('searchController', ['$window', '$log', '$scope', '$rootScope', '$document', '$routeParams', '$location', '$q', '$filter', 'indexedApi', 'CONFIG', 'ELS_EVENTS', 'ELS_FORMATS',
        function ($window, $log, $scope, $rootScope, $document, $routeParams, $location, $q, $filter, indexedApi, CONFIG, ELS_EVENTS, ELS_FORMATS) {

            $scope.alerts = [];
            $scope.loading = false;
            $scope.pagesRemaining = false;
            $scope.pageOfResults = {};
            $scope.searchInfo = '';
            $scope.filters = {
                type: [],
                source: []
            };

            Query.prototype.isFiltered = function() {
                if (Object.keys(this.types).length) {
                    return true;
                }
                if (Object.keys(this.sources).length) {
                    return true;
                }
                return !!this.publicationDate;
            };

            function parseSet(array) {
                if (!array) {
                    return {}
                }
                if (!(array instanceof Array)) {
                    array = array.split(',');
                }
                return array.reduce(function(hash, it){hash[it]=true; return hash}, {});
            }

            function parseDate(str) {
                return $filter('date')(str, ELS_FORMATS.ISO_DATE_FORMAT);
            }

            function dateOf(str) {
                return new Date(parseDate(str));
            }

            function Query(params) {
                this.terms = params.terms || '';
                this.types = parseSet(params.type);
                this.sources = parseSet(params.source);
                this.publicationDate = null;
                if (params.minPublicationDate) {
                    this.publicationDate = {
                        min: new Date(params.minPublicationDate),
                        max: new Date(params.maxPublicationDate)
                    };
                }
                if (params.sort) {
                    this.sort = params.sort;
                }
                this.page = 0;
            }

            function indexedSearch(search) {
                var deferred = $q.defer();
                if (search.terms.length > 0) {
                    $scope.loading = true;
                    indexedApi.search(search).then(function (data) {
                        if (data.containerCount > 0) {
                            if (!angular.isDefined($scope.pageOfResults.count) || $scope.pageOfResults.count == 0) {
                                $scope.pageOfResults.count = data.containerCount;
                                $scope.pageOfResults.results = data.results;
                                $scope.searchInfo = data.containerCount + ' Results';
                                $scope.filters = {
                                    type: CONFIG.searchParameterOptions.type.map(function (it) {
                                        return {
                                            id: it.id,
                                            label: it.label,
                                            active: !!$scope.query.types[it.id],
                                            badge: it.badge,
                                            count: data.facets.list.type[it.id] || 0
                                        }
                                    }).filter(function(it){ return it.count }),
                                    source: CONFIG.searchParameterOptions.source.map(function (it) {
                                        return {
                                            id: it.id,
                                            label: it.label,
                                            active: !!$scope.query.sources[it.id],
                                            icon: it.icon,
                                            count: data.facets.list.source[it.id] || 0
                                        }
                                    }).filter(function(it){ return it.count })
                                };
                                if (data.facets.range.publicationDate) {
                                    $scope.filters.minDate = data.facets.range.publicationDate.min;
                                    $scope.filters.maxDate = data.facets.range.publicationDate.max;

                                    if ($routeParams.minPublicationDate) {
                                        $scope.filters.minDate = parseDate(new Date(Math.max(dateOf($scope.filters.minDate), dateOf($routeParams.minPublicationDate))));
                                    }
                                    if ($routeParams.maxPublicationDate) {
                                        $scope.filters.maxDate = parseDate(new Date(Math.min(dateOf($scope.filters.maxDate), dateOf($routeParams.maxPublicationDate))));
                                    }
                                }
                            } else {
                                $scope.pageOfResults.results.push.apply($scope.pageOfResults.results, data.results);
                            }
                            $scope.pagesRemaining = (search.page + 1) * CONFIG.pageSize < $scope.pageOfResults.count;
                        } else {
                            $scope.searchInfo = 'Your query did not return any results';
                            $scope.pageOfResults = {};
                        }
                        deferred.resolve();
                    }).catch(function (error) {
                        $log.log('ERROR [' + error.status + ']: ' + error.message);
                        $scope.addAlert('danger', 'Something has gone wrong. Please try again...');
                        $scope.pageOfResults = {};
                        deferred.reject();
                    }).finally(function () {
                        $scope.loading = false;
                    });
                } else {
                    deferred.reject();
                }
                return deferred.promise;
            }

            function selectionChanged(filter, selected) {
                $scope.query[filter] = selected;
                fetchFirstPage($scope.query);
            }

            function fetchFirstPage(search) {
                $scope.pageOfResults = {};
                search.page = 0;
                indexedSearch(search);
            }

            function setTitle(search) {
                var title = 'Elsevier Datasearch';
                if (search.terms) {
                    title = search.terms + ' - ' + title;
                }
                $window.document.title = title;
            }

            $scope.fetchNextPage = function() {
                $scope.query.page += 1;
                return indexedSearch($scope.query);
            };

            $scope.nextPage = function(scrolledY, remainingY) {
                if (remainingY < 50 && $scope.pagesRemaining) {
                    $scope.fetchNextPage();
                }
            };

            $scope.search = function (terms) {
                $location.path('/search/' + terms);
            };

            $scope.typeSelectionChanged = function (selected) {
                selectionChanged('types', selected);
                $location.search('type', Object.keys($scope.query.types));
            };

            $scope.sourceSelectionChanged = function (selected) {
                selectionChanged('sources', selected);
                $location.search('source', Object.keys($scope.query.sources));
            };

            $scope.resetSelections = function() {
                clearPublicationDateLimits();
                $scope.sourceSelectionChanged({});
                $scope.typeSelectionChanged({});
                $rootScope.$broadcast(ELS_EVENTS.RESET);
            };

            function clearPublicationDateLimits() {
                delete $scope.query.publicationDate;
                $location.search('minPublicationDate', null);
                $location.search('maxPublicationDate', null);
            }

            $scope.isAnySelectionApplied = function() {
                return Object.keys($scope.query.types).length > 0 || Object.keys($scope.query.sources).length > 0 || $scope.query.publicationDate != null;
            };

            $scope.applyPublicationDateLimits = function(fromDate, toDate) {
                $scope.query.publicationDate = {
                        min: parseDate(fromDate),
                        max: parseDate(toDate)
                };
                $location.search('minPublicationDate', $scope.query.publicationDate.min);
                $location.search('maxPublicationDate', $scope.query.publicationDate.max);
                fetchFirstPage($scope.query);
            };

            $scope.applySort = function(it) {
                $location.search('sort', it);
            };

            $scope.addAlert = function (type, message) {
                $scope.alerts.push({type: type, msg: message});
            };

            $scope.closeAlert = function (index) {
                $scope.alerts.splice(index, 1);
            };

            $scope.selectResult= function(index) {
                $scope.pageOfResults.results.forEach(function(r,i){r.cssClass = (i == index)?'active':''});
            };

            $scope.$watch('query.terms', function (newValue, oldValue) {
                if (newValue.length == 0 && oldValue.length > 0) {
                    $scope.query.page = 0;
                    $scope.query.terms = '';
                    $scope.resetSelections();
                    $scope.search('');
                }
            });

            $scope.query = new Query($routeParams);

            indexedSearch($scope.query);
            setTitle($scope.query);

            angular.element('#search-terms').focus();
        }
    ]);
})();