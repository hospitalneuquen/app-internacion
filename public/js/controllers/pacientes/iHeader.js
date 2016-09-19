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
        riesgoCaidas: null,
        valoracionDolor: null,
        fiebre: null,
        glasgow: null,
        flebitis: null,
        upp: null,

        hayRiesgoCaidas: function() {
            var clase = "";

            if ($scope.internacion.evoluciones && $scope.internacion.evoluciones.length) {

                // traemos todas las evoluciones que tengan riesgo de caida
                var evoluciones = $scope.internacion.evoluciones.filter(function(evolucion) {
                    return (evolucion.tipo == "Controles" && evolucion.riesgoCaida && evolucion.riesgoCaida.total && evolucion.riesgoCaida.total > 0);
                });

                if (evoluciones.length) {

                    // ordenamos
                    evoluciones.sort(function(a, b) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    });

                    // escala
                    if (evoluciones[0].riesgoCaida.total < 25) {
                        $scope.riesgoCaidas = {
                            clase: "default",
                            indicador: "bajo",
                            valor: evoluciones[0].riesgoCaida.total
                        }

                    } else if (evoluciones[0].riesgoCaida.total >= 25 && evoluciones[0].riesgoCaida.total <= 50) {
                        $scope.riesgoCaidas = {
                            clase: "warning",
                            indicador: "medio",
                            valor: evoluciones[0].riesgoCaida.total
                        }
                    } else if (evoluciones[0].riesgoCaida.total > 50) {
                        $scope.riesgoCaidas = {
                            clase: "danger",
                            indicador: "alto",
                            valor: evoluciones[0].riesgoCaida.total
                        }
                    }

                    // var code = '<span class="tips label label-' + clase + '" title="Riesgo de caídas ' + indicador + '">Riesgo caídas</span>';

                    return $scope.riesgoCaidas;
                }
            }

            return null;
        },

        hayValoracionDolor: function() {
            var clase = "";

            if ($scope.internacion.evoluciones && $scope.internacion.evoluciones.length) {

                // traemos todas las evoluciones que tengan riesgo de caida
                var evoluciones = $scope.internacion.evoluciones.filter(function(evolucion) {
                    return (evolucion.tipo == "Controles" && evolucion.dolorValoracion && evolucion.dolorValoracion.intensidad && evolucion.dolorValoracion.intensidad > 0);
                });

                if (evoluciones.length) {

                    // ordenamos
                    evoluciones.sort(function(a, b) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    });

                    // escala
                    if (evoluciones[0].dolorValoracion.intensidad >= 1 && evoluciones[0].dolorValoracion.intensidad <= 3) {
                        $scope.valoracionDolor = {
                            clase: "default",
                            indicador: "leve",
                            valor: evoluciones[0].dolorValoracion.intensidad
                        }

                    } else if (evoluciones[0].dolorValoracion.intensidad >= 4 && evoluciones[0].dolorValoracion.intensidad <= 6) {
                        $scope.valoracionDolor = {
                            clase: "primary",
                            indicador: "moderado",
                            valor: evoluciones[0].dolorValoracion.intensidad
                        }

                    } else if (evoluciones[0].dolorValoracion.intensidad >= 7 && evoluciones[0].dolorValoracion.intensidad <= 9) {
                        $scope.valoracionDolor = {
                            clase: "warning",
                            indicador: "severo",
                            valor: evoluciones[0].dolorValoracion.intensidad
                        }

                    }
                    if (evoluciones[0].dolorValoracion.intensidad == 10) {
                        $scope.valoracionDolor = {
                            clase: "danger",
                            indicador: "intolerable",
                            valor: evoluciones[0].dolorValoracion.intensidad
                        }

                    }

                    // var code = '<span class="tips label label-' + clase + '" title="Riesgo de caídas ' + indicador + '">Riesgo caídas</span>';

                    return $scope.valoracionDolor;
                }
            }

            return null;
        },

        hayFiebre: function() {
            var clase = "";

            if ($scope.internacion.evoluciones && $scope.internacion.evoluciones.length) {

                // traemos todas las evoluciones que tengan riesgo de caida
                var evoluciones = $scope.internacion.evoluciones.filter(function(evolucion) {
                    return (evolucion.tipo == "Controles" && evolucion.signosVitales && evolucion.signosVitales.temperatura && evolucion.signosVitales.temperatura > 0);
                });

                if (evoluciones.length) {

                    // ordenamos
                    evoluciones.sort(function(a, b) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    });

                    // escala
                    if (evoluciones[0].signosVitales.temperatura <= 35) {
                        $scope.fiebre = {
                            clase: "info",
                            indicador: evoluciones[0].signosVitales.temperatura,
                            valor: evoluciones[0].signosVitales.temperatura
                        }

                    } else if (evoluciones[0].signosVitales.temperatura >= 35.1 && evoluciones[0].signosVitales.temperatura <= 36) {
                        $scope.fiebre = {
                            clase: "success",
                            indicador: evoluciones[0].signosVitales.temperatura,
                            valor: evoluciones[0].signosVitales.temperatura
                        }

                    } else if (evoluciones[0].signosVitales.temperatura >= 36.1 && evoluciones[0].signosVitales.temperatura <= 38) {
                        $scope.fiebre = {
                            clase: "default",
                            indicador: evoluciones[0].signosVitales.temperatura,
                            valor: evoluciones[0].signosVitales.temperatura
                        }

                    } else if (evoluciones[0].signosVitales.temperatura >= 38.1 && evoluciones[0].signosVitales.temperatura <= 39) {
                        $scope.fiebre = {
                            clase: "success",
                            indicador: evoluciones[0].signosVitales.temperatura,
                            valor: evoluciones[0].signosVitales.temperatura
                        }
                    } else if (evoluciones[0].signosVitales.temperatura >= 39.1) {
                        $scope.fiebre = {
                            clase: "danger",
                            indicador: evoluciones[0].signosVitales.temperatura,
                            valor: evoluciones[0].signosVitales.temperatura
                        }
                    }

                    // var code = '<span class="tips label label-' + clase + '" title="Riesgo de caídas ' + indicador + '">Riesgo caídas</span>';

                    return $scope.fiebre;
                }
            }

            return null;
        },

        hayGlasgow: function() {
            var clase = "";

            if ($scope.internacion.evoluciones && $scope.internacion.evoluciones.length) {

                // traemos todas las evoluciones que tengan riesgo de caida
                var evoluciones = $scope.internacion.evoluciones.filter(function(evolucion) {
                    return (evolucion.tipo == "Controles" && evolucion.glasgow && evolucion.glasgow.total && evolucion.glasgow.total > 0);
                });

                if (evoluciones.length) {

                    // ordenamos
                    evoluciones.sort(function(a, b) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    });

                    // // escala
                    if (evoluciones[0].glasgow.total > 3 && evoluciones[0].glasgow.total <= 8) {
                        $scope.glasgow = {
                            clase: "danger",
                            indicador: 'grave',
                            valor: evoluciones[0].glasgow.total
                        }

                    } else if (evoluciones[0].glasgow.total >= 9 && evoluciones[0].glasgow.total <= 13) {
                        $scope.glasgow = {
                            clase: "warning",
                            indicador: "moderado",
                            valor: evoluciones[0].glasgow.total
                        }

                    } else if (evoluciones[0].glasgow.total >= 14) {
                        $scope.glasgow = {
                            clase: "success",
                            indicador: "leve",
                            valor: evoluciones[0].glasgow.total
                        }

                    }
                    // var code = '<span class="tips label label-' + clase + '" title="Riesgo de caídas ' + indicador + '">Riesgo caídas</span>';

                    return $scope.glasgow;
                }
            }

            return null;
        },

        hayFlebitis: function() {
            var clase = "";

            if ($scope.internacion.evoluciones && $scope.internacion.evoluciones.length) {

                // traemos todas las evoluciones que tengan riesgo de caida
                var evoluciones = $scope.internacion.evoluciones.filter(function(evolucion) {
                    return (evolucion.tipo == "Controles" && evolucion.flebitis && evolucion.flebitis.grado && evolucion.flebitis.grado > 0);
                });

                if (evoluciones.length) {

                    // ordenamos
                    evoluciones.sort(function(a, b) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    });

                    // escala
                    if (evoluciones[0].flebitis.grado == 0) {
                        $scope.flebitis = {
                            clase: "info",
                            indicador: evoluciones[0].flebitis.grado,
                            valor: evoluciones[0].flebitis.grado
                        }

                    } else if (evoluciones[0].flebitis.grado == 1) {
                        $scope.flebitis = {
                            clase: "success",
                            indicador: evoluciones[0].flebitis.grado,
                            valor: evoluciones[0].flebitis.grado
                        }

                    } else if (evoluciones[0].flebitis.grado == 2) {
                        $scope.flebitis = {
                            clase: "warning",
                            indicador: evoluciones[0].flebitis.grado,
                            valor: evoluciones[0].flebitis.grado
                        }

                    } else if (evoluciones[0].flebitis.grado == 3) {
                        $scope.flebitis = {
                            clase: "danger",
                            indicador: evoluciones[0].flebitis.grado,
                            valor: evoluciones[0].flebitis.grado
                        }
                    }

                    // var code = '<span class="tips label label-' + clase + '" title="Riesgo de caídas ' + indicador + '">Riesgo caídas</span>';
                    return $scope.flebitis;
                }
            }

            return null;
        },

        hayUlcerasPorPresion: function(){
            var clase = "";

            if ($scope.internacion.evoluciones && $scope.internacion.evoluciones.length) {

                // traemos todas las evoluciones que tengan riesgo de caida
                var evoluciones = $scope.internacion.evoluciones.filter(function(evolucion) {
                    return (evolucion.tipo == "Controles" && evolucion.riesgoUPP && evolucion.riesgoUPP.total && evolucion.riesgoUPP.total > 0);
                });

                if (evoluciones.length) {

                    // ordenamos
                    evoluciones.sort(function(a, b) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    });

                    // escala
                    if (evoluciones[0].riesgoUPP.total >= 13 && evoluciones[0].riesgoUPP.total <= 16) {
                        $scope.upp = {
                            clase: "default",
                            indicador: "Riesgo bajo",
                            valor: evoluciones[0].riesgoUPP.total
                        }

                    } else if (evoluciones[0].riesgoUPP.total >= 10 && evoluciones[0].riesgoUPP.total <= 12) {
                        $scope.upp = {
                            clase: "warning",
                            indicador: "Riesgo medio",
                            valor: evoluciones[0].riesgoUPP.total
                        }

                    } else if (evoluciones[0].riesgoUPP.total >= 5 && evoluciones[0].riesgoUPP.total <= 9) {
                        $scope.upp = {
                            clase: "danger",
                            indicador: "Riesgo alto",
                            valor: evoluciones[0].riesgoUPP.total
                        }

                    }

                    // var code = '<span class="tips label label-' + clase + '" title="Riesgo de caídas ' + indicador + '">Riesgo caídas</span>';
                    return $scope.upp;
                }
            }

            return null;
        }
    });

    $scope.$watch('include.internacion', function(current, old) {
        $scope.internacion = current;
        $scope.hayRiesgoCaidas();
        $scope.hayValoracionDolor();
        $scope.hayFiebre();
        $scope.hayGlasgow();
        $scope.hayFlebitis();
        $scope.hayUlcerasPorPresion();
    });
}]);
