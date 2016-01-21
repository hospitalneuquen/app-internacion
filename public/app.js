'use strict';

var appModule = angular.module('appModule')
    .config(["PlexResolverProvider", function (PlexResolverProvider) {
        PlexResolverProvider
<<<<<<< HEAD
             .when('/valoracionEnfermeria', { templateUrl: 'partials/valoracionEnfermeria.html', controller: 'ValoracionEnfermeriaController' })
             .otherwise({ redirectTo: '/valoracionEnfermeria' })
=======
             .when('/prueba', { templateUrl: 'partials/prueba.html', controller: 'PruebaController' })
             .when('/camas', { templateUrl: 'partials/camas.html', controller: 'CamasController' })
             .when('/pacientes/evolucionar', { templateUrl: 'partials/pacientes/evolucionar.html', controller: 'PacientesController' })
             .when('/pacientes/prestaciones', { templateUrl: 'partials/pacientes/evolucionar.html', controller: 'PacientesController' })
             .otherwise({ redirectTo: '/prueba' })
>>>>>>> origin/master
    }])
    .run(['$rootScope', function ($rootScope) {
    }]);
