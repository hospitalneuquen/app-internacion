'use strict';

/**
 * @ngdoc service
 * @module app
 * @name Shared
 * @description
 * Servicio que engloba constantes y métodos compartidos en toda la aplicación
 **/
angular.module('app').factory('Shared', ["Global", "Server", function (Global, Server) {
    var self = {
        // profile: null,
        // init: function () {
        //     return $q.all([
        //         Server.get("/api/his/profile").then(function (data) {
        //             self.profile = data;
        //         }),
        //     ]);
        // },
    };
    return self;
}]);
