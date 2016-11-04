/**
 * @ngdoc service
 * @module app
 * @name Shared
 * @description
 * Servicio que engloba constantes y métodos compartidos en toda la aplicación
 **/
angular.module('app').factory('TiposIndicaciones', ["Global", "Server", "Session", "$timeout", function(Global, Server, Session, $timeout) {
    'use strict';

    var self = {

        /**
         * @ngdoc method
         * @name Shared#internaciones.get
         * @description Obtiene una o varias internaciones según los parámetros de búsqueda
         * @param {String|Object} query Parámetros para la consulta.
         *
         * Puede ser uno de los siguientes tipos:
         *   - `String`: Busca por id
         *   - `Object`: Permite buscar por una o más propiedades. Para más información consultar la api correspondiente.
         **/
        get: function(query) {
            if (typeof query != "undefined") {
                if (angular.isObject(query)) {

                    return Server.get('/api/internacion/tipoIndicacion', {
                        params: query
                    });
                } else if (query != "") {
                    return Server.get('/api/internacion/tipoIndicacion/' + query);
                }
            }

            return Server.get('/api/internacion/tipoIndicacion');

        },
        getPadres: function(query) {
            return Server.get('/api/internacion/tipoIndicacion/getPadres');

        },
        getHijas: function(query) {
            return Server.get('/api/internacion/tipoIndicacion/getHijas');

        },
        /**
         * @ngdoc method
         * @name Shared#internaciones.post
         * @description Crea o modifica una internación
         * @param {String} id Id de la internación (enviar ```null``` para crear una nueva)
         * @param {Object} data Datos
         * @param {Object} options Opciones
         **/
        post: function(id, data, options) {
            return Server.post('/api/internacion/tipoIndicacion/' + (id || ''), data, options);
        }
    };
    return self;
}]);
