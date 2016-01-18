'use strict';

appModule.controller('MainController', ['$scope', '$anchorScroll', 'Plex', 'Server', 'Global', function ($scope, $anchorScroll, Plex, Server, Global) {
    /* plex (text, int, ...) */
    $scope.plex = {
        text: "Hello World!",
        date: new Date(),
        int: 12345,
        float: 123.56,
        bool: true
    }

    /* plex-select simple */
    $scope.plexSelect = {
        seleccion: null,
        opciones: [
            { id: 1, nombre: "Neuquen" },
            { id: 2, nombre: "Buenos Aires" },
            { id: 3, nombre: "Rio Negro" },
        ]
    }

    /* plex-select múltiple */
    $scope.plexSelectMultiple = {
        seleccion: null,
        opciones: [
            { id: 1, nombre: "Neuquen" },
            { id: 2, nombre: "Buenos Aires" },
            { id: 3, nombre: "Rio Negro" },
        ]
    }

    $scope.plexSelectAPI = {
        seleccion: null,
        opciones: function (query) {
            return Global.getMatches(Server.get("/api/shared/ubicaciones/1/descendientes/1000", { cache: true }), query);
        }
    }
}]);