'use strict';

angular.module('app').controller('ValoracionEnfermeriaController', ['$scope', 'Plex', 'plexParams', 'Shared', 'Server', '$timeout', '$alert', function($scope, Plex, plexParams, Shared, Server, $timeout, $alert) {
    angular.extend($scope, {
        enfermeria: {
            FR: null, SAT2: null, disneaEsfuerzo: null, disneaReposo: null, tos: null, secreciones: null, usoMusculos: null, secrecionesCaracteristicas: null, musculosCuales: null, observacionesOxigenacion: null,
            TA: null, FC: null, carotideo: null, radial: null, popliteo: null, pedio: null, observacionesCirculacion: null,
            peso: null, talla: null, habitosAlimentarios: null, vomitos: null, vomitosCaracteristicas: null, nauseas: null, otrosNutricion: null, piezasDentarias:  null, protesis: null, protesisTipo: null,
            dificultadesDeglutir: null, dificultadesMasticar: null, lactanciaMaterna: null, observacionesNutricion: null
        },
        guardar: function() {
            Server.patch('/api/internacion/internacion/' + plexParams.idInternacion + '/valoracionEnfermeria', $scope.enfermeria).then(function(data) {
                Plex.closeView();
            }, function() {

            });
        },
        cargarRiesgoCaidas: function() {
            Plex.openView('riesgoCaidas').then(function() {

            });
        },
    });
}]);
