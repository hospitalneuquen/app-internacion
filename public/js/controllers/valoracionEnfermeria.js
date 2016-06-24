angular.module('app').controller('ValoracionEnfermeriaController', ['$scope', 'Plex', 'plexParams', 'Shared', function($scope, Plex, plexParams, Shared) {
    angular.extend($scope, {
        internacion: null,
        init: function() {
            Shared.internacion.get(plexParams.idInternacion).then(function(data) {
                $scope.internacion = data;
            });
        },
        guardar: function() {
            var data = {
                ingreso: $scope.internacion.ingreso
            };

            Shared.internacion.post(plexParams.idInternacion, data).then(function(internacion) {
                Plex.closeView(internacion);
            });
        },
        cancelar: function() {
            Plex.closeView();
        },
    });

    $scope.init();

    Plex.initView({
        title: "Valoración inicial"
    });
}]);
