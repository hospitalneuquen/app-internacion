angular.module('app').controller('internacion/verEvolucion', ['$scope', 'Plex', 'plexParams', 'Server', 'Global', 'Shared', function($scope, Plex, plexParams, Server, Global, Shared) {
    'use strict';

    angular.extend($scope, {
        internacion: null,
        evolucion: null,

        init: function() {

            // buscamos la internacion
            Shared.internacion.get(plexParams.idInternacion).then(function(internacion) {
                $scope.internacion = internacion;

                // if (plexParams.idEvolucion) {
                //     angular.forEach(internacion.tratamientos, function(tratamiento) {
                //         if (tratamiento.id == plexParams.idTratamiento) {
                //             $scope.tratamiento = tratamiento;
                //         }
                //     });
                // } else {
                //     $scope.tratamiento = internacion.tratamientos[internacion.tratamientos.length - 1];
                // }

            });

        },

    });


    // Init
    $scope.init();

    Plex.initView({
        title: "Ver evolución",
        modal: true
    });
}]);
