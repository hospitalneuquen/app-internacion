'use strict';

angular.module('app').controller('pacientes/evolucionar', ['$scope', 'Plex', 'plexParams', 'Shared', 'Server', '$timeout', 'Session', function($scope, Plex, plexParams, Shared, Server, $timeout, Session) {

    angular.extend($scope, {
        loading: true,
        cama: undefined,
        internacion: undefined,
        evolucionesEdit: undefined, // Item actual que se está editando
        // evoluciones: {},
        // array de servicios para filtrar en la vista
        servicios: [{
            id: null,
            nombreCorto: 'Todos'
        }],
        filtros: {
            evoluciones: [],
            servicio: null,
            filtrar: function() {
                var self = this;

                if (!this.servicio) {
                    $scope.filtros.evoluciones = $scope.internacion.evoluciones;
                } else {
                    $scope.filtros.evoluciones = [];
                    angular.forEach($scope.internacion.evoluciones, function(evolucion, key) {
                        if (self.servicio && evolucion.servicio.id === self.servicio) {
                            $scope.filtros.evoluciones.push(evolucion);
                        }

                    });
                }

            }
        },

        init: function() {
            // buscamos la cama
            Server.get("/api/internacion/cama/" + plexParams.idCama).then(function(cama) {
                $scope.cama = cama;
            });

            $scope.loading = true;
            // buscamos la internacion
            Server.get("/api/internacion/internacion/" + plexParams.idInternacion).then(function(internacion) {
                $scope.internacion = internacion;
                $scope.filtros.evoluciones = internacion.evoluciones;
                $scope.loading = false;

                if ($scope.internacion.evoluciones.length) {
                    var services_found = [];
                    // buscamos los servicios para el filtro de evoluciones
                    angular.forEach($scope.internacion.evoluciones, function(evolucion, key) {
                        if (evolucion.servicio && evolucion.servicio.id) {
                            if ($.inArray(evolucion.servicio.id, services_found) === -1) {
                                $scope.servicios.push(evolucion.servicio);
                                services_found.push(evolucion.servicio.id);
                                // $scope.servicios.push({
                                //     'text': evolucion.servicio.nombreCorto,
                                //     'nombreCorto': evolucion.servicio.nombreCorto,
                                //     'href': '#'
                                // });
                            }
                        }
                    });
                }
            });
        },
        // Inicia la edición de una evolución
        editarEvolucion: function(evolucion) {
            if (evolucion) { // Modificación
                $scope.evolucionesEdit = {};
                angular.copy(evolucion, $scope.evolucionesEdit);
                //item.$editing = true;
            } else { // Alta
                // Valores por defecto
                $scope.evolucionesEdit = {
                    fechaHora: new Date(),
                    tipo: Session.variables.prestaciones_workflow,
                    servicio: Session.servicioActual,
                }
            }
        },
        // Cancelar la edición
        cancelarEdicion: function() {
            $scope.evolucionesEdit = null;
        },
        // Guarda la evolución
        guardarEvolucion: function(evolucion) {
            Server.patch('/api/internacion/internacion/' + plexParams.idInternacion + '/evolucion/' + (evolucion.id || ''), $scope.evolucionesEdit, {
                minify: true
            }).then(function(data) {
                // actualizamos el listado de evoluciones
                $scope.actualizarEvoluciones(data);
                $scope.cancelarEdicion();

                //if ($scope.volverAlMapa) {
                //    Plex.closeView($scope.cama);
            });
        },
        actualizarEvoluciones: function(data) {
            var found = false;
            $scope.loading = true;

            var length = $scope.internacion.evoluciones.length;

            // buscamos la cama y actualizamos el valor con los datos
            for (var i = 0; i < length; i++) {

                if ($scope.internacion.evoluciones[i].id == data.id) {
                    // evolucion encontrada, actualizamos datos
                    $scope.internacion.evoluciones[i] = data;

                    found = true;
                    break;
                }
            }

            // si no lo encontro, entonces es porque acaba de cargarla
            // se la asignamos al resto de las evoluciones
            if (!found) {
                $scope.internacion.evoluciones.push(data);
            }

            $scope.loading = false;
        }
    });

    // Inicialización
    $scope.init();
    Plex.initView({
        title: "Evolucionar paciente"
    });
}]);
