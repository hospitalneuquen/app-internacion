'use strict';

angular.module('plex').directive("plexMap", ["Plex", function (Plex) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            var map;
            var center;
            var marker;
            var updateCenter = function (pos) {
                if (map) { // Inicializó ?
                    map.setCenter(pos ? new google.maps.LatLng(pos.latitud || pos.lat, pos.longitud || pos.lng) : new google.maps.LatLng(-38.9524444, -68.06413889999999));
                };
            }
            var updateMarker = function (pos) {
                if (map) { // Inicializó ?
                    if (marker)
                        marker.setMap(null);

                    if (pos)
                        marker = new google.maps.Marker({
                            position: new google.maps.LatLng(pos.latitud || pos.lat, pos.longitud || pos.lng),
                            map: map
                        });
                }
            };

            // Async load
            require(['async!//maps.googleapis.com/maps/api/js?sensor=false'], function () {
                // Dibuja el mapa en el centro especificado (o sino centrado en Neuquén)
                center = scope.$eval(attrs.center);
                map = new google.maps.Map(element[0], {
                    center: center ? new google.maps.LatLng(center.latitud || center.lat, center.longitud || center.lng) : new google.maps.LatLng(-38.9524444, -68.06413889999999),
                    zoom: 15,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });

                updateMarker(scope.$eval(attrs.marker));
            });

            // Watches
            scope.$watch(attrs.center, function (pos) {
                updateCenter(pos);
            });
            scope.$watch(attrs.marker, function (pos) {
                updateMarker(pos);
            });
        }
    }
}]);