'use strict';

/**
 * @ngdoc service
 * @module app
 * @name Shared
 * @description
 * Servicio que engloba constantes y métodos compartidos en toda la aplicación
 **/
angular.module('app').factory('Shared', ["Global", "Server", function(Global, Server) {
    var self = {
        Mapa: {
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
                console.log("http://localhost:3001/mapa/" + query);
                return Server.get("http://localhost:3001/mapa/" + query);
            },
        },
        ubicaciones: {
            ids: { // Ubicaciones conocidas
                Argentina: '56b333a598a74c8422cf387e',
                Neuquen: '56b333db98a74c8422cf5159',
                NeuquenCapital: '56b333dc98a74c8422cf51a6'
            },
            /**
             * @ngdoc method
             * @name Shared#ubicaciones.get
             * @description Obtiene una o varias ubicaciónes según los parámetros de búsqueda
             * @param {String|Object} query Parámetros para la consulta.
             *
             * Puede ser uno de los siguientes tipos:
             *   - `String`: Busca por id
             *   - `Object`: Permite buscar por una o más propiedades, por ejemplo `nombre`, `tipo`, etc. Para más información consultar la api correspondiente.
             **/
            get: function(query) {
                if (angular.isObject(query)) {
                    return Server.get("/api/internacion/ubicacion", {
                        params: query
                    });
                } else {
                    return Server.get("/api/internacion/ubicacion/" + query);
                }
            },
            /**
             * @ngdoc method
             * @name Shared#ubicaciones.hijos
             * @param {String} id Identificador de la ubicación
             * @param {Object} opciones Opciones de búsqueda.
             *
             * Puede incluir una o más de las siguientes propiedades:
             *   - ``nombre``: filtra resultados que contengan el texto en nombre. Ejemplo "neu" devolverá "Neuquén"
             *   - ``tipo``: filtra los resultados por tipo. Ejemplo: "hospital", "servicio", "pais", "ciudad".
             * @description Devuelve los hijos directos del padre.
             **/
            hijos: function(id, opciones) {
                return Server.get("/api/internacion/ubicacion/" + id + "/hijos", {params: opciones});
            },
            /**
             * @ngdoc method
             * @name Shared#ubicaciones.hijos
             * @param {String} id Identificador de la ubicación
             * @param {Object} opciones Opciones de búsqueda.
             *
             * Puede incluir una o más de las siguientes propiedades:
             *   - ``nombre``: filtra resultados que contengan el texto en nombre. Ejemplo "neu" devolverá "Neuquén"
             *   - ``tipo``: filtra los resultados por tipo. Ejemplo: "hospital", "servicio", "pais", "ciudad".
             * @description Devuelve los hijos directos del padre.
             **/
            descendientes: function(id, opciones) {
                return Server.get("/api/internacion/ubicacion/" + id + "/descendientes", {params: opciones});
            },
        }
    };
    return self;
}]);
