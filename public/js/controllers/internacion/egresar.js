'use strict';

angular.module('app').controller('internacion/egresar', ['$scope', 'Plex', 'plexParams', 'Server', 'Shared', 'Session', function($scope, Plex, plexParams, Server, Shared, Session) {
    angular.extend($scope, {
        searchText: null,
        selectedItem: null,
        egreso: {
            servicio: Session.servicioActual.id
        },

        // opciones para el select del tipo de internacion
        tiposEgresos: [{
            id: 'pase',
            nombre: 'Pase'
        }, {
            id: 'alta',
            nombre: 'Alta'
        }, {
            id: 'defuncion',
            nombre: 'Defunción'
        }, ],

        egresar: function() {
            if ($scope.egreso.tipo == 'alta' || $scope.egreso.tipo == 'defuncion') {
                var data = {
                    estado: 'egresado',
                    egreso: $scope.egreso
                };
            } else if ($scope.egreso.tipo == 'pase') {
                var data = {
                    estado: 'enPase'
                };
            } else if ($scope.egreso.tipo == 'derivacion') {
                var data = {
                    estado: 'derivacion',
                    egreso: $scope.egreso
                };
            }

            Shared.internacion.post(plexParams.idInternacion, data, {
                minify: true
            }).then(function(internacion) {
                // TODO: Definir que hacer en caso de que sea defuncion o alta,
                // si hay que llenar algun otro formulario

                Plex.closeView(internacion);

            });
        },
        hospitales: {
            data: null,
            // selectedItem: null,
            searchText: null,
            querySearch: function(query) {
                var self = $scope.hospitales;
                var regex_nombre = new RegExp(".*" + self.searchText + ".*", "ig");

                if (query) {
                    return self.data.filter(function(i) {

                        return ( (regex_nombre.test(i.nombreCorto) || (regex_nombre.test(i.nombre)) ));
                    });
                }else{
                    return self.data;
                }
            },

            /**
             * Create filter function for a query string
             */
            createFilterFor: function(query) {
                var lowercaseQuery = angular.lowercase(query);
                return function filterFn(hospital) {
                    return (hospital.value.indexOf(lowercaseQuery) === 0);
                };
            },

            selectItem: function(hospital){
                $scope.egreso.derivadoHacia = hospital.id
            }
        },

        cancelarEgreso: function() {
            Plex.closeView();
        },

        init: function() {
            // buscamos los datos de la internacion
            Server.get('/api/internacion/internacion/' + plexParams.idInternacion).then(function(data) {
                $scope.internacion = data;

                $scope.egreso.cama = plexParams.idCama

                Shared.ubicaciones.get({
                    tipo: 'hospital'
                }).then(function(hospitales) {
                    $scope.hospitales.data = hospitales;
                });
            });
        }
    });

    $scope.$watch('egreso.tipoAlta', function(current, old) {
        if ($scope.egreso.tipoAlta != 'derivacion'){
            $scope.egreso.derivadoHacia = null;
        }
    });

    $scope.$watch('egreso.tipo', function(current, old) {
        // si el valor de tipo de egreseo es distinto de alta,
        // entonces limpiamos los valores de los campos anidados
        if (current != 'alta') {
            $scope.egreso.tipoAlta = null;
            $scope.egreso.derivadoHacia = null;
            $scope.egreso.resumenInternacion = null;
            $scope.egreso.diagnosticoAlta = null;
            $scope.egreso.tratamientoaSeguir = null;
        }
    });

    $scope.init();

    Plex.initView({
        title: "Egresar paciente de internación"
    });
}]);
