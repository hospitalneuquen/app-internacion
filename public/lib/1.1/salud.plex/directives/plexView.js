'use strict'

angular.module('plex').directive("plexView", ['$rootScope', '$anchorScroll', '$compile', '$controller', '$q', '$window', '$document', 'Plex', 'PlexResolver', '$animate', '$timeout', function ($rootScope, $anchorScroll, $compile, $controller, $q, $window, $document, Plex, PlexResolver, $animate, $timeout) {
    return {
        restrict: 'EA',
        terminal: true,
        transclude: 'element',
        compile: function (element, attr, linker) {
            return function (scope, $element, attr) {
                function toggleViews(old, current) {
                    if (old)
                        old.element.hide();
                    current.element.show();
                    Plex.currentView(current);
                    Plex.initUI();
                    $window.scrollTo(current.scrollLeft || 0, current.scrollTop || 0);
                }

                // Abre una nueva vista
                scope.$on('$plex-openView', function (event, view) {
                    view.route.then(function (route) {
                        // Elimina las vistas que puedan existir hacia adelante
                        var currentIndex = Number($window.history.state) || 0;
                        while (Plex.viewStack.length > currentIndex + 1) {
                            var temp = Plex.viewStack.pop();
                            temp.scope.$destroy();
                            temp.element.remove();
                        }

                        // Crea la vista
                        Plex.addView(view);

                        var locals = route.locals;
                        var template = locals.$template;
                        view.scope = scope.$new();
                        linker(view.scope, function (clone) {
                            // Prepara la vista anterior
                            var oldView = Plex.viewStack.length > 1 ? Plex.viewStack[Plex.viewStack.length - 2] : null;
                            if (oldView && oldView.element) {
                                oldView.scrollTop = $document[0].documentElement.scrollTop;
                                oldView.scrollLeft = $document[0].documentElement.scrollLeft;
                            }

                            // Crea una entrada en el browser
                            if (Plex.viewStack.length > 1) {
                                //$window.history.pushState(Plex.viewStack.length - 1, null, route.originalPath)
                                $window.history.pushState(Plex.viewStack.length - 1, null, null)
                            }

                            // Prepara el elemento
                            clone.html(template);
                            $element.after(clone);
                            view.element = clone;
                            toggleViews(oldView, view);

                            // 1. Linkea
                            var link = $compile(clone.contents());
                            // 2. Instancia el controlador
                            if (route.controller) {
                                locals.$scope = view.scope;
                                var controller = $controller(route.controller, locals);
                                clone.data('$ngControllerController', controller);
                                clone.contents().data('$ngControllerController', controller);
                            }
                            // 3. Compila
                            link(view.scope);
                            //scope.$broadcast('$plex-initUI');
                            Plex.initUI();

                            /*
                            26/03/2014 | jgabriel | Este código está copiado de ng-view. Hay que ver si hace falta
                            view.scope.$eval(attr.onload || '');

                            // $anchorScroll might listen on event...
                            $anchorScroll();
                            */
                        });
                    });
                });

                // Cierra la vista actual
                scope.$on('$plex-closeView', function (event, gotoView) {
                    var oldView = Plex.currentView();
                    var view = Plex.viewStack[gotoView];
                    toggleViews(oldView, view);
                });

                // Responde cuando se navega con los botones Back/Forward en el browser
                angular.element($window).on('popstate', function (/*event*/) {
                    //var gotoView = Number(event.originalEvent.state) || 0;
                    var gotoView = $window.history.state;
                    // Usa $timeout para no romper el ciclo de rendering de Angular cuando se cierran varias vistas consecutivamente
                    $timeout(function () {
                        scope.$emit('$plex-closeView', gotoView);
                    });
                    /*
                    scope.$apply(function () {
                        scope.$emit('$plex-closeView', gotoView);
                    });
                    */
                })

                // Inicializa la primera página
                $window.history.replaceState(0, null, null);
                var path = location.pathname.substr(($document.find('base').attr('href') || '/').length - 1)
                Plex.openView(path);
            }
        }
    }
}]);