angular.module('datasearch', ['ngRoute', 'ui.bootstrap', 'angulartics', 'angulartics.userzoom', 'datasearch.services', 'datasearch.controllers', 'datasearch.directives', 'datasearch.filters'])
    .constant('ELS_EVENTS', {
        'RESET': '__ELS_RESET',
        'CLOSE': '__ELS_CLOSE'
    })
    .constant('ELS_FORMATS', {
        'ISO_DATE_FORMAT': 'yyyy-MM-dd'
    })
    .config(['$analyticsProvider', function ($analyticsProvider) {
        $analyticsProvider.firstPageview(false); // cf. https://github.com/angulartics/angulartics/issues/181
    }]);
angular.module('datasearch.services', []);
angular.module('datasearch.controllers', []);
angular.module('datasearch.directives', []);
angular.module('datasearch.filters', []);
angular.module('ui.grid',[]);
angular.module('ui.grid.selection',[]);
angular.module('ui.grid.autoResize',[]);

