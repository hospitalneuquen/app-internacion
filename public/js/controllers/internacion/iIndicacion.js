angular.module('app').controller('internacion/iIndicacion', ['$scope', 'Plex', 'Shared', 'Server', 'Session', 'Global', function($scope, Plex, Shared, Server, Session, Global) {
    'use strict';

    angular.extend($scope, {
        tab: 0,

        status : {
            activo: true
        },

        show_toolbar_indicaciones: true,
        show_comenzar_tratamiento: true,
        showForm: false,
        accion: null,
        editandoAgregado: false,
        indicacionBorrar: null,

        internacion: undefined,
        indicacion: {}, // Item actual que se está editando / agregando
        agregado: {}, // cuando voy cargando agregados en plan de hidratacion
        // indicacionEdit: undefined, // Item actual que se está editando

        horarios: ['7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '1', '2', '3', '4', '5', '6'],
        // horarios: ['7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '1', '2', '3', '4', '5', '6'],

        tiposIndicaciones: [{
            id: '',
            nombre: 'Seleccione indicación'
        }, {
            id: 'Plan Hidratación Parenteral',
            nombre: 'Plan Hidratación Parenteral'
        }, {
            id: 'Antibióticos',
            nombre: 'Antibióticos'
        }, {
            id: 'Heparina o profilaxis',
            nombre: 'Heparina o profilaxis'
        }, {
            id: 'Protección gástrica',
            nombre: 'Protección gástrica'
        }, {
            id: 'Otra medicación',
            nombre: 'Otra medicación'
        }, {
            id: 'Controles',
            nombre: 'Controles'
        }, {
            id: 'Cuidados generales',
            nombre: 'Cuidados generales'
        }, {
            id: 'Cuidados especiales',
            nombre: 'Cuidados especiales'
        }, {
            id: 'Nutrición',
            nombre: 'Nutrición'
        }, {
            id: 'Solicitud prestaciones',
            nombre: 'Solicitud prestaciones'
        }, {
            id: 'Otra indicación',
            nombre: 'Otra indicación'
        }],
        tiposControles: [],
        tiposCuidadosGenerales: [],
        // tiposSoluciones: [{
        //     id: 'Solución fisiológica',
        //     nombre: 'Solución fisiológica'
        // }, {
        //     id: 'Dextrosa',
        //     nombre: 'Dextrosa'
        // }, {
        //     id: 'Ringer-Lactato',
        //     nombre: 'Ringer-Lactato'
        // }],

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

        _frascos: [],
        _frascosEdicion: [],

        filtros: {
            indicaciones: [],
            servicio: null,
            filtrar: function() {
                var self = this;

                $scope.show_comenzar_tratamiento = ($scope.internacion.indicaciones.length) ? false : true;
            }

        },

        init: function(internacion) {
            // buscamos la internacion
            if (internacion !== null) {
                $scope.internacion = internacion;

                // asignamos las indicaciones y luego las filtramos
                $scope.filtros.indicaciones = $scope.internacion.indicaciones;
                $scope.filtros.filtrar();

                // $scope.show_comenzar_tratamiento = ($scope.internacion.indicaciones.length) ? true : false;

                // cargamos los valores permitidos para los tipos de indicaciones
                // if ($scope.tiposIndicaciones.length == 0) {
                //     // completamos los select con los respectivos valores a utilizar
                //     $scope.tiposIndicaciones = [{
                //         id: '',
                //         nombre: 'Seleccione indicación'
                //     }];
                //
                //     // buscamos los tipos de indicaciones disponibles
                //     Server.get("/api/internacion/internacion/indicacion/tipos/tipo").then(function(tiposIndicaciones) {
                //         angular.forEach(tiposIndicaciones, function(indicacion) {
                //             $scope.tiposIndicaciones.push({
                //                 id: indicacion,
                //                 nombre: indicacion
                //             });
                //         });
                //     });
                // }

                // cargamos los valores permitidos para los tipos de controles
                if ($scope.tiposControles.length == 0) {
                    $scope.tiposControles = [];
                    // buscamos los tipos de indicaciones disponibles
                    Server.get("/api/internacion/internacion/indicacion/tipos/controles.tipo").then(function(tiposControles) {
                        angular.forEach(tiposControles, function(indicacion) {
                            $scope.tiposControles.push({
                                id: indicacion,
                                nombre: indicacion
                            });
                        });
                    });
                }

                // cargamos los valores permitidos para los tipos de cuidados generales
                if ($scope.tiposCuidadosGenerales.length == 0) {
                    $scope.tiposCuidadosGenerales = [];
                    // buscamos los tipos de indicaciones disponibles
                    Server.get("/api/internacion/internacion/indicacion/tipos/cuidadosGenerales.tipo").then(function(tiposCuidadosGenerales) {
                        angular.forEach(tiposCuidadosGenerales, function(indicacion) {
                            $scope.tiposCuidadosGenerales.push({
                                id: indicacion,
                                nombre: indicacion
                            });
                        });
                    });
                }
            }
        },

        tratamiento: {
            // comenzamos un tratamiento o lo editamos
            comenzar: function(tratamiento) {
                $scope.show_comenzar_tratamiento = false;

                $scope.indicaciones.editar();
            }
        },

        indicaciones: {
            borrar: false,
            editar: function(indicacion) {
                accion: null,

                // mostramos formulario
                $scope.showForm = true;

                // ocultamos toolbar
                $scope.show_toolbar_indicaciones = false;

                if (indicacion) {
                    $scope.accion = "editar";

                    angular.copy(indicacion, $scope.indicacion);

                    if (!$scope.indicacion.servicio) {
                        // $scope.indicacion.servicio = Session.variables.servicioActual
                    }

                    $scope.indicacion.tipo = Global.getById($scope.tiposIndicaciones, indicacion.tipo);

                    // cargamos el valor de tipo de solucion en caso de ser un plan de hidratacion
                    if ($scope.indicacion.tipo == 'Plan Hidratación Parenteral' || $scope.indicacion.tipo.nombre == 'Plan Hidratación Parenteral') {

                        if ($scope.indicacion.planHidratacion.agregados.length) {
                            $scope.indicacion.planHidratacion.poseeAgregados = true;
                        }
                    }

                    // cargamos el valor de prioridad en caso de ser una solicitud de prestacion
                    if ($scope.indicacion.tipo == 'Solicitud prestaciones') {
                        $scope.indicacion.prestaciones.prioridad = Global.getById($scope.prestaciones.prioridad, ($scope.indicacion.prestaciones.prioridad.id || $scope.indicacion.prestaciones.prioridad));
                    }
                } else {
                    $scope.accion = "agregar";

                    // Valores por defecto de la indicacion
                    // $scope.indicacion = {
                    //     fecha: new Date(),
                    //     servicio: Session.variables.servicioActual,
                    // };
                    $scope.indicacion.fecha = new Date();
                    $scope.indicacion.servicio = Session.variables.servicioActual;
                    $scope.indicacion.via = 'EV';
                }

            },
            // Guardamos la indicacion
            guardar: function(indicacion, accion) {
                var accion = (accion) ? accion : 'guardada'

                return Shared.indicaciones.post($scope.internacion.id, indicacion.id || null, indicacion, {
                    minify: true
                }).then(function(data) {
                    Plex.alert('Indicacion ' + accion);

                    // actualizamos el listado de indicaciones
                    $scope.indicaciones.actualizar(data);

                    // vaciamos el formulario
                    $scope.indicacion = {};

                    // ocultamos el formulario
                    $scope.showForm = false;
                });

            },
            // suspender una indicacion
            suspender: function(indicacion) {
                $scope.indicaciones.borrar = true;
                $scope.indicacionBorrar = indicacion;
            },
            confirmarBorrado: function(indicacion) {
                // seteamos el valor activo en false
                indicacion.activo = false;

                // guardamos la indicacion
                $scope.indicaciones.guardar(indicacion, 'suspendida');
                $scope.indicaciones.borrar = false;
            },
            cancelarSuspender: function() {
                $scope.indicaciones.borrar = false;
            },
            actualizar: function(indicacion) {
                var found = false;
                $scope.loading = true;

                var length = $scope.internacion.indicaciones.length;

                // buscamos la cama y actualizamos el valor con los datos
                for (var i = 0; i < length; i++) {
                    if ($scope.internacion.indicaciones[i].id === indicacion.id) {
                        // indicacion encontrada, actualizamos datos
                        $scope.internacion.indicaciones[i] = indicacion;
                        found = true;
                        break;
                    }
                }

                // si no lo encontro, entonces es porque acaba de cargarla
                // se la asignamos al resto de las indicaciones
                if (!found) {
                    $scope.internacion.indicaciones.push(indicacion);
                }

                $scope.loading = false;

                $scope.filtros.filtrar();
            },
            cancelar: function() {
                // vaciamos el formulario
                $scope.indicacion = {};

                // mostramos toolbar
                $scope.show_toolbar_indicaciones = true;

                // ocultamos el formulario
                $scope.showForm = false;

                $scope.filtros.filtrar();
            },

            // AGREAGADOS
            agregados: {
                // creacion o edicion de un agregado
                editar: function(agregado) {

                    if (typeof $scope.agregado.frascos == "undefined") {
                        $scope.agregado.frascos = [];
                    }

                    if (!agregado) {
                        // si no se han agregado aun, inicializamos el array de agregados
                        if (typeof $scope.indicacion.planHidratacion.agregados == "undefined") {
                            $scope.indicacion.planHidratacion.agregados = [];
                        }

                        // $scope.agregado.posicion = $scope.indicacion.planHidratacion.agregados.length;
                        $scope.agregado.posicion = (typeof $scope.indicacion.planHidratacion.agregados !== "undefined") ? $scope.indicacion.planHidratacion.agregados.length : 0;

                        // asignamos los frascos al agregado
                        angular.forEach($scope.agregado._frascos, function(frasco) {
                            $scope.agregado.frascos.push(frasco.id);
                        });

                        $scope.indicacion.planHidratacion.agregados.push($scope.agregado);
                        $scope.agregado = {};
                    } else {
                        // asignamos para editar el agregado
                        $scope.editandoAgregado = true;

                        // creamos una copia del agregado
                        $scope.agregado = angular.copy(agregado);

                        // seleccionamos el tipo de agregado
                        $scope.agregado.tipoAgregado = Global.getById($scope.tiposAgregados, (agregado.tipoAgregado.id || agregado.tipoAgregado));

                        $scope.agregado._frascos = [];
                        // asignamos los frascos
                        angular.forEach($scope.agregado.frascos, function(frasco) {
                            $scope.agregado._frascos.push({
                                id: frasco,
                                value: frasco
                            });
                        });

                    }
                },

                // guardamos la edicion de un agregado
                guardar: function(agregado) {
                    var encontrado = false;

                    angular.forEach($scope.indicacion.planHidratacion.agregados, function(_agregado, index) {

                        if (!encontrado) {
                            if (agregado.posicion == _agregado.posicion) {

                                agregado.frascos = [];
                                angular.forEach(agregado._frascos, function(frasco) {
                                    $scope.agregado.frascos.push(frasco.id);
                                });

                                $scope.indicacion.planHidratacion.agregados[index] = agregado;
                                encontrado = true;
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
                buscarTipoPrestacion: function(query) {
                    // buscamos todos las prestaciones para cargar el select con las opciones
                    var buscar = {
                        nombre: query
                    }

                    return Shared.tipoPrestaciones.get(buscar);
                },
            }
        }

    });

    $scope.$watch('indicacion.planHidratacion.cantidadFrascos', function(current, old) {
        if (current) {
            $scope._frascos = [];
            for (var i = 1; i <= current; i++) {
                $scope._frascos.push({
                    id: i,
                    value: i
                });
            }
        }

    });

    $scope.$watch('indicacion.planHidratacion.dextrosa.cantidad + indicacion.planHidratacion.solucionFisiologica.cantidad + indicacion.planHidratacion.ringerLactato.cantidad', function(current, old) {
        if (current) {

            var total = 0;

            if (typeof $scope.indicacion.planHidratacion.dextrosa != "undefined") {

                if (typeof $scope.indicacion.planHidratacion.dextrosa.dilucion == "undefined") {
                    $scope.indicacion.planHidratacion.dextrosa.dilucion = 5;
                }

                total += parseInt($scope.indicacion.planHidratacion.dextrosa.cantidad) || 0;
            }

            if (typeof $scope.indicacion.planHidratacion.solucionFisiologica != "undefined") {
                total += parseInt($scope.indicacion.planHidratacion.solucionFisiologica.cantidad) || 0;
            }

            if (typeof $scope.indicacion.planHidratacion.ringerLactato != "undefined") {
                total += parseInt($scope.indicacion.planHidratacion.ringerLactato.cantidad) || 0;
            }

            $scope.indicacion.planHidratacion.cantidadFrascos = Math.ceil((total / 500));
        }
    });

    $scope.$watch('indicacion.tipo', function(current, old) {
        // inicializamos los valores para el plan de hidratacion
        if (typeof current != "undefined" && current.nombre == "Plan Hidratación Parenteral") {
            if (typeof $scope.indicacion.id == "undefined") {
                $scope.indicacion.planHidratacion = {}
            }

        }
    });

    // inicializamos mediante el watch de la variable incluida
    $scope.$watch('include.internacion', function(current, old) {
        $scope.init(current);
    });
}]);
