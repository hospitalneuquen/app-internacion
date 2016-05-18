angular.module('app').controller('internacion/editar', ['$scope', 'Plex', 'plexParams', 'Server', '$timeout', 'Personas', 'Global', 'Shared', 'Session', '$filter', function($scope, Plex, plexParams, Server, $timeout, Personas, Global, Shared, Session, $filter) {
    angular.extend($scope, {
        esModificacion: plexParams.idInternacion,
        datosDisabled: true,
        tab: 1,
        internacion: null,
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
        personas: {
            data: null,
            promise: null,
            seleccionado: [],
            query: null,
            actualizar: function() {
                $scope.datosDisabled = true;
                var self = this;
                if (self.query) {
                    var params = {};
                    if (isNaN(self.query)) {
                        params.fulltext = self.query;
                    } else {
                        params.documento = self.query;
                    }
                    self.promise = Personas.get(params).then(function(data) {
                        self.data = data;
                        self.promise = null;
                    });
                }
            },
            seleccionar: function(item) {
                var self = $scope.personas;
                self.seleccionado = [item];

                Shared.internacion.get({
                    estado: ['enIngreso', 'enPase', 'ingresado'],
                    paciente: item.id
                }).then(function(data) {
                    if (data.length) {
                        Plex.alert("Atención: El paciente se encuentra actualmente internado");
                    } else {
                        $scope.datosDisabled = false;
                        $scope.tab = 1;
                        $scope.internacion.paciente = item;
                    }
                });
            }
        },
        pendientes: { // Pacientes pendientes de internación
            data: null,
            promise: null,
            seleccionado: [],
            orden: '-ingreso.fechaHora',
            ordenar: function(order) {
                var self = $scope.pendientes;
                self.data = $filter('orderBy')(self.data, order);
            },
            actualizar: function() {
                var self = $scope.pendientes;
                self.promise = Shared.internacion.get({
                    estado: ['enIngreso', 'enPase']
                }).then(function(data) {
                    self.data = data;
                    self.promise = null;
                });
            },
            seleccionar: function(item) {
                var self = $scope.pendientes;
                self.seleccionado = [item];

                // console.log(data);
                if (item.estado == 'enPase') {
                    var update = {
                        estado: 'ingresado'
                    };

                    // guardamos la internacion
                    Shared.internacion.post(item.id || null, update, {
                        minify: true
                    }).then(function(internacion) {
                        // generamos el pase
                        var pase = {
                            fechaHora: new Date(),
                            cama: plexParams.idCama,
                            servicio: Session.variables.servicioActual.id
                        };

                        Shared.pase.post(internacion.id, null, pase, {
                            minify: true
                        }).then(function(data) {
                            Plex.closeView(internacion);
                        });
                    });

                } else {
                    Plex.closeView(item);
                }
            }
        },
        cancelar: function() {
            Plex.closeView();
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
                        servicio: Session.variables.servicioActual.id
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
            $scope.personas.actualizar();

            $scope.tab = $scope.esModificacion ? 1 : 0;
            // Si es una modificación, buscamos los datos de la internacion ...
            if ($scope.esModificacion)
                Shared.internacion.get(plexParams.idInternacion).then(function(data) {
                    // Copia sólo algunos datos para modificar
                    $scope.internacion = {
                        paciente: data.paciente,
                        ingreso: data.ingreso,
                        tipo: data.tipo
                    };
                });
            else {
                // Datos por default
                $scope.internacion = {
                    ingreso: {
                        fechaHora: new Date()
                    }
                };
                $scope.pendientes.actualizar();
            }
        }
    });

    // Inicializa watches
    $scope.$watch('personas.query', function(current, old) {
        if (current != old){
            $scope.personas.actualizar();
            $scope.datosDisabled = true;
        }
    });

    $scope.$watch('datosDisabled', function(current, old) {
        console.log("Current: ", current);
    });

    // Init
    $scope.init();
}]);
