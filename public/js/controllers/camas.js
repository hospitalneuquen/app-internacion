'use strict';

angular.module('app').controller('CamasController', ['$scope', 'Plex', function($scope, Plex) {
    angular.extend($scope, {
        camas: [{
            "habitacion": 403,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 405,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": true,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 406,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 406,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 406,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 3,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 407,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "reparacion",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 408,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 408,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 409,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 409,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 409,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 3,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 410,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 410,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 411,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "reparacion",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 411,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "reparacion",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 413,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 413,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 415,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 415,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 415,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 3,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 416,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": true,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 416,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": true,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 417,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 417,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 417,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 3,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 418,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": true,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 418,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": true,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 419,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": true,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 419,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 420,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 420,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 420,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 3,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 421,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 421,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": true,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 423,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 423,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 423,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 3,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 425,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "reparacion",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 425,
            "servicio": {
                "id": 2,
                "nombre": "quirurgica"
            },
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "reparacion",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 425,
            "servicio": {
                "id": 2,
                "nombre": "reparacion"
            },
            "numero": 3,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "reparacion",
            "idInternacion": null,
            "paciente": null
        }],

        init: function(){
            $scope.filter.camas = $scope.camas;
            // Server.get('http://localhost:3001/camas/').then(function(data) {
            //     $scope.filter.camas = data;
            // });
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
                            //(!self.nombre || (self.nombre && i.paciente && (i.paciente.nombre.match(self.nombre))))
                            (!self.nombre || (self.nombre && i.paciente && (regex_nombre.test(i.paciente.nombre) || (regex_nombre.test(i.paciente.apellido)) )))
                 });

                //self.camas = (self.camas.length > 0 ) ? (self.camas) : $scope.camas;
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
                alert("yes");

            });
        },

        aReparar: function() {
            Plex.openView('camas/reparar').then(function() {

            })

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


angular.module('app').filter('unique', function() {
    return function(collection, keyname) {
        var output = [],
            keys = [];

        angular.forEach(collection, function(item) {
            var key = item[keyname];
            if (keys.indexOf(key) === -1) {
                keys.push(key);
                output.push(item);
            }
        });

        return output;
    };
});
