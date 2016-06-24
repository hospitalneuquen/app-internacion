'use strict';

angular.module('app').controller('Pacientes/iHeaderController', ["$scope", function($scope) {
    /*
    Este (sub)controlador espera los siguientes parametros (plex-include):
        - internacion: object          | Objeto de internación

    Responde a los siguientes eventos:
        - Ninguno

    Emite los siguientes eventos:
        - Ninguno
    */

    angular.extend($scope, {
        internacion: null,
    });
    $scope.$watch('include.internacion', function(current, old) {
        $scope.internacion = current;
    });
}]);
