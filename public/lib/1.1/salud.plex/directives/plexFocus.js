'use strict';

angular.module('plex').directive('plexFocus', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            scope.$watch(attr.plexFocus, function (current) {
                if (current) {
                    window.setTimeout(function () {
                        element[0].focus();
                    }, 200);
                }
            })
        }
    };
});