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

        Mapa : {
            /**
             * @ngdoc method
             * @name Mapa#get
             * @param {Number} Id del servicio a consultar
             * @description
             * Puede ser uno de los siguientes tipos:
             *   - `Number`: Busca por id del servicio de mapa de camas
             **/
            get: function(query) {
                
                var query = (typeof query !== "undefined") ? query : '';
                // TODO : Resolver si query viene limpio, poder resolver segun los permisos
                // y accesos del usuario logueado, que tipo de servicio hay que consultar
                // para traer las camas, si es 'medica'  o 'quirurgica'
                return Server.get("http://localhost:3001/mapa/" + query);
            },
        }
    };
    return self;
}]);
