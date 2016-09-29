angular.module('app').controller('internacion/verEvolucion', ['$scope', 'Plex', 'plexParams', 'Server', 'Global', 'Shared', function($scope, Plex, plexParams, Server, Global, Shared) {
    'use strict';

    angular.extend($scope, {
        internacion: null,
        evolucion: null,
        indicacion: null,

        init: function() {
            // buscamos la internacion
            Shared.internacion.get(plexParams.idInternacion).then(function(internacion) {
                $scope.internacion = internacion;

                if (plexParams.idEvolucion) {
                    angular.forEach(internacion.evoluciones, function(evolucion) {
                        console.log(plexParams.idEvolucion);
                        console.log(evolucion.id);
                        if (evolucion.id == plexParams.idEvolucion) {
                            $scope.evolucion = evolucion;

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
