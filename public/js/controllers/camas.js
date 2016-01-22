'use strict';

appModule.controller('CamasController', ['$scope', 'Plex', function($scope, Plex) {
    $scope.filtrarHabitacion = function(item) {
        if ($scope.orderProp == 'date') {
            return new Date(item.date);
        }
        return item[$scope.orderProp];
    }
    angular.extend($scope, {
        miFormulario: null,
        nombre: "Mapa de camas",

        camas: [{
            habitacion: 1,
            numero: 1,
            tipoCama: 'cama',
            oxigeno: true,
            desinfectada: true,
            diagnostico: null,
            motivo_internacion: null,
            paciente: null,
            reparacion: false
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
            reparacion: false
        }, {
            habitacion: 2,
            numero: 12,
            tipoCama: 'cuna',
            oxigeno: false,
            desinfectada: true,
            diagnostico: null,
            motivo_internacion: null,
            paciente: null,
            reparacion: true
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
            reparacion: false
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
                nombre: "Lore",
                apellido: "Ipsum",
                dni: "4.524.235",
                edad: 54,
                sexo: "otro"
            },
            reparacion: false
        }],

/*
        habitacionesIncludes : [],

        seleccionarHabitacion : function(habitacion) {
            if (!habitacion){
                $scope.habitacionesIncludes = [];
            }else {
                var i = $.inArray(habitacion,  $scope.habitacionesIncludes);

                if (i > -1) {
                     $scope.habitacionesIncludes.splice(i, 1);
                } else {
                     $scope.habitacionesIncludes.push(habitacion);
                }
            }
        },


        filtroHabitacion : function(camas){

            if ( $scope.habitacionesIncludes.length > 0) {
                if ($.inArray(camas.habitacion, $scope.habitacionesIncludes) < 0)
                    return;
            }

            return camas;
        },
*/
        filtroElegido : "",             // cual es el filtro que elijo
        filtroElegidoValor : "",        // cual es el valor del flitro que elijo
        filteredCamas : [],
        filtroHabitacion : function(camas){
//            console.log($scope.filteredCamas);
//            console.log($scope.filtroElegido);
            //console.log($scope.filtroElegidoValor);
            // si ya he estado trabajando con algun filtro
            // entonces utilizamos el array filteredCamas
            if ($scope.filteredCamas.length > 0){
                if ($scope.filtroElegido != ""){

                    $scope.camas.forEach(function(cama) {
                        if ($scope.filtroElegido){
                            //$scope.filteredCamas.push(cama);
                        }
                    });



                    return $scope.filteredCamas;
                }
            }else{

                if ($scope.filtroElegido != ""){

                    $scope.camas.forEach(function(cama) {
                        if ($scope.filtroElegido){
                            //$scope.filteredCamas.push(cama);
                        }
                    });



                    return $scope.filteredCamas;
                }
            }

            return camas;
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

    // agregamos los watchs para los elementos de filtrado
    $scope.$watch('oxigeno', function(current, old){
        $scope.filtroElegido = "oxigeno";
        $scope.filtroElegidoValor = current;
        $scope.filtroHabitacion($scope.camas);
    });
    $scope.$watch('desinfectada', function(current, old){
        $scope.filtroElegido = "desinfectada";
        $scope.filtroElegidoValor = current;
        $scope.filtroHabitacion($scope.camas);
    });
    $scope.$watch('reparacion', function(current, old){
        $scope.filtroElegido = "reparacion";
        $scope.filtroElegidoValor = current;
        $scope.filtroHabitacion($scope.camas);
    });

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
//
// appModule.filter('filtroHabitacion', function(a, b, c) {
//     console.log(a,b,c);
//     //return $scope.camas;
// });
