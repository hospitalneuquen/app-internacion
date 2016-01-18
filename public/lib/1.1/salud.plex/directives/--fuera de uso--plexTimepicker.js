'use strict'

angular.module('plex').directive("plex", ['$filter', function ($filter) {
    return {
        restrict: "A",
        require: '?ngModel',
        compile: function (element, attrs) {
            var options = attrs.plex;
            var dinamicLink = null;

            return function (scope, element, attrs, modelController) {
                if (element.is("INPUT[type=time]")) {
                    var inputGroup = angular.element("<div class='input-group bootstrap-timepicker'>");
                    element.before(inputGroup);
                    element.detach();
                    inputGroup.append(element);
                    element.addClass('form-control');
                    element.after("<a class='input-group-btn btn btn-default' data-toggle='timepicker' tabindex='-1'><i class='icon-time'></i></a>");                   
                    element.attr('data-toggle', 'timepicker');

                    // Inicializa Timepicker
                    element.timepicker({
                        showMeridian: false,
                        defaultTime: false,
                        showInputs: false
                    });
                    var timepicker = element.data('timepicker');
                    var component = element.siblings('[data-toggle="timepicker"]');
                    if (component.length) {
                        component.on('click', $.proxy(timepicker.showWidget, timepicker));
                    }

                    // Preparar controlador
                    if (modelController) {
                        var format = $filter("date");
                        element.on('changeTime.timepicker', function (e) {
                            if (e.time.value || modelController.$modelValue) {
                                var date = modelController.$modelValue ? new Date(modelController.$modelValue.getTime()) : new Date();
                                date.setHours(e.time.hours, e.time.minutes);
                                if (!angular.equals(date, modelController.$modelValue)) {
                                    scope.$apply(function () {
                                        console.log('Timepicker: ' + date);
                                        modelController.$setViewValue(date);
                                    });
                                }
                            }
                        });

                        // Controla el formato
                        var re = /^(20|21|22|23|[01]\d|\d)([:])(([0-5]\d){1,2})$/;
                        modelController.$parsers.unshift(function (viewValue) {
                            if (!viewValue || angular.isDate(viewValue)) {
                                modelController.$setValidity('time', true);
                                return viewValue;
                            }
                            else
                                if (re.test(viewValue)) {
                                    var parts = viewValue.match(re);
                                    var date = modelController.$modelValue ? new Date(modelController.$modelValue.getTime()) : new Date();
                                    date.setHours(parts[1], parts[3]);
                                    modelController.$setValidity('time', true);
                                    return date;
                                } else {
                                    modelController.$setValidity('time', false);
                                    return;
                                }
                        });

                        // Convierte el valor string que maneja TimePicker a un objeto Date
                        modelController.$formatters.push(function (value) {
                            if (value) {
                                var time = format(value, "HH:mm");
                                element.timepicker('setTime', time)
                                return time;
                            }
                            else
                                value;
                        });
                    }
                }
            }
        }
    }
}]);