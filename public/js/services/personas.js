
'use strict'

/**
 * @ngdoc service
 * @module app
 * @name Personas
 * @description
 * Servicio para consultar y modificar Personas
 **/
angular.module('app').factory('Personas', ["Server", "Plex", "Global", function(Server, Plex, Global) {
    var self = {
        /**
         * @ngdoc method
         * @name Personas#get
         * @param {String|Number|Object} query Parámetros para la consulta
         * @description
         * Puede ser uno de los siguientes tipos:
         *   - `String / Number`: Busca por id
         *   - `Object`: Permite buscar por una o más propiedades, por ejemplo `documento`, `fulltext`,  `apellido`, `nombre`, etc. Para más información consulta la api correspondiente.
         **/
        get: function(query) {
            if (angular.isObject(query)) {
                return Server.get("/api/internacion/persona", {
                    params: query
                });
            } else {
                return Server.get("/api/internacion/persona/" + query);
            }
        },
    };
    return self;
}]);
