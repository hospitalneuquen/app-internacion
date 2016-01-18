'use strict'

// Permite utilizar la directive bs-Tooltip más fácilmente
angular.module('plex').directive('title', ['$tooltip', function ($tooltip) {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            if (attrs.title) {
                var options = {
                    title: attrs.title,
                    placement: attrs.titlePlacement || "top",
                    html: true,
                    container: "body",
                    animation: "am-fade-and-slide-top"
                }
                element.removeAttr("title");
                var tooltip = $tooltip(element, options);
                scope.$on('$destroy', function () {
                    tooltip.destroy();
                });
            }
        }
    };
}]);