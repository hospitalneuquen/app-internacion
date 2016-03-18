angular.module('app').controller('internacion/buscar', ['$scope', 'Plex', 'Server', 'Personas', 'Shared', 'Session', '$filter', '$mdToast', function($scope, Plex, Server, Personas, Shared, Session, $filter, $mdToast) {
    angular.extend($scope, {
        internaciones: null,
        internacionesDisabled: true,
        tab: 0,
        personas: {
            data: null,
            promise: null,
            seleccionado: [],
            query: null,
            actualizar: function() {
                $scope.internacionesDisabled = true;
                var self = this;
                if (self.query) {
                    var params = {};
                    if (isNaN(self.query)) {
                        params.fulltext = self.query;
                    } else {
                        params.documento = self.query;
                    }
                    self.promise = Personas.get(params).then(function(data) {
                        self.data = data;
                        self.promise = null;
                    });
                }
            },
            seleccionar: function(item) {
                // var self = $scope.personas;
                self.seleccionado = [item];

                Shared.internacion.get({
                    paciente: item.id
                }).then(function(data) {
                    if (!data.length) {
                        $mdToast.show(
                            $mdToast
                            .simple()
                            .position('right top')
                            .hideDelay(6000)
                            .textContent("El paciente " + item.apellido + ", " + item.nombre + " no posee internaciones")
                        );
                    } else {
                        $scope.internacionesDisabled = false;
                        $scope.tab = 1;
                        $scope.internaciones = data;
                    }
                });
            }
        },

        init: function() {
            $scope.personas.actualizar();

        }
    });

    // Inicializa watches
    $scope.$watch('personas.query', function(current, old) {
        if (current != old)
            $scope.personas.actualizar();
    });

    // Init
    $scope.init();

    Plex.initView({title: "Buscar internaciones"});
}]);