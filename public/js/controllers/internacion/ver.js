angular.module('app').controller('internacion/ver', ['$scope', 'Plex', 'plexParams', 'Server', '$timeout', 'Personas', 'Global', 'Shared', '$alert', 'Session', function($scope, Plex, plexParams, Server, $timeout, Personas, Global, Shared, $alert,Session) {
    'use strict';

    angular.extend($scope, {
        tab: 0,
        // tabs:{
        //     setActive(index){
        //         tabs.active : (index) ? index : 0
        //     },
        //     [{
        //         "title": "Resumen internación",
        //         "content": "asdf"
        //     }, {
        //         "title": "Gráficos"
        //     }, {
        //         "title": "Ingrseo de internación"
        //     }, {
        //         "title": "Egreso",
        //         "disabled": true
        //     }],
        // },
        showToolbarDrenajes: true,
        show_toolbar_antecedentes: true,
        show_toolbar_pases: true,
        drenajesEdit: undefined, // Item actual que se está editando de los drenajes
        ordenCronologico: [],
        riesgoCaidas: 0,
        selectedTabIndex: 0,
        internacion: null,
        internacionesAnteriores: [],
        pases: null,

        // indicaciones para el dashboard
        indicacionesNuevas : [],
        indicacionesSuspendidas : [],

        tiposDrenajes: [{
            id: 'pleural',
            nombre: 'Pleural'
        }, {
            id: 'percutaneo',
            nombre: 'Percutáneo'
        }],
        ladosDrenajes: [{
            id: 'izquierdo',
            nombre: 'Izquierdo'
        }, {
            id: 'derecho',
            nombre: 'Derecho'
        }],

        tiposInternacion: [{ // opciones para el select del tipo de internacion
            id: 'ambulatorio',
            nombre: 'Ambulatorio'
        }, {
            id: 'guardia',
            nombre: 'Guardia'
        }, {
            id: 'derivacion',
            nombre: 'Derivación'
        }, ],
        tipoInternacionSeleccionada: '',
        camas: null,
        // filtros: {
        //     evoluciones: [],
        //     servicio: null,
        //     filtrar: function() {
        //         var self = this;
        //
        //         if (!this.servicio) {
        //             $scope.filtros.evoluciones = $scope.internacion.evoluciones;
        //         } else {
        //             $scope.filtros.evoluciones = [];
        //             angular.forEach($scope.internacion.evoluciones, function(evolucion) {
        //                 if (self.servicio && evolucion.servicio.id === self.servicio) {
        //                     $scope.filtros.evoluciones.push(evolucion);
        //                 }
        //             });
        //         }
        //     }
        // },

        closeView: function() {
            Plex.closeView({

            });
        },

        drenajes: {
            editar: function(drenaje) {
                $scope.showToolbarDrenajes = false;
                if (drenaje) { // Modificación
                    $scope.tituloFormulario = "Editar drenaje";
                    $scope.drenajesEdit = {};
                    angular.copy(drenaje, $scope.drenajesEdit);
                } else { // Alta
                    $scope.tituloFormulario = "Agregar drenaje";
                    // Valores por defecto
                    $scope.drenajesEdit = {
                        fechaDesde: new Date()
                    };
                }
            },
            guardar: function() {
                Shared.drenaje.post($scope.internacion.id, $scope.drenajesEdit.id || null, $scope.drenajesEdit, {
                    minify: true
                }).then(function(data) {
                    Plex.alert('Drenaje guardado');

                    // agregamos el drenaje
                    $scope.internacion.drenajes.push(data);

                    // actualizamos el listado de evoluciones
                    $scope.drenajes.actualizar(data);

                    // ocultamos el formulario
                    $scope.drenajes.cancelar();
                });
            },

            // Cancelar la edición
            cancelar: function() {
                $scope.drenajesEdit = null;
                $scope.showToolbarDrenajes = true;
            },

            actualizar: function(data) {
                var found = false;

                var length = $scope.internacion.drenajes.length;
                // buscamos el drenaje y actualizamos el valor con los datos
                for (var i = 0; i < length; i++) {
                    if (!found && $scope.internacion.drenajes[i].id === data.id) {
                        // drenaje encontrado, actualizamos datos
                        $scope.internacion.drenajes[i] = data;

                        found = true;
                        break;
                    }
                }

                // si no lo encontro, entonces es porque acaba de cargarlo
                if (!found) {
                    $scope.internacion.drenajes.push(data);
                }

            },
        },

        editarAntecedentes: function() {
            $scope.antecedentesEdit = true;
        },
        cancelarEdicionAntecedentes: function() {
            $scope.antecedentesEdit = false;
        },
        guardarAntecedentes: function() {
            var data = {
                ingreso: $scope.internacion.ingreso
            };

            Shared.internacion.post(plexParams.idInternacion, data).then(function(internacion) {
                if (internacion)
                    $scope.antecedentesEdit = false;
            });

        },
        getCamas: function() {
            var idServicio = $scope.pasesEdit.servicio.id;

            // obtenemos el listadod de camas
            Shared.Mapa.get(idServicio).then(function(camas) {
                $scope.camas = camas;
            });
        },
        editarPase: function(pase) {

            $scope.show_toolbar_pases = false;
            if (pase) { // Modificación
                $scope.tituloFormulario = "Editar pase";
                $scope.pasesEdit = {};
                angular.copy(pase, $scope.pasesEdit);
            } else { // Alta
                $scope.tituloFormulario = "Agregar pase";
                // Valores por defecto
                $scope.pasesEdit = {
                    fechaDesde: new Date()
                    // servicio: Session.variables.servicioActual
                };
            }
        },
        guardarPase: function() {
            Shared.pase.post($scope.internacion.id, $scope.pasesEdit.id || null, $scope.pasesEdit, {
                minify: true
            }).then(function(data) {
                Plex.alert('Pase guardado');

                $scope.internacion.pases.push(data);
                // actualizamos el listado de evoluciones
                $scope.actualizarPases(data);
                $scope.cancelarEdicionPase();
            });
        },
        // Cancelar la edición
        cancelarEdicionPase: function() {
            $scope.pasesEdit = null;
            $scope.show_toolbar_pases = true;
        },
        actualizarPases: function(data) {
            var found = false;

            var length = $scope.internacion.pases.length;
            // buscamos el drenaje y actualizamos el valor con los datos
            for (var i = 0; i < length; i++) {
                if ($scope.internacion.pases[i].id === data.id) {
                    // drenaje encontrado, actualizamos datos
                    $scope.internacion.pases[i] = data;
                    found = true;
                    break;
                }
            }

            // si no lo encontro, entonces es porque acaba de cargarlo
            if (!found) {
                $scope.internacion.pases.push(data);
            }

        },
        buscarUbicacion: function(query, tipo) {
            // buscamos todos los servicios para en caso de ser un pase
            // cargar el select con las opciones
            var buscar = {
                tipo: tipo,
                nombre: query
            }

            return Shared.ubicaciones.get(buscar);
        },
        verEvolucion:function(idInternacion, idEvolucion){
            Plex.openView('internacion/verEvolucion/' + idInternacion + "/" + idEvolucion).then(function() {

            });
        },
        hayEvoluciones: function(tipo) {
            var total = 0;

            if ($scope.internacion && $scope.internacion.evoluciones && $scope.internacion.evoluciones.length > 0) {
                angular.forEach($scope.internacion.evoluciones, function(evolucion) {
                    if (tipo == 'temperatura' && typeof evolucion.signosVitales != "undefined") {
                        if (typeof evolucion.signosVitales.temperatura != "undefined" && evolucion.signosVitales.temperatura > 0) {
                            total += evolucion.signosVitales.temperatura;
                        }
                    } else if (tipo == 'tension' && typeof evolucion.signosVitales != "undefined" && typeof evolucion.signosVitales.circulacion != "undefined") {
                        if (typeof evolucion.signosVitales.circulacion.tensionSistolica  != "undefined" && evolucion.signosVitales.circulacion.tensionSistolica > 0) {
                            total += evolucion.signosVitales.circulacion.tensionSistolica;
                        }
                        if (typeof evolucion.signosVitales.circulacion.tensionDiastolica  != "undefined" && evolucion.signosVitales.circulacion.tensionDiastolica > 0) {
                            total += evolucion.signosVitales.circulacion.tensionDiastolica;
                        }

                    } else if (tipo == 'saturacion' && typeof evolucion.signosVitales != "undefined") {
                        if (typeof evolucion.signosVitales.spo2  != "undefined" && evolucion.signosVitales.spo2 > 0) {
                            total += evolucion.signosVitales.spo2;
                        }
                    }else if (tipo == 'peso' && typeof evolucion.signosVitales != "undefined") {
                        if (typeof evolucion.signosVitales.peso != "undefined" && evolucion.signosVitales.peso > 0) {
                            total += evolucion.signosVitales.peso;
                        }
                    }
                });
            }

            return (total > 0) ? true : false;
        },
        ordenarCronologicamente: function() {
            // agregamos el ingreso
            $scope.ordenCronologico.push({
                fecha: $scope.internacion.ingreso.fechaHora,
                tipo: "Ingreso",
                _tipo: "ingreso",
                data: $scope.internacion.ingreso,
                cama: ''
                    // cama: $scope.internacion.pases[$scope.internacion.pases.length - 1].cama
            });

            // agregamos la valoracion inicial
            $scope.ordenCronologico.push({
                fecha: $scope.internacion.ingreso.fechaHora,
                tipo: "Valoración inicial enfermería",
                _tipo: "valoracion-inicial-enfermeria",
                data: $scope.internacion.ingreso.enfermeria,
                cama: ''
                    // cama: $scope.internacion.pases[$scope.internacion.pases.length - 1].cama
            });

            // agregamos evoluciones
            if ($scope.internacion.evoluciones.length) {
                angular.forEach($scope.internacion.evoluciones, function(evolucion, key) {
                    $scope.ordenCronologico.push({
                        fecha: evolucion.fechaHora,
                        tipo: "Evolución",
                        _tipo: "evolucion",
                        data: evolucion,
                        cama: ''
                            // cama: $scope.internacion.pases[$scope.internacion.pases.length - 1].cama
                    });
                });
            }

            // agregamos indicaciones
            if ($scope.internacion.indicaciones.length) {
                angular.forEach($scope.internacion.indicaciones, function(indicacion, key) {
                    $scope.ordenCronologico.push({
                        fecha: indicacion.createdAt,
                        tipo: "Indicación",
                        _tipo: "indicacion",
                        data: indicacion,
                        cama: ''
                    });
                });
            }

            // agregamos prestaciones
            // if ($scope.internacion.prestaciones.length) {
            //     angular.forEach($scope.internacion.prestaciones, function(prestacion, key) {
            //         $scope.ordenCronologico.push({
            //             fecha: prestacion.fechaHora,
            //             tipo: "Solicitud de prestación",
            //             _tipo: "prestacion",
            //             data: prestacion,
            //             cama: ''
            //             // cama: $scope.internacion.pases[$scope.internacion.pases.length - 1].cama
            //         });
            //     });
            // }

            // // agregamos problemas
            // if ($scope.internacion.problemas.length) {
            //     angular.forEach($scope.internacion.problemas, function(problema, key) {
            //         $scope.ordenCronologico.push({
            //             fecha: problema.createdAt,
            //             tipo: "Problema",
            //             _tipo: "problema",
            //             data: problema,
            //             cama: ''
            //             // cama: $scope.internacion.pases[$scope.internacion.pases.length - 1].cama
            //         });
            //     });
            // }

            // agregamos pase
            if ($scope.internacion.pases.length) {
                var i = 0;
                angular.forEach($scope.internacion.pases, function(pase, key) {
                    // omitimos el primer pase que es de cuando se genera la internacion
                    if (i > 0) {
                        $scope.ordenCronologico.push({
                            fecha: pase.fechaHora,
                            tipo: "Pase",
                            _tipo: "pase",
                            data: pase,
                            cama: ''
                                // cama: $scope.internacion.pases[$scope.internacion.pases.length - 1].cama
                        });

                    }
                    i++;
                });
            }

            // agregamos el ingreso
            if ($scope.internacion.egreso) {
                var inicio = moment($scope.internacion.ingreso.fechaHora);
                var fin = moment($scope.internacion.egreso.fechaHora);
                var duracion = inicio.to(fin, true);

                $scope.ordenCronologico.push({
                    fechaInternacion: $scope.internacion.ingreso.fechaHora,
                    fecha: $scope.internacion.egreso.fechaHora,
                    duracion: duracion,
                    tipo: "Egreso",
                    _tipo: "egreso",
                    data: $scope.internacion.egreso,
                    cama: ''
                    // cama: $scope.internacion.pases[$scope.internacion.pases.length - 1].cama
                });
            }

            // agregamos los drenajes cuando comienzan
            if ($scope.internacion.drenajes.length) {
                angular.forEach($scope.internacion.drenajes, function(drenaje, key) {
                    $scope.ordenCronologico.push({
                        fecha: drenaje.fechaDesde,
                        tipo: "Colocación de drenaje",
                        _tipo: "drenaje",
                        data: drenaje,
                        cama: ''
                            // cama: $scope.internacion.pases[$scope.internacion.pases.length - 1].cama
                    });

                    if (drenaje.fechaHasta) {
                        var inicio = moment(drenaje.fechaDesde);
                        var fin = moment(drenaje.fechaHasta);
                        var duracion = inicio.to(fin, true);

                        $scope.ordenCronologico.push({
                            fecha: drenaje.fechaHasta,
                            tipo: "Extracción de drenaje",
                            _tipo: "drenaje",
                            data: drenaje,
                            duracion: duracion,
                            cama: ''
                                // cama: $scope.internacion.pases[$scope.internacion.pases.length - 1].cama
                        });
                    }
                });
            }

            // // agregamos la primera evoluciones
            // $scope.ordenCronologico.push({
            //     fecha: $scope.internacion.evoluciones[0].fechaHora,
            //     tipo: "Evolución",
            //     data:  $scope.internacion.evoluciones[0]
            // });

            if ($scope.ordenCronologico.length) {
                // ordenamos cronolicamente todo el array
                $scope.ordenCronologico.sort(function(a, b) {
                    // descendente
                    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
                    // ascendente
                    // return new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
                });

                angular.forEach($scope.ordenCronologico, function(elemento, index) {

                    if ($scope.internacion.pases.length > 1) {

                        var cantidadPases = ($scope.internacion.pases.length - 1);

                        for (var i = 0; i <= cantidadPases; i++) {
                            var pase = $scope.internacion.pases[i];

                            // si la fecha del elemento, es menor o igual a la del pase
                            // entonces le asignamos esa cama (nro habitacion y nro cama)
                            if (Global.compareDateTime(new Date(elemento.fecha), new Date(pase.fechaHora)) >= 0) {
                                $scope.ordenCronologico[index].cama = pase.cama;
                            }

                        }
                    } else {
                        $scope.ordenCronologico[index].cama = $scope.internacion.pases[0].cama;
                    }

                });
            }
        },
        goToTab: function(tab) {
            $scope.selectedTabIndex = tab;
        },
        init: function() {
            $scope.tab = plexParams.tab || 0;
            $scope.loading = true;
            // buscamos la internacion
            Shared.internacion.get(plexParams.idInternacion).then(function(internacion) {
                $scope.internacion = internacion;
                // $scope.filtros.evoluciones = internacion.evoluciones;
                $scope.loading = false;

                $scope.tipoInternacionSeleccionada = Global.getById($scope.tiposInternacion, internacion.ingreso.tipo);

                // buscamos los antecedentes personales
                Personas.get(internacion.paciente.id).then(function(persona) {
                    $scope.antecedentesPersonales = persona.antecedentesPersonales;
                });

                // evoluciones
                // if ($scope.internacion.evoluciones.length) {
                //     var services_found = [];
                //     // buscamos los servicios para el filtro de evoluciones
                //     angular.forEach($scope.internacion.evoluciones, function(evolucion) {
                //         if (evolucion.servicio && evolucion.servicio.id) {
                //
                //             if (!services_found.inArray(evolucion.servicio.id)) {
                //                 $scope.servicios.push(evolucion.servicio);
                //                 services_found.push(evolucion.servicio.id);
                //             }
                //         }
                //     });
                // }

                // ordenamos cronologicamente
                $scope.ordenarCronologicamente();


                // buscamos internaciones anteriores
                Shared.internacion.get({
                    paciente: internacion.paciente.id
                }).then(function(data) {
                    if (data.length) {
                        $scope.internacionesAnteriores = data;
                    }
                });

                // revisamos las indicaciones que son del dìa de hoy
                if ($scope.internacion.indicaciones.length) {
                    angular.forEach($scope.internacion.indicaciones, function(indicacion, index) {
                        // si la fecha de creacion es el dia de hoy
                        // entonces la agregamos a las nuevas indicaciones
                        var createdAt = moment(indicacion.createdAt);
                        var esHoy = createdAt.isSame(new Date(), "day");
                        if(esHoy) {
                            $scope.indicacionesNuevas.push(indicacion);
                        }

                        // si la fecha de desactivacion es el dia de hoy
                        // entonces la agregamos a las indicaciones suspendidas
                        var updatedAt = moment(indicacion.updatedAt);
                        var isToday = updatedAt.isSame(new Date(), "day");
                        // console.log(isToday);
                        if(isToday && indicacion.activo == false) {
                            //$scope.indicacionesSuspendidas.push(indicacion);
                        }
                    });
                }
            });

        },

    });

    $scope.getDuration = function(start, end) {
        var inicio = moment(start);
        var fin = moment(end);
        return inicio.to(fin, true);
    };

    $scope.diasColocacionDrenaje = function(start, end) {
        if (!end) {
            end = Date.now();
        }
        var inicio = moment(start);
        var fin = moment(end);

        return parseInt(moment.duration(fin.diff(inicio)).asDays());
    };

    // Init
    $scope.init();

    Plex.initView({
        title: "Ver internación"
    });

    $scope.$watch('internacion', function(current, old) {
        // alert("cambio");
    });
}]);
