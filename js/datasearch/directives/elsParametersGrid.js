(function () {
    'use strict';

    angular.module('datasearch.directives').directive('elsParametersGrid', [function () {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: '/templates/els-parametersgrid.html',
            link: function(scope){

                scope.gridOptions = { enableRowSelection: true, enableRowHeaderSelection: false };

                scope.gridOptions.columnDefs = [
                    { name: 'parameter'}
                ];

                scope.gridOptions.multiSelect = false;
                scope.gridOptions.modifierKeysToMultiSelect = false;
                scope.gridOptions.noUnselect = true;

                scope.gridOptions.onRegisterApi = function(gridApi) {
                    scope.gridApi = gridApi;
                };

                scope.selectParameter = function(){
                    scope.selectedParameter = scope.gridApi.selection.getSelectedRows()[0]["parameter"];
                }
            }
        };
    }])
})();
