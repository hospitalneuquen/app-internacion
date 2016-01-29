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
             .when('/inicio', { templateUrl: 'partials/inicio.html', controller: 'InicioController' })
             .when('/valoracionEnfermeria', { templateUrl: 'partials/valoracionEnfermeria.html', controller: 'ValoracionEnfermeriaController' })
             .when('/mapa', { templateUrl: 'partials/mapa.html', controller: 'MapaController' })
             .when('/pacientes/evolucionar', { templateUrl: 'partials/pacientes/evolucionar.html', controller: 'PacientesController' })
             .when('/pacientes/prestaciones', { templateUrl: 'partials/pacientes/evolucionar.html', controller: 'PacientesController' })
             .when('/sandbox/personas', { templateUrl: 'partials/sandbox/personas.html', controller: 'sandbox/personas' })
             .otherwise({ redirectTo: '/inicio' })
    }])
    .run(['$rootScope', function ($rootScope) {
    }]);
