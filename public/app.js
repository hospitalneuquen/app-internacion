'use strict';

/**
 * @ngdoc module
 * @name app
 * @module app
 * @packageName app
 * @description
 * Módulo principal de la aplicación
 **/
angular.module('app')
    .config(["PlexResolverProvider", function (PlexResolverProvider) {
        PlexResolverProvider
             .when('/prueba', { templateUrl: 'partials/prueba.html', controller: 'PruebaController' })
             .when('/valoracionEnfermeria', { templateUrl: 'partials/valoracionEnfermeria.html', controller: 'ValoracionEnfermeriaController' })
             .when('/camas', { templateUrl: 'partials/camas.html', controller: 'CamasController' })
             .when('/pacientes/evolucionar', { templateUrl: 'partials/pacientes/evolucionar.html', controller: 'PacientesController' })
             .when('/pacientes/prestaciones', { templateUrl: 'partials/pacientes/evolucionar.html', controller: 'PacientesController' })
             .when('/sandbox/personas', { templateUrl: 'partials/sandbox/personas.html', controller: 'sandbox/personas' })
             .otherwise({ redirectTo: '/prueba' })
    }])
    .run(['$rootScope', function ($rootScope) {
    }]);
