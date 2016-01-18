'use strict'

angular.module('plex').directive('plexMaxlength', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attr, ctrl) {
            // Validator
            var isEmpty = function (value) {
                return angular.isUndefined(value) || value === '' || value === null || value !== value;
            }
            var validator = function (value) {
                var val = scope.$eval(attr.plexMaxlength);
                if (isEmpty(value) || isEmpty(val) || value.length <= val) {
                    ctrl.$setValidity('maxlength', true);
                    return value;
                } else {
                    ctrl.$setValidity('maxlength', false);
                    return undefined;
                }
            };

            // Watch for max to change
            scope.$watch(attr.plexMaxlength, function (current, old) {
                if (current != old)
                    validator(ctrl.$viewValue);
            });

            ctrl.$parsers.push(validator);
            ctrl.$formatters.push(validator);
        }
    };
});