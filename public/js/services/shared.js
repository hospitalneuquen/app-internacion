/**
 * @ngdoc service
 * @module app
 * @name Shared
 * @description
 * Servicio que engloba constantes y métodos compartidos en toda la aplicación
 **/
angular.module('app').factory('Shared', ["Global", "Server", "Session","$q", function(Global, Server, Session, $q) {
    'use strict';

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
                query = (typeof query !== "undefined") ? query : '';
                if (Session.servicioActual && Session.servicioActual.id) {
                    query = Session.servicioActual.id;
                    //console.log("/api/internacion/mapa/" + query);
                }
                // TODO : Resolver si query viene limpio, poder resolver segun los permisos
                // y accesos del usuario logueado, que tipo de servicio hay que consultar
                // para traer las camas, si es 'medica'  o 'quirurgica'
                return Server.get("/api/internacion/mapa/" + query, {
                    updateUI: 'big'
                });
            },
        },
        internacion: {
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
                if (angular.isObject(query)) {
                    return Server.get('/api/internacion/internacion', {
                        params: query
                    });
                } else {
                    return Server.get('/api/internacion/internacion/' + query);
                }
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
                return Server.post('/api/internacion/internacion/' + (id || ''), data, options);
            },
            // calcularRiesgoCaida: function(internacion){
            //     var deferred = $q.defer();
            //
            //     var total = 0;
            //     // this.internacion.get(id).then(function(internacion){
            //         if (internacion && internacion.ingreso && internacion.ingreso.enfermeria && internacion.ingreso.enfermeria.riesgoCaida) {
            //             for (var p in internacion.ingreso.enfermeria.riesgoCaida) {
            //                 if (p != 'total')
            //                     total += parseInt(internacion.ingreso.enfermeria.riesgoCaida[p]) || 0;
            //             }
            //         }
            //     // });
            //
            //     deferred.resolve(total);
            //     return deferred.promise;
            // }

        },
        evolucion: {
            /**
             * @ngdoc method
             * @name Shared#evolucion.post
             * @description Crea o modifica una evolución
             * @param {String} idInternacion Id de la internación
             * @param {String} idEvolucion Id de la evolución (enviar ```null``` para crear una nueva)
             * @param {Object} data Datos
             * @param {Object} options Opciones
             **/
            post: function(idInternacion, idEvolucion, data, options) {
                return Server.post('/api/internacion/internacion/' + idInternacion + '/evolucion/' + (idEvolucion || ''), data, options);
            },
        },
        pase: {
            /**
             * @ngdoc method
             * @name Shared#pase.post
             * @description Crea o modifica un pase
             * @param {String} idInternacion Id del pase
             * @param {String} idPase Id de la pase (enviar ```null``` para crear una nueva)
             * @param {Object} data Datos
             * @param {Object} options Opciones
             **/
            post: function(idInternacion, idPase, data, options) {
                return Server.post('/api/internacion/internacion/' + idInternacion + '/pase/' + (idPase || ''), data, options);
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
             * @description Obtiene una o varias ubicaciones según los parámetros de búsqueda
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
                return Server.get("/api/internacion/ubicacion/" + id + "/hijos", {
                    params: opciones
                });
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
                return Server.get("/api/internacion/ubicacion/" + id + "/descendientes", {
                    params: opciones
                });
            },
        }
    };
    return self;
}]);
