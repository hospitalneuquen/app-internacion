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

                if (plexParams.idTratamiento) {
                    angular.forEach(internacion.tratamientos, function(tratamiento) {
                        if (tratamiento.id == plexParams.idTratamiento) {
                            $scope.tratamiento = tratamiento;
                        }
                    });
                } else {
                    $scope.tratamiento = internacion.tratamientos[internacion.tratamientos.length - 1];
                }

                angular.forEach($scope.tratamiento.indicaciones, function(indicacion) {

                    // agregamos el array de horarios a marcar
                    indicacion.horarios = [];

                    // determinamos en que momento comienza
                    var fecha = new Date(indicacion.fechaHora);
                    var proximo = parseInt(fecha.getHours());

                    angular.forEach($scope.horarios, function(hora) {
                        // si la hora es igual al horario de la proxima indicacion
                        // entonces marcamos el horario en la tabla
                        if (hora == proximo) {
                            indicacion.horarios[hora] = "X";

                            if (indicacion.frecuencia != 'unica' || indicacion.frecuencia != '24'){
                                // sumamos a la hora marcada la frecuencia
                                proximo = parseInt(hora) + parseInt(indicacion.frecuencia);

                                if (proximo > 24) {
                                    proximo = proximo - 24;
                                }
                            }
                        }
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
