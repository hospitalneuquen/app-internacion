'use strict';

angular.module('app').controller('ValoracionEnfermeriaController', ['$scope', 'Plex', 'Shared', 'Server', '$timeout', '$alert', function($scope, Plex, Shared, Server, $timeout, $alert) {
    angular.extend($scope, {
        miFormulario: null,
        nombre: "Ana",
        fecha: new Date(),
        guardar: function() {
            var dto = {

                }
                //if (miFormulario.$valid)
                //Server.post('api/internacion/', dto)
        },
        cargarRiesgoCaidas: function() {
            Plex.openView('riesgoCaidas').then(function() {

            });
        },
    });
}]);
