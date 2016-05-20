angular.module('app').controller('internacion/iListaProblemas', ['$scope', 'Plex', 'Shared', 'Server', '$timeout', 'Session', 'Global', function($scope, Plex, Shared, Server, $timeout, Session, Global) {
    'use strict';

    angular.extend($scope, {
        show_toolbar_problemas: true,
        loading: true,
        layout: 'grid',
        internacion: undefined,
        problemasEdit: undefined, // Item actual que se está editando
        // campo que se muestra en caso que no encontrar diagnostico en la busqueda
        showDiagnosticoTexto: false,

        // array de estados para filtrar en la vista
        estados: [
        {
            id: 'ActivoInactivo',
            nombre: 'Activos + Inactivos'
        }, {
            id: 'Activo',
            nombre: 'Activo'
        }, {
            id: 'Inactivo',
            nombre: 'Inactivo'
        }, {
            id: 'Resuelto',
            nombre: 'Resuelto'
        }, {
            id: 'Transformado',
            nombre: 'Transformado'
        },{
            id: '',
            nombre: 'Todos'
        }],
        // array de servicios para filtrar en la vista
        servicios: [{
            id: '',
            nombreCorto: 'Todos'
        }],

        filtros: {
            problemas: [],
            activos: [],
            inactivos: [],
            estado: null,
            servicio: null,
            filtrar: function() {
                var self = this;

                // $scope.filtros.problemas = $scope.internacion.problemas;

                if (!self.servicio) {
                    self.servicio = $scope.servicios[0];
                }

                if (!self.estado) {
                    self.estado = $scope.estados[0];
                }

                self.problemas = $scope.internacion.problemas.filter(function(problema) {
                    return (!self.estado.id || (self.estado.id && problema.estado == self.estado.id) || (self.estado.id == 'ActivoInactivo' && (problema.estado == 'Activo' || problema.estado == 'Inactivo')) ) &&
                        (!self.servicio.id || (self.servicio && problema.servicio && problema.servicio.id == self.servicio.id))
                });


                self.activos = $scope.internacion.problemas.filter(function(problema) {
                    return (problema.estado == 'Activo')
                });

                self.inactivos = $scope.internacion.problemas.filter(function(problema) {
                    return (problema.estado == 'Inactivo')
                });

            }
        },

        init: function(internacion) {
            $scope.loading = true;
            // buscamos la internacion
            if (internacion !== null) {
                $scope.internacion = internacion;

                $scope.filtros.problemas = internacion.problemas;

                $scope.loading = false;

                if ($scope.internacion.problemas.length) {
                    var services_found = [];

                    angular.forEach($scope.internacion.problemas, function(problema) {

                        // buscamos los servicios para el filtro de problemas
                        if (problema.servicio && problema.servicio.id) {
                            if (!services_found.inArray(problema.servicio.id)) {
                                $scope.servicios.push(problema.servicio);
                                services_found.push(problema.servicio.id);
                            }
                        }
                    });
                }

                $scope.filtros.filtrar();

            }
        },

        buscarDiagnostico: function(query) {
            // buscamos todos los diagnosticos
            var buscar = {
                nombre: query,
                idPadre: 1 // harcodeamos el idPadre = 1 para que traiga solo CIE10
            }

            var diagnostico = Shared.diagnosticos.get(buscar);

            diagnostico.then(function(data) {
                $scope.showDiagnosticoTexto = (data.length) ? false : true;
            });

            return diagnostico;
        },

        // Inicia la edición de una evolución
        editarProblema: function(problema) {
            $scope.show_toolbar_problemas = false;

            if (problema) { // Modificación
                $scope.tituloFormulario = "Editar problema";
                $scope.problemasEdit = {};

                angular.copy(problema, $scope.problemasEdit);


            } else { // Alta
                $scope.tituloFormulario = "Agregar problema";

                // Valores por defecto
                $scope.problemasEdit = {
                    fechaDesde: new Date(),
                    servicio: Session.variables.servicioActual,
                    estado: 'Activo'
                };
            }
        },
        // Cancelar la edición
        cancelarEdicion: function() {
            $scope.problemasEdit = null;
            $scope.show_toolbar_problemas = true;
        },

        // Guarda el problema
        guardarProblema: function(problema) {
            // console.log(problema);
            Shared.problemas.post($scope.internacion.id, problema.id || null, $scope.problemasEdit, {
                minify: true
            }).then(function(data) {
                Plex.alert('Problema guardado');

                // actualizamos el listado de problemas
                $scope.actualizarproblemas(data);
                $scope.cancelarEdicion();
            });
        },

        actualizarproblemas: function(data) {
            var found = false;
            $scope.loading = true;

            var length = $scope.internacion.problemas.length;
            for (var i = 0; i < length; i++) {
                if ($scope.internacion.problemas[i].id === data.id) {
                    // problema encontrado, actualizamos datos
                    $scope.internacion.problemas[i] = data;
                    found = true;
                    break;
                }
            }

            // si no lo encontro, entonces es porque acaba de cargarla
            // se lo asignamos al resto de las problemas
            if (!found) {
                $scope.internacion.problemas.push(data);
            }

            $scope.filtros.filtrar();

            $scope.loading = false;
        }
    });

    // $scope.$watch('include.internacion', function(current, old) {
    //     $scope.init(current);
    // });

    // inicializamos mediante el watch de la variable incluida
    $scope.$watch('include.internacion', function(current, old) {
        $scope.init(current);
    });
}]);
