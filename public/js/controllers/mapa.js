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
                Plex.showWarning("La cama está actualmente sin desinfectar, no se puede internar a un paciente en ella.");
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

                    // una vez actualizado el mapa de cama, mostramos el formulario
                    // de carga de datos de la valoracion inicial
                    // $alert({
                    //     title: 'Internacion creada',
                    //     content: 'A continuación puede crear la valoración inicial.',
                    //     placement: 'top-right',
                    //     type: 'success',
                    //     show: true
                    // });
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

                    // $alert({
                    //     title: 'Cama ' + title,
                    //     content: '',
                    //     placement: 'top-right',
                    //     type: 'success',
                    //     show: true
                    // });
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

        // generarPase: function(cama) {
        //     var data = {
        //         estado: 'enPase'
        //     };
        //
        //     Shared.internacion.post(cama.idInternacion, data).then(function(){
        //         // var pase = {
        //         //     fechaHora : new Date(),
        //         //     servicio : Session.servicioActual.id,
        //         //     cama : cama.id
        //         // }
        //
        //         // Shared.pase.post(cama.idInternacion, null, pase, {minify: true}).then(function(){
        //         //     // buscamos la cama y actualizamos el estado como "desocupada"
        //         //     $scope.cambiarEstado(cama, 'desocupada');
        //         // });
        //
        //         // buscamos la cama y actualizamos el estado como "desocupada"
        //         $scope.cambiarEstado(cama, 'desocupada');
        //     });
        //
        // },
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
                    }, 100);

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
// .config(function($mdThemingProvider) {

// Configure a dark theme with primary foreground yellow

// $mdThemingProvider.theme('docs-dark', 'default')
//   .primaryPalette('yellow')
//   .dark();

// $mdThemingProvider.definePalette('amazingPaletteName', {
//     '50': 'ffebee',
//     '100': 'ffcdd2',
//     '200': 'ef9a9a',
//     '300': 'e57373',
//     '400': 'ef5350',
//     '500': 'f44336',
//     '600': 'e53935',
//     '700': 'd32f2f',
//     '800': 'c62828',
//     '900': 'b71c1c',
//     'A100': 'ff8a80',
//     'A200': 'ff5252',
//     'A400': 'ff1744',
//     'A700': 'd50000',
//     'contrastDefaultColor': 'light', // whether, by default, text (contrast)
//     // on this palette should be dark or light
//     'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
//         '200', '300', '400', 'A100'
//     ],
//     'contrastLightColors': undefined // could also specify this if default was 'dark'
// });
// $mdThemingProvider.theme('amazingPaletteName')
//     .primaryPalette('amazingPaletteName')
//     .dark()

// });
