angular.module('app').controller('internacion/iHojaTratamiento', ['$scope', 'Plex', 'Shared', 'Server', '$timeout', 'Session', 'Global', function($scope, Plex, Shared, Server, $timeout, Session, Global) {
    'use strict';

    angular.extend($scope, {
        ultimo: 0, // para armar el listado de indicaciones
        show_toolbar_tratamientos: true,
        loading: true,
        internacion: undefined,
        tratamientosEdit: undefined, // Item actual que se está editando
        tiposIndicaciones: [],
        opcionesIndicacion: [],
        indicacion: {}, // objeto que se crea para agregar a array de indicaciones
        editandoIndicacion: false,
        indexIndicacion: undefined,
        frecuencias: [{
            id: '48',
            nombre: 'Cada 2 días'
        }, {
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

            // buscamos los tipos de indicaciones disponibles
            Server.get("/api/internacion/internacion/tratamiento/tipos/tipo").then(function(tiposIndicaciones) {
                angular.forEach(tiposIndicaciones, function(indicacion) {
                    $scope.tiposIndicaciones.push({
                        id: indicacion,
                        nombre: indicacion
                    });
                });
            });

            // buscamos la internacion
            if (internacion !== null) {
                $scope.internacion = internacion;

                $scope.filtros.tratamientos = internacion.tratamientos;
                $scope.loading = false;

                $scope.filtros.filtrar();
            }
        },
        getOpcionesIndicacion: function() {
            console.log($scope.indicacion.tipoIndicacion);

            switch ($scope.indicacion.tipoIndicacion.id) {
                case 'Plan Hidratación':
                case 'Heparina o profilaxis':
                case 'Protección gástrica':
                case 'Otra medicación':
                case 'Otra indicación':
                    var tipo = "";
                    $scope.opcionesIndicacion = "";
                break;
                case 'Controles':
                    var tipo = "controles.tipo";
                break;
                case 'Cuidados generales':
                    var tipo = "cuidadosGenerales.tipo";
                break;
                case 'Cuidados especiales':
                    var tipo = "cuidadosEspeciales";
                break;
                case 'Dieta':
                    var tipo = "dieta";
                break;
            }

            if (tipo != ""){
                $scope.opcionesIndicacion = [];
                // buscamos los tipos de indicaciones disponibles
                Server.get("/api/internacion/internacion/tratamiento/tipos/"+ tipo).then(function(tiposIndicaciones) {
                    angular.forEach(tiposIndicaciones, function(indicacion) {
                        $scope.opcionesIndicacion.push({
                            id: indicacion,
                            nombre: indicacion
                        });
                    });
                });
            }
        },

        agregarIndicacion: function() {
            if (typeof $scope.tratamientosEdit.indicaciones == "undefined") {
                $scope.tratamientosEdit.indicaciones = [];
            }

            $scope.indicacion.tipo = $scope.indicacion.tipoIndicacion.id;

            if($scope.indicacion.descripcion){
                $scope.indicacion.$descripcion = $scope.indicacion.descripcion;
            }

            if ($scope.indicacion.tipo == 'Plan Hidratación' ||
                $scope.indicacion.tipo == 'Heparina o profilaxis' ||
                $scope.indicacion.tipo == 'Protección gástrica' ||
                $scope.indicacion.tipo == 'Otra medicación'){

                $scope.indicacion.medicamento = {
                    descripcion: $scope.indicacion.descripcion
                }

                $scope.indicacion.$descripcion = $scope.indicacion.descripcion;
            }else if ($scope.indicacion.tipo == "Controles"){
                $scope.indicacion.controles = {
                    tipo: $scope.indicacion.opcionIndicacion.id
                }

                $scope.indicacion.$descripcion = $scope.indicacion.opcionIndicacion.id;
            }else if ($scope.indicacion.tipo == "Cuidados generales"){
                $scope.indicacion.cuidadosGenerales = {
                    tipo: $scope.indicacion.opcionIndicacion.id
                }

                $scope.indicacion.$descripcion = $scope.indicacion.opcionIndicacion.id;
            }

            $scope.tratamientosEdit.indicaciones.push($scope.indicacion);
            console.log($scope.tratamientosEdit.indicaciones);

            $scope.indicacion = {};
        },

        editarIndicacion: function(indicacion, index) {
            $scope.editandoIndicacion = true;
            $scope.indexIndicacion = index;

            angular.copy(indicacion, $scope.indicacion);

        },
        guardarIndicacion: function() {
            $scope.tratamientosEdit.indicaciones[$scope.indexIndicacion] = $scope.indicacion;

            $scope.indexIndicacion = undefined;
            $scope.editandoIndicacion = false;
            $scope.indicacion = {};
        },
        cancelarEditarIndicacion: function() {
            $scope.editandoIndicacion = false;
            $scope.indicacion = {};
        },
        // remove: function(item) {
        //     $scope.internacion.tratamientos.splice($scope.internacion.tratamientos.indexOf(item), 1);
        // },
        verTratamiento: function(tratamiento){
            Plex.openView('internacion/verTratamiento/' + $scope.internacion.id + '/' + tratamiento.id).then(function(internacion) {

            });
        },
        // Inicia la edición de una evolución
        editarTratamiento: function(tratamiento) {
            $scope.show_toolbar_tratamientos = false;

            if (tratamiento) { // Modificación
                $scope.tituloFormulario = "Editar tratamiento";
                $scope.tratamientosEdit = {};

                angular.copy(tratamiento, $scope.tratamientosEdit);

                if ($scope.tratamientosEdit.indicaciones.length){

                    angular.forEach($scope.tratamientosEdit.indicaciones, function(indicacion){
                        if (indicacion.tipo == 'Plan Hidratación' ||
                            indicacion.tipo == 'Heparina o profilaxis' ||
                            indicacion.tipo == 'Protección gástrica' ||
                            indicacion.tipo == 'Otra medicación'){

                            indicacion.$descripcion = indicacion.medicamento.descripcion;

                        }else if (indicacion.tipo == "Controles"){
                            indicacion.$descripcion = indicacion.controles.tipo;
                        }else if (indicacion.tipo == "Cuidados generales"){
                            indicacion.$descripcion = indicacion.cuidadosGenerales.tipo;
                        }

                    });
                }

                // console.log($scope.tratamientosEdit);

                // seleccionamos las frecuencias elegidas para cada elemento
                // $scope.tratamientosEdit.frecuenciaSignosVitales = Global.getById($scope.frecuencias, $scope.tratamientosEdit.frecuenciaSignosVitales);
                // $scope.tratamientosEdit.frecuenciaDiuresis = Global.getById($scope.frecuencias, $scope.tratamientosEdit.frecuenciaDiuresis);
                // $scope.tratamientosEdit.frecuenciaPeso = Global.getById($scope.frecuencias, $scope.tratamientosEdit.frecuenciaPeso);
                // $scope.tratamientosEdit.frecuenciaGlasgow = Global.getById($scope.frecuencias, $scope.tratamientosEdit.frecuenciaGlasgow);
                // $scope.tratamientosEdit.frecuenciaRotarDecubito = Global.getById($scope.frecuencias, $scope.tratamientosEdit.frecuenciaRotarDecubito);
                // $scope.tratamientosEdit.frecuenciaAspirarSecreciones = Global.getById($scope.frecuencias, $scope.tratamientosEdit.frecuenciaAspirarSecreciones);
                // $scope.tratamientosEdit.frecuenciaKinesiologia = Global.getById($scope.frecuencias, $scope.tratamientosEdit.frecuenciaKinesiologia);
                // $scope.tratamientosEdit.frecuenciaOxigeno = Global.getById($scope.frecuencias, $scope.tratamientosEdit.frecuenciaOxigeno);
                // $scope.tratamientosEdit.cualAislamiento = Global.getById($scope.frecuencias, $scope.tratamientosEdit.cualAislamiento);

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
