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
    // riesgoCaidas: function(evoluciones) {
    //     // buscamos la internacion
    //     angular.foreach(evoluciones, function(evolucion){
    //
    //     });
    // }
    var self = {
        hayRiesgoCaidas: function(evoluciones) {
            var clase = "";
            var riesgoCaidas = null;

            if (evoluciones.length) {

                // traemos todas las evoluciones que tengan riesgo de caida
                var _evoluciones = evoluciones.filter(function(evolucion) {
                    return (evolucion.tipo == "Controles" && evolucion.riesgoCaida && evolucion.riesgoCaida.total && evolucion.riesgoCaida.total > 0);
                });

                if (_evoluciones.length) {

                    // ordenamos
                    _evoluciones.sort(function(a, b) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    });

                    // escala
                    if (_evoluciones[0].riesgoCaida.total < 25) {
                        riesgoCaidas = {
                            clase: "default",
                            indicador: "bajo",
                            valor: _evoluciones[0].riesgoCaida.total
                        }

                    } else if (_evoluciones[0].riesgoCaida.total >= 25 && _evoluciones[0].riesgoCaida.total <= 50) {
                        riesgoCaidas = {
                            clase: "warning",
                            indicador: "medio",
                            valor: _evoluciones[0].riesgoCaida.total
                        }
                    } else if (_evoluciones[0].riesgoCaida.total > 50) {
                        riesgoCaidas = {
                            clase: "danger",
                            indicador: "alto",
                            valor: _evoluciones[0].riesgoCaida.total
                        }
                    }

                    // var code = '<span class="tips label label-' + clase + '" title="Riesgo de caídas ' + indicador + '">Riesgo caídas</span>';

                    return riesgoCaidas;
                }
            }

            return null;
        },

        hayValoracionDolor: function(evoluciones) {
            var clase = "";
            var valoracionDolor = null;

            if (evoluciones && evoluciones.length) {

                // traemos todas las evoluciones que tengan riesgo de caida
                var _evoluciones = evoluciones.filter(function(evolucion) {
                    return (evolucion.tipo == "Controles" && evolucion.dolorValoracion && evolucion.dolorValoracion.intensidad && evolucion.dolorValoracion.intensidad > 0);
                });

                if (_evoluciones.length) {

                    // ordenamos
                    _evoluciones.sort(function(a, b) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    });

                    // escala
                    if (_evoluciones[0].dolorValoracion.intensidad >= 1 && _evoluciones[0].dolorValoracion.intensidad <= 3) {
                        valoracionDolor = {
                            clase: "default",
                            indicador: "leve",
                            valor: _evoluciones[0].dolorValoracion.intensidad
                        }

                    } else if (_evoluciones[0].dolorValoracion.intensidad >= 4 && _evoluciones[0].dolorValoracion.intensidad <= 6) {
                        valoracionDolor = {
                            clase: "primary",
                            indicador: "moderado",
                            valor: _evoluciones[0].dolorValoracion.intensidad
                        }

                    } else if (_evoluciones[0].dolorValoracion.intensidad >= 7 && _evoluciones[0].dolorValoracion.intensidad <= 9) {
                        valoracionDolor = {
                            clase: "warning",
                            indicador: "severo",
                            valor: _evoluciones[0].dolorValoracion.intensidad
                        }

                    }
                    if (_evoluciones[0].dolorValoracion.intensidad == 10) {
                        valoracionDolor = {
                            clase: "danger",
                            indicador: "intolerable",
                            valor: _evoluciones[0].dolorValoracion.intensidad
                        }

                    }

                    return valoracionDolor;
                }
            }

            return null;
        },

        hayFiebre: function(evoluciones) {
            var clase = "";
            var fiebre = null;

            if (evoluciones && evoluciones.length) {

                // traemos todas las evoluciones que tengan riesgo de caida
                var _evoluciones = evoluciones.filter(function(evolucion) {
                    return (evolucion.tipo == "Controles" && evolucion.signosVitales && evolucion.signosVitales.temperatura && evolucion.signosVitales.temperatura > 0);
                });

                if (_evoluciones.length) {

                    // ordenamos
                    _evoluciones.sort(function(a, b) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    });

                    // escala
                    if (_evoluciones[0].signosVitales.temperatura <= 35) {
                        fiebre = {
                            clase: "info",
                            indicador: _evoluciones[0].signosVitales.temperatura,
                            valor: _evoluciones[0].signosVitales.temperatura
                        }

                    } else if (_evoluciones[0].signosVitales.temperatura >= 35.1 && _evoluciones[0].signosVitales.temperatura <= 36) {
                        fiebre = {
                            clase: "success",
                            indicador: _evoluciones[0].signosVitales.temperatura,
                            valor: _evoluciones[0].signosVitales.temperatura
                        }

                    } else if (_evoluciones[0].signosVitales.temperatura >= 36.1 && _evoluciones[0].signosVitales.temperatura <= 38) {
                        fiebre = {
                            clase: "default",
                            indicador: _evoluciones[0].signosVitales.temperatura,
                            valor: _evoluciones[0].signosVitales.temperatura
                        }

                    } else if (_evoluciones[0].signosVitales.temperatura >= 38.1 && _evoluciones[0].signosVitales.temperatura <= 39) {
                        fiebre = {
                            clase: "success",
                            indicador: _evoluciones[0].signosVitales.temperatura,
                            valor: _evoluciones[0].signosVitales.temperatura
                        }
                    } else if (_evoluciones[0].signosVitales.temperatura >= 39.1) {
                        fiebre = {
                            clase: "danger",
                            indicador: _evoluciones[0].signosVitales.temperatura,
                            valor: _evoluciones[0].signosVitales.temperatura
                        }
                    }

                    // var code = '<span class="tips label label-' + clase + '" title="Riesgo de caídas ' + indicador + '">Riesgo caídas</span>';

                    return fiebre;
                }
            }

            return null;
        },

        hayGlasgow: function(evoluciones) {
            var clase = "";
            var glasgow = null;

            if (evoluciones && evoluciones.length) {

                // traemos todas las evoluciones que tengan riesgo de caida
                var _evoluciones = evoluciones.filter(function(evolucion) {
                    return (evolucion.tipo == "Controles" && evolucion.glasgow && evolucion.glasgow.total && evolucion.glasgow.total > 0);
                });

                if (_evoluciones.length) {

                    // ordenamos
                    _evoluciones.sort(function(a, b) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    });

                    // // escala
                    if (_evoluciones[0].glasgow.total > 3 && _evoluciones[0].glasgow.total <= 8) {
                        glasgow = {
                            clase: "danger",
                            indicador: 'grave',
                            valor: _evoluciones[0].glasgow.total
                        }

                    } else if (_evoluciones[0].glasgow.total >= 9 && _evoluciones[0].glasgow.total <= 13) {
                        glasgow = {
                            clase: "warning",
                            indicador: "moderado",
                            valor: _evoluciones[0].glasgow.total
                        }

                    } else if (_evoluciones[0].glasgow.total >= 14) {
                        glasgow = {
                            clase: "success",
                            indicador: "leve",
                            valor: _evoluciones[0].glasgow.total
                        }

                    }

                    return glasgow;
                }
            }

            return null;
        },

        hayFlebitis: function(evoluciones) {
            var clase = "";
            var flebitis = null;

            if (evoluciones && evoluciones.length) {

                // traemos todas las evoluciones que tengan riesgo de caida
                var _evoluciones = evoluciones.filter(function(evolucion) {
                    return (evolucion.tipo == "Controles" && evolucion.flebitis && evolucion.flebitis.grado && evolucion.flebitis.grado > 0);
                });

                if (_evoluciones.length) {

                    // ordenamos
                    _evoluciones.sort(function(a, b) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    });

                    // escala
                    if (_evoluciones[0].flebitis.grado == 0) {
                        flebitis = {
                            clase: "info",
                            indicador: _evoluciones[0].flebitis.grado,
                            valor: _evoluciones[0].flebitis.grado
                        }

                    } else if (_evoluciones[0].flebitis.grado == 1) {
                        flebitis = {
                            clase: "success",
                            indicador: _evoluciones[0].flebitis.grado,
                            valor: _evoluciones[0].flebitis.grado
                        }

                    } else if (_evoluciones[0].flebitis.grado == 2) {
                        flebitis = {
                            clase: "warning",
                            indicador: _evoluciones[0].flebitis.grado,
                            valor: _evoluciones[0].flebitis.grado
                        }

                    } else if (_evoluciones[0].flebitis.grado == 3) {
                        flebitis = {
                            clase: "danger",
                            indicador: _evoluciones[0].flebitis.grado,
                            valor: _evoluciones[0].flebitis.grado
                        }
                    }

                    return flebitis;
                }
            }

            return null;
        },

        hayUlcerasPorPresion: function(evoluciones) {
            var clase = "";
            var upp = null;

            if (evoluciones && evoluciones.length) {

                // traemos todas las evoluciones que tengan riesgo de caida
                var _evoluciones = evoluciones.filter(function(evolucion) {
                    return (evolucion.tipo == "Controles" && evolucion.riesgoUPP && evolucion.riesgoUPP.total && evolucion.riesgoUPP.total > 0);
                });

                if (_evoluciones.length) {

                    // ordenamos
                    _evoluciones.sort(function(a, b) {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    });

                    // escala
                    if (_evoluciones[0].riesgoUPP.total >= 13 && _evoluciones[0].riesgoUPP.total <= 16) {
                        upp = {
                            clase: "default",
                            indicador: "Riesgo bajo",
                            valor: _evoluciones[0].riesgoUPP.total
                        }

                    } else if (_evoluciones[0].riesgoUPP.total >= 10 && _evoluciones[0].riesgoUPP.total <= 12) {
                        upp = {
                            clase: "warning",
                            indicador: "Riesgo medio",
                            valor: _evoluciones[0].riesgoUPP.total
                        }

                    } else if (_evoluciones[0].riesgoUPP.total >= 5 && _evoluciones[0].riesgoUPP.total <= 9) {
                        upp = {
                            clase: "danger",
                            indicador: "Riesgo alto",
                            valor: _evoluciones[0].riesgoUPP.total
                        }

                    }

                    // var code = '<span class="tips label label-' + clase + '" title="Riesgo de caídas ' + indicador + '">Riesgo caídas</span>';
                    return upp;
                }
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
        calcularBalanceLiquidos: function(evoluciones, fecha) {
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

        getFrecunciaRespiratoria: function(evoluciones){
            if (evoluciones && evoluciones.length) {

                // traemos todas las evoluciones que tengan riesgo de caida
                var _evoluciones = evoluciones.filter(function(evolucion) {
                    return (evolucion.tipo == "Controles" && evolucion.signosVitales && evolucion.signosVitales.respiracion);
                });

                return (_evoluciones[0].signosVitales.respiracion) ? _evoluciones[0].signosVitales.respiracion : 0;
            }
        },
        getSaturacionOxigeno: function(evoluciones){
            if (evoluciones && evoluciones.length) {

                // traemos todas las evoluciones que tengan riesgo de caida
                var _evoluciones = evoluciones.filter(function(evolucion) {
                    return (evolucion.tipo == "Controles" && evolucion.signosVitales && evolucion.signosVitales.spo2);
                });

                return (_evoluciones[0].signosVitales.spo2) ? _evoluciones[0].signosVitales.spo2 : 0;
            }
        },
        // TODO: Ver como calcular
        getSumplementoOxigeno: function(evoluciones){
            return false;
        },
        getTensionSistolica: function(evoluciones){
            if (evoluciones && evoluciones.length) {

                // traemos todas las evoluciones que tengan riesgo de caida
                var _evoluciones = evoluciones.filter(function(evolucion) {
                    return (evolucion.tipo == "Controles" && evolucion.signosVitales && evolucion.signosVitales.circulacion
                        && evolucion.signosVitales.circulacion.tensionSistolica);
                });

                return (_evoluciones[0].signosVitales.circulacion.tensionSistolica) ? _evoluciones[0].signosVitales.circulacion.tensionSistolica : 0;
            }
        },
        getFrecuenciaCardiaca: function(evoluciones){
            if (evoluciones && evoluciones.length) {

                // traemos todas las evoluciones que tengan riesgo de caida
                var _evoluciones = evoluciones.filter(function(evolucion) {
                    return (evolucion.tipo == "Controles" && evolucion.signosVitales && evolucion.signosVitales.pulso);
                });

                return (_evoluciones[0].signosVitales.pulso) ? _evoluciones[0].signosVitales.pulso : 0;
            }
        },
        getNews(evoluciones){
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
            var frecuenciaRespiratoria = self.getFrecunciaRespiratoria(evoluciones);
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
            var saturacionOxigeno = self.getSaturacionOxigeno(evoluciones);
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
            var sumplementoOxigeno = self.getSumplementoOxigeno(evoluciones);
            // calculamos valor news para suplemento de oxigeno
            news.valor += (sumplementoOxigeno) ? 2 : 0;

            // obtenemos valor de temperatura
            var fiebre = self.hayFiebre(evoluciones);
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
            var tensionSistolica = self.getTensionSistolica(evoluciones);
            // calculamos valor news para tension sistolica
            if (tensionSistolica > 0){
                if (frecuenciaRespiratoria >= 111 && frecuenciaRespiratoria <= 219){
                    news.valor += 0;
                } else if (frecuenciaRespiratoria >= 101 && frecuenciaRespiratoria <= 110){
                    news.valor += 1;
                } else if (frecuenciaRespiratoria >= 91 && frecuenciaRespiratoria <= 100){
                    news.valor += 2;
                } else if (tensionSistolica <= 90 || tensionSistolica >= 131){
                    news.moderado = true;
                    news.valor += 3;
                }
            }

            // obtenemos valores para frecuencia cardiaca
            var frecuenciaCardiaca = self.getFrecuenciaCardiaca(evoluciones);
            // calculamos valor news para frecuencia cardiaca
            if (frecuenciaCardiaca > 0){
                if (frecuenciaCardiaca >= 51 && frecuenciaCardiaca <= 90){
                    news.valor += 0;
                } else if ((frecuenciaCardiaca >= 41 && frecuenciaCardiaca <= 50) ||
                    (frecuenciaCardiaca >= 41 && frecuenciaCardiaca <= 50) ) {
                    news.valor += 1;
                } else if (frecuenciaCardiaca >= 91 && frecuenciaCardiaca <= 100){
                    news.valor += 2;
                } else if (frecuenciaCardiaca <= 90 || frecuenciaCardiaca >= 131){
                    news.moderado = true;
                    news.valor += 3;
                }
            }

            // obtenemos valores para glasgow
            var glasgow = self.hayGlasgow(evoluciones);
            // calculamos valor news para glasgow
            if (glasgow > 0){
                if (glasgow <= 14){
                    news.valor += 3;
                    news.moderado = true;
                } else {
                    news.valor += 0;
                }
            }

            // seteamos la clase
            if (news.moderado){
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
