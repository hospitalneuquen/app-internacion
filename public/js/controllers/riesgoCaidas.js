'use strict';

angular.module('app').controller('RiesgoCaidasController', ['$scope', 'Plex', 'plexParams', 'Shared', 'Server', '$timeout', '$alert', function($scope, Plex, plexParams, Shared, Server, $timeout, $alert) {
    angular.extend($scope, {
        internacion: null,
        riesgoCaida: {
            caidasPrevias: null,
            marcha: null,
            ayudaDeambular: null,
            venoclisis: null,
            comorbilidad: null,
            estadoMental: null,
            total: null
        },
        actualizarRiesgoCaida: function() {
            if (this.internacion && this.internacion.ingreso && this.internacion.ingreso.enfermeria && this.internacion.ingreso.enfermeria.riesgoCaida) {
                var total = 0;
                for (var p in this.internacion.ingreso.enfermeria.riesgoCaida) {
                    if (p != 'total')
                        total += this.internacion.ingreso.enfermeria.riesgoCaida[p] || 0;
                }
                this.internacion.ingreso.enfermeria.riesgoCaida.total = total;
            }
        },
        guardar: function() {
            Server.patch('/api/internacion/internacion/' + plexParams.idInternacion + '/riesgoCaidas', $scope.riesgoCaida).then(function(data) {
                Plex.closeView();
            }, function() {

            });
        },
        init: function() {
            Server.get("/api/internacion/internacion/" + plexParams.idInternacion, {}, {
                updateUI: false
            }).then(function(internacion) {
                if (!internacion) {
                    alert("No se ha podido encontrar la internacion");
                } else {
                    $scope.internacion = internacion;
                    $scope.riesgoCaida = internacion.enfermeria.riesgoCaida;
                }
            });
        },




    });

    $scope.init();

    // Watches
    $scope.$watch('internacion.ingreso.enfermeria.riesgoCaida', function(current, old) {
        if (current != old)
            $scope.actualizarRiesgoCaida();
    }, true);
}]);
