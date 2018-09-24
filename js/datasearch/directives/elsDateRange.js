(function () {
    'use strict';

    angular.module('datasearch.directives').directive('elsDateRange', ['ELS_EVENTS', 'ELS_FORMATS', function (ELS_EVENTS, ELS_FORMATS) {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                minDate: '=',
                maxDate: '=',
                onApply: '&'
            },
            templateUrl: '/templates/els-daterange.html',
            link: function (scope) {
                function init() {
                    scope.date = {
                        from: null,
                        to: null
                    };

                    scope.failed = {
                        from: false,
                        to: false
                    };
                }

                function isEmpty(s) {
                    return (s || '').length == 0;
                }

                function buildDate(s, d) {
                    return new Date(isEmpty(s)? d: s);
                }

                function isValidDate(d) {
                    return !isNaN(d.getTime());
                }

                scope.ISO_DATE_FORMAT = ELS_FORMATS.ISO_DATE_FORMAT;

                scope.applyDates = function() {
                    if (isEmpty(scope.date.from) && isEmpty(scope.date.to)) {
                        return;
                    }

                    var from = buildDate(scope.date.from, scope.minDate);
                    var to =  buildDate(scope.date.to, scope.maxDate);

                    scope.failed.from = !isValidDate(from);
                    scope.failed.to = !isValidDate(to) || from > to;

                    if (scope.failed.from || scope.failed.to) {
                        return;
                    }

                    scope.onApply()(from, to);
                };

                scope.$on(ELS_EVENTS.RESET, function() {
                    init();
                });

                init();
            }
        };
    }])
})();