angular.module('app').controller('internacion/ver', ['$scope', 'Plex', 'plexParams', 'Server', '$timeout', 'Personas', 'Global', 'Shared', function($scope, Plex, plexParams, Server, $timeout, Personas, Global, Shared) {
    'use strict';

    angular.extend($scope, {
        ordenCronologico: [],
        riesgoCaidas: 0,
        selectedTabIndex: 0,
        internacion: null,
        pases: null,
        servicios: [{
            id: null,
            nombreCorto: 'Todos'
        }],
        tiposInternacion: [{ // opciones para el select del tipo de internacion
            id: 'ambulatorio',
            nombre: 'Ambulatorio'
        }, {
            id: 'guardia',
            nombre: 'Guardia'
        }, {
            id: 'derivacion',
            nombre: 'Derivación'
        }, ],
        filtros: {
            evoluciones: [],
            servicio: null,
            filtrar: function() {
                var self = this;

                if (!this.servicio) {
                    $scope.filtros.evoluciones = $scope.internacion.evoluciones;
                } else {
                    $scope.filtros.evoluciones = [];
                    angular.forEach($scope.internacion.evoluciones, function(evolucion) {
                        if (self.servicio && evolucion.servicio.id === self.servicio) {
                            $scope.filtros.evoluciones.push(evolucion);
                        }
                    });
                }
            }
        },

        closeView: function() {
            Plex.closeView({

            });
        },
        editarPase: function(item) {
            alert("Definir que editar y como. Solo fecha ? Descripcion? Permitir editar si no esta egresado el pacietne?")
        },
        ordenarCronologicamente: function() {
            // agregamos el ingreso
            $scope.ordenCronologico.push({
                fecha: $scope.internacion.ingreso.fechaHora,
                tipo: "Ingreso",
                data: $scope.internacion.ingreso
            });

            // agregamos la valoracion inicial
            $scope.ordenCronologico.push({
                fecha: $scope.internacion.ingreso.fechaHora,
                tipo: "Valoración inicial",
                data: $scope.internacion.ingreso.enfermeria
            });

            // agregamos evoluciones
            if ($scope.internacion.evoluciones.length) {
                angular.forEach($scope.internacion.evoluciones, function(evolucion, key) {
                    $scope.ordenCronologico.push({
                        fecha: evolucion.fechaHora,
                        tipo: "Evolución",
                        data: evolucion
                    });
                });
            }

            // agregamos pase
            if ($scope.internacion.pases.length) {
                var i = 0;
                angular.forEach($scope.internacion.pases, function(pase, key) {
                    // omitimos el primer pase que es de cuando se genera la internacion
                    if (i > 0) {
                        $scope.ordenCronologico.push({
                            fecha: pase.fechaHora,
                            tipo: "Pase",
                            data: pase
                        });

                    }
                    i++;
                });
            }

            // agregamos el ingreso
            if ($scope.internacion.egreso) {
                var inicio = moment($scope.internacion.ingreso.fechaHora);
                var fin = moment($scope.internacion.egreso.fechaHora);
                var duracion = inicio.to(fin, true);

                $scope.ordenCronologico.push({
                    fechaInternacion: $scope.internacion.ingreso.fechaHora,
                    fecha: $scope.internacion.egreso.fechaHora,
                    duracion: duracion,
                    tipo: "Egreso",
                    data: $scope.internacion.egreso
                });
            }

            // // agregamos la primera evoluciones
            // $scope.ordenCronologico.push({
            //     fecha: $scope.internacion.evoluciones[0].fechaHora,
            //     tipo: "Evolución",
            //     data:  $scope.internacion.evoluciones[0]
            // });

            // ordenamos cronolicamente todo el array
            $scope.ordenCronologico.sort(function(a, b) {
                return new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
            });

        },
        goToTab: function(tab) {
            $scope.selectedTabIndex = tab;
        },
        init: function() {
            $scope.loading = true;
            // buscamos la internacion
            Shared.internacion.get(plexParams.idInternacion).then(function(internacion) {
                $scope.internacion = internacion;
                $scope.filtros.evoluciones = internacion.evoluciones;
                $scope.loading = false;

                // buscamos los antecedentes personales
                Personas.get(internacion.paciente.id).then(function(persona) {
                    $scope.antecedentesPersonales = persona.antecedentesPersonales;
                });

                // evoluciones
                if ($scope.internacion.evoluciones.length) {
                    var services_found = [];
                    // buscamos los servicios para el filtro de evoluciones
                    angular.forEach($scope.internacion.evoluciones, function(evolucion) {
                        if (evolucion.servicio && evolucion.servicio.id) {
                            // if ($.inArray(evolucion.servicio.id, services_found) === -1) {
                            if (!services_found.inArray(evolucion.servicio.id)) {
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

                // ordenamos cronologicamente
                $scope.ordenarCronologicamente();
            });


        }
    });

    // Init
    $scope.init();

    Plex.initView({
        title: "Ver internación"
    });
}]);
