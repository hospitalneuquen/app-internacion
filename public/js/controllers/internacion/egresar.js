'use strict';

angular.module('app').controller('internacion/egresar', ['$scope', 'Plex', 'plexParams', 'Server', 'Shared', 'Session', function($scope, Plex, plexParams, Server, Shared, Session) {
    angular.extend($scope, {

        // opciones para el select del tipo de internacion
        tiposEgresos: [{
            id: 'pase',
            nombre: 'Pase'
        }, {
            id: 'alta',
            nombre: 'Alta'
        }, {
            id: 'defuncion',
            nombre: 'Defunción'
        }, ],
        egreso: {
            fechaHora: null,
            tipo: null,
            cama: null,
        },

        egresar: function() {
            if ($scope.egreso.tipo == 'alta' || $scope.egreso.tipo == 'defuncion') {
                var data = {
                    estado: 'egresado',
                    egreso: $scope.egreso
                };
            } else if ($scope.egreso.tipo == 'pase') {
                var data = {
                    estado: 'enPase'
                };
            }

            Shared.internacion.post(plexParams.idInternacion, data, {
                minify: true
            }).then(function(internacion) {
                // TODO: Definir que hacer en caso de que sea defuncion o alta,
                // si hay que llenar algun otro formulario

                // // si es un egreso por pase, entonces lo creamos
                // if ($scope.egreso.tipo == 'pase') {
                //     var pase = {
                //         fechaHora: new Date(),
                //         servicio: Session.servicioActual.id,
                //         cama: plexParams.idCama
                //     }
                //
                //     Shared.pase.post(plexParams.idInternacion, null, pase, {
                //         minify: true
                //     }).then(function() {
                //         Plex.closeView(internacion);
                //     });
                //
                // } else {
                //     Plex.closeView(internacion);
                // }

                Plex.closeView(internacion);

            });
        },

        cancelarEgreso: function() {
            Plex.closeView();
        },

        init: function() {
            // buscamos los datos de la internacion
            Server.get('/api/internacion/internacion/' + plexParams.idInternacion).then(function(data) {
                $scope.internacion = data;

                $scope.egreso.cama = plexParams.idCama
            });
        }
    });

    $scope.init();

    Plex.initView({
        title: "Egresar paciente de internación"
    });
}]);
