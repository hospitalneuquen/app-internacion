angular.module('app').controller('internacion/iPrestaciones', ['$scope', 'Plex', 'Shared', 'Server', '$timeout', 'Session', 'Global', function($scope, Plex, Shared, Server, $timeout, Session, Global) {
    'use strict';

    angular.extend($scope, {
        show_toolbar_prestaciones: true,
        loading: true,
        internacion: undefined,
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
        prestacionesEdit: undefined, // Item actual que se está editando

        filtros: {
            prestaciones: [],
            servicio: null,
            filtrar: function(){
                var self = this;
                $scope.filtros.prestaciones = $scope.internacion.prestaciones;
                // if (!self.servicio) {
                //     $scope.filtros.prestaciones = $scope.internacion.prestaciones;
                // } else {
                //     $scope.filtros.prestaciones = [];
                //
                //     if (self.servicio.id !== "undefined" && self.servicio.id == 'mis-prestaciones'){
                //         angular.forEach($scope.internacion.prestaciones, function(prestacion) {
                //             if (self.servicio && prestacion.createdBy.id === Session.user.id) {
                //                 $scope.filtros.prestaciones.push(prestacion);
                //             }
                //         });
                //     }else{
                //         angular.forEach($scope.internacion.prestaciones, function(prestacion) {
                //             if (self.servicio && prestacion.servicio.id === self.servicio.id) {
                //                 $scope.filtros.prestaciones.push(prestacion);
                //             }
                //         });
                //     }
                // }
            }
        },

        buscarTipoPrestacion: function(query){
            // buscamos todos las prestaciones para cargar el select con las opciones
            var buscar = {
                nombre: query
            }

            return Shared.tipoPrestaciones.get(buscar);
        },
        init: function(internacion) {
            $scope.loading = true;
            // buscamos la internacion
            if (internacion != null) {
                $scope.internacion = internacion;

                $scope.filtros.prestaciones = internacion.prestaciones;
                $scope.loading = false;

                // if ($scope.internacion.prestaciones.length) {
                //     var services_found = [];
                //
                //     angular.forEach($scope.internacion.prestaciones, function(prestacion) {
                //
                //         // buscamos los servicios para el filtro de prestaciones
                //         if (prestacion.servicio && prestacion.servicio.id) {
                //             if (!services_found.inArray(prestacion.servicio.id)) {
                //                 $scope.servicios.push(prestacion.servicio);
                //                 services_found.push(prestacion.servicio.id);
                //             }
                //         }
                //     });
                // }

                $scope.filtros.filtrar();

            }
        },

        // Inicia la edición de una evolución
        editarPrestacion: function(prestacion) {
            $scope.show_toolbar_prestaciones = false;
            $scope.drenajes = [];

            if (prestacion) { // Modificación
                $scope.tituloFormulario = "Editar prestación";
                $scope.prestacionesEdit = {};

                angular.copy(prestacion, $scope.prestacionesEdit);

                $scope.prestacionesEdit.prioridad = Global.getById($scope.prioridad, prestacion.prioridad);

            } else { // Alta
                $scope.tituloFormulario = "Agregar evolución";

                // Valores por defecto
                $scope.prestacionesEdit = {
                    fechaHora: new Date(),
                    servicio: Session.variables.servicioActual,
                    estado: 'Pendiente'
                };
            }
        },
        // Cancelar la edición
        cancelarEdicion: function() {
            $scope.prestacionesEdit = null;
            $scope.show_toolbar_prestaciones = true;
        },

        // Guarda la evolución
        guardarPrestacion: function(prestacion) {
            Shared.prestaciones.post($scope.internacion.id, prestacion.id || null, $scope.prestacionesEdit, {
                minify: true
            }).then(function(data) {
                Plex.alert('Prestación guardada');

                // actualizamos el listado de prestaciones
                $scope.actualizarprestaciones(data);
                $scope.cancelarEdicion();
            });
        },

        actualizarprestaciones: function(data) {
            var found = false;
            $scope.loading = true;

            var length = $scope.internacion.prestaciones.length;
            // buscamos la cama y actualizamos el valor con los datos
            for (var i = 0; i < length; i++) {
                if ($scope.internacion.prestaciones[i].id === data.id) {
                    // prestacion encontrada, actualizamos datos
                    $scope.internacion.prestaciones[i] = data;
                    found = true;
                    break;
                }
            }

            // si no lo encontro, entonces es porque acaba de cargarla
            // se la asignamos al resto de las prestaciones
            if (!found) {
                $scope.internacion.prestaciones.push(data);
            }

            $scope.loading = false;
        }
    });

    // inicializamos mediante el watch de la variable incluida
    $scope.$watch('include.internacion', function(current, old) {
        $scope.init(current);
    });
}]);
