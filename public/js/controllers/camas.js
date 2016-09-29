angular.module('app').controller('camasController', ['$scope', 'Plex', 'Shared', 'Server', 'Global', function($scope, Plex, Shared, Server, Global) {
    'use strict';

    angular.extend($scope, {
        camas: [],
        camasEdit: false,
        showToolbar: true,

        tipoCamas: [],
        habitaciones: [],
        sectores: [],
        servicios: [{
            id: '',
            nombre: 'Todos'
        }],

        cama: {
            filter: {
                camas: [],
                habitacion: null,
                tipoCama: false,
                estado: null,
                servicio: null,
                sector: null,

                filtrar: function() {
                    var self = this;

                    self.camas = $scope.camas.filter(function(i) {
                        return (
                            (!self.tipoCama || (self.tipoCama && i.tipoCama == self.tipoCama)) &&
                            (!self.habitacion || (self.habitacion && i.habitacion == self.habitacion)) &&
                            (!self.estado || (self.estado && i.estado == self.estado)) &&
                            (!self.servicio || !self.servicio.id || (self.servicio && i.servicio && i.servicio.id == self.servicio.id)) &&
                            (!self.sector || (self.sector && i.sector == self.sector))
                        );
                    });

                },

                limpiarFiltros: function() {
                    var self = this;
                    self.habitacion = null;
                    self.tipoCama = false;
                    self.estado = null;
                    self.servicio = null;
                    self.sector = null;
                }
            },

            editar: function(cama) {
                if (cama){
                    $scope.camasEdit = cama;
                }else{
                    $scope.camasEdit = {
                        estado: 'desocupada',
                        tipoCama: 'cama',
                        oxigeno: false,
                        desinfectada: false,

                    };
                }

                $scope.showToolbar = false;
            },

            guardar: function() {
                Shared.cama.post($scope.camasEdit.id || null, $scope.camasEdit, {
                    minify: false
                }).then(function(data) {
                    Plex.alert('Cama guardada');

                    $scope.camas.push(data);
                    $scope.cama.cancelar();
                });
            },

            cancelar: function() {
                $scope.camasEdit = false;
                $scope.showToolbar = true;
            }
        },

        buscarUbicacion: function(query, tipo) {
            // buscamos todos los servicios para
            // cargar el select con las opciones
            var buscar = {
                tipo: tipo,
                nombre: query
            }

            return Shared.ubicaciones.get(buscar);
        },

        init: function() {

            // obtenemos las camas para armar el mapa
            Shared.Mapa.get().then(function(data) {
                $scope.camas = data;

                $scope.cama.filter.filtrar();

                var idServicios = [];
                angular.forEach($scope.camas, function(cama, key) {

                    // asignamos los tipos de camas
                    if (!$scope.tipoCamas.inArray(cama.tipoCama)) {
                        $scope.tipoCamas.push(cama.tipoCama);
                    }

                    // asignamos los tipos de camas
                    if (!$scope.sectores.inArray(cama.sector)) {
                        $scope.sectores.push(cama.sector);
                    }

                    // asignamos los servicios en base a los servicios
                    // que tiene cada cama
                    if (cama.servicio && typeof cama.servicio.id !== "undefined") {

                        if ($scope.servicios.length == 0) {
                            $scope.servicios.push(cama.servicio);
                            idServicios.push(cama.servicio._id);
                        } else {
                            if ($.inArray(cama.servicio._id, idServicios) == -1) {
                                $scope.servicios.push(cama.servicio);
                                idServicios.push(cama.servicio._id);
                            }
                        }
                    }
                });

            });

        }
    });

    // watches para los filtros de tipo de cama, habitacion y estado
    $scope.$watch('cama.filter.tipoCama + cama.filter.habitacion + cama.filter.estado + cama.filter.sector', function(current, old) {
        if (current != old) {
            $scope.cama.filter.filtrar();
        }
    });

    // watches para los filtros de servicio
    $scope.$watch('cama.filter.servicio', function(current, old) {
        if (current != old || (current && old && current.id && old.id != current.id != old.id)) {
            $scope.habitaciones = [];

            angular.forEach($scope.camas, function(cama, key) {
                //asignamos las habitaciones segun el servicio
                if (current.id == "" && current.nombre == "Todos") {
                    if (!$scope.habitaciones.inArray(cama.habitacion)) {
                        $scope.habitaciones.push(cama.habitacion);
                    }
                } else if (current.id && current.id == cama.servicio.id) {
                    if (!$scope.habitaciones.inArray(cama.habitacion)) {
                        $scope.habitaciones.push(cama.habitacion);
                    }
                }
            });

            $scope.cama.filter.filtrar();
        }
    });

    // iniciamos el controller
    $scope.init();

    Plex.initView({
        title: "Mapa de camas"
    });

    // inicializamos mediante el watch de la variable incluida
    // $scope.$watch('include.internacion', function(current, old) {
    //     $scope.init(current);
    // });
}]);
