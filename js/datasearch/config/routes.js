(function () {
    'use strict';

    angular.module('datasearch.controllers')
        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider
                .when('/search/:terms*?', {
                    templateUrl: '/templates/search.html',
                    controller: 'searchController',
                    reloadOnSearch: false
                })
                .when('/', {
                    templateUrl: '/templates/landing.html',
                    controller: 'landingController'
                })
                .otherwise({
                    redirectTo: '/'
                });
        }]);
})();