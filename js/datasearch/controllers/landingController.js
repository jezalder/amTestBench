(function () {
    'use strict';

    angular.module('datasearch.controllers').controller('landingController', ['$scope', '$location', function ($scope, $location) {
        $scope.search = function(terms) {
            if (terms) {
                $location.path('/search/' + terms);
            }
            return false;
        };
    }]);
})();
