(function () {
    'use strict';

    angular.module('datasearch.directives').directive('elsScroll', ['$window', function ($window) {
        return {
            restrict: 'A',
            transclude: false,
            scope: {
                onScroll: '&'
            },
            link: function (scope, element) {
                angular.element($window).bind('scroll', function () {
                    var scrolledY = this.pageYOffset + this.innerHeight;
                    var remainingY = Math.abs($(element[0]).offset().top + $(element[0]).outerHeight(true) - scrolledY);
                    scope.onScroll()(scrolledY, remainingY);
                });
            }
        }
    }]);
})();