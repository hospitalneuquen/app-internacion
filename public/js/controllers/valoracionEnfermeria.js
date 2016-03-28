'use strict';

angular.module('app').controller('ValoracionEnfermeriaController', ['$scope', 'Plex', 'plexParams', 'Shared', 'Server', '$timeout', function($scope, Plex, plexParams, Shared, Server, $timeout) {
    angular.extend($scope, {
        internacion: undefined,
        riesgoCaida: null,
        enfermeria: null,

        // variables para la seleccion de el antecedente
        selectedAntecedenteTipo : '',
        selectedAntecedente : '',

        antecedentesSeleccionados : [],

        // variables para los select anidados
        antecedentesTipos: '',
        antecedentes: [],
        _antecedentes : '',
        init: function() {
            Shared.internacion.get(plexParams.idInternacion).then(function(data) {
                $scope.internacion = data;
            });

            // buscamos todos los tipos de antecedentes
            Server.get('/api/internacion/antecedente_tipo').then(function(antecedentes_tipos){
                $scope.antecedentesTipos = antecedentes_tipos;

                angular.forEach($scope.antecedentesTipos, function(antecedente_tipo){
                    // buscamos todos los antecedentes segun el tipo
                    Server.get('/api/internacion/antecedente_tipo/' + antecedente_tipo.id + '/antecedentes').then(function(antecedentes){
                        var _antecedentes = [];
                        angular.forEach(antecedentes, function(antecedente){
                            _antecedentes.push(antecedente);
                        });

                        $scope.antecedentes[antecedente_tipo.id] = _antecedentes;
                    });
                });

            });
        },
        agregarAntecedente: function(){
            console.log($scope.selectedAntecedente);
            //
            // var seleccionado = {
            //     antecedente : $scope._antecedentes[$scope.selectedAntecedente]
            // }
            // $scope.antecedentesSeleccionados.push(seleccionado);
            // console.log($scope.antecedentesSeleccionados);
        },
        // antecedentes: {
        //     data: null,
        //     selectedItem: null,
        //     searchText: null,
        //     querySearch: function(query) {
        //         var allStates = 'Alergias, Cardiovasculares, Metabólicos, Infectológicos, Oncológicos, Respiratorios, Hábitos toxicos, Neurológicos, Urogenital, Oftalmológicos,
        //Circulatorio, Digestivos, Alimentación, Hematopoyeticos, Accidente, Infectológicos, Quirúrgicos, Traumatológicos';
        //         $scope.antecedentes = allStates;
        //         var self = $scope.antecedentes;
        //         var regex_nombre = new RegExp(".*" + self.searchText + ".*", "ig");
        //
        //         if (query) {
        //             return self.data.filter(function(i) {
        //                     return allStates.split(/, +/g).map(function(state) {
        //                         return {
        //                             value: state.toLowerCase(),
        //                             display: state
        //                         };
        //                     });
        //             });
        //         }else{
        //             return self.data;
        //         }
        //     },
        //     createFilterFor: function(query) {
        //         var lowercaseQuery = angular.lowercase(query);
        //         return function filterFn(antecedente) {
        //             return (antecedente.value.indexOf(lowercaseQuery) === 0);
        //         };
        //     }
        // },
        guardar: function() {
            var data = {
                ingreso: $scope.internacion.ingreso
            };

            Shared.internacion.post(plexParams.idInternacion, data, {
                minify: true
            }).then(function(data) {
                Plex.closeView(data);
            }, function() {

            });
        },
        cargarRiesgoCaidas: function(idInternacion) {
            Plex.openView('riesgoCaidas/' + idInternacion).then(function(internacion) {

            });
        },
        actualizarRiesgoCaida: function() {
            if ($scope.internacion.ingreso.enfermeria.riesgoCaida) {
                var total = 0;
                for (var p in $scope.internacion.ingreso.enfermeria.riesgoCaida) {
                    if (p != 'total')
                        total += parseInt($scope.internacion.ingreso.enfermeria.riesgoCaida[p]) || 0;
                }
                $scope.internacion.ingreso.enfermeria.riesgoCaida.total = total;
                console.log(total);
            }
        },
        cancelar: function() {
            Plex.closeView();
        },
    });
    $scope.init();

    // Watches
    $scope.$watch('selectedAntecedenteTipo', function(current, old) {
        if (current != old)
            $scope._antecedentes = $scope.antecedentes[current];
    }, true);

    $scope.$watch('internacion.ingreso.enfermeria.riesgoCaida', function(current, old) {
        if (current != old)
            $scope.actualizarRiesgoCaida();
    }, true);

    Plex.initView({
        title: "Valoración inicial de enfermería"
    });
}]);
