
'use strict'

/**
 * @ngdoc filter
 * @module app
 * @name persona
 * @description
 * Filtro para mostrar datos de una persona
 *
 * @param {Object} persona Instancia de persona
 * @param {string} formato Formato
 *
 * Puede ser uno de los siguientes valores:
 *   - `an`: Muestra el apellido y nombre (valor por defecto)
 *   - `na`: Muestra el nombre y apellido
 *   - `dna`: Muestra el número de documento, nombre y apellido
 *   - `d`: Muestra el número de documento
 *   - `e`: Muestra la edad del paciente. Puede utilizarle el parámetro `opcional` para calcular la edad en la fecha indicada
 * @param {Object} opcional Parámetro opcional para algunos formatos
 *
 * @xxxexample
    <example module="exampleModule" deps="" animate="false">
      <file name="index.html">
        <div ng-controller="MainCtrl as main">
          <pre>{{main.persona | json}}</pre>
          {{main.persona | persona}}
        </div>
      </file>
      <file name="main.js">
        angular.module('exampleModule', ['src']).controller('MainCtrl', function () {
          this.persona = {
            apellido: 'García',
            nombre: 'Dominga',
            documento: 1234567
          }
        });
      </file>
    </example>
 **/
angular.module('app').filter('persona', ['$filter', function($filter) {
    return function(persona, formato, opcional) {
        // Formato default: an
        // Ejemplo de formato: "dan" --> Documento + Apellido + Nombre
        if (!persona)
            return undefined;
        else {
            var formatDocumento = function(appendThis) {
                return !persona.documento ? "" : ((isNaN(persona.documento) ? persona.documento : $filter('number')(persona.documento)) + (appendThis || ""));
            }

            switch (formato) {
                case "na":
                    return persona.nombre + " " + persona.apellido;
                    break;
                case "dan":
                    return formatDocumento(" | ") + persona.apellido + ", " + persona.nombre;
                    break;
                case "d":
                    return formatDocumento();
                    break;
                case "e":
                    if (persona.fechaNacimiento) {
                        var birthDate = new Date(persona.fechaNacimiento);
                        var otherDate = opcional ? new Date(opcional) : new Date();
                        var years = (otherDate.getFullYear() - birthDate.getFullYear());
                        if (otherDate.getMonth() < birthDate.getMonth() ||
                            otherDate.getMonth() == birthDate.getMonth() && otherDate.getDate() < birthDate.getDate()) {
                            years--;
                        }
                        years += years == 1 ? " año" : " años";
                        if (persona.fechaNacimientoEstimada)
                            years += " (estimada)";
                        return years;
                    } else
                        return null;

                case "icon": // establece el icono para el paciente segun la edad y el sexo
                    if (persona) {
                        if (persona.fechaNacimiento) {
                            var birthDate = new Date(persona.fechaNacimiento);
                            var otherDate = opcional ? new Date(opcional) : new Date();
                            var years = (otherDate.getFullYear() - birthDate.getFullYear());
                            if (otherDate.getMonth() < birthDate.getMonth() ||
                                otherDate.getMonth() == birthDate.getMonth() && otherDate.getDate() < birthDate.getDate()) {
                                years--;
                            }

                            var edad = years;
                        } else {
                            var edad = null;
                        }

                        if (edad >= 0 && edad < 15) {
                            if (edad >= 0 && edad <= 3) {
                                return 'icon-i-nursery';
                            } else if (edad > 3 && edad < 15) {
                                return 'fa fa-child';
                            }
                        } else {
                            if (persona.sexo && (persona.sexo == 'Masculino' || persona.sexo == 'masculino')) {
                                return 'fa fa-male';
                            } else if (persona.sexo && (persona.sexo == 'Femenino' || persona.sexo == 'femenino')) {
                                return 'fa fa-female';
                            } else if (persona.sexo && (persona.sexo == 'Indeterminado' || persona.sexo == 'indeterminado')) {
                                return 'fa fa-genderless';
                            }
                        }

                        // devolvemos por defecto
                        return 'fa fa-male';
                    }
                default:
                    return persona.apellido + ", " + persona.nombre;
            }
        }
    }
}]);
