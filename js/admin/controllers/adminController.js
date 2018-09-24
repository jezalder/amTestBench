(function () {
    'use strict';

    angular.module('admin.controllers').controller('adminController', ['$scope', 'adminApi', '$document', 'CONFIG',
        function ($scope, adminApi,  $document, CONFIG) {
            $scope.qfRequiresBoosting = {};
            $scope.qfBoostValue = {};
            $scope.querySlop = "";

            $scope.pfBoostValue = {};
            $scope.phraseSlop = "";

            $scope.pf2BoostValue = {};
            $scope.phraseSlop2 = "";

            $scope.pf3BoostValue = {};
            $scope.phraseSlop3 = "";

            $scope.tieBreaker = "";
            $scope.minimumMatch = "";
            $scope.lowercaseOperators = "";
            $scope.indexedFields = CONFIG.indexedFields;


            function initQueryBoostingFormFields(data) {
                $scope.qfBoostValue = data[0]['queryFields'];
                $scope.querySlop = data[0]['querySlop'];

                $scope.pfBoostValue = data[0]['phraseFields'];
                $scope.phraseSlop = data[0]['phraseSlop'];

                $scope.pf2BoostValue = data[0]['phraseFields2'];
                $scope.phraseSlop2 = data[0]['phraseSlop2'];

                $scope.pf3BoostValue = data[0]['phraseFields3'];
                $scope.phraseSlop3 = data[0]['phraseSlop3'];


                $scope.tieBreaker = data[0]['tieBreaker'];
                $scope.minimumMatch = data[0]['minimumMatch'];
                $scope.lowercaseOperators = data[0]['lowercaseOperators'];
            }

            function initController() {
                adminApi.getQueryBoosting().then(function (data) {
                    initQueryBoostingFormFields(data);
                });
            }

            $scope.cancel = function() {
                initController();
            };

            $scope.saveParams = function () {
                adminApi.updateQueryBoosting(
                    $scope.qfBoostValue, $scope.pfBoostValue,
                    $scope.tieBreaker, $scope.querySlop,
                    $scope.phraseSlop, $scope.minimumMatch,
                    $scope.pf2BoostValue, $scope.phraseSlop2,
                    $scope.pf3BoostValue, $scope.phraseSlop3,
                    $scope.lowercaseOperators
                ).then(function(){
                    $scope.modalMessage="Your settings have been saved.";
                }).catch(function (error) {
                    console.log('ERROR [' + error.status + ']: ' + error.message);
                    $scope.modalMessage="Unable to save your settings. Please try again...";
                }).finally(function() {
                    $document.find('div.modal').eq(0).modal({show: true});
                });
            };

            $scope.resetParams = function () {
                adminApi.resetQueryBoosting().then(function (data) {
                    initQueryBoostingFormFields(data);
                    $scope.modalMessage = "All settings have been reset to system defaults.";
                }).catch(function (error) {
                    console.log('ERROR [' + error.status + ']: ' + error.message);
                    $scope.modalMessage="Unable to restore system defaults. Please try again...";
                }).finally(function() {
                    $document.find('div.modal').eq(0).modal({show: true});
                });
            };

            initController();
        }
    ]);
})();