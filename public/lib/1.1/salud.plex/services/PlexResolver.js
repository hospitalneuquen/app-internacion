(function () {
    'use strict';

    // Define un servicio configurable
    // Nota: La mayoría del código es de angular-route.js (adaptado para el uso de Plex)
    angular.module('plex')
        .provider('PlexResolver', function () {
            // Inicializa el proveedor con sus métodos y propiedades públicas
            this.routes = {};
            this.when = function (path, route) {
                var pathRegExp = function (path, opts) {
                    var insensitive = opts.caseInsensitiveMatch,
                        ret = {
                            originalPath: path,
                            regexp: path
                        },
                        keys = ret.keys = [];

                    path = path
                      .replace(/([().])/g, '\\$1')
                      .replace(/(\/)?:(\w+)([\?\*])?/g, function (_, slash, key, option) {
                          var optional = option === '?' ? option : null;
                          var star = option === '*' ? option : null;
                          keys.push({ name: key, optional: !!optional });
                          slash = slash || '';
                          return ''
                            + (optional ? '' : slash)
                            + '(?:'
                            + (optional ? slash : '')
                            + (star && '(.+?)' || '([^/]+)')
                            + (optional || '')
                            + ')'
                            + (optional || '');
                      })
                      .replace(/([\/$\*])/g, '\\$1');

                    ret.regexp = new RegExp('^' + path + '$', insensitive ? 'i' : '');
                    return ret;
                }

                this.routes[path] = angular.extend(
                  { reloadOnSearch: true },
                  route,
                  path && pathRegExp(path, route)
                );

                // create redirection for trailing slashes
                if (path) {
                    var redirectPath = (path[path.length - 1] == '/')
                          ? path.substr(0, path.length - 1)
                          : path + '/';

                    this.routes[redirectPath] = angular.extend(
                      { redirectTo: path },
                      pathRegExp(redirectPath, route)
                    );
                }

                return this;
            };
            this.otherwise = function (params) {
                this.when(null, params);
                return this;
            }

            // Angular llamará a $get para instanciar del servicio
            this.$get = ['$injector', '$sce', '$templateCache', '$http', '$q', function ($injector, $sce, $templateCache, $http, $q) {
                // Funciones y variables privadas
                var routes = this.routes;
                var switchRouteMatcher = function (on, route) {
                    var self = this;
                    var keys = route.keys,
                        params = {};

                    if (!route.regexp) return null;

                    var m = route.regexp.exec(on);
                    if (!m) return null;

                    for (var i = 1, len = m.length; i < len; ++i) {
                        var key = keys[i - 1];

                        var val = 'string' == typeof m[i]
                              ? decodeURIComponent(m[i])
                              : m[i];

                        if (key && val) {
                            // Parsea parámetros numéricos
                            if (!isNaN(val))
                                params[key.name] = Number(val);
                            else
                                params[key.name] = val;
                        }
                    }
                    return params;
                };
                var updateRoute = function (next) {
                    var locals = angular.extend({}, next.resolve),
                        template, templateUrl;

                    angular.forEach(locals, function (value, key) {
                        locals[key] = angular.isString(value) ?
                            $injector.get(value) : $injector.invoke(value);
                    });

                    if (angular.isDefined(template = next.template)) {
                        if (angular.isFunction(template)) {
                            template = template(next.params);
                        }
                    } else if (angular.isDefined(templateUrl = next.templateUrl)) {
                        if (angular.isFunction(templateUrl)) {
                            templateUrl = templateUrl(next.params);
                        }
                        templateUrl = $sce.getTrustedResourceUrl(templateUrl);
                        if (angular.isDefined(templateUrl)) {
                            next.loadedTemplateUrl = templateUrl;
                            template = $http.get(templateUrl, { cache: $templateCache }).
                                then(function (response) { return response.data; });
                        }
                    }
                    if (angular.isDefined(template)) {
                        locals['$template'] = template;
                    }
                    locals.plexParams = {};
                    return $q.all(locals).then(function (locals) {
                        // Copia parámetros
                        if (next) {
                            next.locals = locals;
                            angular.copy(next.params, locals.plexParams);
                        }

                        // Copia la ruta para acceso desde los controladores
                        locals.plexParams = angular.extend(
                            {
                                $controller: next.$$route && next.$$route.controller,
                                $path: next.$$route && next.$$route.originalPath,
                                $templateUrl: next.$$route && next.$$route.templateUrl
                            }, locals.plexParams);
                        return next;
                    });
                };
                var interpolate = function (string, params) {
                    var result = [];
                    angular.forEach((string || '').split(':'), function (segment, i) {
                        if (i === 0) {
                            result.push(segment);
                        } else {
                            var segmentMatch = segment.match(/(\w+)(.*)/);
                            var key = segmentMatch[1];
                            result.push(params[key]);
                            result.push(segmentMatch[2] || '');
                            delete params[key];
                        }
                    });
                    return result.join('');
                };

                // Devuelve la instancia del servicio con los métodos públicos
                return {
                    resolve: function (route) {
                        // Match a route
                        var temp = route.split('?');
                        var path = temp[0];
                        var search = (temp.length > 1) ? parseKeyValue(temp[1]) : null;
                        var params, match;
                        angular.forEach(routes, function (r, p) {
                            if (!match && (params = switchRouteMatcher(path, r))) {
                                match = inherit(r, {
                                    params: angular.extend({}, search, params),
                                    pathParams: params
                                });
                                match.$$route = r;
                            }
                        });
                        // No route matched; fallback to "otherwise" route
                        if (!match) {
                            var otherwise = routes[null];
                            match = routes[null] && inherit(routes[otherwise.redirectTo], { params: {}, pathParams: {} });
                        }
                        return updateRoute(match);
                    }
                }
            }];
        })


    // Funciones importadas de angular.js
    function inherit(parent, extra) {
        return angular.extend(new (angular.extend(function () { }, { prototype: parent }))(), extra);
    }
    function tryDecodeURIComponent(value) {
        try {
            return decodeURIComponent(value);
        } catch (e) {
            // Ignore any invalid uri component
        }
    }
    function parseKeyValue(/**string*/keyValue) {
        var obj = {}, key_value, key;
        angular.forEach((keyValue || "").split('&'), function (keyValue) {
            if (keyValue) {
                key_value = keyValue.split('=');
                key = tryDecodeURIComponent(key_value[0]);
                if (angular.isDefined(key)) {
                    var val = angular.isDefined(key_value[1]) ? tryDecodeURIComponent(key_value[1]) : true;
                    if (!obj[key]) {
                        obj[key] = val;
                    } else if (isArray(obj[key])) {
                        obj[key].push(val);
                    } else {
                        obj[key] = [obj[key], val];
                    }
                }
            }
        });
        return obj;
    }
})();
