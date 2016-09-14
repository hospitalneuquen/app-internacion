/**
 * @ngdoc service
 * @module app
 * @name Shared
 * @description
 * Servicio que engloba constantes y métodos compartidos en toda la aplicación
 **/
angular.module('app').factory('Shared', ["Global", "Server", "Session", function(Global, Server, Session) {
    'use strict';

    /**
     * @ngdoc method
     * @name Mapa#get
     * @param {Number} Id del servicio a consultar
     * @description
     * Puede ser uno de los siguientes tipos:
     *   - `Number`: Busca por id del servicio de mapa de camas
     **/
    riesgoCaidas: function(evoluciones) {
        // buscamos la internacion
        angular.foreach(evoluciones, function(evolucion){

        });
    }
}
