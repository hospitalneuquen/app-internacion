angular.module('app').controller('ValoracionEnfermeriaController', ['$scope', 'Plex', 'plexParams', 'Shared', function($scope, Plex, plexParams, Shared) {
    angular.extend($scope, {
        internacion: null,
        indicacion: {},
        frecuencias: [{
            id: '48',
            nombre: 'Cada 2 días'
        }, {
            id: '24',
            nombre: 'Una vez al día'
        }, {
            id: '12',
            nombre: 'Cada 12 hs.'
        }, {
            id: '8',
            nombre: 'Cada 8 hs.'
        }, {
            id: '6',
            nombre: 'Cada 6 hs.'
        }, {
            id: '4',
            nombre: 'Cada 4 hs.'
        }],
        totalUPP: parseInt(0),

        // $scope.indicacion.fecha = new Date();
        // $scope.indicacion.servicio = Session.variables.servicioActual;

        init: function() {
            Shared.internacion.get(plexParams.idInternacion).then(function(data) {
                console.log(data);
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

    $scope.$watch('internacion.ingreso.enfermeria.valoracionRiesgoUPP.estadoFisico + internacion.ingreso.enfermeria.valoracionRiesgoUPP.estadoMental + internacion.ingreso.enfermeria.valoracionRiesgoUPP.actividad + internacion.ingreso.enfermeria.valoracionRiesgoUPP.movilidad + internacion.ingreso.enfermeria.valoracionRiesgoUPP.incontinencia', function(current, old) {
        if (current) {

            $scope.totalUPP = 0;
            $scope.totalUPP = $scope.internacion.ingreso.enfermeria.valoracionRiesgoUPP.estadoFisico + $scope.internacion.ingreso.enfermeria.valoracionRiesgoUPP.estadoMental + $scope.internacion.ingreso.enfermeria.valoracionRiesgoUPP.actividad + $scope.internacion.ingreso.enfermeria.valoracionRiesgoUPP.movilidad + $scope.internacion.ingreso.enfermeria.valoracionRiesgoUPP.incontinencia;
        }
    });

    // calculo total glasgow
    $scope.$watch('internacion.ingreso.enfermeria.valoracionGlasgow.ocular + internacion.ingreso.enfermeria.glasgowValoracion.verbal + internacion.ingreso.enfermeria.glasgowValoracion.motor', function(current, old) {
        if (current) {
            $scope.internacion.ingreso.enfermeria.glasgowValoracion.total = 0;
            $scope.internacion.ingreso.enfermeria.glasgowValoracion.total = $scope.internacion.ingreso.enfermeria.glasgowValoracion.ocular + $scope.internacion.ingreso.enfermeria.glasgowValoracion.verbal + $scope.internacion.ingreso.enfermeria.glasgowValoracion.motor;
        }
    });
}]);
