angular.module('app').controller('ValoracionEnfermeriaController', ['$scope', 'Plex', 'plexParams', 'Shared', function($scope, Plex, plexParams, Shared) {
    angular.extend($scope, {
        internacion: null,
        indicacion: {},
        frecuencias: [{
            id: '48',
            nombre: 'Cada 2 días'
        }, {
            id: '24',
            nombre: 'Una vez al día'
        }, {
            id: '12',
            nombre: 'Cada 12 hs.'
        }, {
            id: '8',
            nombre: 'Cada 8 hs.'
        }, {
            id: '6',
            nombre: 'Cada 6 hs.'
        }, {
            id: '4',
            nombre: 'Cada 4 hs.'
        }],
        totalUPP: parseInt(0),

        // $scope.indicacion.fecha = new Date();
        // $scope.indicacion.servicio = Session.variables.servicioActual;

        init: function() {
            Shared.internacion.get(plexParams.idInternacion).then(function(data) {
                $scope.internacion = data;
            });
        },
        guardar: function() {

            if ($scope.internacion.ingreso.enfermeria.glasgowValoracion){
                $scope.internacion.ingreso.enfermeria.glasgowValoracion.total = $scope.internacion.ingreso.enfermeria.glasgowValoracion.motor + $scope.internacion.ingreso.enfermeria.glasgowValoracion.verbal + $scope.internacion.ingreso.enfermeria.glasgowValoracion.ocular;
            }
            if ($scope.internacion.ingreso.enfermeria.riesgoCaida){
                $scope.internacion.ingreso.enfermeria.riesgoCaida.total = $scope.internacion.ingreso.enfermeria.riesgoCaida.caidasPrevias + $scope.internacion.ingreso.enfermeria.riesgoCaida.marcha + $scope.internacion.ingreso.enfermeria.riesgoCaida.ayudaDeambular + $scope.internacion.ingreso.enfermeria.riesgoCaida.venoclisis + $scope.internacion.ingreso.enfermeria.riesgoCaida.comorbilidad + $scope.internacion.ingreso.enfermeria.riesgoCaida.estadoMental;
            }
            if ($scope.internacion.ingreso.enfermeria.valoracionRiesgoUPP){
                $scope.internacion.ingreso.enfermeria.valoracionRiesgoUPP.total = $scope.internacion.ingreso.enfermeria.valoracionRiesgoUPP.estadoFisico + $scope.internacion.ingreso.enfermeria.valoracionRiesgoUPP.estadoMental + $scope.internacion.ingreso.enfermeria.valoracionRiesgoUPP.actividad + $scope.internacion.ingreso.enfermeria.valoracionRiesgoUPP.movilidad + $scope.internacion.ingreso.enfermeria.valoracionRiesgoUPP.incontinencia;
            }

            var data = {
                ingreso: $scope.internacion.ingreso
            };

            // si es glasgow / valoracion del dolor / riesgo UPP / riesgo caidas
            // riesgo UPP agregar grafic
            // guardar tambien como evoluciones

            // // calculamos valores de glasgow
            // if ($scope.internacion.ingreso.glasgowValoracion) {
            //     $scope.internacion.ingreso.glasgowValoracion.total = $scope.internacion.ingreso.glasgowValoracion.motor +$scope.internacion.ingreso.glasgowValoracion.verbal + $scope.internacion.ingreso.glasgowValoracion.ocular;
            //
            //     $scope.evolucion = {
            //         fechaHora: new Date(),
            //         tipo: 'Servicio',
            //         servicio: Session.variables.servicioActual.id,
            //         //texto: indicacion.tipo,
            //         glasgow: $scope.internacion.ingreso.glasgowValoracion
            //     };
            //
            //     data.evoluciones.push(evolucion);
            // }
            // // calculamos valores de riesgo de caidas
            // if ($scope.evolucionesEdit.riesgoCaida) {
            //     $scope.internacion.ingreso.riesgoCaida.total = $scope.internacion.ingreso.riesgoCaida.caidasPrevias + $scope.internacion.ingreso.riesgoCaida.marcha + $scope.internacion.ingreso.riesgoCaida.ayudaDeambular + $scope.internacion.ingreso.riesgoCaida.venoclisis + $scope.internacion.ingreso.riesgoCaida.comorbilidad + $scope.internacion.ingreso.riesgoCaida.estadoMental;
            //
            //     $scope.evolucion = {
            //         fechaHora: new Date(),
            //         tipo: 'Servicio',
            //         servicio: Session.variables.servicioActual.id,
            //         //texto: indicacion.tipo,
            //         riesgoCaida: $scope.internacion.ingreso.riesgoCaida
            //     };
            //
            //     data.evoluciones.push(evolucion);
            // }
            // // calculamos valores de riesgo de ulceras por presion
            // if ($scope.internacion.ingreso.valoracionRiesgoUPP) {
            //     $scope.internacion.ingreso.valoracionRiesgoUPP.total = $scope.evolucionesEdit.internacion.ingreso.valoracionRiesgoUPP.estadoFisico + $scope.evolucionesEdit.internacion.ingreso.valoracionRiesgoUPP.estadoMental + $scope.evolucionesEdit.internacion.ingreso.valoracionRiesgoUPP.actividad + $scope.evolucionesEdit.internacion.ingreso.valoracionRiesgoUPP.movilidad + $scope.evolucionesEdit.internacion.ingreso.valoracionRiesgoUPP.incontinencia;
            //
            //     $scope.evolucion = {
            //         fechaHora: new Date(),
            //         tipo: 'Servicio',
            //         servicio: Session.variables.servicioActual.id,
            //         //texto: indicacion.tipo,
            //         riesgoUPP: $scope.internacion.ingreso.riesgoCaida
            //     };
            //
            //     data.evoluciones.push(evolucion);
            // }
            //
            // if ($scope.internacion.ingreso.dolorValoracion){
            //     $scope.evolucion = {
            //         fechaHora: new Date(),
            //         tipo: 'Servicio',
            //         servicio: Session.variables.servicioActual.id,
            //         //texto: indicacion.tipo,
            //         dolorValoracion: $scope.internacion.ingreso.dolorValoracion
            //     };
            //
            //     data.evoluciones.push(evolucion);
            // }

            Shared.internacion.post(plexParams.idInternacion, data).then(function(internacion) {
                // if (internacion.evoluciones.length){
                //     angular.forEach(internacion.evoluciones, function(evolucion){
                //
                //         Shared.evolucion.post(internacion.id, null, evolucion, {
                //             minify: true
                //         }).then(function(data) {
                //         });
                //     });
                //
                //     Plex.closeView(internacion);
                // }else{
                //     Plex.closeView(internacion);
                // }
                $scope.internacion = internacion;

                Plex.closeView(internacion);
            });
        },
        cancelar: function() {
            Plex.closeView();
        },
    });

    $scope.init();

    Plex.initView({
        title: "Valoración inicial"
    });

    // $scope.$watch('internacion.ingreso.enfermeria.valoracionRiesgoUPP.estadoFisico + internacion.ingreso.enfermeria.valoracionRiesgoUPP.estadoMental + internacion.ingreso.enfermeria.valoracionRiesgoUPP.actividad + internacion.ingreso.enfermeria.valoracionRiesgoUPP.movilidad + internacion.ingreso.enfermeria.valoracionRiesgoUPP.incontinencia', function(current, old) {
    //     if (current) {
    //
    //         $scope.totalUPP = 0;
    //         $scope.totalUPP = $scope.internacion.ingreso.enfermeria.valoracionRiesgoUPP.estadoFisico + $scope.internacion.ingreso.enfermeria.valoracionRiesgoUPP.estadoMental + $scope.internacion.ingreso.enfermeria.valoracionRiesgoUPP.actividad + $scope.internacion.ingreso.enfermeria.valoracionRiesgoUPP.movilidad + $scope.internacion.ingreso.enfermeria.valoracionRiesgoUPP.incontinencia;
    //     }
    // });
    //
    // // calculo total glasgow
    // $scope.$watch('internacion.ingreso.enfermeria.valoracionGlasgow.ocular + internacion.ingreso.enfermeria.glasgowValoracion.verbal + internacion.ingreso.enfermeria.glasgowValoracion.motor', function(current, old) {
    //     if (current) {
    //         $scope.internacion.ingreso.enfermeria.glasgowValoracion.total = 0;
    //         $scope.internacion.ingreso.enfermeria.glasgowValoracion.total = $scope.internacion.ingreso.enfermeria.glasgowValoracion.ocular + $scope.internacion.ingreso.enfermeria.glasgowValoracion.verbal + $scope.internacion.ingreso.enfermeria.glasgowValoracion.motor;
    //     }
    // });
}]);
