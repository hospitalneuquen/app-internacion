'use strict';

angular.module('app').controller('InicioController', ['$scope', 'Plex', 'Shared', 'Session', function($scope, Plex, Shared,Session) {

    angular.extend($scope, {
        pacientes: [
            {
                nombre: 'Manuel Urbano',
                diagnostico: 'Apendicitis',
                dias: 3
            },
            {
                nombre: 'Ana Antinori',
                diagnostico: 'Dolor cervical',
                dias: 4
            },
            {
                nombre: 'Ed Kristensen',
                diagnostico: 'Trastorno alimenticio',
                dias: 2
            }
        ],
        pasesSerivicio: [
            {
                habitacion: 525,
                cama: 1,
                descripcion: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum luctus quam eget ullamcorper posuere.",
                algo: "Nulla sapien lorem"
            },
            {
                habitacion: 525,
                cama: 2,
                descripcion: "Integer mattis quam sed eros feugiat mattis.  Nullam quis ligula libero. Maecenas suscipit viverra porttitor. Praesent id dignissim sem. Nunc sollicitudin est nec nisl porttitor malesuada. Cras venenatis congue sodales. Maecenas ipsum purus, elementum at enim ut, facilisis sodales enim.",
                algo: "Nulla sapien lorem"
            },
            {
                habitacion: 525,
                cama: 3,
                descripcion: "Aliquam sagittis ultrices ornare. Nullam quis ligula libero. Maecenas suscipit viverra porttitor. Praesent id dignissim sem. Nunc sollicitudin est nec nisl porttitor malesuada. Cras venenatis congue sodales. Maecenas ipsum purus, elementum at enim ut, facilisis sodales enim.",
                algo: "Nulla sapien lorem"
            },
            {
                habitacion: 523,
                cama: 1,
                descripcion: "Maecenas suscipit viverra porttitor. Praesent id dignissim sem. Nunc sollicitudin est nec nisl porttitor malesuada. Cras venenatis congue sodales. Maecenas ipsum purus, elementum at enim ut, facilisis sodales enim.",
                algo: "Nulla sapien lorem"
            },

        ],
        goTo: function(opcion){
            Plex.openView('mapa/' + opcion).then(function(){

            });
        },
        init: function() {
            // obtenemos las camas para armar el mapa
            Shared.Mapa.get(Session.variables.servicioActual.id).then(function(data) {
                $scope.camas = data;

                $scope.camasOcupadas = $scope.camas.filter(function(i){
                    return (i.estado == 'ocupada')
                });

                // ocupacion
                $scope.camasBloqueadas = $scope.camas.filter(function(i){
                    return (i.estado == 'bloqueada')
                });

                // deshabilitadas
                $scope.camasBloqueadas = $scope.camas.filter(function(i){
                    return (i.estado == 'bloqueada')
                });

                $scope.camasDescontaminacion = $scope.camas.filter(function(i){
                    return (i.estado == 'desocupada' && !i.desinfectada)
                });

                $scope.camasReparacion = $scope.camas.filter(function(i){
                    return (i.estado == 'reparacion')
                });

                // disponibles
                $scope.camasDesocupadas = $scope.camas.filter(function(i){
                    return (i.estado == 'desocupada')
                });

                $scope.camasDesocupadasOxigeno = $scope.camas.filter(function(i){
                    return (i.estado == 'desocupada' && i.oxigeno)
                });
            });

        },
        verInternacion: function(idInternacion) {
            Plex.openView('internacion/ver/' + idInternacion + "/0").then(function() {

            });
        }
    });

    // Inicializa vista
    Plex.initView({
        title: "Punto de inicio",
        actions: [{
            title: "Camas",
            icon: "fa fa-bed",
            handler: function() {
                Plex.openView('mapa').then(function() {})
            }
        }]
    });

    $scope.init();
}]);
