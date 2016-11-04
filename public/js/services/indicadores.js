/**
 * @ngdoc service
 * @module app
 * @name Shared
 * @description
 * Servicio que engloba constantes y métodos compartidos en toda la aplicación
 **/
angular.module('app').factory('Indicadores', ["Global", "Server", "Session", "Shared", function(Global, Server, Session, Shared) {
    'use strict';

    /**
     * @ngdoc method
     * @name Mapa#get
     * @param {Number} Id del servicio a consultar
     * @description
     * Puede ser uno de los siguientes tipos:
     *   - `Number`: Busca por id del servicio de mapa de camas
     **/
    // riesgoCaidas: function(internacion) {
    //     // buscamos la internacion
    //     angular.foreach(evoluciones, function(evolucion){
    //
    //     });
    // }
    var self = {

        hayRiesgoCaidas: function(internacion) {
            var clase = "";
            var riesgoCaidas = null;
            var evolucion = null;
            var evoluciones = internacion.evoluciones;

            if (evoluciones && evoluciones.length) {

                var found = false;
                var i = evoluciones.length - 1;

                while (i >= 0 && !found){
                    if (evoluciones[i].riesgoCaida &&
                        evoluciones[i].riesgoCaida.total && evoluciones[i].riesgoCaida.total > 0){

                        evolucion = evoluciones[i];
                        found = true;
                    }

                    i--;
                }
            }

            // si no hay evoluciones nos fijamos si se ha hecho la
            // inicial de enfermeria
            if (!found && typeof internacion.ingreso != "undefined"
                && typeof internacion.ingreso.enfermeria != "undefined"
                && typeof internacion.ingreso.enfermeria.riesgoCaida != "undefined"
                ){

                evolucion = internacion.ingreso.enfermeria;
            }


            if (evolucion && evolucion.riesgoCaida) {
                // escala
                if (evolucion.riesgoCaida.total < 25) {
                    riesgoCaidas = {
                        clase: "default",
                        indicador: "bajo",
                        valor: evolucion.riesgoCaida.total
                    }

                } else if (evolucion.riesgoCaida.total >= 25 && evolucion.riesgoCaida.total <= 50) {
                    riesgoCaidas = {
                        clase: "warning",
                        indicador: "medio",
                        valor: evolucion.riesgoCaida.total
                    }
                } else if (evolucion.riesgoCaida.total > 50) {
                    riesgoCaidas = {
                        clase: "danger",
                        indicador: "alto",
                        valor: evolucion.riesgoCaida.total
                    }
                }

                return riesgoCaidas;
            }


            return null;
        },

        hayValoracionDolor: function(internacion) {
            var clase = "";
            var valoracionDolor = null;
            var evoluciones = internacion.evoluciones;

            if (evoluciones && evoluciones.length) {

                var found = false;
                var i = evoluciones.length - 1;
                var evolucion = null;

                while (i >= 0 && !found){
                    if (evoluciones[i].dolorValoracion &&
                        evoluciones[i].dolorValoracion.intensidad && evoluciones[i].dolorValoracion.intensidad > 0){

                        evolucion = evoluciones[i];
                        found = true;
                    }

                    i--;
                }
            }
            // si no hay evoluciones nos fijamos si se ha hecho la
            // inicial de enfermeria
            if (!found && typeof internacion.ingreso != "undefined"
                && typeof internacion.ingreso.enfermeria != "undefined"
                && typeof internacion.ingreso.enfermeria.dolorValoracion != "undefined"
                ){

                evolucion = internacion.ingreso.enfermeria;
            }


            if (evolucion && evolucion.dolorValoracion) {
                // escala
                if (evolucion.dolorValoracion.intensidad >= 1 && evolucion.dolorValoracion.intensidad <= 3) {
                    valoracionDolor = {
                        clase: "default",
                        indicador: "leve",
                        valor: evolucion.dolorValoracion.intensidad
                    }

                } else if (evolucion.dolorValoracion.intensidad >= 4 && evolucion.dolorValoracion.intensidad <= 6) {
                    valoracionDolor = {
                        clase: "primary",
                        indicador: "moderado",
                        valor: evolucion.dolorValoracion.intensidad
                    }

                } else if (evolucion.dolorValoracion.intensidad >= 7 && evolucion.dolorValoracion.intensidad <= 9) {
                    valoracionDolor = {
                        clase: "warning",
                        indicador: "severo",
                        valor: evolucion.dolorValoracion.intensidad
                    }

                }
                if (evolucion.dolorValoracion.intensidad == 10) {
                    valoracionDolor = {
                        clase: "danger",
                        indicador: "intolerable",
                        valor: evolucion.dolorValoracion.intensidad
                    }

                }

                return valoracionDolor;
            }

            return null;
        },

        hayFiebre: function(internacion) {
            var clase = "";
            var fiebre = null;
            var evoluciones = internacion.evoluciones;

            if (evoluciones && evoluciones.length) {

                var found = false;
                var i = evoluciones.length - 1;
                var evolucion = null;

                while (i >= 0 && !found){
                    if (evoluciones[i].signosVitales &&
                        evoluciones[i].signosVitales.temperatura && evoluciones[i].signosVitales.temperatura > 0){

                        evolucion = evoluciones[i];
                        found = true;
                    }

                    i--;
                }

                if (evolucion && evolucion.signosVitales) {

                    // escala
                    if (evolucion.signosVitales.temperatura <= 35) {
                        fiebre = {
                            clase: "info",
                            indicador: evolucion.signosVitales.temperatura,
                            valor: evolucion.signosVitales.temperatura
                        }

                    } else if (evolucion.signosVitales.temperatura >= 35.1 && evolucion.signosVitales.temperatura <= 36) {
                        fiebre = {
                            clase: "success",
                            indicador: evolucion.signosVitales.temperatura,
                            valor: evolucion.signosVitales.temperatura
                        }

                    } else if (evolucion.signosVitales.temperatura >= 36.1 && evolucion.signosVitales.temperatura <= 38) {
                        fiebre = {
                            clase: "default",
                            indicador: evolucion.signosVitales.temperatura,
                            valor: evolucion.signosVitales.temperatura
                        }

                    } else if (evolucion.signosVitales.temperatura >= 38.1 && evolucion.signosVitales.temperatura <= 39) {
                        fiebre = {
                            clase: "success",
                            indicador: evolucion.signosVitales.temperatura,
                            valor: evolucion.signosVitales.temperatura
                        }
                    } else if (evolucion.signosVitales.temperatura >= 39.1) {
                        fiebre = {
                            clase: "danger",
                            indicador: evolucion.signosVitales.temperatura,
                            valor: evolucion.signosVitales.temperatura
                        }
                    }

                    return fiebre;
                }
            }

            return null;
        },

        hayGlasgow: function(internacion) {
            var clase = "";
            var glasgow = null;
            var evoluciones = internacion.evoluciones;

            if (evoluciones && evoluciones.length) {

                var found = false;
                var i = evoluciones.length - 1;
                var evolucion = null;

                while (i >= 0 && !found){
                    if (evoluciones[i].glasgow &&
                        evoluciones[i].glasgow.total && evoluciones[i].glasgow.total > 0){

                        evolucion = evoluciones[i];
                        found = true;
                    }

                    i--;
                }
            }
            // si no hay evoluciones nos fijamos si se ha hecho la
            // inicial de enfermeria
            if (!found && typeof internacion.ingreso != "undefined"
                && typeof internacion.ingreso.enfermeria != "undefined"
                && typeof internacion.ingreso.enfermeria.glasgowValoracion != "undefined"
                ){

                var evolucion = {
                    glasgow : internacion.ingreso.enfermeria.glasgowValoracion
                };
            }

            if (evolucion && evolucion.glasgow) {
                // escala
                if (evolucion.glasgow.total > 3 && evolucion.glasgow.total <= 8) {
                    glasgow = {
                        clase: "danger",
                        indicador: 'grave',
                        valor: evolucion.glasgow.total
                    }

                } else if (evolucion.glasgow.total >= 9 && evolucion.glasgow.total <= 13) {
                    glasgow = {
                        clase: "warning",
                        indicador: "moderado",
                        valor: evolucion.glasgow.total
                    }

                } else if (evolucion.glasgow.total >= 14) {
                    glasgow = {
                        clase: "success",
                        indicador: "leve",
                        valor: evolucion.glasgow.total
                    }

                }

                return glasgow;
            }


            return null;
        },

        hayFlebitis: function(internacion) {
            var clase = "";
            var flebitis = null;
            var evoluciones = internacion.evoluciones;

            if (evoluciones && evoluciones.length) {

                var found = false;
                var i = evoluciones.length - 1;
                var evolucion = null;

                while (i >= 0 && !found){
                    if (evoluciones[i].flebitis &&
                        evoluciones[i].flebitis.grado && evoluciones[i].flebitis.grado > 0){

                        evolucion = evoluciones[i];
                        found = true;
                    }

                    i--;
                }

                if (evolucion && evolucion.flebitis) {
                    // escala
                    if (evolucion.flebitis.grado == 0) {
                        flebitis = {
                            clase: "info",
                            indicador: evolucion.flebitis.grado,
                            valor: evolucion.flebitis.grado
                        }

                    } else if (evolucion.flebitis.grado == 1) {
                        flebitis = {
                            clase: "success",
                            indicador: evolucion.flebitis.grado,
                            valor: evolucion.flebitis.grado
                        }

                    } else if (evolucion.flebitis.grado == 2) {
                        flebitis = {
                            clase: "warning",
                            indicador: evolucion.flebitis.grado,
                            valor: evolucion.flebitis.grado
                        }

                    } else if (evolucion.flebitis.grado == 3) {
                        flebitis = {
                            clase: "danger",
                            indicador: evolucion.flebitis.grado,
                            valor: evolucion.flebitis.grado
                        }
                    }

                    return flebitis;
                }
            }

            return null;
        },

        hayUlcerasPorPresion: function(internacion) {
            var clase = "";
            var upp = null;
            var evoluciones = internacion.evoluciones;

            if (evoluciones && evoluciones.length) {

                var found = false;
                var i = evoluciones.length - 1;
                var evolucion = null;

                while (i >= 0 && !found){
                    if (evoluciones[i].riesgoUPP &&
                        evoluciones[i].riesgoUPP.total && evoluciones[i].riesgoUPP.total > 0){

                        evolucion = evoluciones[i];
                        found = true;
                    }

                    i--;
                }
            }
            // si no hay evoluciones nos fijamos si se ha hecho la
            // inicial de enfermeria
            if (!found && typeof internacion.ingreso != "undefined"
                && typeof internacion.ingreso.enfermeria != "undefined"
                && typeof internacion.ingreso.enfermeria.valoracionRiesgoUPP != "undefined"
                ){

                var evolucion = {
                    riesgoUPP : internacion.ingreso.enfermeria.valoracionRiesgoUPP
                };
            }

            if (evolucion && evolucion.riesgoUPP) {
                // escala
                if (evolucion.riesgoUPP.total >= 13 && evolucion.riesgoUPP.total <= 16) {
                    upp = {
                        clase: "default",
                        indicador: "Riesgo bajo",
                        valor: evolucion.riesgoUPP.total
                    }

                } else if (evolucion.riesgoUPP.total >= 10 && evolucion.riesgoUPP.total <= 12) {
                    upp = {
                        clase: "warning",
                        indicador: "Riesgo medio",
                        valor: evolucion.riesgoUPP.total
                    }

                } else if (evolucion.riesgoUPP.total >= 5 && evolucion.riesgoUPP.total <= 9) {
                    upp = {
                        clase: "danger",
                        indicador: "Riesgo alto",
                        valor: evolucion.riesgoUPP.total
                    }

                }

                // var code = '<span class="tips label label-' + clase + '" title="Riesgo de caídas ' + indicador + '">Riesgo caídas</span>';
                return upp;
            }

            return null;
        },

        hayAislamiento: function(aislamiento) {
            var clase = "";
            var aislamiento = [];

            if (aislamiento && aislamiento.length) {

                angular.forEach(aislamiento, function(data) {
                    if (!data.hasta) {
                        var _aislamiento = {
                            clase: "danger",
                            indicador: data.tipo,
                            fecha: $filter('date')(data.desde.fecha, "dd/MM/yyyy  'a las' HH:mm ")
                        }

                        aislamiento.push(_aislamiento);
                    }
                });
            }

            return null;
        },
        // fecha: yyyy-mm-dd
        calcularBalanceLiquidos: function(internacion, fecha) {
            var evoluciones = internacion.evoluciones;

            var balanceTotalLiquidos = {
                ingresos: 0,
                egresos: 0,
                total: 0
            };

            if (evoluciones && evoluciones.length) {

                angular.forEach(evoluciones, function(evolucion) {

                    // solo calculo los elementos de la fecha que se ha pedido
                    if (fecha) {
                        if (moment(moment(fecha).format('YYYY-MM-DD')).isSame(moment(new Date(evolucion.createdAt)).format('YYYY-MM-DD'))) {
                            // evolucion = calcularValores(evolucion);
                            if (typeof evolucion.balance != "undefined") {
                                Shared.evolucion.calcularBalance(evolucion, function(data) {
                                    evolucion = data;
                                });
                            }

                            // actualizamos valores
                            balanceTotalLiquidos.ingresos += evolucion.balance.$total_ingresos;
                            balanceTotalLiquidos.egresos += evolucion.balance.$total_egresos;
                            balanceTotalLiquidos.total += evolucion.balance.$balance;
                        }
                    } else {

                        // evolucion = calcularValores(evolucion);
                        if (typeof evolucion.balance != "undefined") {
                            Shared.evolucion.calcularBalance(evolucion, function(data) {
                                evolucion = data;
                            });
                        }

                        // actualizamos valores
                        balanceTotalLiquidos.ingresos += evolucion.balance.$total_ingresos;
                        balanceTotalLiquidos.egresos += evolucion.balance.$total_egresos;
                        balanceTotalLiquidos.total += evolucion.balance.$balance;
                    }

                });
            }

            return balanceTotalLiquidos;
        },

        getFrecunciaRespiratoria: function(internacion){
            var respiracion = 0;
            var evoluciones = internacion.evoluciones;

            if (evoluciones && evoluciones.length) {
                var found = false;
                var i = evoluciones.length - 1;

                while (i >= 0 && !found){
                    if (evoluciones[i].signosVitales &&
                        evoluciones[i].signosVitales.respiracion && evoluciones[i].signosVitales.respiracion > 0){

                        respiracion = evoluciones[i].signosVitales.respiracion;
                        found = true;
                    }

                    i--;
                }

            }

            return respiracion;
        },
        getSaturacionOxigeno: function(internacion){
            var spo2 = 0;
            var evoluciones = internacion.evoluciones;

            if (evoluciones && evoluciones.length) {

                var found = false;
                var i = evoluciones.length - 1;

                while (i >= 0 && !found){
                    if (evoluciones[i].signosVitales && evoluciones[i].signosVitales.spo2){

                        spo2 = evoluciones[i].signosVitales.spo2;
                        found = true;
                    }

                    i--;
                }

            }

            return spo2;
        },
        // TODO: Calcular si tiene o no suplemento de oxigeno
        // se deben utilizar las indicaciones, en caso de tener activa
        // la indicacion de colocacion de oxigeno
        getSumplementoOxigeno: function(internacion){
            return false;
        },
        getTensionSistolica: function(internacion){
            var tensionSistolica = 0;
            var evoluciones = internacion.evoluciones;

            if (evoluciones && evoluciones.length) {
                var found = false;
                var i = evoluciones.length - 1;

                while (i >= 0 && !found){
                    if (evoluciones[i].signosVitales && evoluciones[i].signosVitales.circulacion
                        && evoluciones[i].signosVitales.circulacion.tensionSistolica){

                        tensionSistolica = evoluciones[i].signosVitales.circulacion.tensionSistolica;
                        found = true;
                    }

                    i--;
                }

            }

            return tensionSistolica;
        },
        getFrecuenciaCardiaca: function(internacion){
            var pulso = 0;
            var evoluciones = internacion.evoluciones;

            if (evoluciones && evoluciones.length) {
                var found = false;
                var i = evoluciones.length - 1;
                var evolucion = null;

                while (i >= 0 && !found){
                    if (evoluciones[i].signosVitales && evoluciones[i].signosVitales.pulso){
                        pulso = evoluciones[i].signosVitales.pulso;
                        found = true;
                    }

                    i--;
                }

            }

            return pulso;
        },
        getNews(internacion){
            var evoluciones = internacion.evoluciones;
            // frecuencia respiratoria *
            // saturacion oxigeno *
            // suplementos oxigeno?
            // temperatura *
            // sistolica
            // frecuencia cardiaca
            // nivel de conciencia

            var news = {
                valor: 0,
                clase: '',
                moderado: false // si hay algun valor en 3, entonces pasamos a true
            };

            // obtenemos valores para frecuencia respiratoria
            var frecuenciaRespiratoria = self.getFrecunciaRespiratoria(internacion);
            // calculamos valor news para frecuencia respiratoria
            if (frecuenciaRespiratoria > 0){
                if (frecuenciaRespiratoria >= 12 && frecuenciaRespiratoria <= 20){
                    news.valor += 0;
                } else if (frecuenciaRespiratoria >= 9 && frecuenciaRespiratoria <= 11){
                    news.valor += 1;
                } else if (frecuenciaRespiratoria >= 21 && frecuenciaRespiratoria <= 24){
                    news.valor += 2;
                } else if (frecuenciaRespiratoria <= 8 || frecuenciaRespiratoria >= 25){
                    news.moderado = true;
                    news.valor += 3;
                }
            }
            // obtenemos valores para saturacion de oxigeno
            var saturacionOxigeno = self.getSaturacionOxigeno(internacion);
            // calculamos valor news para saturacion de oxigeno
            if (saturacionOxigeno > 0){
                if (saturacionOxigeno >= 96){
                    news.valor += 0;
                } else if (saturacionOxigeno >= 94 && saturacionOxigeno <= 95){
                    news.valor += 1;
                } else if (saturacionOxigeno >= 92 && saturacionOxigeno <= 93){
                    news.valor += 2;
                } else if (saturacionOxigeno <= 91){
                    news.moderado = true;
                    news.valor += 3;
                }
            }

            // obtenemos valor para suplemento de oxigeno
            var sumplementoOxigeno = false;
            if (internacion.indicaciones && internacion.indicaciones.length){
                sumplementoOxigeno = self.getSumplementoOxigeno(internacion);
            }
            // calculamos valor news para suplemento de oxigeno
            news.valor += (sumplementoOxigeno) ? 2 : 0;

            // obtenemos valor de temperatura
            var fiebre = self.hayFiebre(internacion);
            // calculamos valor news para temperatura
            if (fiebre && fiebre.valor > 0){
                if (fiebre.valor >= 36.1 && fiebre.valor <= 38){
                    news.valor += 0;
                }else if ( (fiebre.valor >= 35.1 && fiebre.valor <= 36) || (fiebre.valor >= 38.1 && fiebre.valor <= 39)){
                    news.valor += 1;
                }else if (fiebre.valor >= 39.1){
                    news.valor += 2;
                }else if (fiebre.valor <= 35){
                    news.moderado = true;
                    news.valor += 3;
                }
            }

            // obtenemos valores para tension sistolica
            var tensionSistolica = self.getTensionSistolica(internacion);
            // calculamos valor news para tension sistolica
            if (tensionSistolica > 0){
                if (tensionSistolica >= 111 && tensionSistolica <= 219){
                    news.valor += 0;
                } else if (tensionSistolica >= 101 && tensionSistolica <= 110){
                    news.valor += 1;
                } else if (tensionSistolica >= 91 && tensionSistolica <= 100){
                    news.valor += 2;
                } else if (tensionSistolica <= 90 || tensionSistolica >= 131){
                    news.moderado = true;
                    news.valor += 3;
                }
            }

            // obtenemos valores para frecuencia cardiaca
            var frecuenciaCardiaca = self.getFrecuenciaCardiaca(internacion);
            // calculamos valor news para frecuencia cardiaca
            if (frecuenciaCardiaca > 0){
                if (frecuenciaCardiaca >= 51 && frecuenciaCardiaca <= 90){
                    news.valor += 0;
                } else if ((frecuenciaCardiaca >= 41 && frecuenciaCardiaca <= 50) ||
                    (frecuenciaCardiaca >= 91 && frecuenciaCardiaca <= 110) ) {
                    news.valor += 1;
                } else if (frecuenciaCardiaca >= 111 && frecuenciaCardiaca <= 130){
                    news.valor += 2;
                } else if (frecuenciaCardiaca <= 40 || frecuenciaCardiaca >= 131){
                    news.moderado = true;
                    news.valor += 3;
                }
            }

            // obtenemos valores para glasgow
            var glasgow = self.hayGlasgow(internacion);
            // calculamos valor news para glasgow
            if (glasgow && glasgow.valor > 0){
                if (glasgow.valor <= 14){
                    news.valor += 3;
                    news.moderado = true;
                } else {
                    news.valor += 0;
                }
            }

            // seteamos la clase
            if (news.valor <= 5 && news.moderado){
                news.clase = 'warning';
            }else{
                if (news.valor == 0){

                }else if (news.valor >= 1 && news.valor <= 4){
                    news.clase = 'success';
                }else if (news.valor >= 5 && news.valor <= 6){
                    news.clase = 'warning';
                }else if (news.valor >= 7){
                    news.clase = 'danger';
                }
            }

            return news;
        }
    };
    return self;
}]);
