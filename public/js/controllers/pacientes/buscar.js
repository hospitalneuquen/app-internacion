'use strict';

angular.module('app').controller('pacientes/buscar', ['$scope', 'Plex', 'Server', function($scope, Plex, Server) {
    angular.extend($scope, {
        pacientes : undefined,

        init: function () {
            // buscamos los pacientes que estan en el estado 'enIngreso'
            Server.get('/api/internacion/internacion/estado/enIngreso').then(function(data){
                $scope.pacientes = data;
            });
        },
        seleccionarInternacion: function(data){
            Plex.closeView(data);
        }

    });

    $scope.init();

    Plex.initView({
        title: "Seleccione paciente"
    });
}]);
