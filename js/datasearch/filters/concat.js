(function () {
    'use strict';

    angular.module('datasearch.filters').filter('concat', function () {
        return function (input) {
            var out;
            switch ((input || []).length) {
                case 0:
                    out = 'Authors unknown';
                    break;
                case 1:
                    out = input[0];
                    break;
                default:
                    out = Array.prototype.concat(input.slice(0, input.length - 1).join(', '), input[input.length - 1]).join(' & ');
                    break;
            }
            return out;
        }
    })
})();