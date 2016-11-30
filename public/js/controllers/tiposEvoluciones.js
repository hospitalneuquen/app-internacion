angular.module('app').controller('TiposEvolucionesController', ['$scope', 'Plex', 'TiposEvoluciones', 'Server', 'Global', function($scope, Plex, TiposEvoluciones, Server, Global) {
    'use strict';

    angular.extend($scope, {
        tiposEvoluciones: [],
        tiposEvolucionesEdit: false,
        showToolbar: true,

        editar: function(tipoEvolucion) {
            console.log(tipoEvolucion);
            if (tipoEvolucion){
                // angular.copy(tipoEvolucion, $scope.evolucionesEdit);

                $scope.tiposEvolucionesEdit = tipoEvolucion;

                // if (tipoEvolucion.idTipoIndicacion){
                //     $scope.tiposEvolucionesEdit.idTipoIndicacion = Global.getById($scope.tiposEvolucionesPadre, tipoEvolucion.idTipoIndicacion);
                // }
            }else{
                $scope.tiposEvolucionesEdit = {};
                // $scope.tiposEvolucionesEdit = {
                //     estado: 'desocupada',
                //     tipoCama: 'cama',
                //     oxigeno: false,
                //     desinfectada: false,
                //
                // };
            }
            console.log( $scope.evolucionesEdit);
            $scope.showToolbar = false;
        },

        guardar: function() {
            TiposEvoluciones.post($scope.tiposEvolucionesEdit.id || null, $scope.tiposEvolucionesEdit, {
                minify: false
            }).then(function(data) {
                Plex.alert('Tipo de indicación guardada');

                $scope.tiposEvoluciones.push(data);
                $scope.cancelar();
            });
        },

        cancelar: function() {
            $scope.tiposEvolucionesEdit = false;
            $scope.showToolbar = true;
        },

        init: function() {
            // obtenemos las camas para armar el mapa
            TiposEvoluciones.get().then(function(data) {
                $scope.tiposEvoluciones = data;
            });
        }
    });

    // iniciamos el controller
    $scope.init();

    Plex.initView({
        title: "Tipos de evoluciones"
    });

}]);
