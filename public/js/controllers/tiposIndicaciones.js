angular.module('app').controller('TiposIndicacionesController', ['$scope', 'Plex', 'TiposIndicaciones', 'TiposEvoluciones', 'Server', 'Global', function($scope, Plex, TiposIndicaciones, TiposEvoluciones, Server, Global) {
    'use strict';

    angular.extend($scope, {
        tiposIndicaciones: [],
        tiposEvoluciones: [],
        tiposIndicacionesEdit: false,
        showToolbar: true,

        editar: function(tipoIndicacion) {
            if (tipoIndicacion){
                // $scope.tiposIndicacionesEdit = tipoIndicacion;
                $scope.tiposIndicacionesEdit = {};
                angular.copy(tipoIndicacion, $scope.tiposIndicacionesEdit);
            }else{
                $scope.tiposIndicacionesEdit = {
                    estado: 'desocupada',
                    tipoCama: 'cama',
                    oxigeno: false,
                    desinfectada: false,

                };
            }


            $scope.showToolbar = false;
        },

        guardar: function() {
            TiposIndicaciones.post($scope.tiposIndicacionesEdit.id || null, $scope.tiposIndicacionesEdit, {
                minify: false
            }).then(function(data) {
                Plex.alert('Tipo de indicación guardada');

                $scope.tiposIndicaciones.push(data);
                $scope.cancelar();
            });
        },

        cancelar: function() {
            $scope.tiposIndicacionesEdit = false;
            $scope.showToolbar = true;
        },

        init: function() {
            TiposEvoluciones.get().then(function(data) {
                $scope.tiposEvoluciones = data;
            });
            TiposIndicaciones.getPadres().then(function(data) {
                $scope.tiposIndicacionesPadre = data;
                // $scope.tiposIndicacionesPadre.unshift({
                //     id: null,
                //     nombre: 'Indicación padre'
                // });
            });
            // obtenemos las camas para armar el mapa
            TiposIndicaciones.get().then(function(data) {
                $scope.tiposIndicaciones = data;

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
        title: "Tipos de indicaciones"
    });

    $scope.$watch('tiposIndicacionesEdit.evolucionable', function(current, old) {
        if (typeof current != "undefined" ) {
            if (!current){
                $tiposIndicacionesEdit.tipoEvolucion = {};
            }
        }
    });
}]);
