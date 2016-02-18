'use strict';

angular.module('app').controller('pacientes/evolucionar', ['$scope', 'Plex', 'plexParams', 'Shared', 'Server', '$timeout', function($scope, Plex, plexParams, Shared, Server, $timeout) {

    angular.extend($scope, {
        loading: true,
        cama: undefined,
        internacion: undefined,
        evoluciones: {},

        init: function() {
            // seteamos los valores por defecto de las evoluciones
            $scope.setDefaultEvoluciones();

            // buscamos la cama
            Server.get("/api/internacion/cama/" + plexParams.idCama, {}, {
                updateUI: false
            }).then(function(cama) {
                if (!cama) {
                    alert("No se ha podido encontrar la cama");
                } else {
                    $scope.cama = cama;
                }
            });

            $scope.loading = true;
            // buscamos la internacion
            Server.get("/api/internacion/internacion/" + plexParams.idInternacion, {}, {
                updateUI: false
            }).then(function(internacion) {
                if (!internacion) {
                    alert("No se ha podido encontrar la internacion");
                } else {
                    $scope.internacion = internacion;
                    $scope.loading = false;
                }
            });

            // buscamos todos los datos del paciente que faltan
        },



        editarEvolucion: function(evolucion){
            $scope.evolucionesEdit = {};

            angular.copy(evolucion, $scope.evolucionesEdit);
        },

        guardarEvolucion: function(evolucion){
            Server.patch('/api/internacion/internacion/' + plexParams.idInternacion + '/evolucion/' + evolucion.id, $scope.evolucionesEdit).then(function(data) {

                evolucion.$editing = false;

                // actualizamos el listado de evoluciones
                $scope.actualizarEvoluciones(data);
            }, function() {

            });
        },

        crearEvolucion: function() {
            Server.patch('/api/internacion/internacion/' + plexParams.idInternacion + '/evolucion', $scope.evoluciones).then(function(data) {
                // si se eligio la opcion de volver al mapa de camas
                // entonces devolvemos la cama para que genere la animacion
                if ($scope.volverAlMapa){
                    Plex.closeView($scope.cama);
                }else{
                    // vaciamos los elementos del formulario
                    $scope.setDefaultEvoluciones();

                    // reiniciamos el formulario
                    $scope.formEvolucion.$setPristine();

                    // actualizamos el listado de evoluciones
                    $scope.actualizarEvoluciones(data);
                }
            }, function() {

            });
        },

        actualizarEvoluciones: function (data){
            var found = false;
            $scope.loading = true;

            var length = $scope.internacion.evoluciones.length;

            // buscamos la cama y actualizamos el valor con los datos
            for (var i = 0; i < length; i++){

                if ($scope.internacion.evoluciones[i].id == data.id){
                    // evolucion encontrada, actualizamos datos
                    $scope.internacion.evoluciones[i] = data;

                    found = true;
                    break;
                }
            }

            // si no lo encontro, entonces es porque acaba de cargarla
            // se la asignamos al resto de las evoluciones
            if (!found){
                $scope.internacion.evoluciones.push(data);
            }

            $scope.loading = false;
        },

        setDefaultEvoluciones: function(){
            $scope.evoluciones = {
                fecha: null,
                hora: null,
                pulso: null,
                ta: null,
                mmhg: null,
                temperatura: null,
                respiracion: null,
                spo2: null,
                peso: null,
                texto: null
            }
        }
    });

    $scope.init();

    Plex.initView({
        title: "Evolucionar paciente"
    });
}]);
