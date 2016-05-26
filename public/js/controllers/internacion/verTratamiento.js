angular.module('app').controller('internacion/verTratamiento', ['$scope', 'Plex', 'plexParams', 'Server', '$timeout', 'Personas', 'Global', 'Shared', function($scope, Plex, plexParams, Server, $timeout, Personas, Global, Shared) {
    'use strict';

    angular.extend($scope, {
        internacion: null,
        tratamiento: null,
        horarios: ['7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '1', '2', '3', '4', '5', '6'],
        init: function() {

            // buscamos la internacion
            Shared.internacion.get(plexParams.idInternacion).then(function(internacion) {
                $scope.internacion = internacion;

                if (plexParams.idTratamiento){
                    angular.forEach(internacion.tratamientos, function(tratamiento){
                        if (tratamiento.id == plexParams.idTratamiento){
                            $scope.tratamiento = tratamiento;
                        }
                    });
                }else{
                    $scope.tratamiento = internacion.tratamientos[internacion.tratamientos.length - 1];
                }

                angular.forEach($scope.tratamiento.indicaciones, function(indicacion){
                    if (indicacion.tipo == 'Plan Hidratación' ||
                        indicacion.tipo == 'Heparina o profilaxis' ||
                        indicacion.tipo == 'Protección gástrica' ||
                        indicacion.tipo == 'Otra medicación'){

                        indicacion.$descripcion = indicacion.medicamento.descripcion;

                    }else if (indicacion.tipo == "Controles"){
                        indicacion.$descripcion = indicacion.controles.tipo;
                    }else if (indicacion.tipo == "Cuidados generales"){
                        indicacion.$descripcion = indicacion.cuidadosGenerales.tipo;
                    }

                    indicacion.horarios = [];
                    var proximo = 0;
                    angular.forEach($scope.horarios, function(hora){
                        // indicacion.horarios[hora] = true;
                        if ( (indicacion.frecuencia == 'unica' || indicacion.frecuencia == '24' ) && hora == '8'){
                            indicacion.horarios[hora] = "X";
                        }

                        if (indicacion.frecuencia == '12' ) {
                            if (hora == '8'){
                                indicacion.horarios[hora] = "X";
                                proximo = parseInt(hora) + 12;
                            } else if (proximo == hora) {
                                indicacion.horarios[hora] = "X";
                            }
                        }

                        if (indicacion.frecuencia == '6' ) {
                            if (hora == '8'){
                                indicacion.horarios[hora] = "X";
                                proximo = parseInt(hora) + 6;
                            } else if (proximo == hora) {
                                indicacion.horarios[hora] = "X";
                                proximo = parseInt(hora) + 6;
                            }

                            if (proximo > 24){
                                proximo = proximo - 24;
                            }
                        }

                        if (indicacion.frecuencia == '4' ) {
                            if (hora == '8'){
                                indicacion.horarios[hora] = "X";
                                proximo = parseInt(hora) + 4;
                            } else if (proximo == hora) {
                                indicacion.horarios[hora] = "X";
                                proximo = parseInt(hora) + 4;
                            }

                            if (proximo > 24){
                                proximo = proximo - 24;
                            }
                        }


                        // <span ng-if="">
                        //     <span ng-init="anterior = hora"></span>
                        //     X
                        // </span>
                    });
                });
            });


        }
    });


    // Init
    $scope.init();

    Plex.initView({
        title: "Ver tratamiento"
    });
}]);
