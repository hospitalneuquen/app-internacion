'use strict'

// appModule.directive("pacienteSelectorFecha", ['Global', function (Global) {
angular.module("app").directive('pacienteSelectorFecha',  ['Global', function (Global) {
    return {
        // <input type="hidden" ng-model="opcion" plex="item.nombre for item in opciones" ng-required="requerido" />\
        template: function(){
            var code = '<div class="row">\
                       <div class="col-sm-5">\
                           <input type="text" ng-model="cantidad" prefix="Hace" plex="int" plex-min="1" plex-max="opcion.max" ng-required="requerido" />\
                       </div>\
                       <div class="col-sm-7">\
                           <select ng-model="opcion" plex="item.nombre for item in opciones" ng-required="requerido" ></select>\
                       </div>\
                   </div>';

            return code;
        },
        restrict: 'E',
        //transclude: true,
        scope: {
            fecha: '=fecha',
            requerido: '=requerido',
        },
        link: function (scope, element) {
            // Inicializa scope
            scope.opciones = [
                { id: 'days', nombre: 'Día(s)', max: 30 },
                { id: 'months', nombre: 'Mes(es)', max: 11 },
                { id: 'years', nombre: 'Año(s)', max: 100 }
            ];
            scope.opcion = scope.opciones[0];
            scope.cantidad = null;

            // Observa el cambio de 'fecha'
            var ignorarCambio = false;
            scope.$watch('fecha', function (current, old) {
                if (ignorarCambio) {
                    ignorarCambio = false;
                } else {
                    if (current) {
                        // Convierte la fecha a "hace XX meses"
                        // 10/08/2014 | jgabriel | Código adaptado desde moment.js
                        var milliseconds = new Date() - current;
                        var seconds = Math.round(Math.abs(milliseconds) / 1000),
                            minutes = Math.round(seconds / 60),
                            hours = Math.round(minutes / 60),
                            days = Math.round(hours / 24),
                            years = Math.round(days / 365),
                            args = seconds < 45 && ['s', seconds] || minutes === 1 && ['m'] || minutes < 45 && ['m', minutes] || hours === 1 && ['h'] || hours < 22 && ['h', hours] || days === 1 && ['days'] || days <= 25 && ['days', days] || days <= 45 && ['months'] || days < 345 && ['months', Math.round(days / 30)] || years === 1 && ['years'] || ['years', years];

                        scope.opcion = Global.getById(scope.opciones, args[0]);
                        if (scope.opcion) {
                            scope.cantidad = args[1] || 1;
                        } else {
                            scope.cantidad = 1;
                            scope.opcion = scope.opciones[0];
                        }
                    } else {
                        scope.cantidad = null;
                    }
                }
            });

            // Actualiza 'fecha'
            scope.$watch('cantidad + opcion.id', function (current, old) {
                if (current != old) {
                    if (scope.cantidad && scope.opcion) {
                        var cantidad = (scope.opcion.id == 'days' && scope.cantidad == 1) ? 0 : scope.cantidad; // Así toma el día de hoy
                        scope.fecha = moment().add(scope.opcion.id, -cantidad).toDate();
                        ignorarCambio = true;
                    } else {
                        scope.fecha = null;
                        ignorarCambio = true;
                    }
                }
            });
        }
    }
}]);
