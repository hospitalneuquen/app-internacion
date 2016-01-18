angular.module('plex').directive('plexActions', ['$dropdown', '$tooltip', function ($dropdown, $tooltip) {
    return {
        restrict: 'A',
        scope: true,
        link: function (scope, element, attrs) {
            var dropDown;
            var tooltip;

            // Muestra un ícono con el dropdown
            var icon = angular.element('<i>')
                        .appendTo(element)
                        .addClass('fa fa-tasks actions') /* Cambié 'text-muted' por opacidad (en la clase 'actions') para permitir que el color sea contextual  */                
                        .on('click', function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                        });

            // Watches
            scope.$watch(attrs.plexActions, function (actions) {
                if (dropDown)
                    dropDown.destroy();
                if (tooltip)
                    tooltip.destroy();
                icon.hide();
                
                if (actions) {
                    // Convierte las acciones al formato elegido
                    var content = [];
                    actions.forEach(function (i) {
                        if (!angular.isDefined(i.visible) || i.visible)
                            content.push({
                                text: (i.icon ? "<i class='" + i.icon + "'></i>" : "") + "<span>" + i.title + "</span>",
                                divider: i.divider,
                                click: function () { i.handler(scope.$parent) },
                            })
                    });

                    if (content.length > 0) {
                        icon.show();

                        // Arma el dropdown
                        scope.content = content;
                        var options = {
                            scope: scope,
                            placement: attrs.placement || 'auto'
                        }
                        dropDown = $dropdown(icon, options);
                        //dropDown = $dropdown(element, options);

                        // Arma el tooltip
                        // 23/05/2014 | jgabriel | Lo deshabilito porque es muy molesto
                        //var tooltip = {
                        //    title: "Haga clic para mostrar más opciones",
                        //    placement: "top",
                        //    container: "body",
                        //    animation: "am-fade-and-slide-top"
                        //}
                        //tooltip = $tooltip(icon, tooltip);
                    }
                }
            });

            scope.$on('$destroy', function () {
                if (dropDown)
                    dropDown.destroy();
                if (tooltip)
                    tooltip.destroy();
            });
        }
    }
}]);