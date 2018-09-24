(function () {
    'use strict';

    angular.module('datasearch.services').factory('hash', [
        function() {
            return {
                calculate: function(o) {
                    var hash = 0, i, chr, len;
                    if (o.length == 0) return hash;
                    for (i = 0, len = o.length; i < len; i++) {
                        chr   = o.charCodeAt(i);
                        hash  = ((hash << 5) - hash) + chr;
                        hash |= 0; // Convert to 32bit integer
                    }
                    return hash;
                }
            };
        }
    ]);
})();