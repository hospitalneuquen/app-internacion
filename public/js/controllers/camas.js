'use strict';

angular.module('appModule').controller('CamasController', ['$scope', 'Plex', function($scope, Plex) {

    angular.extend($scope, {
        miFormulario: null,
        nombre: "Mapa de camas",

        // camasUnique: [
        //     nombre: "1",
        //     seleccionada: false
        // ]

        camas: [{
            habitacion: 1,
            numero: 1,
            tipoCama: 'cama',
            oxigeno: true,
            desinfectada: false,
            diagnostico: null,
            motivo_internacion: null,
            paciente: null,
            estado: 'desocupada'
        }, {
            habitacion: 1,
            numero: 2,
            tipoCama: 'sillon',
            oxigeno: false,
            desinfectada: false,
            diagnostico: "Diagnostico falso",
            motivo_internacion: "Motivo falso",
            paciente: {
                id: 1,
                nombre: "Manuel",
                apellido: "Urbano",
                dni: "31.955.283",
                edad: 29,
                sexo: "masculino"
            },
            estado: 'ocupada'
        }, {
            habitacion: 2,
            numero: 12,
            tipoCama: 'cuna',
            oxigeno: false,
            desinfectada: true,
            diagnostico: null,
            motivo_internacion: null,
            paciente: null,
            estado: 'reparacion'
        }, {
            habitacion: 2,
            numero: 2,
            tipoCama: 'cama',
            oxigeno: true,
            desinfectada: true,
            diagnostico: "Diagnostico falso",
            motivo_internacion: "Motivo falso",
            paciente: {
                id: 1,
                nombre: "Lore",
                apellido: "Ipsum",
                dni: "4.524.235",
                edad: 54,
                sexo: "femenino"
            },
            estado: 'ocupada'
        }, {
            habitacion: 2,
            numero: 3,
            tipoCama: 'cama',
            oxigeno: true,
            desinfectada: true,
            diagnostico: "Diagnostico falso",
            motivo_internacion: "Motivo falso",
            paciente: {
                id: 1,
                nombre: "Miguel",
                apellido: "Ipsum",
                dni: "4.524.235",
                edad: 54,
                sexo: "otro"
            },
            estado: 'ocupada'
        }, {
            habitacion: 3,
            numero: 1,
            tipoCama: 'cama',
            oxigeno: false,
            desinfectada: false,
            diagnostico: null,
            motivo_internacion: null,
            paciente: null,
            estado: 'reparacion'
        }, {
            habitacion: 4,
            numero: 1,
            tipoCama: 'cama',
            oxigeno: false,
            desinfectada: false,
            diagnostico: null,
            motivo_internacion: null,
            paciente: null,
            estado: 'reparacion'
        }, {
            habitacion: 5,
            numero: 1,
            tipoCama: 'cama',
            oxigeno: false,
            desinfectada: false,
            diagnostico: null,
            motivo_internacion: null,
            paciente: null,
            estado: 'reparacion'
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
            filtrar: function(){
                var self = this;

                var regex_nombre = new RegExp(".*" + self.nombre + ".*", "ig");

                 self.camas = $scope.camas.filter(function(i){
                     return (!self.oxigeno || (self.oxigeno && i.oxigeno)) &&
                            (!self.desinfectada || (self.desinfectada && i.desinfectada)) &&
                            (!self.tipoCama || (self.tipoCama && i.tipoCama == self.tipoCama)) &&
                            (!self.habitacion || (self.habitacion && i.habitacion == self.habitacion)) &&
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
            }
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

    $scope.$watch('filter.nombre + filter.oxigeno + filter.desinfectada + filter.tipoCama + filter.habitacion', function(current, old){
        if (current != old){
            $scope.filter.filtrar();
        }
     });

    $scope.init();
}]);


angular.module('appModule').filter('unique', function() {
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
