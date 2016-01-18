'use strict'

angular.module('plex').directive('plexSkin', ['Global', '$q', 'SSO', '$http', function (Global, $q, SSO, $http) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            var path = "/lib/1.1/";
            var defaultSkin = path + "lib.cosmo.css";
            // Define promise que será resuelta sólo cuando tenga cargada la skin inicial
            var deferred = $q.defer();
            Global.init(deferred.promise);

            // Métodos
            var loadCss = function (value) {
                // Corrije el bug de la versión 1.0 que guardaba la URL completa en SSO Settings
                var url = path + value.replace(path, "").replace("/lib/1.0/", "");

                // 07/07/2014 | jgabriel | F*cking $animate! No hubo forma de hacerlo con Angular
                var body = angular.element("BODY");
                body.fadeOut(function () {
                    // Chequea si el skin existe en el servidor ...
                    $http.get(url)
                        .success(function () {
                            angular.element("<LINK>")
                                .appendTo(element.parent())
                                .attr("rel", "stylesheet")
                                .attr("href", url)
                                .on("load", function () {
                                    // Indica que la ejecución puede continuar
                                    deferred.resolve();
                                    // Reemplaza el elemento original y elimina el nuevo
                                    element.attr("href", url);
                                    angular.element(this).remove();
                                    body.removeClass("plex-cloak");
                                    body.fadeIn();
                                })
                        })
                        .error(function () {
                            loadCss(defaultSkin);
                        })
                });
            };

            SSO.init().finally(function () {
                var skin = (SSO.session && SSO.session.settings.plexSkin) || defaultSkin;
                loadCss(skin);

                scope.$watch(attr.plexSkin, function (current, old) {
                    if (current && current != old) {
                        // Guarda las preferencias de usuario en el servidor
                        if (SSO.session) {
                            SSO.settings.post("plexSkin", current.replace(path, ""));
                        }

                        // Carga skin
                        loadCss(current);
                    }
                });
            })
        }
    }
}]);
