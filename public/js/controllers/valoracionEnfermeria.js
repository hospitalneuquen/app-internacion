'use strict';

angular.module('appModule').controller('ValoracionEnfermeriaController', ['$scope', function($scope) {
    angular.extend($scope, {
        miFormulario: null,
        nombre: "Ana",
        fecha: new Date(),
        guardar: function() {
            var dto = {

                }
                //if (miFormulario.$valid)
                //Server.post('api/internacion/', dto)
        }
    });
}]);
