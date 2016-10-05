'use strict';

angular.module('app').controller('Pacientes/iHeaderController', ["$scope", "$filter", "Indicadores", function($scope, $filter, Indicadores) {
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
        riesgoCaidas: null,
        valoracionDolor: null,
        fiebre: null,
        glasgow: null,
        flebitis: null,
        upp: null,
        aislamiento: [],
        balanceTotalLiquidos: {
            ingresos: 0,
            egresos: 0,
            total: 0
        },
    });

    $scope.$watch('include.internacion', function(current, old) {
        $scope.internacion = current;
        if (current && current.evoluciones){
            $scope.riesgoCaidas = Indicadores.hayRiesgoCaidas($scope.internacion.evoluciones);
            $scope.valoracionDolor = Indicadores.hayValoracionDolor($scope.internacion.evoluciones);
            $scope.fiebre = Indicadores.hayFiebre($scope.internacion.evoluciones);
            $scope.glasgow = Indicadores.hayGlasgow($scope.internacion.evoluciones);
            $scope.flebitis = Indicadores.hayFlebitis($scope.internacion.evoluciones);
            $scope.upp = Indicadores.hayUlcerasPorPresion($scope.internacion.evoluciones);
            $scope.balanceTotalLiquidos = Indicadores.calcularBalanceLiquidos($scope.internacion.evoluciones, moment());
            $scope.aislamiento = Indicadores.hayAislamiento($scope.internacion.aislamiento);
            $scope.news = Indicadores.getNews($scope.internacion.evoluciones);
        }
    });
}]);
