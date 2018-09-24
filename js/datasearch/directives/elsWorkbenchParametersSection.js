(function () {
    'use strict';

    angular.module('datasearch.directives').directive('elsWorkbenchParametersSection', ['$document', 'CONFIG', function ($document, CONFIG) {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: '/templates/els-workbench-parameters-section.html',
            scope: {
                parametersForm: "=",
                panel: "@",
                isFieldsSection: "@",
                header: "@",
                headerLink: "@",
                sectionName: "@",
                slopName: "@",
                slopLabel: "@",
                slopLink: "@",
                parametersToDisplay: "=",
                parametersToAdd: "="
            },

            link: function (scope) {

                function showModal() {
                    scope.modalDialog = $document.find('#parametersmodal' + scope.panel + scope.sectionName).modal({show: true});
                }

                function loadOptions() {
                    var parameters = [];

                    if (scope.sectionName === "parameters") {
                        Object.keys(scope.parametersToAdd).filter(function(p) {
                            return p == "tieBreaker" | p == "minimumMatch" | p == "lowercaseOperators";
                        }).forEach(function (value){
                            parameters.push({"parameter": CONFIG.boostParameterToLabel[value]});
                        });

                    } else {
                        if (scope.parametersToAdd[scope.sectionName] !== undefined) {
                            Object.keys(scope.parametersToAdd[scope.sectionName]).forEach(function (parameter) {
                                parameters.push({"parameter": parameter});
                            });
                        }

                        if (scope.sectionName === "queryFields" && scope.parametersToAdd.hasOwnProperty("querySlop")) {
                            parameters.push({"parameter": CONFIG.boostParameterToLabel["querySlop"]});
                        } else if (scope.sectionName === "phraseFields" && scope.parametersToAdd.hasOwnProperty("phraseSlop")) {
                            parameters.push({"parameter": CONFIG.boostParameterToLabel["phraseSlop"]});
                        } else if (scope.sectionName === "phraseFields2" && scope.parametersToAdd.hasOwnProperty("phraseSlop2")) {
                            parameters.push({"parameter": CONFIG.boostParameterToLabel["phraseSlop2"]});
                        } else if (scope.sectionName === "phraseFields3" && scope.parametersToAdd.hasOwnProperty("phraseSlop3")) {
                            parameters.push({"parameter": CONFIG.boostParameterToLabel["phraseSlop3"]});
                        }
                    }

                    scope.gridOptions.data = parameters;
                }

                scope.showFieldModal = function () {
                    showModal();
                    loadOptions();
                }

                scope.$watch('selectedParameter', function (newValue, oldValue) {
                    if (newValue != undefined && newValue != oldValue && newValue != "") {
                        addField(newValue);
                    }
                });

                scope.removeField = function (section, field) {
                    if (CONFIG.indexedFields.indexOf(field) == -1) {
                        // This parameter is not an indexed field, therefore it is not section specific.
                        delete scope.parametersToDisplay[field];

                        scope.parametersToAdd[field] = undefined;
                    } else {
                        // This parameter is an indexed field, therefore it is section specific.
                        delete scope.parametersToDisplay[section][field];

                        if (!scope.parametersToAdd.hasOwnProperty(section)) {
                            scope.parametersToAdd[section] = {};
                        }
                        scope.parametersToAdd[section][field] = undefined;
                    }
                    scope.selectedParameter = "";
                    scope.parametersForm.$dirty = true;
                }

                function addField(field) {
                    if (CONFIG.indexedFields.indexOf(field) == -1) {
                        // This parameter is not an indexed field, therefore it is not section specific.
                        scope.parametersToDisplay[CONFIG.labelToBoostParameter[field]] = "";

                        delete scope.parametersToAdd[CONFIG.labelToBoostParameter[field]];
                    } else {
                        // This parameter is an indexed field, therefore it is section specific.
                        if (!scope.parametersToDisplay.hasOwnProperty(scope.sectionName)) {
                            scope.parametersToDisplay[scope.sectionName] = {};
                        }
                        scope.parametersToDisplay[scope.sectionName][field] = "";

                        delete scope.parametersToAdd[scope.sectionName][field];
                    }
                    scope.selectedParameter = "";
                }
            }
        };
    }])
})();