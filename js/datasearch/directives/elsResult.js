(function () {
    'use strict';

    angular.module('datasearch.directives').directive('elsResult', ['CONFIG','hash', '$sce', '$timeout', '$rootScope', '$window', function (CONFIG, hash, $sce, $timeout, $rootScope, $window) {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                result: '=',
                explain: '=',
                toggle: '=',
                workbench: '='
            },
            templateUrl: '/templates/els-result.html',
            link: function (scope) {
                var CLOSE_EVENT = 'CLOSE';
                var typeColors = {};
                var typeLabels = {};
                var hasGeoData = false;
                var map = null;
                var geoDescription = '';
                var INIT_FEATURE = {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [0.0, 0.0]
                    }
                };
                var scale = L.control.scale({
                    'position': 'bottomleft',
                    'metric':true,
                    'imperial': false
                });
                var tileLayer = $window.L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
                    attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU,<br/>UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
                    maxZoom: 10
                });
                var geoLayer = $window.L.geoJson(INIT_FEATURE, {
                    onEachFeature: bindId,
                    pointToLayer: drawMarker
                });
                geoLayer.clearLayers();

                function bindId(feature, layer) {
                    if (feature.properties && feature.properties.id) {
                        layer.bindPopup(feature.properties.id);
                    }
                }

                function drawMarker(feature, latlng) {
                    return $window.L.circleMarker(latlng, {
                        radius: 6,
                        fillColor: '#ff924d',
                        color: '#ff6300',
                        weight: 1,
                        opacity: 1,
                        fillOpacity: 0.8
                    });
                }

                function sign(x) {
                    return x >= 0 ? 1 : -1;
                }

                function explainExists(assetId) {
                    return scope.explain !== undefined && scope.explain[assetId] !== undefined;
                }

                function renderMap(id) {
                    if (map == null) {
                        map = $window.L.map('inline-preview-map-' + id);
                        map.addControl(scale);
                        map.addLayer(tileLayer);
                        map.addLayer(geoLayer);
                        map.on('moveend', function() {
                            var description = scope.latLngAsText(map.getCenter());
                            scope.current.description = $sce.trustAsHtml(description);
                            return description;
                        });
                    }
                    $timeout(function(){
                        map.fitBounds(geoLayer.getBounds());
                        map.invalidateSize(); // force map tiles to be loaded once control is rendered
                    });
                }

                scope.latLngAsText = function(latLng) {
                    return '<p><strong>Centre Point of Location:</strong></p><p>' +
                        'Latitude: ' + Math.abs(latLng.lat.toFixed(2)) + '&deg;' + 'N S'.substr(1 - sign(latLng.lat),1) + '<br/>' +
                        'Longitude: ' + Math.abs(latLng.lng.toFixed(2)) + '&deg;' + 'E W'.substr(1 - sign(latLng.lng),1) + '</p>';
                };

                scope.inline = false;
                scope.typeList = [];
                scope.current = {index: 0};
                var matchingAssets = scope.result.assets.filter(function(a){return a.hasOwnProperty('score')});

                scope.nonMatchingAssetCount = scope.result.assets.filter(function(a){return !a.hasOwnProperty('score')}).length;

                CONFIG.searchParameterOptions.type.forEach(function(t) {
                    var count = matchingAssets.filter(function(a){return a.type == t.id}).length;
                    if (count > 0) {
                        scope.typeList.push({
                            'label': t.label,
                            'count': count,
                            'color': {'color': t.badge.color},
                            'background': {'background-color': t.badge.color}
                        });
                    }
                    typeColors[t.id] = t.badge.color;
                    typeLabels[t.id] = t.label;
                });
                scope._id = scope.result.source + ':' + hash.calculate(scope.result.id);
                scope.source = CONFIG.searchParameterOptions.source.filter(function(s){return s.id === scope.result.source}).pop();
                scope.assetList = [];
                scope.assetList.push({
                    'type': 'CONTAINER',
                    'color': {'color': '#000'},
                    'title': 'Description',
                    'href': scope.result.assets[0]._links.dataset.href,
                    'previewType': 'DESCRIPTION',
                    'selected': true,
                    'matching': true
                });
                scope.result.assets.forEach(function(a){
                    var asset = {
                        'type': a.type,
                        'label': typeLabels[a.type],
                        'color': {'color': typeColors[a.type]},
                        'background': {'background-color': typeColors[a.type]},
                        'title': a.title,
                        'href': a._links.dataset.href,
                        'selected': false,
                        'description': a.description,
                        'matching': a.hasOwnProperty('score'),
                        'explain': explainExists(a.solrId) ? scope.explain[a.solrId] : ''
                    };
                    if (a._links && a._links.preview) {
                        asset.previewType = a._links.preview.type.indexOf("image/") == 0? 'IMAGE': 'IFRAME';
                        asset.src = a._links.preview.href;
                    }
                    if (a.location) {
                        hasGeoData = true;
                        geoLayer.addData(a.location);
                    }
                    scope.assetList.push(asset);
                });

                scope.result.score = scope.result.assets[0].score;

                scope.setCurrent = function(index) {
                    index = index % scope.assetList.length;
                    if (index < 0) {
                        index = scope.assetList.length-1;
                    }
                    scope.assetList.forEach(function(r,i){r.selected = (index == i)});
                    scope.current = scope.assetList[index];
                    scope.current.index = index;
                };
                scope.open = function() {
                    $rootScope.$broadcast(CLOSE_EVENT);
                    scope.inline = true;
                };
                scope.$on(CLOSE_EVENT, function() {
                    scope.inline = false;
                });
                scope.$watch('current', function(newValue) {
                    if (newValue && newValue.previewType === 'LOCATION') {
                        renderMap(scope._id);
                    }
                });
                if (hasGeoData) {
                    scope.assetList.push({
                        'type': 'LOCATION',
                        'color': {'color': '#000'},
                        'title': 'Location Details',
                        'previewType': 'LOCATION',
                        'description': geoDescription,
                        'selected': false,
                        'matching': true
                    });
                }

                scope.getMatching = function(assetList) {
                    var matchingOnly = [];
                    assetList.forEach(function(a) {
                        if (a.matching == true && a.title != "Description" && a.title != "Location Details") {
                           matchingOnly.push(a);
                        }
                    });

                    return matchingOnly;
                };

                scope.toggleExplain = function() {
                    scope.toggle = !scope.toggle;
                };

                scope.setCurrent(0);
            }
        };
    }]);
})();