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
        estados: [{
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
        }, {
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
                    return (!self.estado.id || (self.estado.id && problema.estado == self.estado.id) || (self.estado.id == 'ActivoInactivo' && (problema.estado == 'Activo' || problema.estado == 'Inactivo'))) &&
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
                if (data.length){
                    $scope.showDiagnosticoTexto = false;
                }else{
                    $scope.showDiagnosticoTexto = true;
                    $scope.problemasEdit.diagnosticoTexto = "";
                    $scope.problemasEdit.diagnostico = {};
                    $scope.problemasEdit.diagnosticoCie = {};
                }
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

                $scope.problemasEdit.idProblema = $scope.problemasEdit.id;
                $scope.problemasEdit.diagnosticoCie = $scope.problemasEdit.diagnostico;
                $scope.problemasEdit.servicio = Session.variables.servicioActual.id;

            } else { // Alta
                $scope.tituloFormulario = "Agregar problema";

                // Valores por defecto
                $scope.problemasEdit = {
                    fechaDesde: new Date(),
                    servicio: Session.variables.servicioActual.id,
                    activo: true,
                    estado: 'Activo'
                };
            }

            $scope.showDiagnosticoTexto = ($scope.problemasEdit.diagnosticoTexto) ? true : false;
        },
        // Cancelar la edición
        cancelarEdicion: function() {
            $scope.problemasEdit = null;
            $scope.show_toolbar_problemas = true;
        },

        // Guarda el problema
        guardarProblema: function(problema) {
            problema.diagnostico = (problema.diagnosticoCie && problema.diagnosticoCie.id) ? problema.diagnosticoCie.id : null;
            // problema.servicio = (problema.servicio.id) ? problema.servicio.id : Session.variables.servicioActual.id;
            // problema.servicio = Session.variables.servicioActual.id;

            // console.log($scope.diagnosticCie);
            Shared.problemas.post($scope.internacion.id, problema.id || null, $scope.problemasEdit).then(function(data) {
                Plex.alert('Problema guardado');

                // actualizamos el listado de problemas
                $scope.actualizarProblemas(data);
                $scope.cancelarEdicion();
            });
        },

        actualizarProblemas: function(data) {
            var found = false;
            $scope.loading = true;

            // Shared.internacion.get($scope.internacion.id).then(function(data) {
            //
            //     if (data.length) {
            //         $scope.internacion.problemas = data.problemas;
            //     }
            // });
            var length = $scope.internacion.problemas.length;
            for (var i = 0; i < length; i++) {
                if ($scope.internacion.problemas[i].id === data.idProblema) {
                    $scope.internacion.problemas[i].activo = false;
                // if ($scope.internacion.problemas[i].id === data.id) {
                //     // problema encontrado, actualizamos datos
                //     $scope.internacion.problemas[i] = data;
                    // found = true;
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

    // inicializamos mediante el watch de la variable incluida
    $scope.$watch('include.internacion', function(current, old) {
        // console.log(current);
        $scope.init(current);
    });
}]);

angular.module('app').filter('estaActivo', function() {
    return function(collection, keyname) {

        var output = [],
            keys = [];

        angular.forEach(collection, function(item) {
            if (item.activo){
                output.push(item);
            }
        });

        return output;
    };
});
