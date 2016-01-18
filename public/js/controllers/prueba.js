'use strict';

appModule.controller('PruebaController', ['$scope', function($scope) {
  angular.extend($scope, {
    miFormulario: null,
    nombre: "Pedro",
    fecha: new Date(),
    guardar: function(){
      var dto = {

      }
      //if (miFormulario.$valid)
      //Server.post('api/internacion/', dto)
    }
  });
}]);
