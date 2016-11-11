angular.module('app').controller('internacion/verNews', ['$scope', 'Plex', 'plexParams', 'Server', 'Global', 'Shared', 'Indicadores', function($scope, Plex, plexParams, Server, Global, Shared, Indicadores) {
    'use strict';

    angular.extend($scope, {
        internacion: null,
        news: null,
        init: function() {
            // buscamos la internacion
            Shared.internacion.get(plexParams.idInternacion).then(function(internacion) {
                $scope.internacion = internacion;

                $scope.news = Indicadores.getNews(internacion);
            });

        },

    });


    // Init
    $scope.init();

    Plex.initView({
        title: "Detalle NEWS",
        modal: true
    });
}]);
