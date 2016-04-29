angular.module('app').controller('MapaController', ['$scope', 'Plex', 'Shared', 'Server', '$timeout', 'Session', '$alert', function($scope, Plex, Shared, Server, $timeout, Session, $alert) {
    'use strict';

    Session.servicioActual = {
        "id": '56b3352698a74c8422cf8224',
        "_id": '56b3352698a74c8422cf8224',
        "nombre": "Servicio de Clínica Médica",
        "nombreCorto": "Clínica Médica"
    };
    //
    // Session.servicioActual = {
    //     _id : '56b3352898a74c8422cf8263',
    //     "nombre": "Servicio de Clínica Quirúrgica",
    //     "nombreCorto" : "Clínica Quirúrgica"
    // };

    angular.extend($scope, {
        vista: 0,
        layout: 'grid',
        servicios: [{
            id: '',
            nombre: 'Todos'
        }],
        idServicioActual: '',
        // variable que determina si la internacion tiene info de ingreso
        ingresoEnfermeria: false,
        habitaciones: [],
        tipoCamas: [],
        camas: null,
        actions: [{
            text: 'Internación',
            handler: function(scope) {
                $scope.editarIngresoInternacion(scope.cama.id, scope.cama.idInternacion);
            }
        }, {
            text: 'Evoluciones',
            handler: function(scope) {
                $scope.evolucionarPaciente(scope.cama);
            }
        }, {
            text: 'Valoración inicial',
            handler: function(scope) {
                $scope.verValoracionInicial(scope.cama.idInternacion);
            }
        }, {
            text: 'Cargar prestaciones',
            handler: function(scope) {
                $scope.cargarPrestaciones();
            }
        }, {
            text: 'Desocupar cama',
            handler: function(scope) {
                $scope.egresarPaciente(scope.cama);
            }
        }],
        init: function() {
            // obtenemos las camas para armar el mapa
            Shared.Mapa.get(Session.ubicacionActual).then(function(data) {
                $scope.camas = data;
                $scope.filter.filtrar();

                var idServicios = [];
                angular.forEach($scope.camas, function(cama, key) {

                    if (cama.idInternacion) {
                        Shared.internacion.get(cama.idInternacion).then(function(internacion) {
                            cama.$internacion = internacion;
                        });
                    }

                    //asignamos las habitaciones
                    if (!$scope.habitaciones.inArray(cama.habitacion)) {
                        $scope.habitaciones.push(cama.habitacion);
                    }

                    // asignamos los tipos de camas
                    if (!$scope.tipoCamas.inArray(cama.tipoCama)) {
                        $scope.tipoCamas.push(cama.tipoCama);
                    }

                    // asignamos los servicios en base a los servicios
                    // que tiene cada cama
                    if (cama.servicio && typeof cama.servicio.id !== "undefined") {

                        if ($scope.servicios.length == 0) {
                            $scope.servicios.push(cama.servicio);
                            idServicios.push(cama.servicio._id);
                        } else {
                            if ($.inArray(cama.servicio._id, idServicios) == -1) {
                                $scope.servicios.push(cama.servicio);
                                idServicios.push(cama.servicio._id);
                            }
                        }
                    }

                });

                // ordenamos las habitaciones
                if ($scope.habitaciones.length > 0) {
                    $scope.habitaciones.sort();
                }
            });

        },
        filter: {
            camas: null,
            habitacion: null,
            oxigeno: false,
            desinfectada: null,
            tipoCama: false,
            nombre: null,
            estado: null,
            servicio: null,
            filtrar: function() {
                var self = this;
                var regex_nombre = new RegExp(".*" + self.nombre + ".*", "ig");

                var _desinfectada = (self.desinfectada) ? false : null;

                self.camas = $scope.camas.filter(function(i) {
                    // if (i.servicio && i.servicio.id && self.servicio && self.servicio.id)
                    //     console.log(Date.now(), self.servicio.id, i.servicio.id);
                    return (!self.oxigeno || (self.oxigeno && i.oxigeno)) &&
                        // (!self.desinfectada || (self.desinfectada && i.desinfectada)) &&
                        (_desinfectada === null || (!_desinfectada && !i.desinfectada)) &&
                        (!self.tipoCama || (self.tipoCama && i.tipoCama == self.tipoCama)) &&
                        (!self.habitacion || (self.habitacion && i.habitacion == self.habitacion)) &&
                        (!self.estado || (self.estado && i.estado == self.estado)) &&
                        (!self.servicio || !self.servicio.id || (self.servicio && i.servicio && i.servicio.id == self.servicio.id)) &&
                        (!self.nombre || (self.nombre && i.paciente && (regex_nombre.test(i.paciente.nombre) || (regex_nombre.test(i.paciente.apellido)) || (regex_nombre.test(i.paciente.documento)))));
                });
            },
            limpiarFiltros: function() {
                var self = this;
                self.habitacion = null;
                self.oxigeno = false;
                self.desinfectada = false;
                self.tipoCama = false;
                self.nombre = null;
                self.estado = null;
                self.servicio = null;
            }
        },

        verInternacion: function(idInternacion) {
            Plex.openView('internacion/ver/' + idInternacion).then(function() {

            });
        },
        // buscamos un paciente y creamos la itnernacion
        buscarPaciente: function(cama) {
            if (!cama.desinfectada) {
                $alert({
                    title: 'Cama sin desfinfectar',
                    content: 'La cama está actualmente sin desinfectar, no se puede internar a un paciente en ella.',
                    placement: 'top-right',
                    type: 'info',
                    show: true
                });
                return false;
            }
            Plex.openView('internacion/editar/cama/' + cama.id).then(function(internacion) {
                // si la internacion
                $scope.ingresoEnfermeria = (typeof internacion.ingreso.enfermeria === 'undefined') ? true : false;

                // operar con el paciente / internacion devuelto en data
                if (typeof internacion !== "undefined") {
                    $scope.cambiarEstado(cama, 'ocupada', internacion.id);
                } else {
                    //Plex.showError("Internacion no encontrada");
                }
            });
        },
        // cambiamos el estado de una cama
        cambiarEstado: function(cama, estado, idInternacion) {
            var dto = {
                estado: estado,
                motivo: (cama.$motivo && typeof cama.$motivo != "undefined") ? cama.$motivo : '',
                idInternacion: (idInternacion && typeof idInternacion != "undefined") ? idInternacion : ''
            };

            // el parametro updateUI en false, es para evitar la pantalla de error
            Server.post("/api/internacion/cama/cambiarEstado/" + cama.id, dto).then(function(data) {
                $scope.actualizarMapa(data);

                // verificamos si el parametro $action definido en la vista
                // viene con el valor 'internacion' y de ser asi, entonces
                // mostramos el formulario de valoracion de enfermeria
                if (cama.$action == 'internacion') {
                    // nos fijamos si no tiene datos de ingresos de enfermeria
                    // y de ser asi mostramos el formulario de valoracion de enfermeria

                    // if ($scope.ingresoEnfermeria){
                    //     $scope.openToast("Internacion creada. A continuación puede crear la valoración inicial.");
                    //
                    //     $timeout(function() {
                    //             if (data) {
                    //                 $scope.openToast("");
                    //                 $alert({
                    //                     title: 'Valoracion enfermeria guardada',
                    //                     content: '',
                    //                     placement: 'top-right',
                    //                     type: 'success',
                    //                     show: true
                    //                 });
                    //             }
                    //         });
                    //     }, 500);
                    // }

                    if ($scope.ingresoEnfermeria) {
                        $alert({
                            title: 'Internacion creada',
                            content: 'A continuación puede crear la valoración inicial.',
                            placement: 'top-right',
                            type: 'success',
                            show: true
                        });

                        $timeout(function() {
                            Plex.openView('valoracionEnfermeria/' + data.idInternacion).then(function(data) {
                                if (data) {
                                    $alert({
                                        title: '',
                                        content: 'Valoracion enfermeria guardada',
                                        placement: 'top-right',
                                        type: 'success',
                                        show: true
                                    });
                                }
                            });
                        }, 500);
                    }


                } else {
                    switch (estado) {
                        case 'reparacion':
                            var title = ' enviada a reparación';
                            break;
                        case 'desinfectada':
                            var title = ' desinfectada';
                            break;
                        case 'desocupada':
                            if (cama.$action == 'reparacion') {
                                var title = ' reparada';
                            } else {
                                var title = ' desocupada';
                            }
                            break;
                    }

                    $alert({
                        title: 'Cama ' + title,
                        content: '',
                        placement: 'top-right',
                        type: 'success',
                        show: true
                    });
                }

            });
        },

        evolucionarPaciente: function(cama) {
            Plex.openView('internacion/evolucionar/' + cama.idInternacion).then(function(data) {
                if (data) {
                    // buscamos la cama y actualizamos el estado como "desocupada"
                    $scope.cambiarEstado(cama, 'desocupada', internacion.id);
                }

            });
        },

        editarIngresoInternacion: function(idCama, idInternacion) {
            Plex.openView('internacion/editar/' + idInternacion).then(function(internacion) {
                if (internacion) {
                    Server.patch('/api/internacion/cama/' + idCama + '/cambiarPaciente/' + internacion.paciente).then(function(cama) {
                        $scope.actualizarMapa(cama);
                    });
                }
            });
        },

        verValoracionInicial: function(idInternacion) {
            Plex.openView('valoracionEnfermeria/' + idInternacion).then(function(internacion) {

            });

        },

        egresarPaciente: function(cama) {
            // buscamos la internacion y generamos el egreso
            Plex.openView("internacion/egresar/" + cama.idInternacion + "/" + cama.id).then(function(internacion) {
                if (internacion) {
                    // buscamos la cama y actualizamos el estado como "desocupada"
                    // $scope.cambiarEstado(cama, 'desocupada', internacion.id);
                    $scope.cambiarEstado(cama, 'desocupada');
                }
            });
        },
        actualizarMapa: function(data) {
            var length = $scope.camas.length;

            // buscamos la cama y actualizamos el valor con los datos
            for (var i = 0; i < length; i++) {
                if ($scope.filter.camas[i].id == data.id) {
                    // cama encontrada, actualizamos datos
                    $scope.filter.camas[i] = data;
                    $scope.filter.camas[i].$rotar = true;
                    // agregamos un pequeño timeout para volver a rotar la cama
                    $timeout(function() {
                        $scope.filter.camas[i].$rotar = false;
                    }, 120);

                    break;
                }
            }
        },
        closeView: function() {
            Plex.closeView({

            });
        },
    });

    $scope.diasColocacionDrenaje = function(start, end) {
        if (!end) {
            end = Date.now();
        }
        var inicio = moment(start);
        var fin = moment(end);

        return parseInt(moment.duration(fin.diff(inicio)).asDays());
    };

    $scope.$watch('filter.servicio', function(current, old) {
        if (current != old || (current && old && current.id && old.id != current.id != old.id)) {
            $scope.filter.filtrar();
        }
    });

    $scope.$watch('filter.nombre + filter.oxigeno + filter.desinfectada + filter.tipoCama + filter.habitacion + filter.estado', function(current, old) {
        if (current != old) {
            $scope.filter.filtrar();
        }
    });

    $scope.init();

    Plex.initView({
        title: "Mapa de camas"
    });
}]);
