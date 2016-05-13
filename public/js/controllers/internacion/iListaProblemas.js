angular.module('app').controller('internacion/iListaProblemas', ['$scope', 'Plex', 'Shared', 'Server', '$timeout', 'Session', 'Global', function($scope, Plex, Shared, Server, $timeout, Session, Global) {
    'use strict';

    angular.extend($scope, {
        show_toolbar_problemas: true,
        loading: true,
        internacion: undefined,
        problemasEdit: undefined, // Item actual que se está editando

        filtros: {
            problemas: [],
            servicio: null,
            filtrar: function(){
                var self = this;
                $scope.filtros.problemas = $scope.internacion.problemas;
            }
        },

        init: function(internacion) {
            $scope.loading = true;
            // buscamos la internacion
            if (internacion !== null) {
                $scope.internacion = internacion;

                $scope.filtros.problemas = internacion.problemas;
                $scope.loading = false;

                $scope.filtros.filtrar();

            }
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
                    servicio: Session.servicioActual,
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

            $scope.loading = false;
        }
    });

    // inicializamos mediante el watch de la variable incluida
    $scope.$watch('include.internacion', function(current, old) {
        $scope.init(current);
    });
}]);
