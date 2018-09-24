(function () {
    'use strict';

    angular.module('datasearch.services').factory('indexedApi', ['$http', '$filter','$q','ELS_FORMATS',
        function($http, $filter, $q, ELS_FORMATS) {
            return {
                search: function(search) {
                    var deferred = $q.defer();
                    var params = {
                        page: search.page,
                        query: search.terms,
                        source: Object.keys(search.sources),
                        type: Object.keys(search.types),
                        sort : search.sort
                    };

                    if (search.publicationDate) {
                        params.minPublicationDate = $filter('date')(search.publicationDate.min, ELS_FORMATS.ISO_DATE_FORMAT);
                        params.maxPublicationDate = $filter('date')(search.publicationDate.max, ELS_FORMATS.ISO_DATE_FORMAT);
                    }

                    $http.get('/indexed/api/v2/search', {params: params})
                    .success(function(data) {
                        if (data.facets.range.publicationDate) {
                            data.facets.range.publicationDate.min = new Date(data.facets.range.publicationDate.min);
                            data.facets.range.publicationDate.max = new Date(data.facets.range.publicationDate.max);
                        }
                        deferred.resolve(data);
                    })
                    .error(function(data, status) {
                        var msgData = data || {message: 'NA'};
                        deferred.reject({ status: status, message: msgData.message });
                    });
                    return deferred.promise;
                }
            };
        }
    ]);
})();