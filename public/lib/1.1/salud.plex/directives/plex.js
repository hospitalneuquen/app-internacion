'use strict'

angular.module('plex').directive("plex", ['$injector', function ($injector) {
    return {
        restrict: 'EAC',
        require: ['?ngModel', '^?form'],
        priority: 598, // Para que el postLink ejecute último. ng-if tiene prioridad 600
        compile: function (element, attrs) {
            // Determina el tipo
            var type = attrs.plex;
            if (type) {
                if (type != "int" && type != "float" && type != "date" && type != "time" && type != "bool" && type != "html")
                    type = "select";
            } else {
                // 04/08/2014 | jgabriel | Este bloque se mantiene por compatibilidad. En las aplicaciones, cambiar todos los inputs a type='text' y luego borrar este código
                if (element.is("INPUT[type=date]"))
                    type = "date";
                else
                    if (element.is("INPUT[type=time]"))
                        type = "time";
                    else
                        if (element.is("SELECT") || element.is("INPUT[type=select]"))
                            type = "select";
                        else
                            if (element.is("INPUT[type=number]"))
                                type = "int"
                            else
                                if (element.is("INPUT[type=hidden]"))
                                    type = "hidden"
            }

            // Inyecta dinámicamente directivas
            var dinamicLink = null;
            switch (type) {
                case "date":
                    element.attr("bs-datepicker", "");
                    attrs.autoclose = true;
                    attrs.dateFormat = attrs.dateFormat || "mediumDate";
                    dinamicLink = $injector.get("bsDatepickerDirective")[0].compile(element, attrs);
                    break;
                case "time":
                    element.attr("bs-timepicker", "");
                    attrs.autoclose = true;
                    //attrs.minuteStep = attrs.minuteStep || 30;  POR UN BUG NO FUNCIONA. Esperando solución
                    dinamicLink = $injector.get("bsTimepickerDirective")[0].compile(element, attrs);
                    break;
                case "select":
                    attrs.plexSelect = attrs.plex;
                    dinamicLink = $injector.get("plexSelectDirective")[0].compile(element, attrs);
                    break;
                case "html":
                    attrs.plexSelect = attrs.plex;
                    dinamicLink = $injector.get("textAngularDirective")[0].compile(element, attrs);
                    break;
            }

            return {
                post: function (scope, element, attrs, controllers) {
                    var modelController = controllers[0];
                    var formController = controllers[1];
                    // Actualiza el DOM
                    var newParent = angular.element("<div class='form-group'>");
                    // Label
                    if (attrs.label) {
                        var texto = attrs.label == "\\" ? "&nbsp;" : attrs.label;
                        var label = angular.element("<label>").html(texto); /* Usa \ para dejar un label vacío */
                        // Insert texto "Opcional"
                        if (attrs.ngRequired) {
                            scope.$watch(attrs.ngRequired, function (current) {
                                if (current === false)
                                    label.html(texto + "<span class='optional text-muted'>(opcional)</span>");
                                else
                                    label.html(texto);
                            });
                        }
                        newParent.append(label);
                    }
                    element.before(newParent);
                    element.detach();
                    newParent.append(element);

                    newParent.append("<span class='help-block'>Requerido</span>");
                    newParent.append("<span class='help-block'>Valor no válido</span>");
                    if (attrs.hint)
                        newParent.append(angular.element("<span class='help-block'>").text(attrs.hint));

                    // Visibilidad
                    if (attrs.ngShow)
                        scope.$watch(attrs.ngShow, function (value) {
                            if (value)
                                newParent.show();
                            else
                                newParent.hide();
                        });
                    if (attrs.ngHide)
                        scope.$watch(attrs.ngHide, function (value) {
                            if (value)
                                newParent.show();
                            else
                                newParent.hide();
                        });

                    // Validación
                    var validator = function (element, modelController) {
                        // Calcula valores
                        var required = typeof (modelController) != 'undefined' && !modelController.$pristine && modelController.$error.required;
                        var invalid = typeof (modelController) != 'undefined' && !modelController.$pristine && ((modelController.$error.pattern || modelController.$error.number || modelController.$error.max || modelController.$error.min || modelController.$error.date || modelController.$error.time || modelController.$error.maxlength || modelController.$error.minlength) || false);

                        // Muestra/oculta elementos 
                        var controlGroup = element.parents(".form-group").eq(0);
                        controlGroup.toggleClass("has-error", required || invalid);
                        var spans = controlGroup.find(".help-block");
                        spans.eq(0).css("display", required ? "block" : "none");
                        spans.eq(1).css("display", invalid ? "block" : "none");
                    }

                    if (modelController) {
                        modelController.$parsers.push(function (value) { validator(element, modelController); return value; });
                        scope.$watch(function () { return modelController.$error }, function () { validator(element, modelController); }, true);
                    } else {
                        validator(element);
                    }

                    // Cuando se llama a Plex.submitForm();
                    scope.$on("$plex-before-submit", function (event, submitController) {
                        modelController.$setDirty();
                        validator(element, modelController);
                        //modelController.$validate();
                        //debugger;
                        //// Dirty = true (i.e. fuerza que muestre los campos requeridos)
                        //if (modelController && formController == submitController)
                        //    modelController.$setViewValue(modelController.$viewValue);
                    });

                    switch (type) {
                        case "date":
                            var inputGroup = angular.element("<div class='input-group'>");
                            element.before(inputGroup);
                            element.detach();                          
                            if (attrs.selectOnly) {
                                element.attr('readonly', 'readonly');
                                element.css({ cursor: "pointer" });
                                element.on('click', function () { $(this).next().find(".btn").click(); });
                            }
                            inputGroup.append(element);
                            element.addClass('form-control');
                            element.after($("<span class='input-group-btn'><a class='btn btn-default' tabindex='-1'><i class='fa fa-calendar'></i></a></span>").on('click', function () {
                                element.removeAttr('readonly');
                                element.focus();
                                element.attr('readonly', 'readonly');
                            }));

                            // Soluciona el bug de ng-readonly
                            if (attrs.ngReadonly)
                                scope.$watch(attrs.ngReadonly, function (value) {
                                    if (value)
                                        element.attr("disabled", "disabled")
                                    else
                                        element.removeAttr("disabled");
                                });
                            break;
                        case "time":
                            var inputGroup = angular.element("<div class='input-group'>");
                            element.before(inputGroup);
                            element.detach();
                            inputGroup.append(element);
                            element.addClass('form-control');
                            element.after($("<span class='input-group-btn'><a class='btn btn-default' tabindex='-1'><i class='fa fa-clock-o'></i></a></span>").on('click', function () { element.focus() }));

                            // Soluciona el bug de ng-readonly
                            if (attrs.ngReadonly)
                                scope.$watch(attrs.ngReadonly, function (value) {
                                    if (value)
                                        element.attr("disabled", "disabled")
                                    else
                                        element.removeAttr("disabled");
                                });
                            break;
                        case "int":
                        case "float":
                            if (attrs.prefix || attrs.suffix) {
                                var inputGroup = angular.element("<div class='input-group'>");
                                element.before(inputGroup);
                                element.detach();
                                if (attrs.prefix)
                                    inputGroup.append('<span class="input-group-addon">' + attrs.prefix + '</span>');
                                inputGroup.append(element);
                                if (attrs.suffix)
                                    inputGroup.append('<span class="input-group-addon">' + attrs.suffix + '</span>');
                            }

                            element.addClass('form-control');
                            // Permite sólo tipear dígitos
                            var numberParsers = function (value) {
                                if (value) {
                                    value = ("" + value).replace(",", ".");
                                    var regEx;
                                    if (type == "float")
                                        regEx = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/;
                                    else
                                        regEx = /^\s*(\-|\+)?(\d+)\s*$/;


                                    if (regEx.test(value)) {
                                        modelController.$setValidity('number', true);
                                        return parseFloat(value, 10);
                                    }
                                    else {
                                        modelController.$setValidity('number', false);
                                        return null;
                                    }
                                } else {
                                    return value;
                                }
                            };
                            if (modelController)
                                modelController.$parsers.unshift(numberParsers);
                            break;
                        case "select":
                        case "hidden":
                            element.addClass("form-control select2");
                            break;
                        case "bool":
                            //debugger;
                            var id = "plex" + Math.floor((1 + Math.random()) * 0x10000);
                            element.attr("id", id);
                            element.attr("type", "checkbox");
                            element.attr("class", "onoffswitch-checkbox");
                            // Crea el div contenedor
                            var group = angular.element("<div class='onoffswitch'>");
                            element.before(group);
                            element.detach();
                            group.append(element);
                            // Crea el label
                            var label = angular.element('<label class="onoffswitch-label">').appendTo(group);
                            label.attr("for", id);
                            var span = angular.element('<span class="onoffswitch-inner">').appendTo(label);
                            span.attr("data-true", attrs.true || "Si");
                            span.attr("data-false", attrs.false || "No");
                            angular.element('<span class="onoffswitch-switch">').appendTo(label);
                            break;
                        case "html":
                            break;
                        default:
                            if (attrs.prefix || attrs.suffix) {
                                var inputGroup = angular.element("<div class='input-group'>");
                                element.before(inputGroup);
                                element.detach();
                                if (attrs.prefix)
                                    inputGroup.append('<span class="input-group-addon">' + attrs.prefix + '</span>');
                                inputGroup.append(element);
                                if (attrs.suffix)
                                    inputGroup.append('<span class="input-group-addon">' + attrs.suffix + '</span>');
                            }
                            element.addClass('form-control');
                    }

                    // Directivas dinámicas
                    if (dinamicLink)
                        dinamicLink(scope, element, attrs, modelController);

                    // Eventos
                    scope.$on("$plex-before-submit", function (event, submitController) { // Invocado desde Plex.submitForm()
                        // Dirty = true (i.e. fuerza que muestre los campos requeridos)
                        if (modelController && formController == submitController)
                            modelController.$setViewValue(modelController.$viewValue);
                    }); 
                    element.on("$destroy", function () {
                        if (!element.data("$plex-destroy")) {
                            element.data("$plex-destroy", true);
                            newParent.remove();
                            element.data("$plex-destroy", null);
                        }
                    });
                }
            }
        }
    }
}]);