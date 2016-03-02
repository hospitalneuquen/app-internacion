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
        'use strict';

        PlexResolverProvider
             .when('/inicio', { templateUrl: 'partials/inicio.html', controller: 'InicioController' })
             .when('/mapa', { templateUrl: 'partials/mapa.html', controller: 'MapaController' })
             // Internaciones
             .when('/internacion/editar/:idInternacion', { templateUrl: 'partials/internacion/editar.html', controller: 'internacion/editar' })
             .when('/internacion/editar/cama/:idCama', { templateUrl: 'partials/internacion/editar.html', controller: 'internacion/editar' })
             .when('/internacion/editar', { templateUrl: 'partials/internacion/editar.html', controller: 'internacion/editar' })
             .when('/internacion/evolucionar/:idInternacion', { templateUrl: 'partials/internacion/evolucionar.html', controller: 'internacion/evolucionar' })
             // Enfermería
             .when('/valoracionEnfermeria/:idInternacion', { templateUrl: 'partials/valoracionEnfermeria.html', controller: 'ValoracionEnfermeriaController' })
             .when('/riesgoCaidas/:idInternacion', { templateUrl: 'partials/riesgoCaidas.html', controller: 'RiesgoCaidasController' })
             // Pacientes
             .when('/pacientes/prestaciones', { templateUrl: 'partials/pacientes/prestaciones.html', controller: 'pacientes/prestaciones' })
             // Sandbox
             .when('/sandbox/personas', { templateUrl: 'partials/sandbox/personas.html', controller: 'sandbox/personas' })
             .when('/sandbox/ubicaciones', { templateUrl: 'partials/sandbox/ubicaciones.html', controller: 'sandbox/ubicaciones' })
             .when('/sandbox/internaciones', { templateUrl: 'partials/sandbox/internaciones.html', controller: 'sandbox/internaciones' })
             .otherwise({ redirectTo: '/inicio' });
    }]);
