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
             .when('/valoracionEnfermeria/:idInternacion', { templateUrl: 'partials/valoracionEnfermeria.html', controller: 'ValoracionEnfermeriaController' })
             .when('/riesgoCaidas/:idInternacion', { templateUrl: 'partials/riesgoCaidas.html', controller: 'RiesgoCaidasController' })
             .when('/mapa', { templateUrl: 'partials/mapa.html', controller: 'MapaController' })

             .when('/internaciones/editar/:idInternacion', { templateUrl: 'partials/internaciones/editar.html', controller: 'internaciones/editar' })
             .when('/internaciones/egresar/:idInternacion/:idCama', { templateUrl: 'partials/internaciones/egresar.html', controller: 'internaciones/egresar' })

             .when('/pacientes/buscar', { templateUrl: 'partials/pacientes/buscar.html', controller: 'pacientes/buscar' })
             .when('/pacientes/evolucionar/:idCama/:idInternacion', { templateUrl: 'partials/pacientes/evolucionar.html', controller: 'pacientes/evolucionar' })
             .when('/pacientes/prestaciones', { templateUrl: 'partials/pacientes/prestaciones.html', controller: 'pacientes/prestaciones' })

             .when('/sandbox/personas', { templateUrl: 'partials/sandbox/personas.html', controller: 'sandbox/personas' })
             .when('/sandbox/ubicaciones', { templateUrl: 'partials/sandbox/ubicaciones.html', controller: 'sandbox/ubicaciones' })
             .when('/sandbox/internaciones', { templateUrl: 'partials/sandbox/internaciones.html', controller: 'sandbox/internaciones' })
             .otherwise({ redirectTo: '/inicio' })
    }])
    .run(['$rootScope', function ($rootScope) {
    }]);
