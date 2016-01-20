'use strict';

appModule.controller('PruebaController', ['$scope', 'Plex', function($scope, Plex) {
    angular.extend($scope, {
        miFormulario: null,
        nombre: "Pedro",
        fecha: new Date(),
        guardar: function() {
            alert("yes");
            var dto = {

                }
                //if (miFormulario.$valid)
                //Server.post('api/internacion/', dto)
        }

    });

    Plex.initView({
        title: "Mi titulo",
        actions: [{
            title: "Camas",
            icon: "fa fa-bed",
            handler: function() {
                Plex.openView('camas').then(function() {

                })
            }
        }]
    });
}]);
