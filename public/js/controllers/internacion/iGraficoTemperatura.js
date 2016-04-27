angular.module('app').controller('internacion/iGraficoTemperatura', ['$scope', 'Plex', 'Shared', 'Server', 'Session', function($scope, Plex, Shared, Server, Session) {
    'use strict';

    angular.extend($scope, {
        internacion: undefined,
        init: function(internacion) {
            // buscamos la internacion
            if (internacion != null) {
                $scope.internacion = internacion;

                if ($scope.internacion.evoluciones.length) {
                    angular.forEach($scope.internacion.evoluciones, function(evolucion) {

                        if (evolucion.temperatura) {
                            var d = new Date(evolucion.fechaHora);
                            var date = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds());

                            $scope.chart.options.series[0].data.push({
                                x: date,
                                y: evolucion.temperatura
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
                    text: 'Temperatura',
                    x: -20 //center
                },
                subtitle: {
                    text: '',
                    x: -20
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        rotation: -45,
                        format: '{value: %d/%m/%Y %H:%M }',
                    },
                    title: {
                        text: ''
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
                        text: 'Temperatura en °C'
                    }
                },
                tooltip: {
                    // valueSuffix: '',
                    // headerFormat: '<b>{series.name}</b><br>',
                    // pointFormat: '{point.x:%e. %b}: {point.y:.2f} °C'
                    headerFormat: '<b>{point.y:.2f} °C</b><br>',
                    pointFormat: '{point.x: %d/%m/%Y %H:%M}'
                },
                plotOptions: {
                    // series: {
                    //     pointPlacement: "on"
                    // },
                    spline: {
                        marker: {
                            enabled: true
                        }
                    }
                },
                legend: {
                    enabled: false
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
