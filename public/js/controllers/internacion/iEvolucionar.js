angular.module('app').controller('internacion/iEvolucionar', ['$scope', 'Plex', 'Shared', 'Server', '$timeout', 'Session', function($scope, Plex, Shared, Server, $timeout, Session) {
    'use strict';

    // DEBUG
    // Session.servicioActual = {
    //     "id": '56b3352698a74c8422cf8224',
    //     "_id": '56b3352698a74c8422cf8224',
    //     "nombre": "Servicio de Clínica Médica",
    //     "nombreCorto": "Clínica Médica"
    // };
    // Session.variables.prestaciones_workflow = "enfermero";
    // Shared.pase.post("56d5d9beb2953f2814509fbc", "56d723bb44550e180d6be265", {
    //     fechaHora: new Date(),
    //     servicio: Session.servicioActual.id,
    //     cama: '56cef2ebc070385d4770b7f0'
    // });
    //

    angular.extend($scope, {
        show_toolbar: true,
        tituloEvolucion: '',
        loading: true,
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
                    angular.forEach($scope.internacion.evoluciones, function(evolucion) {
                        if (self.servicio && evolucion.servicio.id === self.servicio) {
                            $scope.filtros.evoluciones.push(evolucion);
                        }
                    });
                }
            }
        },

        init: function(internacion) {
            $scope.loading = true;
            // buscamos la internacion
            // Shared.internacion.get($scope.include.idInternacion).then(function(internacion) {
            // $scope.internacion = internacion;
            if (internacion != null){
                $scope.internacion = internacion;

                $scope.filtros.evoluciones = internacion.evoluciones;
                $scope.loading = false;

                if ($scope.internacion.evoluciones.length) {
                    var services_found = [];

                    angular.forEach($scope.internacion.evoluciones, function(evolucion) {
                        // sumamos los totales por evolucion
                        evolucion.$total_ingresos = $scope.sumar(evolucion.ingresos);
                        evolucion.$total_egresos = $scope.sumar(evolucion.egresos);

                        evolucion.$balance = evolucion.$total_ingresos - evolucion.$total_egresos;

                        // buscamos los servicios para el filtro de evoluciones
                        if (evolucion.servicio && evolucion.servicio.id) {
                            if (!services_found.inArray(evolucion.servicio.id)) {
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
            }
        },

        // Inicia la edición de una evolución
        editarEvolucion: function(evolucion) {
            $scope.show_toolbar = false;
            if (evolucion) { // Modificación
                $scope.tituloFormulario = "Editar evolución";
                $scope.evolucionesEdit = {};
                angular.copy(evolucion, $scope.evolucionesEdit);
                //item.$editing = true;
            } else { // Alta
                $scope.tituloFormulario = "Agregar evolución";
                // Valores por defecto
                $scope.evolucionesEdit = {
                    fechaHora: new Date(),
                    tipo: Session.variables.prestaciones_workflow,
                    servicio: Session.servicioActual,
                };
            }
        },
        // Cancelar la edición
        cancelarEdicion: function() {
            $scope.evolucionesEdit = null;
            $scope.show_toolbar = true;
        },
        // Guarda la evolución
        guardarEvolucion: function(evolucion) {
            Shared.evolucion.post($scope.internacion.id, evolucion.id || null, $scope.evolucionesEdit, {
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

            // sumamos los totales por evolucion
            data.$total_ingresos = $scope.sumar(data.ingresos);
            data.$total_egresos = $scope.sumar(data.egresos);
            data.$balance = data.$total_ingresos - data.$total_egresos;

            var length = $scope.internacion.evoluciones.length;
            // buscamos la cama y actualizamos el valor con los datos
            for (var i = 0; i < length; i++) {
                if ($scope.internacion.evoluciones[i].id === data.id) {
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
        },
        // realizamos al suma de los valores para ingresos o egresos
        sumar: function(valores){
            var total = 0;

            angular.forEach(valores, function(value, key) {
                total += value;
            });

            return total;
        }

    });

    // inicializamos mediante el watch de la variable incluida
    $scope.$watch('include.internacion', function (current, old) {
        $scope.init(current);
    });
}]);