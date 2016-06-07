angular.module('app').controller('internacion/iHojaTratamiento', ['$scope', 'Plex', 'Shared', 'Server', '$timeout', 'Session', 'Global', function($scope, Plex, Shared, Server, $timeout, Session, Global) {
    'use strict';

    angular.extend($scope, {
        accion: null,
        ultimo: 0, // para armar el listado de indicaciones
        show_toolbar_tratamientos: true,
        loading: true,
        internacion: undefined,
        tratamientosEdit: undefined, // Item actual que se está editando

        horarios: ['7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '1', '2', '3', '4', '5', '6'],

        tiposIndicaciones: [],
        tiposControles: [],
        tiposCuidadosGenerales: [],
        tiposSoluciones: [{
            id: 'Solución fisiológica',
            nombre: 'Solución fisiológica'
        }, {
            id: 'Dextrosa',
            nombre: 'Dextrosa'
        }, {
            id: 'Ringer-Lactato',
            nombre: 'Ringer-Lactato'
        }],

        tiposAgregados: [{
            id: 'Ampollas de electrolitos',
            nombre: 'Ampollas de electrolitos'
        }, {
            id: 'Polivitamínicos',
            nombre: 'Polivitamínicos'
        }, {
            id: 'Calcio',
            nombre: 'Calcio'
        }, {
            id: 'Otro',
            nombre: 'Otro'
        }],
        agregado: {}, // cuando voy cargando agregados en plan de hidratacion

        // opcionesIndicacion: [],
        indicacion: {}, // objeto que se crea para agregar a array de indicaciones
        editandoIndicacion: false,
        editandoAgregado: false,
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

            // buscamos la internacion
            if (internacion !== null) {
                $scope.internacion = internacion;

                $scope.filtros.tratamientos = internacion.tratamientos;

                // $scope.tiposSoluciones = [];
                // var resolver = "planHidratacion.tipoSolucion";
                // // buscamos los tipos de indicaciones disponibles
                // Server.get("/api/internacion/internacion/tratamiento/tipos/" + resolver).then(function(opciones) {
                //     angular.forEach(opciones, function(opcion) {
                //         $scope.tiposSoluciones.push({
                //             id: opcion,
                //             nombre: opcion
                //         });
                //     });
                // });

                $scope.loading = false;
                $scope.filtros.filtrar();
            }
        },

        tratamientos: {
            // Cancelar la edición
            cancelar: function() {
                $scope.tratamientosEdit = null;
                $scope.show_toolbar_tratamientos = true;
            },

            ver: function(tratamiento) {
                Plex.openView('internacion/verTratamiento/' + $scope.internacion.id + '/' + tratamiento.id).then(function(internacion) {

                });
            },

            // TRATAMIENTOS
            // Inicia la edición de una evolución
            editar: function(tratamiento) {
                $scope.show_toolbar_tratamientos = false;

                $scope.tiposIndicaciones = [{
                    id: '',
                    nombre: 'Seleccione indicación'
                }];

                // buscamos los tipos de indicaciones disponibles
                Server.get("/api/internacion/internacion/tratamiento/tipos/tipo").then(function(tiposIndicaciones) {
                    angular.forEach(tiposIndicaciones, function(indicacion) {
                        $scope.tiposIndicaciones.push({
                            id: indicacion,
                            nombre: indicacion
                        });
                    });
                });

                $scope.tiposControles = [];
                // buscamos los tipos de indicaciones disponibles
                Server.get("/api/internacion/internacion/tratamiento/tipos/controles.tipo").then(function(tiposControles) {
                    angular.forEach(tiposControles, function(indicacion) {
                        $scope.tiposControles.push({
                            id: indicacion,
                            nombre: indicacion
                        });
                    });
                });

                $scope.tiposCuidadosGenerales = [];
                // buscamos los tipos de indicaciones disponibles
                Server.get("/api/internacion/internacion/tratamiento/tipos/cuidadosGenerales.tipo").then(function(tiposCuidadosGenerales) {
                    angular.forEach(tiposCuidadosGenerales, function(indicacion) {
                        $scope.tiposCuidadosGenerales.push({
                            id: indicacion,
                            nombre: indicacion
                        });
                    });
                });

                if (tratamiento) { // Modificación
                    $scope.tituloFormulario = "Editar tratamiento";
                    $scope.tratamientosEdit = {};

                    angular.copy(tratamiento, $scope.tratamientosEdit);

                    if ($scope.tratamientosEdit.indicaciones.length) {

                        // marcamos las frecuencias en la tabla
                        $scope.marcarFrecuencias();

                    }

                } else { // Alta
                    $scope.tituloFormulario = "Agregar tratamiento";

                    // Valores por defecto
                    $scope.tratamientosEdit = {
                        fecha: new Date(),
                        servicio: Session.variables.servicioActual,
                    };
                }
            },

            // Guarda el tratamiento
            guardar: function(tratamiento) {
                Shared.tratamientos.post($scope.internacion.id, tratamiento.id || null, $scope.tratamientosEdit, {
                    minify: true
                }).then(function(data) {
                    Plex.alert('Tratamiento guardado');

                    // actualizamos el listado de tratamientos
                    $scope.tratamientos.actualizartratamientos(data);

                    $scope.tratamientos.cancelar();
                });
            },

            // actulizar la lista de tratamientos con los datos del ultimo guardado
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
        },

        // FUNCIONALIDAD INDICACIONES
        indicaciones: {
            // buscamos la ultima posicion en el array de indicaciones segun
            // el tipo de indicacion que vamos a agregar
            getLastPositionOf: function(key) {
                var last_position = 0;
                var length = $scope.tratamientosEdit.indicaciones.length;

                for (var i = 0; i < length; i++) {
                    if ($scope.tratamientosEdit.indicaciones[i].tipo.nombre == key || $scope.tratamientosEdit.indicaciones[i].tipo == key) {
                        last_position = i;
                    }
                }

                return (last_position > 0) ? last_position : -1;
            },

            agregar: function() {
                if (typeof $scope.tratamientosEdit.indicaciones == "undefined") {
                    $scope.tratamientosEdit.indicaciones = [];
                }

                // agregamos la fecha y hora de la indicacion
                $scope.indicacion.fechaHora = new Date();

                // seteamos el valor activo
                $scope.indicacion.activo = true;

                var length = $scope.tratamientosEdit.indicaciones.length;

                if (length > 0) {

                    // si es heparina o profilaxis los enviamos debajo del Plan de hidratacion
                    if ($scope.indicacion.tipo.nombre == 'Heparina o profilaxis') {
                        var last_position = $scope.indicaciones.getLastPositionOf('Plan Hidratación');

                        last_position = (last_position == -1) ? 0 : last_position;
                    }

                    // si es proteccion gastrica los enviamos debajo de heparina
                    // o profilaxis en caso que existan, y si no debajo del Plan de hidratacion
                    if ($scope.indicacion.tipo.nombre == 'Protección gástrica') {
                        var last_position = $scope.indicaciones.getLastPositionOf('Heparina o profilaxis');
                        // si no encontramos heparina o profilaxis, entonces
                        // lo colocamos debajo del plan de hidratacion
                        if (last_position == -1) {
                            var last_position = $scope.indicaciones.getLastPositionOf('Plan Hidratación');

                            // si encontramos plan de hidratacion, entonces lo ponemos debajo
                            // si no, lo ponemos al principio
                            last_position = (last_position == -1) ? 0 : last_position;
                        }
                    }
                }

                // si es un plan de hidratacion, los enviamos al principio
                if ($scope.indicacion.tipo.nombre == 'Plan Hidratación') {
                    $scope.tratamientosEdit.indicaciones.unshift($scope.indicacion);
                } else {
                    // guardamos en una posicion determinada
                    if (last_position >= 0) {
                        $scope.tratamientosEdit.indicaciones.splice(last_position+1, 0, $scope.indicacion);
                    } else {
                        // o si no hay posicion, lo mandamos al final del array
                        $scope.tratamientosEdit.indicaciones.push($scope.indicacion);
                    }
                }

                $scope.indicacion = {};

                // marcamos las frecuencias en la tabla
                $scope.marcarFrecuencias();
            },

            editar: function(indicacion, index) {
                $scope.editandoIndicacion = true;
                $scope.indexIndicacion = index;

                if (indicacion) {
                    angular.copy(indicacion, $scope.indicacion);

                    $scope.indicacion.tipo = Global.getById($scope.tiposIndicaciones, indicacion.tipo.id || indicacion.tipo);

                    if ($scope.indicacion.tipo == 'Plan Hidratación' ||
                        (typeof $scope.indicacion.tipo.nombre != undefined && $scope.indicacion.tipo.nombre == 'Plan Hidratación')) {
                        $scope.indicacion.planHidratacion.tipoSolucion = Global.getById($scope.tiposSoluciones, $scope.indicacion.planHidratacion.tipoSolucion);
                    }
                    if ($scope.indicacion.tipo == 'Solicitud prestaciones' ||
                        (typeof $scope.indicacion.tipo.nombre != "undefined" && $scope.indicacion.tipo.nombre == 'Solicitud prestaciones')){

                        $scope.indicacion.prestaciones.prioridad = Global.getById($scope.prestaciones.prioridad, ($scope.indicacion.prestaciones.prioridad.id || $scope.indicacion.prestaciones.prioridad));
                    }
                } else {

                    if (typeof $scope.tratamientosEdit.indicaciones == "undefined") {
                        $scope.tratamientosEdit.indicaciones = [];
                    }

                    // $scope.setDescripcionIndicacion($scope.indicacion.tipoIndicacion.id);

                    $scope.tratamientosEdit.indicaciones.push($scope.indicacion);

                    $scope.indicacion = {};
                }
            },
            guardar: function() {
                $scope.tratamientosEdit.indicaciones[$scope.indexIndicacion] = $scope.indicacion;

                $scope.indexIndicacion = undefined;
                $scope.editandoIndicacion = false;
                $scope.indicacion = {};

            },
            cancelar: function() {
                $scope.editandoIndicacion = false;
                $scope.indicacion = {};
            }
        },

        // AGREAGADOS
        agregados: {
            editar: function(agregado) {
                if (agregado) {
                    $scope.editandoAgregado = true;
                    $scope.agregado = agregado;
                    // $scope.agregado.tipoAgregado = Global.getById($scope.tiposAgregados, agregado.tipoAgregado);
                    // console.log(Global.getById($scope.tiposAgregados, (agregado.tipoAgregado || agregado.tipoAgregado.id)));
                } else {
                    if (typeof $scope.indicacion.planHidratacion.agregados == "undefined") {
                        $scope.indicacion.planHidratacion.agregados = [];
                    }

                    $scope.agregado.posicion = $scope.indicacion.planHidratacion.agregados.length;

                    $scope.indicacion.planHidratacion.agregados.push($scope.agregado);
                    $scope.agregado = {};
                }

            },
            guardar: function() {
                var encontrado = false;
                angular.forEach($scope.indicacion.planHidratacion.agregados, function(agregado) {

                    if (!encontrado) {
                        if ($scope.agregado.posicion == agregado.posicion) {
                            agregado = $scope.agregado;
                        }
                    }

                });

                $scope.editandoAgregado = false;
                $scope.agregado = {};
            },
            cancelar: function() {
                $scope.editandoAgregado = false;
                $scope.agregado = {};
            }
        },
        prestaciones: {
            prioridad: [{
                id: 'No prioritario',
                nombre: 'No prioritario'
            }, {
                id: 'Urgente',
                nombre: 'Urgente'
            }, {
                id: 'Emergencia',
                nombre: 'Emergencia'
            }],
            buscarTipoPrestacion: function(query){
                // buscamos todos las prestaciones para cargar el select con las opciones
                var buscar = {
                    nombre: query
                }

                return Shared.tipoPrestaciones.get(buscar);
            },
        },

        // marcar la frecuencias de las indicaciones con X en la tabla
        marcarFrecuencias: function(){
            angular.forEach($scope.tratamientosEdit.indicaciones, function(indicacion) {
                // agregamos el array de horarios a marcar
                indicacion.horarios = [];

                // determinamos en que momento comienza
                var fecha = new Date(indicacion.fechaHora);
                var proximo = parseInt(fecha.getHours());

                angular.forEach($scope.horarios, function(hora) {
                    // si la hora es igual al horario de la proxima indicacion
                    // entonces marcamos el horario en la tabla
                    if (hora == proximo) {
                        indicacion.horarios[hora] = "X";

                        if (indicacion.frecuencia != 'unica' || indicacion.frecuencia != '24'){
                            // sumamos a la hora marcada la frecuencia
                            proximo = parseInt(hora) + parseInt(indicacion.frecuencia);

                            if (proximo > 24) {
                                proximo = proximo - 24;
                            }
                        }
                    }
                });
            });
        }
        // remove: function(item) {
        //     $scope.internacion.tratamientos.splice($scope.internacion.tratamientos.indexOf(item), 1);
        // },

    });

    // inicializamos mediante el watch de la variable incluida
    $scope.$watch('include.internacion', function(current, old) {
        $scope.init(current);
    });
}]);
