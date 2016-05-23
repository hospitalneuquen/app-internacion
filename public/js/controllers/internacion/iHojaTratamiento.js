angular.module('app').controller('internacion/iHojaTratamiento', ['$scope', 'Plex', 'Shared', 'Server', '$timeout', 'Session', 'Global', function($scope, Plex, Shared, Server, $timeout, Session, Global) {
    'use strict';

    angular.extend($scope, {
        ultimo: 0, // para armar el listado de indicaciones
        show_toolbar_tratamientos: true,
        loading: true,
        internacion: undefined,
        tratamientosEdit: undefined, // Item actual que se está editando
        indicacion: {},
        editandoIndicacion: false,
        indexIndicacion: undefined,
        frecuencias: [{
            id: '24',
            nombre: 'Una vez al día'
        }, {
            id: '12',
            nombre: 'Cada 12 hs.'
        }, {
            id: '8',
            nombre: 'Cada 8 hs.'
        }, {
            id: '6',
            nombre: 'Cada 6 hs.'
        }, {
            id: '4',
            nombre: 'Cada 4 hs.'
        }],
        filtros: {
            tratamientos: [],
            servicio: null,
            filtrar: function() {
                var self = this;
                $scope.filtros.tratamientos = $scope.internacion.tratamientos;

                // if (!self.servicio) {
                //     $scope.filtros.tratamientos = $scope.internacion.tratamientos;
                // } else {
                //     $scope.filtros.tratamientos = [];
                //     if (self.servicio.id !== "undefined" && self.servicio.id == 'solo-hoy'){
                //         angular.forEach($scope.internacion.tratamientos, function(tratamiento) {
                //             if (self.servicio && tratamiento.fecha == Date.Now()) {
                //                 $scope.filtros.tratamientos.push(tratamiento);
                //             }
                //         });
                //     }else{
                //         angular.forEach($scope.internacion.tratamientos, function(tratamiento) {
                //             if (self.servicio && tratamiento.servicio.id === self.servicio.id) {
                //                 $scope.filtros.tratamientos.push(tratamiento);
                //             }
                //         });
                //     }
                // }
            }

        },

        init: function(internacion) {
            $scope.loading = true;

            // buscamos la internacion
            if (internacion !== null) {
                $scope.internacion = internacion;

                $scope.filtros.tratamientos = internacion.tratamientos;
                $scope.loading = false;

                $scope.filtros.filtrar();

            }
        },
        agregarIndicacion: function(){
            // console.log($scope.indicacion);
            if (typeof $scope.tratamientosEdit.indicaciones == "undefined"){
                $scope.tratamientosEdit.indicaciones = [];
            }

            $scope.tratamientosEdit.indicaciones.push($scope.indicacion);

            $scope.indicacion = {};
        },
        editarIndicacion: function(indicacion, index){
            $scope.editandoIndicacion = true;
            $scope.indexIndicacion = index;
            angular.copy(indicacion, $scope.indicacion);
        },
        guardarIndicacion: function(){
            $scope.tratamientosEdit.indicaciones[$scope.indexIndicacion] = $scope.indicacion;

            $scope.indexIndicacion = undefined;
            $scope.editandoIndicacion = false;
            $scope.indicacion = {};
        },
        cancelarEditarIndicacion: function(){
            $scope.editandoIndicacion = false;
            $scope.indicacion = {};
        },
        // remove: function(item) {
        //     $scope.internacion.tratamientos.splice($scope.internacion.tratamientos.indexOf(item), 1);
        // },

        // Inicia la edición de una evolución
        editarTratamiento: function(tratamiento) {
            $scope.show_toolbar_tratamientos = false;

            if (tratamiento) { // Modificación
                $scope.tituloFormulario = "Editar tratamiento";
                $scope.tratamientosEdit = {};

                angular.copy(tratamiento, $scope.tratamientosEdit);

                // seleccionamos las frecuencias elegidas para cada elemento
                $scope.tratamientosEdit.frecuenciaSignosVitales = Global.getById($scope.frecuencias, $scope.tratamientosEdit.frecuenciaSignosVitales);
                $scope.tratamientosEdit.frecuenciaDiuresis = Global.getById($scope.frecuencias, $scope.tratamientosEdit.frecuenciaDiuresis);
                $scope.tratamientosEdit.frecuenciaPeso = Global.getById($scope.frecuencias, $scope.tratamientosEdit.frecuenciaPeso);
                $scope.tratamientosEdit.frecuenciaGlasgow = Global.getById($scope.frecuencias, $scope.tratamientosEdit.frecuenciaGlasgow);
                $scope.tratamientosEdit.frecuenciaRotarDecubito = Global.getById($scope.frecuencias, $scope.tratamientosEdit.frecuenciaRotarDecubito);
                $scope.tratamientosEdit.frecuenciaAspirarSecreciones = Global.getById($scope.frecuencias, $scope.tratamientosEdit.frecuenciaAspirarSecreciones);
                $scope.tratamientosEdit.frecuenciaKinesiologia = Global.getById($scope.frecuencias, $scope.tratamientosEdit.frecuenciaKinesiologia);
                $scope.tratamientosEdit.frecuenciaOxigeno = Global.getById($scope.frecuencias, $scope.tratamientosEdit.frecuenciaOxigeno);
                $scope.tratamientosEdit.cualAislamiento = Global.getById($scope.frecuencias, $scope.tratamientosEdit.cualAislamiento);

            } else { // Alta
                $scope.tituloFormulario = "Agregar tratamiento";

                // Valores por defecto
                $scope.tratamientosEdit = {
                    fecha: new Date(),
                    servicio: Session.variables.servicioActual,
                };
            }
        },
        // Cancelar la edición
        cancelarEdicion: function() {
            $scope.tratamientosEdit = null;
            $scope.show_toolbar_tratamientos = true;
        },

        // Guarda el tratamiento
        guardarTratamiento: function(tratamiento) {
            Shared.tratamientos.post($scope.internacion.id, tratamiento.id || null, $scope.tratamientosEdit, {
                minify: true
            }).then(function(data) {
                Plex.alert('Tratamiento guardado');

                // actualizamos el listado de tratamientos
                $scope.actualizartratamientos(data);

                $scope.cancelarEdicion();
            });
        },

        actualizartratamientos: function(data) {
            var found = false;
            $scope.loading = true;

            var length = $scope.internacion.tratamientos.length;
            for (var i = 0; i < length; i++) {
                if ($scope.internacion.tratamientos[i].id === data.id) {
                    // tratamiento encontrado, actualizamos datos
                    $scope.internacion.tratamientos[i] = data;
                    found = true;
                    break;
                }
            }

            // si no lo encontro, entonces es porque acaba de cargarla
            // se lo asignamos al resto de las tratamientos
            if (!found) {
                $scope.internacion.tratamientos.push(data);
            }

            $scope.loading = false;
        }
    });

    // inicializamos mediante el watch de la variable incluida
    $scope.$watch('include.internacion', function(current, old) {
        $scope.init(current);
    });
}]);
