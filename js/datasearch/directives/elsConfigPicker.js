(function () {
    'use strict';

    angular.module('datasearch.directives').directive('elsConfigPicker', ['$document', '$http', function ($document, $http) {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: '/templates/els-configpicker.html',
            scope: {
                panel : '@',
                selectedConfig : '=',
                parametersForm: '='
            },
            link: function(scope){
                scope.selectedConfig = {};
                scope.selectedConfig.displayName = "Select configuration file for panel " + scope.panel;

                function showModal(panel) {
                    $document.find('#modal' + panel).modal({show: true});
                }

                function loadOptions() {
                    $http.get('/indexed/api/v2/admin/boost-params/sandbox/').success(function (data) {
                            scope.gridOptions.data = data;
                        });
                }

                scope.showModalSelector = function(panel){
                    showModal(panel);
                    loadOptions();
                };

                scope.registerNameChange = function() {
                    scope.parametersForm.$dirty = (scope.selectedConfig.boostParams !== undefined);
                }
            }
        };
    }])
})();
