angular.module('app').controller('internacion/valoracionMedica', ['$scope', 'Plex', 'plexParams', 'Shared', function($scope, Plex, plexParams, Shared) {
    angular.extend($scope, {
        internacion: null,
        init: function() {
            Shared.internacion.get(plexParams.idInternacion).then(function(data) {
                $scope.internacion = data;
            });
        },

        checkIfEnterKeyWasPressed: function($event, input){
            // console.log($event.which);
            var keyCode = $event.which || $event.keyCode;
            if (keyCode === 13) {
                if (input == 1 && $scope.positivo !== "") {
                    // Do that thing you finally wanted to do
                    if (typeof $scope.internacion.ingreso.medico == "undefined"){
                        $scope.internacion.ingreso.medico = {};
                    }
                    if (typeof $scope.internacion.ingreso.medico.impresionDiagnostica == "undefined"){
                        $scope.internacion.ingreso.medico.impresionDiagnostica = {};
                    }
                    if (typeof $scope.internacion.ingreso.medico.impresionDiagnostica.listaPositivos == "undefined"){
                        $scope.internacion.ingreso.medico.impresionDiagnostica.listaPositivos = [];
                    }

                    $scope.internacion.ingreso.medico.impresionDiagnostica.listaPositivos.push($scope.positivo);

                    $scope.positivo = "";
                }
                if (input == 2 && $scope.sindrome !== "") {
                    // Do that thing you finally wanted to do
                    if (typeof $scope.internacion.ingreso.medico == "undefined"){
                        $scope.internacion.ingreso.medico = {};
                    }
                    if (typeof $scope.internacion.ingreso.medico.impresionDiagnostica == "undefined"){
                        $scope.internacion.ingreso.medico.impresionDiagnostica = {};
                    }
                    if (typeof $scope.internacion.ingreso.medico.impresionDiagnostica.listaSindromes == "undefined"){
                        $scope.internacion.ingreso.medico.impresionDiagnostica.listaSindromes = [];
                    }

                    $scope.internacion.ingreso.medico.impresionDiagnostica.listaSindromes.push($scope.sindrome);

                    $scope.sindrome = "";
                }
                if (input == 3 && $scope.hipotesis !== "") {
                    // Do that thing you finally wanted to do
                    if (typeof $scope.internacion.ingreso.medico == "undefined"){
                        $scope.internacion.ingreso.medico = {};
                    }
                    if (typeof $scope.internacion.ingreso.medico.impresionDiagnostica == "undefined"){
                        $scope.internacion.ingreso.medico.impresionDiagnostica = {};
                    }
                    if (typeof $scope.internacion.ingreso.medico.impresionDiagnostica.listaHipotesis == "undefined"){
                        $scope.internacion.ingreso.medico.impresionDiagnostica.listaHipotesis = [];
                    }

                    $scope.internacion.ingreso.medico.impresionDiagnostica.listaHipotesis.push($scope.hipotesis);

                    $scope.hipotesis = "";
                }
            }

        },

        guardar: function() {
            var data = {
                ingreso: $scope.internacion.ingreso
            };

            return Shared.internacion.post(plexParams.idInternacion, data).then(function(internacion){
                if (internacion){
                    Plex.alert("Valoración médica guardada");
                }
                Plex.closeView(internacion);
            });
        },
        cancelar: function() {
            Plex.closeView();
        },
    });

    // Init
    $scope.init();
    Plex.initView({
        title: "Valoración médica inicial"
    });
}]);
