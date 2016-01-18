'use strict';

angular.module('plex').directive('plexEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.plexEnter, { 'event': event });
                });
                event.preventDefault();
            }
        });
    };
});


