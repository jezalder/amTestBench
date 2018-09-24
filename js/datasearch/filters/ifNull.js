(function () {
    'use strict';

    angular.module('datasearch.filters').filter('ifNull', function () {
        return function (input, expression) {
            return (input || '').length > 0 ? input : expression;
        }
    })
})();