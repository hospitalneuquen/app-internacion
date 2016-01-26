'use strict';

appModule.controller('CamasController', ['$scope', 'Plex', function($scope, Plex) {

    angular.extend($scope, {


        camas: [{
            "habitacion": 3,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "ocupada",
            "idInternacion": null,
            "paciente": {
                id: 456,
                apellido: "Urbano",
                nombre: "Manuel",
                documento: "31965283",
                fechaNacimiento: Date,
                sexo: 'Masculino'
            }
        },
        {
            "habitacion": 5,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 6,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 6,
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 6,
            "numero": 3,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 7,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "reparacion",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 8,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 8,
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 9,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 8,
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 8,
            "numero": 3,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 10,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 10,
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 11,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "reparacion",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 11,
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "reparacion",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 13,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 13,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 15,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 15,
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 15,
            "numero": 3,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 16,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": true,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 16,
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": true,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 17,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 18,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": true,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 18,
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": true,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 19,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": true,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 19,
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 20,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 20,
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 20,
            "numero": 3,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 21,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 22,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": true,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 23,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 23,
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 23,
            "numero": 3,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "desocupada",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 25,
            "numero": 1,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "reparacion",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 25,
            "numero": 2,
            "tipoCama": "cama",
            "oxigeno": false,
            "desinfectada": true,
            "estado": "reparacion",
            "idInternacion": null,
            "paciente": null
        },
        {
            "habitacion": 25,
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
            Plex.openView('pacientes/buscar.html').then(function() {


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


appModule.filter('unique', function() {
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
