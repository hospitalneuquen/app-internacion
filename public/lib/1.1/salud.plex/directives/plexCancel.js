'use strict';

angular.module('plex').directive("plexCancel", ["$parse", function ($parse) {
    return {
        restrict: "A",
        require: '^form',
        link: function (scope, element, attrs, formController) {
            var fn = $parse(attrs.plexCancel);
            element.on('click', function (event) {
                // TODO: cambiar a un confirm más lindo
                if (formController.$pristine || confirm('¿Está seguro que desea cancelar?')) {
                    scope.$apply(function () {
                        fn(scope, { $event: event });
                    });
                }
            });
        }
    }
}]);