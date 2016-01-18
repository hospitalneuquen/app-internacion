'use strict';

angular.module('plex').directive("plexSubmit", ["$parse", function ($parse) {
    return {
        restrict: "A",
        require: '^form',
        link: function (scope, element, attrs, formController) {
            var fn = $parse(attrs.plexSubmit);
            element.on('click', function (event) {
                scope.$apply(function () {
                    scope.$broadcast('$plex-before-submit', formController);
                    if (formController.$valid)
                        fn(scope, { $event: event });
                });
            });
        }
    }
}]);