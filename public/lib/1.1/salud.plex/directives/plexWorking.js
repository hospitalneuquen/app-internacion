'use strict'

angular.module('plex').directive("plexWorking", function ($injector) {
    return function (scope, element, attrs) {
        if (element[0].className.indexOf('fa-')) {
            var originalClass = element.attr('class');
            var workingClass = originalClass;
            var classes = workingClass.split(/\s+/);;
            for (var i = 0; i < classes.length; i++) {
                if (classes[i].indexOf('fa-') == 0) {
                    workingClass = workingClass.replace(classes[i], 'fa-spinner fa-spin');
                    break;
                }
            }

            scope.$watch(attrs.plexWorking, function (current) {
                element.attr('class', (current) ? workingClass : originalClass)
            });
        }
    }
});