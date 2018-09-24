(function () {
    'use strict';

    angular.module('admin.controllers')
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/', {
                    templateUrl: '/templates/admin.html',
                    controller: 'adminController'
                })
                .when('/workbench', {
                    templateUrl: '/templates/workbench.html',
                    controller: 'workbenchController'
                })
                .otherwise({
                    redirectTo: '/'
                });
        }]);
})();