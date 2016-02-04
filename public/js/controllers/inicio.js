'use strict';

angular.module('app').controller('InicioController', ['$scope', 'Plex', 'Server', function($scope, Plex, Server) {    
    // Inicializa vista
    Plex.initView({
        title: "Punto de inicio",
        actions: [{
            title: "Camas",
            icon: "fa fa-bed",
            handler: function() {
                Plex.openView('mapa').then(function() {})
            }
        }]
    });
}]);
