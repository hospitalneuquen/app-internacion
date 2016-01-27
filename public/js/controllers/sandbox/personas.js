'use strict';

angular.module('appModule').controller('sandbox/personas', ['$scope', 'Plex', 'Server', '$timeout', 'Personas', function($scope, Plex, Server, $timeout, Personas) {
    angular.extend($scope, {
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
                    Personas.get(params).then(function(data) {
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
