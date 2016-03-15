angular.module('app').controller('MapaController', ['$scope', 'Plex', 'Shared', 'Server', '$timeout', 'Session', '$mdToast', function($scope, Plex, Shared, Server, $timeout, Session, $mdToast) {
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
        // servicios: [],
        habitaciones: [],
        tipoCamas: [],
        camas: null,
        init: function() {
            // obtenemos las camas para armar el mapa
            Shared.Mapa.get(Session.ubicacionActual).then(function(data) {
                $scope.camas = data;
                $scope.filter.filtrar();

                var services_found = [];
                angular.forEach(data, function(cama, key) {

                    //asignamos las habitaciones
                    if (!$scope.habitaciones.inArray(cama.habitacion)) {
                        $scope.habitaciones.push(cama.habitacion);
                    }

                    // asignamos los tipos de camas
                    if (!$scope.tipoCamas.inArray(cama.tipoCama)) {
                        $scope.tipoCamas.push(cama.tipoCama);
                    }

                    // asignamos los servicios
                    // if (!$scope.servicios.length) {
                    //     $scope.servicios.push(cama.servicio);
                    //     services_found.push(cama.servicio._id);
                    // } else {
                    //
                    //     if ($.inArray(cama.servicio._id, services_found) == -1) {
                    //         $scope.servicios.push(cama.servicio);
                    //         services_found.push(cama.servicio._id);
                    //     }
                    // }
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
            desinfectada: false,
            tipoCama: false,
            nombre: null,
            estado: null,
            // servicio: false,
            filtrar: function() {
                var self = this;
                var regex_nombre = new RegExp(".*" + self.nombre + ".*", "ig");

                self.camas = $scope.camas.filter(function(i) {
                    return (!self.oxigeno || (self.oxigeno && i.oxigeno)) &&
                        (!self.desinfectada || (self.desinfectada && i.desinfectada)) &&
                        (!self.tipoCama || (self.tipoCama && i.tipoCama == self.tipoCama)) &&
                        (!self.habitacion || (self.habitacion && i.habitacion == self.habitacion)) &&
                        (!self.estado || (self.estado && i.estado == self.estado)) &&
                        // (!self.servicio || (self.servicio && i.servicio._id == self.servicio)) &&
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
            }
        },

        // buscamos un paciente y creamos la itnernacion
        buscarPaciente: function(cama) {
            if (!cama.desinfectada) {
                $scope.openToast("La cama está actualmente sin desinfectar, no se puede internar a un paciente en ella.");
                return false;
            }
            Plex.openView('internacion/editar/cama/' + cama.id).then(function(internacion) {
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

                    $scope.openToast("Internacion creada. A continuación puede crear la valoración inicial.");

                    $timeout(function() {
                        Plex.openView('valoracionEnfermeria/' + data.idInternacion).then(function() {

                        });
                    }, 500);

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

                    $scope.openToast("Cama " + title);
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

            // Server.get('/api/internacion/internacion/' + idInternacion + '/valoracionEnfermeria').then(function(valoracionInicial){
            //     console.log(valoracionInicial);
            // });
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

        verInternacion: function(idInternacion) {
            Plex.openView('internacion/ver/' + idInternacion).then(function() {

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

        // mostrar notificacion
        openToast: function($text) {
            $mdToast.show(
                $mdToast
                .simple()
                .position('right top')
                .hideDelay(6000)
                .textContent($text)
            );
        }

    });

    $scope.$watch('filter.nombre + filter.oxigeno + filter.desinfectada + filter.tipoCama + filter.habitacion + filter.estado', function(current, old) {
        if (current != old) {
            $scope.filter.filtrar();
        }
    });

    $scope.init();

}]);
