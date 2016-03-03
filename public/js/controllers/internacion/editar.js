angular.module('app').controller('internacion/editar', ['$scope', 'Plex', 'plexParams', 'Server', '$timeout', 'Personas', 'Global', 'Shared', 'Session', function($scope, Plex, plexParams, Server, $timeout, Personas, Global, Shared, Session) {
    'use strict';

    angular.extend($scope, {
        esModificacion: plexParams.idInternacion,
        internacion: null,
        personas: {
            data: null,
            query: '',
            timeoutHandler: null,
            actualizar: function() {
                var self = this;
                if (self.timeoutHandler)
                    $timeout.cancel(self.timeoutHandler);

                self.timeoutHandler = $timeout(function() {
                    if (!self.query)
                        return;

                    var params = {};
                    if (isNaN(self.query)) {
                        params.fulltext = self.query;
                    } else {
                        params.documento = self.query;
                    }
                    Personas.get(params).then(function(data) {
                        self.data = data;
                    });
                }, 250);
            }
        },
        pacientes: {
            internacion: undefined
        },
        seleccionarInternacion: function(data) {
            console.log(data);
            if (data.estado == 'enPase'){
                var update = {
                    estado : 'ingresado'
                };

                // guardamos la internacion
                Shared.internacion.post(data.id || null, update, {
                    minify: true
                }).then(function(data) {
                    var internacion = data;
                    // generamos el pase
                    var pase = {
                        fechaHora: data.ingreso.fechaHora,
                        cama: plexParams.idCama,
                        servicio: Session.servicioActual.id
                    };

                    Shared.pase.post(data.id, null, pase, {minify: true}).then(function(data){
                        Plex.closeView(internacion);
                    });

                });

            }else{
                Plex.closeView(data);
            }


        },

        // opciones para el select del tipo de internacion
        tiposInternacion: [{
            id: 'ambulatorio',
            nombre: 'Ambulatorio'
        }, {
            id: 'guardia',
            nombre: 'Guardia'
        }, {
            id: 'derivacion',
            nombre: 'Derivación'
        }, ],

        seleccionarPersona: function(paciente) {
            Shared.internacion.get({
                estado: ['enIngreso', 'enPase', 'ingresado'],
                paciente: paciente.id
            }).then(function(data) {
                if (data.length) {
                    Plex.showWarning("Atención: El paciente se encuentra actualmente internado");
                } else {
                    // Si no hay ninguna internacion creada, crea una con los valores por default
                    if (!$scope.internacion)
                        $scope.internacion = {
                            ingreso: {
                                fechaHora: new Date(),
                            }
                        };
                    $scope.internacion.paciente = paciente;
                }
            });
        },

        guardar: function() {
            // Completa datos para el alta
            if (!$scope.esModificacion) {
                // Si seleccionó una cama, crea un pase con los datos
                if (plexParams.idCama) {
                    $scope.internacion.estado = 'ingresado';
                    $scope.internacion.pases = [{
                        fechaHora: $scope.internacion.ingreso.fechaHora,
                        cama: plexParams.idCama,
                        servicio: Session.servicioActual.id
                    }];
                } else {
                    $scope.internacion.estado = 'enIngreso';
                }
            }

            Shared.internacion.post(plexParams.idInternacion || null, $scope.internacion, {
                minify: true
            }).then(function(data) {
                Plex.closeView(data);
            });
        },

        init: function() {
            // Si es una modificación, buscamos los datos de la internacion ...
            if ($scope.esModificacion)
                Shared.internacion.get(plexParams.idInternacion).then(function(data) {
                    // Copia sólo algunos datos para modificar
                    $scope.internacion = {
                        paciente: data.paciente,
                        ingreso: data.ingreso,
                    };
                    $scope.internacion.ingreso.tipo = Global.getById($scope.tiposInternacion, data.ingreso.tipo);
                });

            // buscamos los pacientes que estan en el estado 'enIngreso' o 'enPase'
            Shared.internacion.get({
                estado: ['enIngreso', 'enPase']
            }).then(function(data) {
                $scope.pacientes.internacion = data;
            });
        }
    });

    // Inicializa watches
    $scope.$watch('personas.query', function() {
        $scope.personas.actualizar();
    });

    // Init
    $scope.init();
    Plex.initView({
        title: plexParams.idInternacion ? "Editar internación" : "Internar paciente"
    });
}]);
