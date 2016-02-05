'use strict';

angular.module('app').controller('sandbox/ubicaciones', ['$scope', 'Plex', 'Server', '$timeout', 'Shared', function($scope, Plex, Server, $timeout, Shared) {
    angular.extend($scope, {
        data: null,
        buscarPor: 'texto',
        nombre: 'Argentina',
        tipo: '',
        timeoutHandler: null,
        actualizar: function() {
            var self = this;
            if (self.timeoutHandler)
                $timeout.cancel(self.timeoutHandler);

            self.timeoutHandler = $timeout(function() {
                var params = {
                    nombre: self.nombre,
                    tipo: self.tipo,
                };

                var promise = self.buscarPor == 'texto' ? Shared.ubicaciones.get(params) : Shared.ubicaciones.descendientes(Shared.ubicaciones.ids.Argentina, params);
                promise.then(function(data) {
                    self.data = data;
                });
            }, 250);
        }
    });

    // Inicializa watches
    $scope.$watch('buscarPor', function(current, old) {
        if (current != old) {
            if (current == 'descendientes') {
                $scope.nombre = ''
                if (!$scope.tipo)
                    $scope.tipo = "provincia";
            }
            $scope.data = null;
            $scope.actualizar();
        }
    });

    $scope.$watch('nombre + tipo', function() {
        $scope.actualizar();
    });

    // Inicializa vista
    Plex.initView({
        title: "Ubicaciones",
    });
}]);
