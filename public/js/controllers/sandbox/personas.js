angular.module('app').controller('sandbox/personas', ['$scope', 'Plex', 'Server', '$timeout', 'Personas', function($scope, Plex, Server, $timeout, Personas) {
    angular.extend($scope, {
        promise: null,
        chart: {
            update: 1,
            options: {
                // Seguir docs en http://api.highcharts.com/highcharts
                chart: {
                    type: 'spline',
                },
                title: {
                    text: ''
                },
                legend: {
                    enabled: false
                },
                series: [{
                    name: 'Peso',
                    data: [
                        { x: new Date(2015, 5, 5),
                            y: 100
                        },
                        { x: new Date(2016, 6, 6),
                            y: 200
                        }
                    ],
                    dataLabels: {
                        enabled: true,
                        format: '{y} Kg'
                    },
                    marker: {
                        enabled: true
                    },
                    color: 'silver'
                }, ],
                xAxis: {
                    type: 'datetime',
                    title: {
                        text: ''
                    }
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    min: 0
                }
            },
            init: function() {

            },
            forceUpdate: function() {
                this.update++;
            }
        },
        personas: {
            data: null,
            query: 'Urbano',
            timeoutHandler: null,
            actualizar: function() {
                var self = this;
                if (self.timeoutHandler)
                    $timeout.cancel(self.timeoutHandler);

                self.timeoutHandler = $timeout(function() {
                    if (!self.query)
                        return;

                    var params = {};
                    if (isNaN(self.query)) {
                        params.fulltext = self.query;
                    } else {
                        params.documento = self.query;
                    }
                    self.promise = Personas.get(params).then(function(data) {
                        self.data = data;
                    });
                }, 250);
            }
        },
    });

    // Inicializa watches
    $scope.$watch('personas.query', function() {
        $scope.personas.actualizar();
    });

    // Inicializa vista
    Plex.initView({
        title: "MPI (Master Patient Index)",
    });
}]);
