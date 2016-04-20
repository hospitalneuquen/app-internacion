angular.module('app').controller('internacion/iGraficoSaturacion', ['$scope', 'Plex', 'Shared', 'Server', 'Session', function($scope, Plex, Shared, Server, Session) {
    'use strict';

    angular.extend($scope, {
        internacion: undefined,
        init: function(internacion) {
            // buscamos la internacion
            if (internacion != null) {
                $scope.internacion = internacion;

                if ($scope.internacion.evoluciones.length) {
                    angular.forEach($scope.internacion.evoluciones, function(evolucion) {

                        if (evolucion.spo2) {
                            var d = new Date(evolucion.fechaHora);
                            var date = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());

                            $scope.chart.options.series[0].data.push({
                                x: date,
                                y: evolucion.spo2
                            });
                        }
                    });

                    $scope.chart.update++;
                }
            }
        },

        chart: {
            update: 1,
            options: {
                global: {
                    useUTC: false
                },
                title: {
                    text: 'Saturación oxígeno',
                    x: -20 //center
                },
                subtitle: {
                    text: '',
                    x: -20
                },
                xAxis: {
                    gridLineWidth: 1,
                    lineColor: '#000',
                    tickColor: '#000',
                    type: 'datetime',
                    // dateTimeLabelFormats: { // don't display the dummy year
                    //     month: '%e. %b',
                    //     year: '%b'
                    // },
                    startOnTick: true,
                    labels: {
                        rotation: -45,
                        format: '{value: %d/%m/%Y %H:%M }',
                    },
                    title: {
                        text: ''
                    }
                },
                yAxis: {
                    minorTickInterval: 'auto',
                    lineColor: '#000',
                    lineWidth: 1,
                    tickWidth: 1,
                    tickColor: '#000',
                    title: {
                        text: '% de saturación de oxígeno'
                    }
                },
                tooltip: {
                    // valueSuffix: '',
                    // headerFormat: '<b>{series.name}</b><br>',
                    // pointFormat: '{point.x:%e. %b}: {point.y:.2f} °C'
                    pointFormat: '{point.y:.2f} %'
                },
                legend: {
                    enabled: false
                },
                plotOptions: {
                    series: {
                        pointPlacement: "on"
                    },
                    spline: {
                        marker: {
                            enabled: true
                        }
                    }
                },
                // legend: {
                //     layout: 'vertical',
                //     align: 'right',
                //     verticalAlign: 'middle',
                //     borderWidth: 0
                // },
                series: [{
                    pointStart: 0,
                    name: '',
                    data: []
                }]

            },
            init: function() {

            },
            forceUpdate: function() {
                this.update++;
            }
        }


    });

    // inicializamos mediante el watch de la variable incluida
    $scope.$watch('include.internacion', function(current, old) {
        $scope.init(current);
    });
}]);
