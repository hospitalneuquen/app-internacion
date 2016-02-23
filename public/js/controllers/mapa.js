'use strict';

angular.module('app').controller('MapaController', ['$scope', 'Plex', 'Shared', 'Server', '$timeout', '$alert', function($scope, Plex, Shared, Server, $timeout, $alert) {
    angular.extend($scope, {
        habitaciones: [],
        tipoCamas: [],
        camas: null,
        init: function(){
            // obtenemos las camas para armar el mapa
            Shared.Mapa.get().then(function(data){
                $scope.camas = data;
                $scope.filter.filtrar();

                //asignamos las habitaciones
                angular.forEach(data, function(cama, key){
                    if ($.inArray(cama.habitacion, $scope.habitaciones) == -1){
                        $scope.habitaciones.push(cama.habitacion);
                    }

                    if ($.inArray(cama.tipoCama, $scope.tipoCamas) == -1){
                        $scope.tipoCamas.push(cama.tipoCama);
                    }

                });

                // ordenamos las habitaciones
                if ($scope.habitaciones.length > 0){
                    $scope.habitaciones.sort();
                }
            });

        },
        filter:{
            camas: null,
            habitacion: null,
            oxigeno: false,
            desinfectada: false,
            tipoCama: false,
            nombre: null,
            estado: null,
            filtrar: function(){
                var self = this;
                var regex_nombre = new RegExp(".*" + self.nombre + ".*", "ig");

                self.camas = $scope.camas.filter(function(i){
                     return (!self.oxigeno || (self.oxigeno && i.oxigeno)) &&
                            (!self.desinfectada || (self.desinfectada && i.desinfectada)) &&
                            (!self.tipoCama || (self.tipoCama && i.tipoCama == self.tipoCama)) &&
                            (!self.habitacion || (self.habitacion && i.habitacion == self.habitacion)) &&
                            (!self.estado || (self.estado && i.estado == self.estado)) &&
                            (!self.nombre || (self.nombre && i.paciente && (regex_nombre.test(i.paciente.nombre) || (regex_nombre.test(i.paciente.apellido)) || (regex_nombre.test(i.paciente.documento)) )))

                 });
            },
            limpiarFiltros: function(){
                var self = this;
                self.habitacion = null;
                self.oxigeno = false;
                self.desinfectada = false;
                self.tipoCama = false;
                self.nombre = null;
                self.estado = null;
            }
        },

        buscarPaciente: function(cama){
            if (!cama.desinfectada){
                Plex.showWarning("La cama está actualmente sin desinfectar, no se puede internar a un paciente en ella.");
                return false;
            }
            Plex.openView('pacientes/buscar').then(function(internacion) {
                // operar con el paciente / internacion devuelto en data
                if (typeof internacion !== "undefined") {
                    $scope.cambiarEstado(cama, 'ocupada', internacion.id);
                }else{
                    //Plex.showError("Internacion no encontrada");
                }
            });
        },
        // cambiamos el estado de una cama
        cambiarEstado: function(cama, estado, idInternacion){
            var dto = {
                estado: estado,
                motivo: (cama.$motivo && typeof cama.$motivo != "undefined") ? cama.$motivo : '',
                idInternacion: (idInternacion && typeof idInternacion != "undefined") ? idInternacion : ''
            }

            // el parametro updateUI en false, es para evitar la pantalla de error
            Server.post("/api/internacion/cama/cambiarEstado/" + cama.id, dto).then(function(data){

                $scope.actualizarMapa(data);

                // verificamos si el parametro $action definido en la vista
                // viene con el valor 'internacion' y de ser asi, entonces
                // mostramos el formulario de valoracion de enfermeria
                if (data.$action == 'internacion'){
                    // una vez actualizado el mapa de cama, mostramos el formulario
                    // de carga de datos de la valoracion inicial
                    $alert({title: 'Internacion creada', content: 'A continuación puede crear la valoración inicial.', placement: 'top-right', type: 'success', show: true});

                    $timeout(function(){
                        Plex.openView('valoracionEnfermeria/' + data.idInternacion).then(function() {

                        });
                    }, 500);
                }

            });
        },

        evolucionar: function(cama){
            Plex.openView('pacientes/evolucionar/' + cama.id + '/' + cama.idInternacion).then(function(data) {
                if (data){
                    $scope.actualizarMapa(data);
                }

            });
        },

        editarInternacion: function(idInternacion){
            Plex.openView('internaciones/editar/' + idInternacion).then(function(internacion) {

            });
        },

        verValoracionInicial: function (idInternacion){
            Plex.openView('valoracionEnfermeria/' + idInternacion).then(function(internacion) {

            });
            // Server.get('/api/internacion/internacion/' + idInternacion + '/valoracionEnfermeria').then(function(valoracionInicial){
            //     console.log(valoracionInicial);
            // });
        },

        actualizarMapa: function(data){
            var length = $scope.camas.length;

            // buscamos la cama y actualizamos el valor con los datos
            for (var i = 0; i < length; i++){
                if ($scope.filter.camas[i].id == data.id){
                    // cama encontrada, actualizamos datos
                    $scope.filter.camas[i] = data;
                    $scope.filter.camas[i].$rotar = true;
                    // agregamos un pequeño timeout para volver a rotar la cama
                    $timeout(function(){
                        $scope.filter.camas[i].$rotar = false;
                    }, 100);

                    break;
                }
            }
        },
        closeView: function() {
            Plex.closeView({

            });
        }

    });

    $scope.$watch('filter.nombre + filter.oxigeno + filter.desinfectada + filter.tipoCama + filter.habitacion + filter.estado', function(current, old){
        if (current != old){
            $scope.filter.filtrar();
        }
     });

    $scope.init();
}]);
