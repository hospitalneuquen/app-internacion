angular.module('app').controller('internacion/valoracionMedica', ['$scope', 'Plex', 'plexParams', 'Shared', function($scope, Plex, plexParams, Shared) {
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

            return Shared.internacion.post(plexParams.idInternacion, data).then(function(internacion){
                Plex.closeView(internacion);
            });
        },
        cancelar: function() {
            Plex.closeView();
        },
    });

    // Init
    $scope.init();
    Plex.initView({
        title: "Valoración médica inicial"
    });
}]);
