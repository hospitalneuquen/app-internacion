'use strict';

angular.module('app').controller('internacion/evolucionar', ["$scope", "Plex", "plexParams", "Shared", function ($scope, Plex, plexParams, Shared) {
    /*
    Este (sub)controlador espera los siguientes parametros (plex-include):
        - internacion: id          | id de internación

    Responde a los siguientes eventos:
        - Ninguno

    Emite los siguientes eventos:
        - Ninguno
    */

    angular.extend($scope, {
        init: function() {
            // buscamos la internacion
            Shared.internacion.get(plexParams.idInternacion).then(function(internacion) {
                $scope.internacion = internacion;
            });
        }
    });

    // Inicialización
    $scope.init();
    Plex.initView({
        title: "Evolucionar paciente"
    });
}]);
