angular.module('app').controller('internacion/ver', ['$scope', 'Plex', 'plexParams', 'Server', '$timeout', 'Personas', 'Global', 'Shared', function($scope, Plex, plexParams, Server, $timeout, Personas, Global, Shared) {
    'use strict';

    angular.extend($scope, {
        internacion: null,
        pases: null,
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

        init: function() {
            $scope.loading = true;
            // buscamos la internacion
            Shared.internacion.get(plexParams.idInternacion).then(function(internacion) {
                $scope.internacion = internacion;
                $scope.filtros.evoluciones = internacion.evoluciones;
                $scope.loading = false;

                if ($scope.internacion.evoluciones.length) {
                    var services_found = [];
                    // buscamos los servicios para el filtro de evoluciones
                    angular.forEach($scope.internacion.evoluciones, function(evolucion) {
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
                console.log(internacion);
            });


        }
    });

    // Init
    $scope.init();

    Plex.initView({
        title: "Internación"
    });
}]);
