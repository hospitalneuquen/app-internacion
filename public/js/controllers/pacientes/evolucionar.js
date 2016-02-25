'use strict';

angular.module('app').controller('pacientes/evolucionar', ['$scope', 'Plex', 'plexParams', 'Shared', 'Server', '$timeout', 'Session', function($scope, Plex, plexParams, Shared, Server, $timeout, Session) {

    angular.extend($scope, {
        loading: true,
        cama: undefined,
        internacion: undefined,
        // evoluciones: {},
        // array de servicios para filtrar en la vista
        servicios: [{
            id: null,
            nombreCorto: 'Todos'
        }],
        filtros: {
            evoluciones: [],
            servicio: null,
            filtrar: function(){
                var self = this;

                if (!this.servicio){
                    $scope.filtros.evoluciones = $scope.internacion.evoluciones;
                }else{
                    $scope.filtros.evoluciones = [];
                    angular.forEach($scope.internacion.evoluciones, function(evolucion, key) {
                        if (self.servicio && evolucion.servicio.id === self.servicio){
                            $scope.filtros.evoluciones.push(evolucion);
                        }

                    });
                }

            }
        },

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
                    $scope.filtros.evoluciones = internacion.evoluciones;
                    $scope.loading = false;

                    if ($scope.internacion.evoluciones.length){
                        var services_found = [];
                        // buscamos los servicios para el filtro de evoluciones
                        angular.forEach($scope.internacion.evoluciones, function(evolucion, key) {
                            if (evolucion.servicio && evolucion.servicio.id){
                                if ($.inArray(evolucion.servicio.id, services_found) === -1) {
                                    $scope.servicios.push(evolucion.servicio);
                                    services_found.push(evolucion.servicio.id);
                                    // $scope.servicios.push({
                                    //     'text': evolucion.servicio.nombreCorto,
                                    //     'nombreCorto': evolucion.servicio.nombreCorto,
                                    //     'href': '#'
                                    // });
                                }
                            }


                        });
                    }
                }
            });
        },

        editarEvolucion: function(evolucion) {
            $scope.evolucionesEdit = {};

            angular.copy(evolucion, $scope.evolucionesEdit);
        },

        guardarEvolucion: function(evolucion) {
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
                if ($scope.volverAlMapa) {
                    Plex.closeView($scope.cama);
                } else {
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

        actualizarEvoluciones: function(data) {
            var found = false;
            $scope.loading = true;

            var length = $scope.internacion.evoluciones.length;

            // buscamos la cama y actualizamos el valor con los datos
            for (var i = 0; i < length; i++) {

                if ($scope.internacion.evoluciones[i].id == data.id) {
                    // evolucion encontrada, actualizamos datos
                    $scope.internacion.evoluciones[i] = data;

                    found = true;
                    break;
                }
            }

            // si no lo encontro, entonces es porque acaba de cargarla
            // se la asignamos al resto de las evoluciones
            if (!found) {
                $scope.internacion.evoluciones.push(data);
            }

            $scope.loading = false;
        },

        setDefaultEvoluciones: function() {
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
                texto: null,
                servicio: Session.servicioActual
            }
        }
    });

    $scope.init();

    Plex.initView({
        title: "Evolucionar paciente"
    });
}]);
