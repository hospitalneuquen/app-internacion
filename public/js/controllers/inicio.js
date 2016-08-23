'use strict';

angular.module('app').controller('InicioController', ['$scope', 'Plex', 'Shared', 'Session', function($scope, Plex, Shared,Session) {

    angular.extend($scope, {
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
