angular.module('app').controller('internacion/iGraficoLiquidos', ['$scope', 'Plex', 'Shared', 'Server', 'Session', function($scope, Plex, Shared, Server, Session) {
    'use strict';

    angular.extend($scope, {
        internacion: undefined,
        init: function(internacion) {
            // buscamos la internacion
            if (internacion != null) {
                $scope.internacion = internacion;

                if ($scope.internacion.evoluciones.length) {
                    angular.forEach($scope.internacion.evoluciones, function(evolucion) {
                        // calculamos balance de liquidos
                        $scope.calcularBalance(evolucion);
                    });

                    $scope.chart.update++;
                }
            }
        },
        // calcula los balances de liquidos que ha tenido una evoluciones
        calcularBalance: function(evolucion) {
            evolucion.$total_ingresos = 0;
            // sumamos los totales por evolucion
            if (evolucion.balance.ingresos.length) {
                angular.forEach(evolucion.balance.ingresos, function(ingreso) {
                    if (typeof ingreso.hidratacion != "undefined") {

                        if (typeof ingreso.hidratacion.enteral != "undefined") {
                            evolucion.$total_ingresos += $scope.sumar(ingreso.hidratacion.enteral);
                        }

                        if (typeof ingreso.hidratacion.parenteral != "undefined") {
                            evolucion.$total_ingresos += $scope.sumar(ingreso.hidratacion.parenteral);
                        }

                        if (typeof ingreso.hidratacion.oral != "undefined") {
                            evolucion.$total_ingresos += $scope.sumar(ingreso.hidratacion.oral);
                        }
                    }

                    if (typeof ingreso.medicamentos != "undefined") {
                        evolucion.$total_ingresos += $scope.sumar(ingreso.medicamentos);
                    }

                    if (typeof ingreso.hemoterapia != "undefined") {
                        evolucion.$total_ingresos += $scope.sumar(ingreso.hemoterapia);
                    }

                    if (typeof ingreso.nutricion != "undefined") {

                        if (typeof ingreso.nutricion.enteral != "undefined") {
                            evolucion.$total_ingresos += $scope.sumar(ingreso.nutricion.enteral);
                        }

                        if (typeof ingreso.nutricion.soporteOral != "undefined") {
                            evolucion.$total_ingresos += $scope.sumar(ingreso.nutricion.soporteOral);
                        }
                    }
                });
                // evolucion.balance.$total_ingresos = $scope.sumar(evolucion.balance.ingresos);
            }
            evolucion.$total_egresos = $scope.sumar(evolucion.balance.egresos);

            // calculamos el balance entre el ingreso y egreso
            evolucion.$balance = parseFloat(evolucion.$total_ingresos) - parseFloat(evolucion.$total_egresos);

            var d = new Date(evolucion.createdAt);
            var date = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());

            // var date = moment(evolucion.createdAt).format('MMMM Do YYYY, h:mm:ss a');

            if (evolucion.$total_ingresos){

                // guardamos el balance en el array de series para mostrar la grafica
                $scope.chart.options.series[0].data.push({
                    x: date,
                    y: evolucion.$total_ingresos
                });
                $scope.chart.options.series[1].data.push({
                    x: date,
                    y: evolucion.$total_egresos
                });
                $scope.chart.options.series[2].data.push({
                    x: date,
                    y: evolucion.$balance
                });

                // devolvemos la evolucion con los balances y los totales
                return evolucion;
            }

        },
        // realizamos al suma de los valores para ingresos o egresos
        sumar: function(valores) {
            var total = 0;

            angular.forEach(valores, function(value, key) {
                // verificamos si es un drenaje y entonces recorremos
                // para sumar los valores
                if (key === 'drenajes') {
                    if (value.length > 0) {
                        angular.forEach(value, function(drenaje, k) {
                            if (drenaje.cantidad) {
                                total += drenaje.cantidad;
                            }
                        });
                    }

                } else {
                    total += value;
                }

            });

            return total;
        },
        chart: {
            update: 1,
            options: {
                global: {
                    useUTC: false
                },
                // Seguir docs en http://api.highcharts.com/highcharts
                chart: {
                    type: 'spline',
                },
                title: {
                    text: 'Balance de líquidos'
                },
                legend: {
                    enabled: false
                },
                series: [{
                    name: 'Ingresos',
                    data: [],
                    dataLabels: {
                        enabled: true,
                        format: '{y} ml'
                    },
                    // marker: {
                    //     enabled: true
                    // },
                    // color: 'silver'
                }, {
                    name: 'Egresos',
                    data: [],
                    dataLabels: {
                        enabled: true,
                        format: '{y} ml'
                    },
                }, {
                    name: 'Balance',
                    data: [],
                    dataLabels: {
                        enabled: true,
                        format: '{y} ml'
                    },
                }, ],
                xAxis: {
                    type: 'datetime',
                    labels: {
                        format: '{value: %d/%m/%Y %H:%M }',
                    },
                    title: {
                        text: 'Fecha evolución'
                    }
                },
                yAxis: {
                    title: {
                        text: 'Valores ml'
                    },
                    // min: 0
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x:  %d/%m/%Y %H:%M}: {point.y:.2f} ml',
                    // dateTimeLabelFormats: '%e / %b / %Y %H:%M'
                    // dateTimeLabelFormats: {
                    //     month: '%e. %b',
                    //     year: '%b'
                    // }
                },
                plotOptions: {
                    spline: {
                        marker: {
                            enabled: true
                        }
                    }
                },
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom',

                },
            },
            init: function() {

            },
            forceUpdate: function() {
                this.update++;
            }
        },

    });

    // inicializamos mediante el watch de la variable incluida
    $scope.$watch('include.internacion', function(current, old) {
        $scope.init(current);
    });
}]);
