(function () {
    'use strict';

    angular.module('angulartics.userzoom', ['angulartics'])
        .config(['$analyticsProvider', '$windowProvider', function ($analyticsProvider, $windowProvider) {
            var $window = $windowProvider.$get();

            var noop = function(){};

            var _getUz = function() {
                return $window._uz_tracking || { trackHTML: noop };
            };

            $analyticsProvider.registerEventTrack(function(action) {
                _getUz().trackHTML(action);
            });
        }]);
})();