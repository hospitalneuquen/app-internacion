angular.module('app').controller('InicioController', ['$scope', 'Plex', 'Server', 'Global', function($scope, Plex, Server, Global) {
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
