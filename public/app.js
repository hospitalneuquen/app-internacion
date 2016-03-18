/**
 * @ngdoc module
 * @name app
 * @module app
 * @packageName app
 * @description
 * Módulo principal de la aplicación
 **/
angular.module('app')
    .config(["PlexResolverProvider", "$mdThemingProvider", function (PlexResolverProvider, $mdThemingProvider) {
        // $mdThemingProvider.theme('default')
        //    .primaryPalette('indigo')
        //    .accentPalette('pink')
        //  .warnPalette('deep-orange')
        // .backgroundPalette('grey');

        PlexResolverProvider
             .when('/inicio', { templateUrl: 'partials/inicio.html', controller: 'InicioController' })
             .when('/mapa', { templateUrl: 'partials/mapa.html', controller: 'MapaController' })
             // Internaciones
             .when('/internacion/buscar', { templateUrl: 'partials/internacion/buscar.html', controller: 'internacion/buscar' })
             .when('/internacion/editar/:idInternacion', { templateUrl: 'partials/internacion/editar.html', controller: 'internacion/editar' })
             .when('/internacion/editar/cama/:idCama', { templateUrl: 'partials/internacion/editar.html', controller: 'internacion/editar' })
             .when('/internacion/editar', { templateUrl: 'partials/internacion/editar.html', controller: 'internacion/editar' })
             .when('/internacion/evolucionar/:idInternacion', { templateUrl: 'partials/internacion/evolucionar.html', controller: 'internacion/evolucionar' })
             .when('/internacion/egresar/:idInternacion/:idCama', { templateUrl: 'partials/internacion/egresar.html', controller: 'internacion/egresar' })
             .when('/internacion/ver/:idInternacion', { templateUrl: 'partials/internacion/ver.html', controller: 'internacion/ver' })
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
