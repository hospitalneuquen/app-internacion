'use strict';

var appModule = angular.module('appModule')
    .config(["PlexResolverProvider", function (PlexResolverProvider) {
        PlexResolverProvider
             .when('/prueba', { templateUrl: 'partials/prueba.html', controller: 'PruebaController' })
             .otherwise({ redirectTo: '/prueba' })
    }])
    .run(['$rootScope', function ($rootScope) {
    }]);
