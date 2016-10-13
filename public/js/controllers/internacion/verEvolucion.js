angular.module('app').controller('internacion/verEvolucion', ['$scope', 'Plex', 'plexParams', 'Server', 'Global', 'Shared', function($scope, Plex, plexParams, Server, Global, Shared) {
    'use strict';

    angular.extend($scope, {
        internacion: null,
        evolucion: null,
        indicacion: null,

        // propiedades para el grafico de UPP
        graph : {'width': 360, 'height': 470},
        radius : 10,
        sw : 55,

        init: function() {
            // buscamos la internacion
            Shared.internacion.get(plexParams.idInternacion).then(function(internacion) {
                $scope.internacion = internacion;

                if (plexParams.idEvolucion) {
                    angular.forEach(internacion.evoluciones, function(evolucion) {
                        if (evolucion.id == plexParams.idEvolucion) {
                            $scope.evolucion = evolucion;

                            if (evolucion.balance){
                                Shared.evolucion.calcularBalance($scope.evolucion, function(evolucion){
                                    $scope.evolucion = evolucion;
                                });
                            }

                            angular.forEach(internacion.indicaciones, function(indicacion) {
                                if (indicacion.id == evolucion.idIndicacion) {
                                    $scope.indicacion = indicacion;
                                }
                            });
                        }
                    });
                } else {
                    // $scope.tratamiento = internacion.tratamientos[internacion.tratamientos.length - 1];
                }
                // console.log($scope.evolucion);
            });

        },

    });


    // Init
    $scope.init();

    Plex.initView({
        title: "Evolución",
        modal: true
    });
}]);
