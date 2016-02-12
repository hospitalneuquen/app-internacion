'use strict';

angular.module('app').controller('PacientesController', ['$scope', 'Plex', function($scope, Plex) {
    // angular.extend($scope, {
    //     evolucionar: function() {
    //         Plex.openView('pacientes/evolucionar').then(function() {
    //             alert("Cerrando Evolucionar");
    //         })
    //
    //     },
    //
    //     cerrarEvolucionar: function() {
    //         Plex.closeView({
    //
    //         });
    //     },
    //
    //     cargarPrestaciones: function(tipo_prestacion) {
    //         Plex.initView({
    //             title: "Prestaciones",
    //             actions: [{
    //                 title: "Prestaciones de " + tipo_prestacion,
    //                 icon: "fa fa-",
    //                 handler: function() {
    //                     Plex.openView('prestaciones').then(function() {
    //
    //                     })
    //                 }
    //             }]
    //         });
    //     },
    //
    //     cerrarPrestaciones: function() {
    //         Plex.closeView({
    //
    //         });
    //     }
    // });

}]);
