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
            var temperatura = null;
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
                        temperatura = {
                            clase: "info",
                            indicador: evolucion.signosVitales.temperatura,
                            valor: evolucion.signosVitales.temperatura
                        }

                    } else if (evolucion.signosVitales.temperatura >= 35.1 && evolucion.signosVitales.temperatura <= 36) {
                        temperatura = {
                            clase: "success",
                            indicador: evolucion.signosVitales.temperatura,
                            valor: evolucion.signosVitales.temperatura
                        }

                    } else if (evolucion.signosVitales.temperatura >= 36.1 && evolucion.signosVitales.temperatura <= 38) {
                        temperatura = {
                            clase: "default",
                            indicador: evolucion.signosVitales.temperatura,
                            valor: evolucion.signosVitales.temperatura
                        }

                    } else if (evolucion.signosVitales.temperatura >= 38.1 && evolucion.signosVitales.temperatura <= 39) {
                        temperatura = {
                            clase: "success",
                            indicador: evolucion.signosVitales.temperatura,
                            valor: evolucion.signosVitales.temperatura
                        }
                    } else if (evolucion.signosVitales.temperatura >= 39.1) {
                        temperatura = {
                            clase: "danger",
                            indicador: evolucion.signosVitales.temperatura,
                            valor: evolucion.signosVitales.temperatura
                        }
                    }

                    return temperatura;
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
        // se deben utilizar las indicaciones, en caso de tener activa
        // la indicacion de colocacion de oxigeno
        getSumplementoOxigeno: function(internacion){
            var indicaciones = internacion.indicaciones;

            if (indicaciones && indicaciones.length) {
                var found = false;
                var i = indicaciones.length - 1;

                while (i >= 0 && !found){
                    if (indicaciones[i].tipoIndicacion.nombre == 'Oxigenoterapia'){
                        found = true;
                        if (indicaciones[i].medicamento.oxigeno.accion == 'Colocación'){
                            return true;
                        }
                    }

                    i--;
                }

            }

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
            news['frecuenciaRespiratoria'] = {valorNews: 0, valor: 0};
            news.frecuenciaRespiratoria.valor = self.getFrecunciaRespiratoria(internacion);
            // calculamos valor news para frecuencia respiratoria
            if (news.frecuenciaRespiratoria.valor > 0){
                if (news.frecuenciaRespiratoria.valor >= 12 && news.frecuenciaRespiratoria.valor <= 20){
                    news.valor += 0;
                    news.frecuenciaRespiratoria.valorNews = 0;
                } else if (news.frecuenciaRespiratoria.valor >= 9 && news.frecuenciaRespiratoria.valor <= 11){
                    news.valor += 1;
                    news.frecuenciaRespiratoria.valorNews = 1;
                } else if (news.frecuenciaRespiratoria.valor >= 21 && news.frecuenciaRespiratoria.valor <= 24){
                    news.valor += 2;
                    news.frecuenciaRespiratoria.valorNews = 2;
                } else if (news.frecuenciaRespiratoria.valor <= 8 || news.frecuenciaRespiratoria.valor >= 25){
                    news.moderado = true;
                    news.valor += 3;
                    news.frecuenciaRespiratoria.valorNews = 3;
                }
            }

            // obtenemos valores para saturacion de oxigeno
            news['saturacionOxigeno'] = {valorNews: 0, valor: 0};
            news['saturacionOxigeno'].valor = self.getSaturacionOxigeno(internacion);
            // calculamos valor news para saturacion de oxigeno
            if (news.saturacionOxigeno.valor > 0){
                if (news.saturacionOxigeno.valor >= 96){
                    news.valor += 0;
                    news.saturacionOxigeno.valorNews = 0;
                } else if (news.saturacionOxigeno.valor >= 94 && news.saturacionOxigeno.valor <= 95){
                    news.valor += 1;
                    news.saturacionOxigeno.valorNews = 1;
                } else if (news.saturacionOxigeno.valor >= 92 && news.saturacionOxigeno.valor <= 93){
                    news.valor += 2;
                    news.saturacionOxigeno.valorNews = 2;
                } else if (news.saturacionOxigeno.valor <= 91){
                    news.moderado = true;
                    news.valor += 3;
                    news.saturacionOxigeno.valorNews = 3;
                }
            }

            // obtenemos valor para suplemento de oxigeno
            var sumplementoOxigeno = false;
            if (internacion.indicaciones && internacion.indicaciones.length){
                sumplementoOxigeno = self.getSumplementoOxigeno(internacion);
            }

            news['sumplementoOxigeno'] = {valorNews: 0, valor: 0};
            news['sumplementoOxigeno'].valor = sumplementoOxigeno;
            // calculamos valor news para suplemento de oxigeno
            news.valor += (news.sumplementoOxigeno.valor) ? 2 : 0;

            // obtenemos valor de temperatura
            news.temperatura = self.hayFiebre(internacion);
            if (!news.temperatura) {news.temperatura = {};}
            news.temperatura['valorNews']  = 0;
            // calculamos valor news para temperatura
            if (news.temperatura && news.temperatura.valor > 0){
                if (news.temperatura.valor >= 36.1 && news.temperatura.valor <= 38){
                    news.valor += 0;
                    news.temperatura.valorNews = 0;
                }else if ( (news.temperatura.valor >= 35.1 && news.temperatura.valor <= 36) || (news.temperatura.valor >= 38.1 && news.temperatura.valor <= 39)){
                    news.valor += 1;
                    news.temperatura.valorNews = 1;
                }else if (news.temperatura.valor >= 39.1){
                    news.valor += 2;
                    news.temperatura.valorNews = 2;
                }else if (news.temperatura.valor <= 35){
                    news.moderado = true;
                    news.valor += 3;
                    news.temperatura.valorNews = 3;
                }
            }

            // obtenemos valores para tension sistolica
            news['tensionSistolica'] = {valorNews: 0, valor: 0};
            news['tensionSistolica'].valor = self.getTensionSistolica(internacion);
            // calculamos valor news para tension sistolica
            if (news.tensionSistolica.valor > 0){
                if (news.tensionSistolica.valor >= 111 && news.tensionSistolica.valor <= 219){
                    news.valor += 0;
                    news.tensionSistolica.valorNews = 0;

                } else if (news.tensionSistolica.valor >= 101 && news.tensionSistolica.valor <= 110){
                    news.valor += 1;
                    news.tensionSistolica.valorNews = 1;

                } else if (news.tensionSistolica.valor >= 91 && news.tensionSistolica.valor <= 100){
                    news.valor += 2;
                    news.tensionSistolica.valorNews = 2;

                } else if (news.tensionSistolica.valor <= 90 || news.tensionSistolica.valor >= 220){
                    news.moderado = true;
                    news.valor += 3;
                    news.tensionSistolica.valorNews = 3;
                }
            }

            // obtenemos valores para frecuencia cardiaca
            news['frecuenciaCardiaca'] = {valorNews: 0, valor: 0};
            news['frecuenciaCardiaca'].valor = self.getFrecuenciaCardiaca(internacion);
            // calculamos valor news para frecuencia cardiaca
            if (news.frecuenciaCardiaca.valor > 0){
                if (news.frecuenciaCardiaca >= 51 && news.frecuenciaCardiaca.valor <= 90){
                    news.valor += 0;
                    news.frecuenciaCardiaca.valorNews = 0;
                } else if ((news.frecuenciaCardiaca.valor >= 41 && news.frecuenciaCardiaca.valor <= 50) ||
                    (news.frecuenciaCardiaca >= 91 && news.frecuenciaCardiaca <= 110) ) {
                    news.valor += 1;
                    news.frecuenciaCardiaca.valorNews = 1;
                } else if (news.frecuenciaCardiaca.valor >= 111 && news.frecuenciaCardiaca.valor <= 130){
                    news.valor += 2;
                    news.frecuenciaCardiaca.valorNews = 2;
                } else if (news.frecuenciaCardiaca.valor <= 40 || news.frecuenciaCardiaca.valor >= 131){
                    news.moderado = true;
                    news.valor += 3;
                    news.frecuenciaCardiaca.valorNews = 3;
                }
            }

            // obtenemos valores para glasgow.
            news['glasgow'] = self.hayGlasgow(internacion);
            if (!news.glasgow) {news.glasgow = {};}
            news.glasgow['valorNews'] = 0;
            // calculamos valor news para glasgow
            if (news.glasgow && news.glasgow.valor > 0){
                if (news.glasgow.valor <= 14){
                    news.valor += 3;
                    news.moderado = true;
                    news.glasgow.valorNews = 3;
                } else {
                    news.valor += 0;
                    news.glasgow.valorNews = 0;
                }
            }

            // seteamos la clase
            if (news.valor <= 5 && news.moderado){
                news.clase = 'danger';
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
