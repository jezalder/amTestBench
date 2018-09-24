(function () {
    'use strict';

    angular.module('datasearch.directives').directive('elsUserMenu', ['authApi',  function (authApi) {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: '/templates/els-usermenu.html',
            link: function (scope) {
                authApi.getAuth().then(function(auth) {
                    scope.userName = auth.name;
                    scope.links = auth._links;
                });
            }
        };
    }])
})();