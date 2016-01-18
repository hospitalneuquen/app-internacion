'use strict'

angular.module('plex').directive('plexMinlength', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attr, ctrl) {
            // Validator
            var isEmpty = function (value) {
                return angular.isUndefined(value) || value === '' || value === null || value !== value;
            }
            var validator = function (value) {
                var val = scope.$eval(attr.plexMinlength);
                if (isEmpty(value) || isEmpty(val) || value.length >= val) {
                    ctrl.$setValidity('minlength', true);
                    return value;
                } else {
                    ctrl.$setValidity('minlength', false);
                    return undefined;
                }
            };

            // Watch for min to change
            scope.$watch(attr.plexMinlength, function (current, old) {
                if (current != old)
                    validator(ctrl.$viewValue);
            });

            ctrl.$parsers.push(validator);
            ctrl.$formatters.push(validator);
        }
    };
});
