'use strict';

angular.module('global').factory('Global', ['$q', function ($q) {
    return {
        _initPromises: [],
        _searchCache: [],
        init: function (promise) {
            this._initPromises.push(promise);
        },
        // Este método es llamado por Plex para ver si se han ejecutado todos los bloques de inicialización
        waitInit: function () {
            return $q.all(this._initPromises);
        },
        // Hace el matching de un texto ignorando acentos
        matchText: function (term, text) {
            return Select2.util.stripDiacritics('' + text).toUpperCase().indexOf(Select2.util.stripDiacritics('' + term).toUpperCase()) >= 0;
        },
        // Espera los resultados de una promise y devuele los items indicados por query. Esta función se usa con plex.select
        // Parámetros:
        //      - promise [promise]: Suele ser la promise devuelta por Server.get()
        //      - query [string | int | array]: indica el Texto, Id o lista de Ids a buscar
        //      - getTextFunction [function(item)]: indica una función que devuelve el texto de un item. Si no se especifica, utiliza el campo 'nombre'
        //      - orderBy [string]: indica un campo por el cual se ordenarán los resultados
        getMatches: function (promise, query, getTextFunction, orderBy) {
            // Define getTextFunction()
            if (!getTextFunction)
                getTextFunction = function (item) { return item.nombre };

            // Matchea items
            if (query) {
                var self = this;
                promise = promise.then(function (data) {
                    // 1º Busca por texto
                    if (angular.isString(query)) {
                        var matches = [];
                        for (var i = 0; i < data.length; i++) {
                            if (self.matchText(query, getTextFunction(data[i])))
                                matches.push(data[i]);
                        }
                        return matches;
                    }

                    else
                        // 2º Buscar [id1, id2] of [{id: ...}, {id: ...}]
                        if (angular.isArray(query)) {
                            var matches = [];
                            for (var j = 0; j < query.length; j++) {
                                for (var i = 0; i < data.length; i++) {
                                    if ((angular.isNumber(query[j]) && data[i].id == query[j]) ||
                                        (angular.isObject(query[j]) && 'id' in query[j] && data[i].id == query[j].id))
                                        matches.push(data[i]);
                                }
                            }
                            return matches;
                        }

                        else
                            // 3º Busca por id o {id: ...}
                        {
                            for (var i = 0; i < data.length; i++) {
                                if ((angular.isNumber(query) && data[i].id == query) ||
                                    (angular.isObject(query) && 'id' in query && data[i].id == query.id))
                                    return data[i];

                            }
                            return data;
                        }
                });
            }

            // Ordena item
            return promise.then(function (data) {
                if (orderBy)
                    data = $filter("orderBy")(data, orderBy);
                return data;
            });
        },
        // Devuelve el item indicado por Id
        getById: function (array, id, showError) {
            if (array)
                for (var i = 0; i < array.length; i++) {
                    if (array[i].id == id)
                        return array[i];
                }

            if (showError)
                throw "Id no encontrado"
            return null;
        },
        // Devuelve el índica del item indicado por Id
        indexById: function (array, id) {
            if (array)
                for (var i = 0; i < array.length; i++) {
                    if (array[i].id == id)
                        return i;
                }
            return -1;
        },
        // Devuelve los días de diferencia entre las fechas
        compareDate: function (date1, date2) {
            var d1 = new Date(date1);
            var d2 = new Date(date2);
            d1.setHours(0, 0, 0, 0);
            d2.setHours(0, 0, 0, 0);
            return (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24);
        },
        // Devuelve los milisegunds de diferencia entre las dos fechas
        compareDateTime: function (date1, date2) {
            return date1.getTime() - date2.getTime();
        },
        // Indica si la fecha es el día de hoy
        isToday: function (date) {
            return this.compareDate(date, new Date()) == 0
        },
        cache: {
            data: {},
            get: function (key, id, params) {
                return this.data[key + '/' + id + '/' + JSON.stringify(params)];
            },
            put: function (key, id, params, value) {
                this.data[key + '/' + id + '/' + JSON.stringify(params)] = value;
            },
            invalidate: function (key, id) {
                for (var k in this.data) {
                    if (k.indexOf(key + '/' + id + '/') == 0)
                    {
                        console.log('cache - invalidate ' + k);
                        delete this.data[k];
                    }
                }
            }
        },
        // [DEBUG] Es una función sólo para debugging. Indica la cantidad de watches que hay en un momento dato. Es utilizada para analizar la performance.
        watchCount: function () {
            var root = $(document.getElementsByTagName('body'));
            var watchers = [];

            var f = function (element) {
                if (element.data().hasOwnProperty('$scope')) {
                    angular.forEach(element.data().$scope.$$watchers, function (watcher) {
                        watchers.push(watcher);
                    });
                }

                angular.forEach(element.children(), function (childElement) {
                    f($(childElement));
                });
            };

            f(root);

            console.log("Watch count: " + watchers.length);
            return watchers.length;
        },
        strings: {
            capitalizeWords: function (string) {
                return string.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
            },
            format: function () {
                var theString = arguments[0];
                for (var i = 1; i < arguments.length; i++) {
                    var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
                    theString = theString.replace(regEx, arguments[i]);
                }
                return theString;
            }
        }
    }
}]);