angular.module('plex').directive('plexInclude', function () {
    return {
        scope: true,
        template: '<div ng-include="plexInclude"></div>',
        /*
        templateUrl: function (element, attrs) {
            return attrs.plexInclude;
        },
        */
        link: function (scope, element, attrs) {
            // Observa cambios en la URL
            scope.plexInclude = scope.$eval(attrs.plexInclude);
            scope.$watch(attrs.plexInclude, function (current) {
                scope.plexInclude = current;
            });

            // Inyecta una propiedad 'include' en el scope que tendrá todos los parámetros pasados en todos los atributos que comienza con el plefijo "plexInclude"
            scope.include = {};

            // Observa cambios en todos los parámetros
            angular.forEach(attrs, function (value, attr) {
                if (attr.indexOf('plexInclude') == 0 && attr != 'plexInclude') {
                    var item = attr.substr(11, 1).toLowerCase() + attr.substr(12);
                    scope.$watch(value, function (current) {
                        scope.include[item] = current;
                    });
                }
            });
        }
    };
});