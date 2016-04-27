angular.module('app').controller('internacion/iEvolucionar', ['$scope', 'Plex', 'Shared', 'Server', '$timeout', 'Session', function($scope, Plex, Shared, Server, $timeout, Session) {
    'use strict';

    angular.extend($scope, {
        tab: 0,
        show_toolbar: true,
        tituloEvolucion: '',
        loading: true,
        internacion: undefined,
        drenajes: [],
        drenajesInternacion: [],
        evolucionesEdit: undefined, // Item actual que se está editando
        balanceTotal: 0,
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
            if (internacion != null) {
                $scope.internacion = internacion;

                $scope.filtros.evoluciones = internacion.evoluciones;
                $scope.loading = false;

                if ($scope.internacion.evoluciones.length) {
                    var services_found = [];

                    angular.forEach($scope.internacion.evoluciones, function(evolucion) {

                        // calculamos balance de liquidos
                        $scope.calcularBalance(evolucion);

                        $scope.balanceTotal += evolucion.$balance;

                        // buscamos los servicios para el filtro de evoluciones
                        if (evolucion.servicio && evolucion.servicio.id) {
                            if (!services_found.inArray(evolucion.servicio.id)) {
                                $scope.servicios.push(evolucion.servicio);
                                services_found.push(evolucion.servicio.id);
                            }
                        }
                    });
                }

                if ($scope.internacion.drenajes.length) {
                    // cargamos los drenajes al array de drenajesInternacion
                    angular.forEach($scope.internacion.drenajes, function(drenaje){
                        // if (drenaje.fechaHasta && moment(new Date()).isBefore(drenaje.fechaHasta)){
                        drenaje.$activo = false;
                        if (!drenaje.fechaHasta){
                            drenaje.$activo = true;
                        }

                        $scope.drenajesInternacion.push(drenaje);
                    });
                }
            }
        },

        // Inicia la edición de una evolución
        editarEvolucion: function(evolucion) {
            $scope.show_toolbar = false;
            $scope.drenajes = [];

            if (evolucion) { // Modificación
                $scope.tituloFormulario = "Editar evolución";
                $scope.evolucionesEdit = {};
                angular.copy(evolucion, $scope.evolucionesEdit);

                // cargamos los drenajes de la internacion
                if ($scope.drenajesInternacion.length) {
                    angular.forEach($scope.drenajesInternacion, function(drenajeInternacion){
                        var drenaje = drenajeInternacion;
                        var encontrado = false;
                        // si el drenaje de la evolucion esta dentro de los de la internacion
                        if ($scope.evolucionesEdit.egresos.drenajes.length) {
                            angular.forEach($scope.evolucionesEdit.egresos.drenajes, function(drenajeEvolucion) {

                                if (!encontrado && drenajeInternacion.id == drenajeEvolucion.idDrenaje){
                                    drenaje.idDrenaje = drenajeEvolucion.idDrenaje;
                                    drenaje.caracteristicaLiquido = drenajeEvolucion.caracteristicaLiquido;
                                    drenaje.cantidad = drenajeEvolucion.cantidad;
                                    drenaje.observaciones = drenajeEvolucion.observaciones;

                                    encontrado = true;

                                    $scope.drenajes.push(drenaje);
                                }
                            });
                        }

                        if (!encontrado && drenajeInternacion.$activo === true){
                            drenaje.idDrenaje = "";
                            drenaje.caracteristicaLiquido = "";
                            drenaje.cantidad = "";
                            drenaje.observaciones = "";

                            $scope.drenajes.push(drenaje);
                        }

                    });
                }

            } else { // Alta
                $scope.tab = 1;
                $scope.tituloFormulario = "Agregar evolución";
                // Valores por defecto
                $scope.evolucionesEdit = {
                    fechaHora: new Date(),
                    tipo: Session.variables.prestaciones_workflow,
                    servicio: Session.servicioActual,
                    egresos: {
                        drenajes : []
                    }
                };

                // asignamos los drenajes activos
                if ($scope.drenajesInternacion.length) {
                    // cargamos los drenajes
                    angular.forEach($scope.drenajesInternacion, function(drenaje){
                        drenaje.idDrenaje = "";
                        drenaje.caracteristicaLiquido = "";
                        drenaje.cantidad = "";
                        drenaje.observaciones = "";
                        if (drenaje.$activo){
                            $scope.drenajes.push(drenaje);
                        }
                    });
                }

            }

        },
        // Cancelar la edición
        cancelarEdicion: function() {
            $scope.evolucionesEdit = null;
            $scope.show_toolbar = true;
        },
        // Guarda la evolución
        guardarEvolucion: function(evolucion) {
            // si se han evolucionado los drenajes entonces los cargamos
            if ($scope.drenajes.length > 0){
                $scope.evolucionesEdit.egresos.drenajes = [];
                angular.forEach($scope.drenajes, function(drenaje) {
                    var _drenaje = {
                        idDrenaje: drenaje.idDrenaje,
                        caracteristicaLiquido: drenaje.caracteristicaLiquido,
                        cantidad: drenaje.cantidad,
                        observaciones: drenaje.observaciones,
                    }
                    $scope.evolucionesEdit.egresos.drenajes.push(_drenaje);
                });
                // angular.copy($scope.drenajes, $scope.evolucionesEdit.egresos.drenajes);
            }
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

            // calculamos balance de liquidos
            //$scope.calcularBalance(data);

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

            // actualizamos el grafico
            // $scope.chart.update++;
        },
        // calcula los balances de liquidos que ha tenido una evoluciones
        calcularBalance: function(evolucion) {
            // sumamos los totales por evolucion
            evolucion.$total_ingresos = $scope.sumar(evolucion.ingresos);
            evolucion.$total_egresos = $scope.sumar(evolucion.egresos);

            // calculamos el balance entre el ingreso y egreso
            evolucion.$balance = parseFloat(evolucion.$total_ingresos) - parseFloat(evolucion.$total_egresos);

            // devolvemos la evolucion con los balances y los totales
            return evolucion;
        },
        // realizamos al suma de los valores para ingresos o egresos
        sumar: function(valores) {
            var total = 0;

            angular.forEach(valores, function(value, key) {
                // verificamos si es un drenaje y entonces recorremos
                // para sumar los valores
                if (key === 'drenajes' ){
                    if (value.length > 0){
                        angular.forEach(value, function(drenaje, k) {
                            if (drenaje.cantidad){
                                total += drenaje.cantidad;
                            }
                        });
                    }

                }else{
                    total += value;
                }

            });

            return total;
        },
    });

    // inicializamos mediante el watch de la variable incluida
    $scope.$watch('include.internacion', function(current, old) {
        $scope.init(current);
    });
}]);
