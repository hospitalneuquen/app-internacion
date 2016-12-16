'use strict';

angular.module('app').controller('Pacientes/iHeaderController', ["$scope", "$filter", "Indicadores", "Plex", function($scope, $filter, Indicadores, Plex) {
    /*
    Este (sub)controlador espera los siguientes parametros (plex-include):
        - internacion: object          | Objeto de internación

    Responde a los siguientes eventos:
        - Ninguno

    Emite los siguientes eventos:
        - Ninguno
    */

    angular.extend($scope, {
        // internacion: null,
        riesgoCaidas: null,
        valoracionDolor: null,
        temperatura: null,
        glasgow: null,
        flebitis: null,
        upp: null,
        aislamiento: [],
        indicadores: [],
        imc: null,
        balanceTotalLiquidos: {
            ingresos: 0,
            egresos: 0,
            total: 0
        },

        verEvolucion:function(idEvolucion){
            Plex.openView('internacion/verEvolucion/' + $scope.internacion.id + "/" + idEvolucion).then(function() {

            });
        },
        verNews : function(){
            Plex.openView('internacion/verNews/' + $scope.internacion.id).then(function() {

            });
        },
        init: function (){
            // alert("cambioe n iHdeader");
            // if (current && current.evoluciones){
            if ($scope.internacion && $scope.internacion.evoluciones){
                $scope.ultimaEvolucion = $scope.internacion.evoluciones[$scope.internacion.evoluciones.length-1];

                $scope.riesgoCaidas = Indicadores.hayRiesgoCaidas($scope.internacion);
                if ($scope.riesgoCaidas){
                    $scope.indicadores.riesgoCaidas = $scope.riesgoCaidas;
                }

                $scope.valoracionDolor = Indicadores.hayValoracionDolor($scope.internacion);
                if ($scope.valoracionDolor){
                    $scope.indicadores.valoracionDolor = $scope.valoracionDolor;
                }

                $scope.temperatura = Indicadores.hayFiebre($scope.internacion);
                if ($scope.temperatura){
                    $scope.indicadores.temperatura = $scope.temperatura;
                }

                $scope.glasgow = Indicadores.hayGlasgow($scope.internacion);
                if ($scope.glasgow){
                    $scope.indicadores.glasgow = $scope.glasgow;
                }

                $scope.flebitis = Indicadores.hayFlebitis($scope.internacion);
                if ($scope.flebitis){
                    $scope.indicadores.flebitis = $scope.flebitis;
                }

                $scope.upp = Indicadores.hayUlcerasPorPresion($scope.internacion);
                if ($scope.upp){
                    $scope.indicadores.upp = $scope.upp;
                }

                // $scope.balanceTotalLiquidos = Indicadores.calcularBalanceLiquidos($scope.internacion.evoluciones, moment());
                $scope.balanceTotalLiquidos = Indicadores.calcularBalanceLiquidos($scope.internacion);
                if ($scope.balanceTotalLiquidos){
                    $scope.indicadores.balanceTotalLiquidos = $scope.balanceTotalLiquidos;
                }

                $scope.aislamiento = Indicadores.hayAislamiento($scope.internacion.aislamiento);
                if ($scope.aislamiento){
                    $scope.indicadores.aislamiento = $scope.aislamiento;
                }

                $scope.news = Indicadores.getNews($scope.internacion);
                if ($scope.news){
                    $scope.indicadores.news = $scope.news;
                }

                $scope.imc = Indicadores.getImc($scope.internacion);
                if ($scope.imc){
                    $scope.indicadores.imc = $scope.imc;
                }
            }
        }
    });

    $scope.$watch('include.internacion', function(current, old) {
        $scope.init();
    });
}]);
