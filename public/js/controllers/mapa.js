'use strict';

angular.module('app').controller('MapaController', ['$scope', 'Plex', 'Shared', 'Server', function($scope, Plex, Shared, Server) {

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
                            (!self.nombre || (self.nombre && i.paciente && (regex_nombre.test(i.paciente.nombre) || (regex_nombre.test(i.paciente.apellido)) )))
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

        buscarPaciente: function(){
            Plex.openView('pacientes/buscar').then(function() {

            });
        },

        aReparar: function(idCama) {
            var dto = {
                estado: 'reparacion'
            }
            //Server.post("http://localhost:3001/cama/cambiarEstado/56aa200fc070385d4770b444", dto).then(function(){
            // el parametro updateUI en false, es para evitar la pantalla de error
            Server.post("http://localhost:3001/cama/cambiarEstado/" + idCama, dto, {updateUI: false}).then(function(data){
                var length = $scope.camas.length;
                // TODO: REVISAR como volver a rotar la tarjeta antes de asignar la cama modificada
                for (var i = 0; i < length; i++){
                    if ($scope.filter.camas[i].id == idCama){
                        setTimeout(function(){
                            $scope.filter.camas[i].$rotar = false;
                        }, 10000);
                        $scope.filter.camas[i] = data;
                        break;
                    }
                }
            }, function(error){
                Plex.showWarning(error.data);
            });
        },
        camaReparada: function(idCama){
            var dto = {
                estado: 'desocupada'
            }

            // el parametro updateUI en false, es para evitar la pantalla de error
            Server.post("http://localhost:3001/cama/cambiarEstado/" + idCama, dto, {updateUI: false}).then(function(data){
                var length = $scope.camas.length;
                for (var i = 0; i < length; i++){
                    if ($scope.filter.camas[i].id == idCama){
                        $scope.filter.camas[i] = data;
                        break;
                    }
                }
            }, function(error){
                Plex.showWarning(error.data);
            });
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
//
//
// angular.module('app').filter('unique', function() {
//     return function(collection, keyname) {
//         var output = [],
//             keys = [];
//
//         angular.forEach(collection, function(item) {
//             var key = item[keyname];
//             if (keys.indexOf(key) === -1) {
//                 keys.push(key);
//                 output.push(item);
//             }
//         });
//
//         return output;
//     };
// });
