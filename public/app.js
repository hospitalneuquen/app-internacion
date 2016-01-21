'use strict';

var appModule = angular.module('appModule')
    .config(["PlexResolverProvider", function (PlexResolverProvider) {
        PlexResolverProvider
             .when('/valoracionEnfermeria', { templateUrl: 'partials/valoracionEnfermeria.html', controller: 'ValoracionEnfermeriaController' })
             .otherwise({ redirectTo: '/valoracionEnfermeria' })
    }])
    .run(['$rootScope', function ($rootScope) {
    }]);
