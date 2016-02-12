'use strict';

angular.module('app').controller('pacientes/evolucionar', ['$scope', 'Plex', 'plexParams', 'Shared', 'Server', '$timeout', function($scope, Plex, plexParams, Shared, Server, $timeout) {

    angular.extend($scope, {
        internacion: undefined,
        evoluciones: undefined,
        cama: undefined,

        init: function() {

            // buscamos la cama
            Server.get("/api/internacion/cama/" + plexParams.idCama, {}, {
                updateUI: false
            }).then(function(cama) {
                if (!cama) {
                    alert("No se ha podido encontrar la cama");
                } else {
                    $scope.cama = cama;
                }
            });

            // buscamos la internacion
            Server.get("/api/internacion/internacion/" + plexParams.idInternacion, {}, {
                updateUI: false
            }).then(function(internacion) {
                if (!internacion) {
                    alert("No se ha podido encontrar la internacion");
                } else {
                    $scope.internacion = internacion;
                }
            });

            // buscamos todos los datos del paciente que faltan
        },
        guardarEvolucion: function() {
            var dto = {
                paciente: $scope.internacion.paciente.toString(),
                estado: 'ingresado',

                fechaHora: $scope.internacion.fechaHora,
                tipo: $scope.internacion.tipo.id,
                motivo: $scope.internacion.motivo,
                diagnosticoPresuntivo: $scope.internacion.diagnosticoPresuntivo

            };

            Server.patch('/api/internacion/internacion', dto).then(function(data) {
                Plex.closeView(data);
            }, function() {

            });
        }
    });

    $scope.init();

    Plex.initView({
        title: "Evolucionar paciente"
    });
}]);
