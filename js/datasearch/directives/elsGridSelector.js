(function () {
    'use strict';

    angular.module('datasearch.directives').directive('elsGridSelector', ['$document', '$http', function ($document, $http) {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: '/templates/els-gridselector.html',
            link: function(scope){

                scope.gridOptions = { enableRowSelection: true, enableRowHeaderSelection: false };

                scope.gridOptions.columnDefs = [
                    { name: 'name'},
                    { name: 'updatedAt' , cellFilter:'date'}
                ];

                scope.gridOptions.multiSelect = false;
                scope.gridOptions.modifierKeysToMultiSelect = false;
                scope.gridOptions.noUnselect = true;

                scope.gridOptions.onRegisterApi = function( gridApi ) {
                    scope.gridApi = gridApi;
                };

                scope.loadConfig = function(){
                    var selected = scope.gridApi.selection.getSelectedRows()[0];
                    scope.selectedConfig = selected;
                    scope.selectedConfig.displayName = selected.name;
                    scope.selectedConfig.isClone = false;
                };

                scope.cloneConfig = function(){
                    var clonee = scope.gridApi.selection.getSelectedRows()[0];
                    var clone = clonee;
                    clone.name = "New Config - " + new Date();
                    scope.selectedConfig = clone;
                    scope.selectedConfig.displayName = clone.name;
                    scope.selectedConfig.isClone = true;
                };

                scope.isCloneDisabled = function() {
                    return (scope.gridApi === undefined || scope.gridApi.selection === undefined || scope.gridApi.selection.getSelectedRows().length == 0);
                };

            }
        };
    }])
})();
