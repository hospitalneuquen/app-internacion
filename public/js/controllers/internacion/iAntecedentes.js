angular.module('app').controller('internacion/iAntecedentes', ["$scope", "Server", "Plex", function($scope, Server, Plex) {
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
        antecedentesBinarios: null,
        seleccionado: null,
        nuevaFila: null, // Indica el índice de la nueva fila para destacarla
        antecedenteFamiliar: undefined,

        remove: function(item) {
            $scope.internacion.ingreso.antecedentes.binarios.splice($scope.internacion.ingreso.antecedentes.binarios.indexOf(item), 1);
        },

        agregarAntecedenteFamiliar: function(){
            // console.log($scope.indicacion);
            if (typeof $scope.internacion.ingreso.antecedentes.familiares == "undefined"){
                $scope.internacion.ingreso.antecedentes.familiares = [];
            }

            $scope.internacion.ingreso.antecedentes.familiares.push($scope.antecedenteFamiliar);

            $scope.antecedenteFamiliar = {};
        },

        agregarAlergia: function(){
            // console.log($scope.indicacion);
            if (typeof $scope.internacion.ingreso.antecedentes.alergias == "undefined"){
                $scope.internacion.ingreso.antecedentes.alergias = [];
            }

            $scope.internacion.ingreso.antecedentes.alergias.push($scope.antecedenteAlergia);

            $scope.antecedenteAlergia = {};
        },

        agregarVacuna: function(){
            // console.log($scope.indicacion);
            if (typeof $scope.internacion.ingreso.antecedentes.vacunas == "undefined"){
                $scope.internacion.ingreso.antecedentes.vacunas = [];
            }

            $scope.internacion.ingreso.antecedentes.vacunas.push($scope.antecedenteVacuna);

            $scope.antecedenteVacuna = {};
        },
    });

    // Watches
    $scope.$watch('seleccionado', function(current, old) {
        if (current && (current != old)) {
            $scope.nuevaFila = null;
            if ($scope.internacion.ingreso.antecedentes.binarios.some(function(i) {
                    return i.antecedente.id === current.id;
                })) {
                Plex.alert("El antecedente ya está indicado", "info");
            } else {
                $scope.internacion.ingreso.antecedentes.binarios.push({
                    antecedente: current
                });
                $scope.nuevaFila = $scope.internacion.ingreso.antecedentes.binarios.length - 1;
            }
        }
    });

    // Init
    $scope.$watch('include.internacion', function(current, old) {
        if (!$scope.internacion && current) {
            $scope.internacion = current;
            Server.get("/api/internacion/antecedenteBinario").then(function(data) {
                $scope.antecedentesBinarios = data;

                // Si no tiene ningún antecedente, agrega + frecuentes
                angular.merge($scope.internacion, {
                    ingreso: {
                        antecedentes: {
                            binarios: []
                        }
                    }
                });

                if (!$scope.internacion.ingreso.antecedentes.binarios.length) {
                    $scope.antecedentesBinarios.forEach(function(i) {
                        if (i.frecuente && i.grupo != "Estilo de vida" && i.grupo != "Alergias" )
                            $scope.internacion.ingreso.antecedentes.binarios.push({
                                antecedente: i
                            });
                    });
                }

                // Sort
                $scope.internacion.ingreso.antecedentes.binarios.sort(function(a, b) {
                    return (a.antecedente.grupo + a.antecedente.nombre) > (b.antecedente.grupo + b.antecedente.nombre);
                });
            });
        }
    });
}]);
