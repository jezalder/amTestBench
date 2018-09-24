(function () {
    'use strict';

    angular.module('datasearch.directives').directive('elsFacet', function () {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                items: '=',
                onSelectionChange: '=',
                facetTitle: '@'
            },
            templateUrl: '/templates/els-facet.html',
            link: function (scope) {
                scope.toggleFilter = function(item) {

                    var filters = scope.items.reduce(function(base, value){
                        if (value.id === item.id) {
                            value.active = !item.active;
                        }
                        if (value.active) {
                            base[value.id] = value.active;
                        }
                        return base;
                    }, {});

                    scope.onSelectionChange(filters);
                };
            }
        };
    })
})();
