'use strict';

angular.module('app').controller('sandbox/internaciones', ['$scope', 'Plex', 'Server', '$timeout', 'Personas', function($scope, Plex, Server, $timeout, Personas) {
    angular.extend($scope, {
        log: undefined,
        idInternacion: '569e2c529bfbce901a9eca06',
        form: {
            paciente: '569e2c529bfbce901a9eca06',
            fechaHora: new Date(),
            tipo: 'ambulatorio',
            motivo: 'Apendicitis',
            cama: '569e2c529bfbce901a9eca06'
        },
        crearInternacion: function() {
            Server.post('/api/internacion/internacion', this.form).then(function(data) {
                $scope.log = data;
            })
        },
        modificarInternacion: function() {
            Server.patch('/api/internacion/internacion/' + this.idInternacion, this.form).then(function(data) {
                $scope.log = data;
            })
        }
    });

    // Inicializa vista
    Plex.initView({
        title: "Sandbox Internaciones",
    });
}]);
