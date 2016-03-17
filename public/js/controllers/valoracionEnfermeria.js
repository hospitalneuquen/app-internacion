'use strict';

angular.module('app').controller('ValoracionEnfermeriaController', ['$scope', 'Plex', 'plexParams', 'Shared', 'Server', '$timeout', function($scope, Plex, plexParams, Shared, Server, $timeout) {
    angular.extend($scope, {
        internacion: undefined,
        enfermeria: null,
        ingreso: null,
        riesgoCaida: null,
        //{
        //     FR: null,
        //     SAT2: null,
        //     disneaEsfuerzo: null,
        //     disneaReposo: null,
        //     tos: null,
        //     secreciones: null,
        //     usoMusculos: null,
        //     secrecionesCaracteristicas: null,
        //     musculosCuales: null,
        //     observacionesOxigenacion: null,
        //     TA: null,
        //     FC: null,
        //     carotideo: null,
        //     radial: null,
        //     popliteo: null,
        //     pedio: null,
        //     observacionesCirculacion: null,
        //     peso: null,
        //     talla: null,
        //     habitosAlimentarios: null,
        //     vomitos: null,
        //     vomitosCaracteristicas: null,
        //     nauseas: null,
        //     otrosNutricion: null,
        //     piezasDentarias: null,
        //     protesis: null,
        //     protesisTipo: null,
        //     dificultadesDeglutir: null,
        //     dificultadesMasticar: null,
        //     lactanciaMaterna: null,
        //     observacionesNutricion: null,
        //     espontaneaVesical: null,
        //     incontinenciaVesical: null,
        //     urostomiaVesical: null,
        //     sondaVesical: null,
        //     tallaVesical: null,
        //     otrosVesical: null,
        //     caracteristicaVesical: null,
        //     espontaneaIntestinal: null,
        //     ostomiaIntestinal: null,
        //     diarreaIntestinal: null,
        //     incontinenciaIntestinal: null,
        //     constipacionIntestinal: null,
        //     otrosIntestinal: null,
        //     caracteristicaIntestinal: null,
        //     drenajes: null,
        //     otrosEliminacion: null,
        //     drenajesCaracteristicas: null,
        //     otrosCaracteristicas: null,
        //     observacionesEliminacion: null,
        //     temperatura: null,
        //     color: null,
        //     higiene: null,
        //     higieneAyuda: null,
        //     edemas: null,
        //     edemasLocalizacion: null,
        //     mucosasLesiones: null,
        //     mucosasDeshidratadas: null,
        //     pielLesiones: null,
        //     pielDeshidratada: null,
        //     piesLesiones: null,
        //     piesDeshidratados: null,
        //     bocaLesiones: null,
        //     bocaDeshidratada: null,
        //     genitalesLesiones: null,
        //     genitalesDeshidratados: null,
        //     observacionesTegumentos: null,
        //     ayudaVestirse: null,
        //     dificultadesCaminar: null,
        //     dispositivosMovilizacion: null,
        //     dispositivosCuales: null,
        //     observacionesMovilizarse: null,
        //     dormirContinuo: null,
        //     dormirDiscontinuo: null,
        //     dormirInsomnio: null,
        //     dormirSomnolencia: null,
        //     observacionesDormir: null,
        //     tabaco: null,
        //     tabacoCuantos: null,
        //     alcohol: null,
        //     alcoholCuanto: null,
        //     drogas: null,
        //     drogasCuales: null,
        //     otrosAdicciones: null,
        //     riesgosFisicos: null,
        //     riesgosQuimicos: null,
        //     riesgosCuales: null,
        //     revisionGinecologica: null,
        //     fechaRevisionGinecologica: null,
        //     revisionUrologica: null,
        //     fechaRevisionUrologica: null,
        //     ETS: null,
        //     riesgoCardiovascular: null,
        //     otrosDescriba: null,
        //     riesgoCaidas: null,
        //     riesgoUPP: null,
        //     riesgosDescriba: null,
        //     observacionesSeguridad: null,
        //     orientado: null,
        //     glasgow: null,
        //     idioma: null,
        //     vision: null,
        //     audicion: null,
        //     lenguaje: null,
        //     describaSensopercepcion: null,
        //     dolor: null,
        //     dolorLocalizacion: null,
        //     observacionesComunicacion: null,
        //     creenciasReligiosas: null,
        //     frecuenciaIglesia: null,
        //     visitaReligioso: null,
        //     religiosoCual: null,
        //     observacionesEspiritualidad: null,
        //     comprendeSituacion: null,
        //     sentimientosSituacion: null,
        //     dudasExpresadas: null,
        //     actividadesHabituales: null,
        //     observacionesAprender: null,
        //     observacionesGenerales: null
        // },
        init: function() {
            Shared.internacion.get(plexParams.idInternacion).then(function(data) {
                // Copia sólo algunos datos para modificar
                $scope.internacion = {
                    paciente: data.paciente,
                    ingreso: data.ingreso,
                    enfermeria: data.ingreso.enfermeria,
                    tipo: data.tipo
                };
            });
        },
        // init: function() {
        //     Server.get("/api/internacion/internacion/" + plexParams.idInternacion, {}, {
        //         updateUI: false
        //     }).then(function(internacion) {
        //         if (!internacion) {
        //             //alert("No se ha podido encontrar la internacion");
        //         } else {
        //             $scope.internacion = internacion;
        //             $scope.ingreso = internacion.ingreso;
        //             $scope.enfermeria = internacion.ingreso.enfermeria;
        //             // $scope.fechaHora = internacion.ingreso.fechaHora;
        //             // $scope.tipo = internacion.ingreso.tipo;
        //             console.log($scope.internacion);
        //             console.log($scope.enfermeria);
        //             console.log($scope.fechaHora);
        //         }
        //     });
        // },
        guardar: function() {
            var data = {
                ingreso: {
                    enfermeria:$scope.enfermeria
                }
            };
            Shared.internacion.post(plexParams.idInternacion, data, {
                minify: true
            }).then(function(data) {
                Plex.closeView();
            }, function() {

            });
        },
        cargarRiesgoCaidas: function(idInternacion) {
            Plex.openView('riesgoCaidas/' + idInternacion).then(function(internacion) {

            });
        },
        actualizarRiesgoCaida: function() {
            console.log("actualizarRiesgoCaida");
            if (this.enfermeria.riesgoCaida) {
                console.log("actualizarRiesgoCaida2222222222");
                var total = 0;
                for (var p in this.enfermeria.riesgoCaida) {
                    if (p != 'total')
                        total += parseInt(this.enfermeria.riesgoCaida[p]) || 0;
                }
                this.enfermeria.riesgoCaida.total = total;
                console.log(this.enfermeria.riesgoCaida);
            }
        },
        cancelar: function(){
            Plex.closeView();
        },
    });
    $scope.init();

    // Watches
    $scope.$watch('enfermeria.riesgoCaida', function(current, old) {
        if (current != old)
            $scope.actualizarRiesgoCaida();
    }, true);

    Plex.initView({
        title: "Valoración inicial de enfermería"
    });
}]);
