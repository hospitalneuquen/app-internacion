'use strict';

angular.module('app').controller('Pacientes/iHeaderController', ["$scope", "Shared", function ($scope, Shared) {
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
        riesgoCaidas: 0
    });
    $scope.$watch('include.internacion', function (current, old) {
        $scope.internacion = current;

        // riesgo caidas
        Shared.internacion.calcularRiesgoCaida(current).then(function(total) {
            $scope.riesgoCaidas = total;
        })

    });
}]);
