(function () {
    'use strict';

    angular.module('admin.controllers').controller('workbenchController', ['$scope', 'workbenchApi', 'CONFIG', '$document', '$log', '$q',
        function ($scope, workbenchApi, CONFIG, $document, $log, $q) {

            $scope.parametersToDisplay = {};
            $scope.parametersAvailableForAddition = {};
            $scope.pageOfResults = {};

            $scope.$watch('selectedConfigA.boostParams', function (newValue, oldValue) {
                if (newValue != undefined && newValue != oldValue) {
                    initializeParametersToDisplayAndToAdd($scope.selectedConfigA.boostParams, $scope.selectedConfigA.name);
                    $scope.workbench.parametersFormA.$dirty = $scope.selectedConfigA.isClone;
                }
            });

            $scope.$watch('selectedConfigB.boostParams', function (newValue, oldValue) {
                if (newValue != undefined && newValue != oldValue) {
                    initializeParametersToDisplayAndToAdd($scope.selectedConfigB.boostParams, $scope.selectedConfigB.name);
                    $scope.workbench.parametersFormB.$dirty = $scope.selectedConfigB.isClone;
                }
            });

            $scope.showPanelParameters = function(selectedConfiguration) {
                return selectedConfiguration !== undefined && selectedConfiguration.boostParams !== undefined;
            };

            $scope.saveConfiguration = function(configurationName, configuration) {
                if (! isNonEmptyString(configurationName)) {
                    $scope.modalMessage = "Please select a configuration first.";
                    $document.find('#workbenchmodal').modal({show: true});
                    return;
                }

                if (configuration === undefined) {
                    $log.log("The configuration model to save cannot be undefined.");
                    return;
                }

                var configurationToSave = buildAllAvailableParametersModel();
                var mergedConfigurations = angular.merge({}, configurationToSave, $scope.defaultBoostParams);

                angular.merge(mergedConfigurations, configuration);
                mergedConfigurations = removeEmptyMapEntries(mergedConfigurations);

                workbenchApi.saveConfiguration(configurationName, mergedConfigurations).then(function(data) {
                    if (configurationName !== $scope.selectedConfigA.displayName &&
                        configurationName !== $scope.selectedConfigB.displayName) {
                        $log.log("Unable to identify configuration to set pristine.");
                    }

                    if (configurationName === $scope.selectedConfigA.displayName) {
                        $scope.workbench.parametersFormA.$setPristine();
                    }
                    if (configurationName === $scope.selectedConfigB.displayName) {
                        $scope.workbench.parametersFormB.$setPristine();
                    }

                    $scope.modalMessage = "Configuration '" + configurationName + "' has been saved.";
                }).catch(function (error) {
                    $log.log('ERROR [' + error.status + ']: ' + error.message);
                    $scope.modalMessage = "Unable to save configuration '" + configurationName + "'.";
                }).finally(function() {
                    $document.find('#workbenchmodal').modal({show: true});
                });
            };

            $scope.search = function(queryTerms) {
                if (! isNonEmptyString(queryTerms)) {
                    $scope.modalMessage = "Please provide search terms.";
                    $document.find('#workbenchmodal').modal({show: true});
                    return;
                }

                var configurationsToSave = needsSaving();
                if (configurationsToSave !== "") {
                    $scope.modalMessage = "Please save configuration(s) " + configurationsToSave + " before searching.";
                    $document.find('#workbenchmodal').modal({show: true});
                    return;
                }

                if (isNonEmptyString($scope.selectedConfigA.displayName)) {
                    $scope.pageOfResults[$scope.selectedConfigA.displayName] = {};
                    indexedSearch($scope.pageOfResults[$scope.selectedConfigA.displayName], queryTerms, encodePlusSign($scope.selectedConfigA.displayName), 0);
                }

                if (isNonEmptyString($scope.selectedConfigB.displayName)) {
                    $scope.pageOfResults[$scope.selectedConfigB.displayName] = {};
                    indexedSearch($scope.pageOfResults[$scope.selectedConfigB.displayName], queryTerms, encodePlusSign($scope.selectedConfigB.displayName), 0);
                }
            };

            $scope.isSearchDisabled = function() {
                return ($scope.selectedConfigA === undefined || $scope.selectedConfigA.boostParams == undefined) &&
                    ($scope.selectedConfigB == undefined || $scope.selectedConfigB.boostParams === undefined);
            };

            function initController() {
                workbenchApi.getDefaultBoostParams().then(function (data) {
                    $scope.defaultBoostParams = data[0];
                });
            }

            function buildAllAvailableParametersModel() {
                var allAvailableParametersModel = {};

                allAvailableParametersModel.queryFields = {};
                allAvailableParametersModel.phraseFields = {};
                allAvailableParametersModel.phraseFields2 = {};
                allAvailableParametersModel.phraseFields3 = {};

                CONFIG.indexedFields.forEach(function(field) {
                    allAvailableParametersModel.queryFields[field] = "";
                    allAvailableParametersModel.phraseFields[field] = "";
                    allAvailableParametersModel.phraseFields2[field] = "";
                    allAvailableParametersModel.phraseFields3[field] = "";
                });

                allAvailableParametersModel.querySlop = "";
                allAvailableParametersModel.phraseSlop = "";
                allAvailableParametersModel.phraseSlop2 = "";
                allAvailableParametersModel.phraseSlop3 = "";
                allAvailableParametersModel.tieBreaker = "";
                allAvailableParametersModel.minimumMatch = "";
                allAvailableParametersModel.lowercaseOperators = "";

                return allAvailableParametersModel;
            }

            function initializeParametersToDisplayAndToAdd(boostParams, configurationName) {
                var allAvailableParametersModel = buildAllAvailableParametersModel();

                $scope.parametersToDisplay[configurationName] = {};
                $scope.parametersAvailableForAddition[configurationName] = {};

                Object.keys(allAvailableParametersModel).forEach(function (topLevelKey) {
                    if (isObject(allAvailableParametersModel[topLevelKey])) {
                        Object.keys(allAvailableParametersModel[topLevelKey]).forEach(function (indexedFieldKey) {
                            if (showParameter(boostParams, topLevelKey, indexedFieldKey)) {
                                if ($scope.parametersToDisplay[configurationName][topLevelKey] === undefined) {
                                    $scope.parametersToDisplay[configurationName][topLevelKey] = {};
                                }
                                $scope.parametersToDisplay[configurationName][topLevelKey][indexedFieldKey] = boostParams[topLevelKey][indexedFieldKey];
                            } else {
                                if ($scope.parametersAvailableForAddition[configurationName][topLevelKey] === undefined) {
                                    $scope.parametersAvailableForAddition[configurationName][topLevelKey] = {};
                                }
                                $scope.parametersAvailableForAddition[configurationName][topLevelKey][indexedFieldKey] = {};
                            }
                        });
                    } else {
                        if (showParameter(boostParams, topLevelKey)) {
                            $scope.parametersToDisplay[configurationName][topLevelKey] = boostParams[topLevelKey];
                        } else {
                            $scope.parametersAvailableForAddition[configurationName][topLevelKey] = {};
                        }
                    }
                });
            }

            function removeEmptyMapEntries(mapWithEmptyEntries) {
                Object.keys(mapWithEmptyEntries).forEach(function(topLevelKey) {
                    if (! isObject(mapWithEmptyEntries[topLevelKey])) {
                        //leaf key
                        if (mapWithEmptyEntries[topLevelKey] === "") {
                            delete mapWithEmptyEntries[topLevelKey];
                        }
                    } else {
                        Object.keys(mapWithEmptyEntries[topLevelKey]).forEach(function (indexedField) {
                            if (mapWithEmptyEntries[topLevelKey][indexedField] === "") {
                                delete mapWithEmptyEntries[topLevelKey][indexedField];
                            }
                        });
                    }
                });

                return mapWithEmptyEntries;
            }

            function needsSaving() {
                var toSave = "";
                if($scope.workbench.parametersFormA.$dirty === true) {
                    toSave = "'" + $scope.selectedConfigA.displayName + "'";
                }
                if ($scope.workbench.parametersFormB.$dirty === true) {
                    if (toSave === "") {
                        toSave = "'" + $scope.selectedConfigB.displayName + "'";
                    } else {
                        toSave = toSave + " and '" + $scope.selectedConfigB.displayName + "'";
                    }
                }
                return toSave;
            }

            function showParameter(configuration, parameter, indexedField) {
                if (indexedField !== undefined) {
                    return configuration !== undefined && configuration[parameter] !== undefined
                        && configuration[parameter][indexedField] !== undefined
                        && configuration[parameter][indexedField] !== $scope.defaultBoostParams[parameter][indexedField];
                } else {
                    return configuration !== undefined && configuration[parameter] !== undefined
                        && configuration[parameter] !== $scope.defaultBoostParams[parameter];
                }
            };

            function isObject(val) {
                return typeof val === 'object';
            };

            function isNonEmptyString(configurationName) {
                return configurationName !== undefined && configurationName.trim() !== "";
            };

            function encodePlusSign(name) {
                // Need to encode '+' when configuration name is sent as query parameter.
                return name.replace('+', "%2B");
            };

            function indexedSearch(pageOfResults, queryTerms, configurationName, page) {
                var deferred = $q.defer();

                workbenchApi.searchWithConfiguration(queryTerms, configurationName, page).then(function (data) {
                    if (data.containerCount > 0) {
                        pageOfResults.count = data.containerCount;
                        pageOfResults.results = data.results;
                        pageOfResults.explain = data.debug.explain;
                    } else {
                        pageOfResults = {};
                    }
                    deferred.resolve();
                }).catch(function (error) {
                    $log.log('ERROR [' + error.status + ']: ' + error.message);
                    pageOfResults = {};
                    deferred.reject();
                });

                return deferred.promise;
            };

            initController();
        }])
})();
