(function () {
    'use strict';

    angular.module('datasearch.services').factory('adminApi', ['$http', '$filter','$q',
        function($http, $filter, $q) {
            return {
                getQueryBoosting: function() {
                    var deferred = $q.defer();
                    $http.get('/indexed/api/v2/admin/boost-params/active')
                        .success(function(data) {
                            deferred.resolve(data);
                        })
                        .error(function(data, status) {
                            deferred.reject({ status: status, message: data.message });
                        });
                    return deferred.promise;
                },
                updateQueryBoosting: function(queryFields, phraseFields, tieBreaker, querySlop, phraseSlop, minimumMatch, phraseFields2, phraseSlop2, phraseFields3, phraseSlop3, lowercaseOperators) {
                    var deferred = $q.defer();
                    var data = {};
                    data["queryFields"] = queryFields;
                    data["querySlop"] = querySlop;

                    data["phraseFields"] = phraseFields;
                    data["phraseSlop"] = phraseSlop;

                    data["phraseFields2"] = phraseFields2;
                    data["phraseSlop2"] = phraseSlop2;

                    data["phraseFields3"] = phraseFields3;
                    data["phraseSlop3"] = phraseSlop3;

                    data["tieBreaker"] = tieBreaker;
                    data["minimumMatch"] = minimumMatch;
                    data["lowercaseOperators"] = lowercaseOperators;
                    $http.put('/indexed/api/v2/admin/boost-params/active', data)
                        .success(function(data) {
                            deferred.resolve(data);
                        })
                        .error(function(data, status) {
                            deferred.reject({ status: status, message: data.message });
                        });
                    return deferred.promise;
                },
                resetQueryBoosting: function() {
                    var deferred = $q.defer();
                    $http.delete('/indexed/api/v2/admin/boost-params/active')
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