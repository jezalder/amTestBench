(function () {
    'use strict';

    angular.module('datasearch.services').factory('authApi', ['$http', '$filter', '$q',
        function ($http, $filter, $q) {
            return {
                getAuth: function () {
                    var deferred = $q.defer();
                    $http.get('/indexed/api/v2/auth')
                        .success(function (data) {
                            deferred.resolve(data);
                        })
                        .error(function (data, status) {
                            deferred.reject({status: status, message: data.message});
                        });
                    return deferred.promise;
                }
            };
        }
    ]);
}());