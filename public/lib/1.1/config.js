'use strict';
// Módulos para cargar
var requiredModules = [
    // Core
    'ngRoute', 'ngAnimate', 'ngSanitize', 'angular-servicestack',
    // UI
    //'mgcrea.ngStrap',
    'mgcrea.ngStrap.core',
    'mgcrea.ngStrap.affix',
    'mgcrea.ngStrap.button',
    'mgcrea.ngStrap.datepicker',
    'mgcrea.ngStrap.dropdown',
    'mgcrea.ngStrap.modal',
    'mgcrea.ngStrap.popover',
    'mgcrea.ngStrap.timepicker',
    'mgcrea.ngStrap.tooltip',
    'mgcrea.ngStrap.tab',
    'mgcrea.ngStrap.helpers.dateParser',
    'mgcrea.ngStrap.helpers.dateFormatter',
    'mgcrea.ngStrap.helpers.debounce',
    'mgcrea.ngStrap.helpers.dimensions',
    // Other
    'angularLoad',
    'pasvaz.bindonce',
    'ngFileUpload',
    'textAngular',
    // Salud
    'global', 'plex'
];

// Crea el módulo principal de la aplicación (appModule)
angular
    .module('appModule', requiredModules)
    .config(['$locationProvider', 'serviceStackRestConfigProvider', '$httpProvider', '$dropdownProvider', '$buttonProvider', '$provide', function ($locationProvider, serviceStackRestConfigProvider, $httpProvider, $dropdownProvider, $buttonProvider, $provide) {
        // Habilitar la siguiente linea para usar paths 'app/url' en vez de 'app#url'
        // 21/02/2014 | jgabriel | Deshabilito html5Mode porque causa problemas en tablets y móviles
        $locationProvider.html5Mode(false);

        // Configura al acceso a las APIs
        serviceStackRestConfigProvider.setRestConfig({
            maxRetries: 0,
            unauthorizedFn: function (response, $location) {
                $location.path("/dotnet/SSO/Login.aspx");
            }
        });

        // Configura Angular-Strap
        angular.extend($buttonProvider.defaults, {
            activeClass: 'btn-success'
        });
        angular.extend($dropdownProvider.defaults, {
            animation: 'am-flip-x',
            html: 'true',
            container: 'body'
        });

        // TextAngular
        $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function (taRegisterTool, taOptions) {
            taOptions.forceTextAngularSanitize = false;
            taOptions.toolbar = [
                ['bold', 'italics', 'underline', 'ul', 'ol', 'redo', 'undo'],
                ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
            ];
            return taOptions;
        }]);

        // Convierte fechas a/de .NET
        $httpProvider.defaults.transformResponse.unshift(function (data) {
            // Parsea fechas de formato .NET en objetos Date
            var rvalidchars = /^[\],:{}\s]*$/;
            var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
            var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
            var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
            var dateISO = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:[.,]\d+)?Z/i;
            var dateNet = /\/Date\((-?\d+)(?:-\d+)?\)\//i;

            var replacer = function (key, value) {
                if (typeof (value) === "string") {
                    if (dateISO.test(value)) {
                        return new Date(value);
                    }
                    if (dateNet.test(value)) {
                        return new Date(parseInt(dateNet.exec(value)[1], 10));
                    }
                }
                return value;
            };

            if (data && typeof (data) == "string" && rvalidchars.test(data.replace(rvalidescape, "@").replace(rvalidtokens, "]").replace(rvalidbraces, ""))) {
                return window.JSON.parse(data, replacer);
            }
            else {
                return data;
            }
        })

        $httpProvider.defaults.transformRequest.unshift(function (data) {
            // Convierte objetos Date en formato .NET
            var rvalidchars = /^[\],:{}\s]*$/;
            var rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
            var rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
            var rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g;
            var dateISO = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:[.,]\d+)?Z/i;
            var dateNet = /\/Date\((-?\d+)(?:-\d+)?\)\//i;

            var replacer = function (key, value) {
                if (key && angular.isObject(this) && angular.isDate(this[key])) {
                    return "/Date(" + this[key].getTime() + "-0000)/"
                }
                else
                    return value;
            };

            if (data && angular.isObject(data))
                return window.JSON.stringify(data, replacer);
            else
                return data;
        });
    }])
    .run(['$rootScope', 'Global', 'Plex', 'SSO', function ($rootScope, Global, Plex, SSO) {
        angular.extend($rootScope, {
            currentTheme: 'cosmo',
            // Acceso global a servicios
            Global: Global,
            Plex: Plex,
            SSO: SSO
        });
        //Global.init(SSO.init());
    }]);
