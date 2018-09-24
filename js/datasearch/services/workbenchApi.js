(function () {
    'use strict';

    angular.module('datasearch.services').factory('workbenchApi', ['$http', '$q',
        function($http, $q) {
            return {
                getDefaultBoostParams: function() {
                    var deferred = $q.defer();

                    $http.get('/indexed/api/v2/admin/boost-params/default')
                        .success(function(data) {
                            deferred.resolve(data);
                        })
                        .error(function(data, status) {
                            deferred.reject({ status: status, message: data.message });
                        });
                    return deferred.promise;
                },
                saveConfiguration: function(configurationName, configurationToSave) {
                    var deferred = $q.defer();

                    $http.put('/indexed/api/v2/admin/boost-params/sandbox/' + configurationName, configurationToSave)
                        .success(function(data) {
                            deferred.resolve(data);
                        })
                        .error(function(data, status) {
                            deferred.reject({ status: status, message: data.message });
                        });
                    return deferred.promise;
                },
                searchWithConfiguration: function(queryTerms, configurationName, page) {
                    var deferred = $q.defer();

                    $http.get('/indexed/api/v2/search?query=' + queryTerms + '&queryBoostConfig=' + configurationName + '&page=' + page)
                        .success(function(data) {
                            deferred.resolve(data);
                        })
                        .error(function(data, status) {
                            deferred.reject({ status: status, message: data.message });
                    });
                    return deferred.promise;
                }
            };
        }
    ]);
})();