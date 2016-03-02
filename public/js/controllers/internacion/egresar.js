'use strict';

angular.module('app').controller('internacion/egresar', ['$scope', 'Plex', 'plexParams', 'Server', 'Shared', function($scope, Plex, plexParams, Server, Shared) {
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
            var data = {
                estado : 'egresado'
            };

            Shared.internacion.post(plexParams.idInternacion, data, {minify: true}).then(function(internacion){
                Plex.closeView(internacion);
            });
        },

        cancelarEgreso: function(){
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
