'use strict';

var appModule = angular.module('appModule')
    .config(["PlexResolverProvider", function (PlexResolverProvider) {
        PlexResolverProvider
             .when('/test', { templateUrl: '/lib/1.1/test/partial.html', controller: 'TestController' })
             .otherwise({ redirectTo: '/test' })
    }])
    .run([function () {
    }]).controller('TestController', ['$scope', 'Plex', 'Server', '$timeout', function ($scope, Plex, Server, $timeout) {
        // Propiedades
        $scope.texto = "World";
        $scope.numero = 100;
        $scope.minNumero = 1;
        $scope.maxNumero = 100;
        $scope.lista = null;
        $scope.seleccionado = null;
        $scope.fecha = new Date(2015, 1, 2);
        $scope.minFecha = new Date(2015, 1, 1);
        $scope.maxFecha = new Date(2015, 1, 20);

        // Métodos
        $scope.submit = function () {
            alert("Validacion OK");
        };
        $scope.cancel = function () {
            alert("Cancel");
        };
        $scope.cargarLista = function ($value) {
            console.log($value);
            return Server.get('/api/his/profile').then(function (data) {
                return data.tiposPrestaciones;
            });
        }
    }]);
