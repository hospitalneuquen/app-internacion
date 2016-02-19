'use strict';

angular.module('app').controller('RiesgoCaidasController', ['$scope', function($scope) {
    angular.extend($scope, {
        internacion: null,
        actualizarRiesgoCaida: function() {
            if (this.internacion && this.internacion.ingreso && this.internacion.ingreso.enfermeria && this.internacion.ingreso.enfermeria.riesgoCaida) {
                var total = 0;
                for (var p in this.internacion.ingreso.enfermeria.riesgoCaida) {
                    if (p != 'total')
                        total += this.internacion.ingreso.enfermeria.riesgoCaida[p] || 0;
                }
                this.internacion.ingreso.enfermeria.riesgoCaida.total = total;
            }
        }
    });

    // Watches
    $scope.$watch('internacion.ingreso.enfermeria.riesgoCaida', function(current, old) {
        if (current != old)
            $scope.actualizarRiesgoCaida();
    }, true);
}]);
