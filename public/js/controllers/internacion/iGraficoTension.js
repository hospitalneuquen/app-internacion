angular.module('app').controller('internacion/iGraficoTension', ['$scope', 'Plex', 'Shared', 'Server', 'Session', function($scope, Plex, Shared, Server, Session) {
    'use strict';

    angular.extend($scope, {
        internacion: undefined,
        init: function(internacion) {
            // buscamos la internacion
            if (internacion != null) {
                $scope.internacion = internacion;

                if ($scope.internacion.evoluciones.length) {
                    angular.forEach($scope.internacion.evoluciones, function(evolucion) {
                        if (typeof evolucion.signosVitales != "undefined" && typeof evolucion.signosVitales.circulacion != "undefined" && typeof evolucion.signosVitales.circulacion.tensionSistolica != "undefined"
                            && typeof evolucion.signosVitales.circulacion.tensionDiastolica != "undefined"
                            && evolucion.signosVitales.circulacion.tensionSistolica && evolucion.signosVitales.circulacion.tensionDiastolica) {


                            var d = new Date(evolucion.fechaHora);
                            var date = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());

                            $scope.chart.options.series[0].data.push({
                                x: date,
                                y: evolucion.signosVitales.circulacion.tensionSistolica
                            });
                            $scope.chart.options.series[1].data.push({
                                x: date,
                                y: evolucion.signosVitales.circulacion.tensionDiastolica
                            });
                        }
                    });
                }

                $scope.chart.update++;
            }
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
                    text: 'Tensión arterial'
                },
                series: [{
                    name: 'Sistólica',
                    data: [],
                    dataLabels: {
                        enabled: true,
                        format: '{y} mmHG'
                    },
                    // marker: {
                    //     enabled: true
                    // },
                    // color: 'silver'
                }, {
                    name: 'Diastólica',
                    data: [],
                    dataLabels: {
                        enabled: true,
                        format: '{y} mmHG'
                    },
                }],
                xAxis: {
                    type: 'datetime',
                    labels: {
                        format: '{value: %d/%m/%Y %H:%M }',
                    },
                    title: {
                        text: 'Fecha evolución'
                    },
                    gridLineWidth: 1,
                    lineColor: '#000',
                    tickColor: '#000',
                    type: 'datetime',
                    // dateTimeLabelFormats: { // don't display the dummy year
                    //     month: '%e. %b',
                    //     year: '%b'
                    // },
                    startOnTick: true
                },
                yAxis: {
                    minorTickInterval: 'auto',
                    lineColor: '#000',
                    lineWidth: 1,
                    tickWidth: 1,
                    tickColor: '#000',
                    title: {
                        text: 'Valores mmHG'
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
