
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
         * @description Obtiene uno o varios pacientes según los parámetros de búsqueda
         * @param {String|Object} query Parámetros para la consulta.
         *
         * Puede ser uno de los siguientes tipos:
         *   - `String`: Busca por id
         *   - `Object`: Permite buscar por una o más propiedades, por ejemplo `documento`, `fulltext`,  `apellido`, `nombre`, etc. Para más información consultar la api correspondiente.
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
