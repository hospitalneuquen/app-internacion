'use strict';

angular.module('plex').factory('Plex', ["$rootScope", "PlexResolver", "$window", "$modal", "$q", "$timeout", "Global", "SSO", function ($rootScope, PlexResolver, $window, $modal, $q, $timeout, Global, SSO) {
    var self = {
        /*
        ViewStack es un array de objetos son las siguientes propiedades:
            - element: elemento visual que se muestra u oculta
            - deferred: promesa que se resuelve cuando se cierra la vista
            - ui: opciones de la interfase de usuario
            - formController: relaciona los botones "Guardar" y "Cancelar" con métodos del controlador actual
        */
        viewStack: [], // array of {element, deferred, ui, form}
        currentViewIndex: null,
        title: null,
        subtitle: null,
        currentSkin: null,
        error: {
            show: false,
            title: undefined
        },
        warning: {
            show: false,
            title: undefined
        },
        info: {
            show: false,
            title: undefined
        },
        loading: {
            smallCount: 0,
            bigCount: 0,
            showSmall: false,
            showBig: false,
            update: function (value, useBig) // Indica que la aplicación está cargando datos, o bien que ha finalizado
            {
                if (useBig) {
                    if (value)
                        this.bigCount++;
                    else if (this.bigCount > 0)
                        this.bigCount--;
                    this.showBig = this.bigCount > 0;
                } else {
                    if (value)
                        this.smallCount++;
                    else if (this.smallCount > 0)
                        this.smallCount--;
                    this.showSmall = this.smallCount > 0;
                }
            }
        },
        actions: [],        // Acciones que se muestran en el footer. Es un array de {title, icon, [url | handler], visible, disabled}
        menuActions: null,  // Acciones que se muestran en menú a la izquierda del nav-bar
        userActions: [
            {
                text: "<i class=\"fa fa-lock\"></i><span>Bloquear sesión</span>",
                click: function () {
                    self.sessionLock(true);
                }
            },
            {
                text: "<i class=\"fa fa-sign-out\"></i><span>Cerrar sesión</span>",
                click: function () {
                    window.location = "/dotnet/SSO/Logout.aspx";
                }
            },
            {
                text: "<i class=\"fa fa-user\"></i><span>Cambiar usuario</span>",
                click: function () {
                    window.location = "/dotnet/SSO/Logout.aspx?relogin=1&url=" + encodeURIComponent(window.location);
                }
            },
            {
                divider: true
            },
            {
                text: "<i class=\"fa fa-gear\"></i><span>Opciones de usuario</span>",
                click: function () {
                    window.location = "/dotnet/SSO/Options.aspx?url=" + encodeURIComponent(window.location);
                }
            },
            {
                divider: true
            },
            {
                text: "<i class=\"fa fa-circle plex-skin-icon-cosmo\"></i><span>Cosmo</span>",
                click: function () {
                    self.currentSkin = "/lib/1.1/lib.cosmo.css";
                }
            },
            {
                text: "<i class=\"fa fa-circle plex-skin-icon-flatly\"></i><span>Flatly</span>",
                click: function () {
                    self.currentSkin = "/lib/1.1/lib.flatly.css";
                }
            },
            {
                text: "<i class=\"fa fa-circle plex-skin-icon-amelia\"></i><span>Amelia</span>",
                click: function () {
                    self.currentSkin = "/lib/1.1/lib.amelia.css";
                }
            },
            {
                text: "<i class=\"fa fa-circle plex-skin-icon-slate\"></i><span>Slate</span>",
                click: function () {
                    self.currentSkin = "/lib/1.1/lib.slate.css";
                }
            },
            {
                text: "<i class=\"fa fa-circle plex-skin-icon-superhero\"></i><span>Superhero</span>",
                click: function () {
                    self.currentSkin = "/lib/1.1/lib.superhero.css";
                }
            }
        ],
        sessionLockModal: null,
        sessionLock: function (doLock) {
            if (!self.sessionLockModal) {
                self.sessionLockModal = "dummy"; // Hasta que resuelta la promise. Evita duplicar el popup

                var showFn = function () {
                    self.sessionLockModal = $modal({
                        contentTemplate: '/Lib/1.1/html/ssoLock.html',
                        show: true,
                        keyboard: false,
                        backdrop: 'static',
                        placement: 'center'
                    });
                };

                if (doLock)
                    SSO.lock().then(function () { showFn() });
                else
                    showFn();
            }
        },
        submitForm: function () {
            var form = self.currentView().form;
            if (!form.isSubmitting) {
                $rootScope.$broadcast('$plex-before-submit', form.controller)
                if (form.controller.$valid) {
                    form.isSubmitting = true;

                    // Clear warnings
                    self.warning.show = false;

                    var result = form.submitHandler();
                    if (angular.isDefined(result)) {
                        // Is it a promise?
                        if (angular.isDefined(result.finally))
                            result
                            .then(function () {
                                form.controller.$setPristine(true);
                            })
                            .finally(function () {
                                form.isSubmitting = false;
                            });
                        else {
                            if (result) {
                                form.isSubmitting = false;
                                form.controller.$setPristine(true);
                            }
                        }
                    }
                    else {
                        form.isSubmitting = false;
                        form.controller.$setPristine(true);
                    }
                }
                else {
                    self.showWarning('Por favor verifique los datos ingresados');
                }
                $rootScope.$broadcast('$plex-after-submit', form.controller);
            }
        },
        cancelForm: function () {
            var handler = self.currentView().form.cancelHandler;
            if (handler) handler();
        },
        isFormValid: function (showErrors) {
            var form = self.currentView().form;
            if (form) {
                if (form.controller.$valid)
                    return true;
                else {
                    if (showErrors) {
                        // Marca los controladores como modificados para que muestren los errores
                        angular.forEach(form.controller.$error, function (property) {
                            angular.forEach(property, function (controller) {
                                //controller.$setPristine(false);
                                controller.$setViewValue(controller.$viewValue);
                            });
                        });
                    }
                    return false;
                }
            }
            else
                return true;
        },
        showError: function (message) {
            if (!message)
                message = "No se pudo comunicar con la base de datos. Por favor intente la operación nuevamente...";
            self.error.title = message;
            self.error.show = true;
        },
        showWarning: function (message) {
            self.warning.title = message;
            self.warning.show = true;
        },
        showInfo: function (message) {
            self.info.title = message;
            self.info.show = true;
        },
        //clearAlerts: function () {
        //    self.error.show = false;
        //    self.warning.show = false;
        //    self.info.show = false;
        //},
        addView: function (view) {
            angular.extend(view, {
                ui: {                        // Será inicializado cuando el controlador llame a initView()
                    title: null,
                    subtitle: null,
                    actions: null
                },
                form: null                   // Será inicializado en linkForm()
            });
            self.viewStack.push(view);
            self.currentView(view);
            return view;
        },
        currentView: function (view) {
            if (view) {
                self.currentViewIndex = self.viewStack.indexOf(view);
                return view;
            }
            else {
                return angular.isNumber(self.currentViewIndex) ? self.viewStack[self.currentViewIndex] : null;
            }
        },
        openView: function (path) {
            console.log(path);
            var deferred = $q.defer();
            Global.waitInit().then(function () {
                // Muestra la vista (usa $timeout para no romper el ciclo de rendering)
                $timeout(function () {
                    $rootScope.$broadcast('$plex-openView', {
                        route: PlexResolver.resolve(path.indexOf('/') != 0 ? '/' + path : path),
                        deferred: deferred
                    });
                });
            });
            return deferred.promise;
        },
        closeView: function (returnValue) {
            //if (self.currentViewIndex > 0) {
            //    var view = self.currentView();
            //    // Usa $timeout para no romper el ciclo de rendering
            //    $timeout(function () {
            //        $window.history.back();
            //        view.deferred.resolve(returnValue);
            //    });
            //}

            // Usa $timeout para no romper el ciclo de rendering
            $timeout(function () {
                if (self.currentViewIndex > 0) {
                    var view = self.currentView();
                    $window.history.back();
                    view.deferred.resolve(returnValue);
                }
            }, 50);
        },
        openDialog: function (url) {
            // TODO: Abrir un modal
            $window.open(url);
        },
        initUI: function () {
            var currentView = self.currentView();
            self.title = currentView.ui.title;
            self.subtitle = currentView.ui.subtitle;
            self.actions = [];
            angular.forEach(currentView.ui.actions, function (a) {
                if ((!angular.isDefined(a.visible)) || a.visible)
                    self.actions.push(a);
            });
        },
        initView: function (settings) {
            // Esta función es llamada por el controlador para inicializar la vista
            var currentView = self.currentView();

            // Prepara la acciones
            if (settings.actions) {
                for (var i = 0; i < settings.actions.length; i++) {
                    var action = settings.actions[i];
                    action.action = function () {
                        if (this.handler)
                            this.handler();
                        else
                            if (this.url)
                                self.openView(this.url);
                    }
                }
            }

            // Inicializa la UI
            angular.extend(currentView.ui, settings);
            self.initUI();
        },
        initApplication: function (applicationId) {
            // Obtiene el menú de la aplicación actual
            SSO.menu(applicationId).then(function (data) {
                // Arma el menú
                self.menuActions = [];
                if (data.length) {
                    self.menuActions = data[0].items.map(function (i) {
                        return {
                            text: i.text,
                            click: function () {
                            }
                        }
                    });
                }

                self.menuActions = self.menuActions.concat([
                    //{
                    //    divider: true
                    //},
                    {
                        text: "<i class=\"fa fa-home\"></i><span>Volver a la Intranet</span>",
                        click: function () {
                            window.location = "/";
                        }
                    },
                    {
                        divider: true
                    },
                    {
                        text: "<i class=\"fa fa-user\"></i><span>¿Problemas de identificación del paciente o datos desactualizados?</span>",
                        click: function () {
                            self.openView('/feedback/paciente');
                        }
                    },
                    {
                        text: "<i class=\"fa fa-flag\"></i><span>¿Diagnóstico/problema no encontrado o con nombre confuso?</span>",
                        click: function () {
                            self.openView('/feedback/diagnostico');
                        }
                    },
                    {
                        text: "<i class=\"fa fa-comments\"></i><span>Reportar una sugerencia o problema de la aplicación</span>",
                        click: function () {
                            $q.when(self.currentView().route, function (route) {
                                // TODO: debería estar la URL final (i.e. con los parámetros incorporados)
                                self.openView('/feedback/app/' + encodeURIComponent(route.originalPath) + ' ' + JSON.stringify(route.params) + '/' + encodeURIComponent(route.controller));
                            });
                        }
                    }
                ]);
            });
        },
        linkForm: function (controller, submitHandler, cancelHandler) { // Esta función es llamada por la directiva plexForm
            if (!controller)
                throw "Utilice la directiva plex-form para vincular un formulario a la vista.";
            if (!submitHandler)
                throw "El formulario debe tener asociado un submit handler. Puede definir un método submit() en el scope del controlador.";
            if (!cancelHandler)
                throw "El formulario debe tener asociado un cancel handler. Puede definir un método cancel() en el scope del controlador.";

            self.currentView().form = {
                controller: controller,
                submitHandler: submitHandler,
                cancelHandler: cancelHandler
            }
        },
        unlinkForm: function (controller) { // Esta función es llamada por la directiva plexForm
            // TODO: Revisar porque esto no funciona bien!!!! El PlexForm->scope.destroy se llama en momentos inadecuados!!!
            // Momentáneamente recorro todas las vistas

            //self.currentView().form = null;
            this.viewStack.forEach(function (view) {
                if (view.form && (view.form.controller == controller)) {
                    view.form = null;
                }
            })
        }
    }

    // Eventos
    $rootScope.$on("sso-unlock", function () {
        self.sessionLockModal.hide();
        self.sessionLockModal = null;
    });

    return self;
}]);