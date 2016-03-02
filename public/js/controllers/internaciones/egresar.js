'use strict';

angular.module('app').controller('internaciones/egresar', ['$scope', 'Plex', 'plexParams', 'Server', '$timeout', 'Personas', 'Global', function($scope, Plex, plexParams, Server, $timeout, Personas, Global) {
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
            console.log($scope.egreso);
            // Server.patch('/api/internacion/internacion/' + plexParams.idInternacion + '/editarIngreso', $scope.internacion, {
            //     minify: true
            // }).then(function(data) {
            //     Plex.closeView(data);
            // }, function() {
            //
            // });
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
