angular.module('app').controller('TiposEvolucionesController', ['$scope', 'Plex', 'TiposEvoluciones', 'Server', 'Global', function($scope, Plex, TiposEvoluciones, Server, Global) {
    'use strict';

    angular.extend($scope, {
        tiposEvoluciones: [],
        tiposEvolucionesEdit: false,
        showToolbar: true,

        editar: function(tipoEvolucion) {

            if (tipoEvolucion){
                angular.copy(tipoEvolucion, $scope.evolucionesEdit);
                // $scope.tiposEvolucionesEdit = tipoEvolucion;
                $scope.tiposEvolucionesEdit.idTipoIndicacion = Global.getById($scope.tiposEvolucionesPadre, tipoEvolucion.idTipoIndicacion);
            }else{
                $scope.tiposEvolucionesEdit = {
                    estado: 'desocupada',
                    tipoCama: 'cama',
                    oxigeno: false,
                    desinfectada: false,

                };
            }

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
                // console.log(data);
                $scope.tiposEvoluciones = data;

                // var idServicios = [];
                // angular.forEach($scope.camas, function(cama, key) {
                //
                //     // asignamos los tipos de camas
                //     if (!$scope.tipoCamas.inArray(cama.tipoCama)) {
                //         $scope.tipoCamas.push(cama.tipoCama);
                //     }
                //
                //     // asignamos los tipos de camas
                //     if (!$scope.sectores.inArray(cama.sector)) {
                //         $scope.sectores.push(cama.sector);
                //     }
                //
                //     // asignamos los servicios en base a los servicios
                //     // que tiene cada cama
                //     if (cama.servicio && typeof cama.servicio.id !== "undefined") {
                //
                //         if ($scope.servicios.length == 0) {
                //             $scope.servicios.push(cama.servicio);
                //             idServicios.push(cama.servicio._id);
                //         } else {
                //             if ($.inArray(cama.servicio._id, idServicios) == -1) {
                //                 $scope.servicios.push(cama.servicio);
                //                 idServicios.push(cama.servicio._id);
                //             }
                //         }
                //     }
                // });

            });

        }
    });

    // iniciamos el controller
    $scope.init();

    Plex.initView({
        title: "Tipos de evoluciones"
    });

}]);
