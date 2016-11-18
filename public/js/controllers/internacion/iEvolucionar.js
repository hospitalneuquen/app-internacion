angular.module('app').controller('internacion/iEvolucionar', ['$scope', 'Plex', 'Shared', 'Server', '$timeout', 'Session', '$alert', function($scope, Plex, Shared, Server, $timeout, Session, $alert) {
    'use strict';

    angular.extend($scope, {
        graph : {'width': 360, 'height': 470},
        radius : 10,
        sw : 55,

        tab: 0,
        show_toolbar: true,
        tituloEvolucion: '',
        loading: true,
        internacion: undefined,
        drenajes: [],
        drenajesInternacion: [],
        evolucionesEdit: undefined, // Item actual que se está editando
        balanceTotal: 0,
        ultimaEvolucion: {},
        // evoluciones: {},
        tiposWidgets: [],
        wigetCargados : [],
        // array de servicios para filtrar en la vista
        tiposEvoluciones: [{
            id: '',
            nombre: 'Todas'
        }],
        profesionales: [{
            id: '',
            nombre: 'Todos'
        }],
        servicios: [{
            id: '',
            nombreCorto: 'Todas'
        }, {
            id: 'mis-evoluciones',
            nombreCorto: "Mis evoluciones"
        }],

        // tinymce
        tinymceOptions : {
            // plugins: 'link image code',
            menubar: false,
            toolbar: 'undo redo | bold italic'
        },

        filtros: {
            evoluciones: [],
            servicio: null,
            profesional: null,
            tiposEvoluciones: null,
            filtrar: function() {
                var self = this;

                if (!self.profesional) {
                    self.profesional = $scope.profesionales[0];
                }

                if (!self.servicio) {
                    self.servicio = $scope.servicios[0];
                }

                if (!self.tiposEvoluciones) {
                    self.tiposEvoluciones = $scope.tiposEvoluciones[0];
                }

                self.evoluciones = $scope.internacion.evoluciones.filter(function(evolucion) {
                    return (!self.servicio.id || (self.servicio && evolucion.servicio && (evolucion.servicio.id == self.servicio.id || (self.servicio.id == 'mis-evoluciones' && evolucion.createdBy.id === Session.user.id)))) &&
                        // (!self.servicio.id || (self.servicio.id == 'mis-evoluciones' && evolucion.createdBy.id === Session.user.id )) &&
                        (!self.tiposEvoluciones.id || (self.tiposEvoluciones.id == evolucion.tipoEvolucion.id)) &&
                        (!self.profesional.id || (self.profesional && evolucion.tipo && evolucion.tipo == self.profesional.id))
                });

                // if (!self.servicio) {
                //     $scope.filtros.evoluciones = $scope.internacion.evoluciones;
                // } else {
                //     $scope.filtros.evoluciones = [];
                //
                //     if (self.servicio.id !== "undefined" && self.servicio.id == 'mis-evoluciones') {
                //         angular.forEach($scope.internacion.evoluciones, function(evolucion) {
                //             if (self.servicio && evolucion.createdBy.id === Session.user.id) {
                //                 $scope.filtros.evoluciones.push(evolucion);
                //             }
                //         });
                //     } else {
                //         angular.forEach($scope.internacion.evoluciones, function(evolucion) {
                //             if (self.servicio && evolucion.servicio.id === self.servicio.id) {
                //                 $scope.filtros.evoluciones.push(evolucion);
                //             }
                //         });
                //     }

                // angular.forEach($scope.filtros.evoluciones, function(evolucion) {
                //     if (self.profesional == "" || self.profesional.id == evolucion.tipo) {
                //         $scope.filtros.evoluciones.push(evolucion);
                //     }
                // });
                // }
            }
        },

        init: function(internacion) {
            $scope.loading = true;
            // buscamos la internacion
            if (internacion != null) {
                $scope.internacion = internacion;

                $scope.filtros.evoluciones = internacion.evoluciones;
                $scope.loading = false;

                if ($scope.internacion.evoluciones.length) {
                    var services_found = [];
                    var profesionales_found = [];
                    var tipos_found = [];

                    angular.forEach($scope.internacion.evoluciones, function(evolucion) {

                        // calculamos balance de liquidos
                        if (typeof evolucion.balance != "undefined"){
                            Shared.evolucion.calcularBalance(evolucion, function(data){
                                evolucion = data;
                            });
                        }

                        $scope.balanceTotal += evolucion.balance.$balance;

                        // buscamos los servicios para el filtro de evoluciones
                        if (evolucion.servicio && evolucion.servicio.id) {
                            if (!services_found.inArray(evolucion.servicio.id)) {
                                $scope.servicios.push(evolucion.servicio);
                                services_found.push(evolucion.servicio.id);
                            }
                        }

                        if (!profesionales_found.inArray(evolucion.tipo)) {

                            $scope.profesionales.push({
                                id: evolucion.tipo,
                                nombre: evolucion.tipo
                            });
                            profesionales_found.push(evolucion.tipo);
                        }

                        // asignamos los tipos a los filtros
                        console.log(tipos_found, evolucion.tipoIndicacion.tipoEvolucion.id);

                        if (!tipos_found.inArray(evolucion.tipoIndicacion.tipoEvolucion.id)) {

                            $scope.tiposEvoluciones.push({
                                id: evolucion.tipoIndicacion.tipoEvolucion.id,
                                nombre: evolucion.tipoIndicacion.nombre
                            });

                            tipos_found.push(evolucion.tipoIndicacion.tipoEvolucion.id);
                        }

                        // // asignamos la indicacion a la evolucion
                        // var indicacion = $scope.internacion.indicaciones.filter(function(indicacion){
                        //     return (indicacion.id && indicacion.id == evolucion.idIndicacion);
                        // });
                        // evolucion.indicacion = indicacion[0];

                    });
                }

                // cargamos los valores permitidos para los tipos de controles
                if ($scope.tiposWidgets.length == 0) {
                    // los tipos de widgets que tengan key es porque se levantan
                    // los resultados desde una evolucion
                    // los que no tengan key es porque es un elemento a tomar
                    // de la internacion o calcular aparte
                    $scope.tiposWidgets = [{
                        id: '',
                        key: '',
                        nombre: 'Seleccione'
                    },
                    {
                        id: 'problemas',
                        nombre: 'Lista de problemas'
                    },
                    // {
                    //     id: 'antecedentes',
                    //     nombre: 'Antecedentes'
                    // },
                    {

                        "_id": "5808d77e9621181a69adf8f7",
                        "nombre": "Signos vitales",
                        "key": "signosVitales",
                        "idTipoEvolucion": "5808d3ce9621181a69adf8f3",
                        "id": "5808d77e9621181a69adf8f7"
                    },
                    {
                        "_id": "5808d77e9621181a69adf8f9",
                       "nombre": "Ulceras por presión",
                       "key": "riesgoUPP",
                       "idTipoEvolucion": "5808d3ce9621181a69adf8f3",
                       "id": "5808d77e9621181a69adf8f9"
                   },
                   {
                        "_id": "5808d77e9621181a69adf8f8",
                        "nombre": "Balance",
                        "key": "balance",
                        "idTipoEvolucion": "5808d3ce9621181a69adf8f3",
                        "id": "5808d77e9621181a69adf8f8"
                    },
                    // {
                    //     "_id": "5808d77e9621181a69adf8ff",
                    //     "nombre": "Flebitis",
                    //     "key": "flebitis",
                    //     "idTipoEvolucion": "5808d3ce9621181a69adf8f3",
                    //     "id": "5808d77e9621181a69adf8ff"
                    // },
                    {
                        "_id": "5808d77e9621181a69adf8fa",
                        "nombre": "Glasgow",
                        "key": "glasgow",
                        "idTipoEvolucion": "5808d3ce9621181a69adf8f3",
                        "id": "5808d77e9621181a69adf8fa"
                    },{
                        "_id": "5808d77e9621181a69adf8fb",
                        "nombre": "Riesgo caídas",
                        "key": "riesgoCaida",
                        "idTipoEvolucion": "5808d3ce9621181a69adf8f3",
                        "id": "5808d77e9621181a69adf8fb"
                    },{
                        "_id": "5808d77e9621181a69adf8fe",
                        "nombre": "Valoración del dolor",
                        "key": "dolorValoracion",
                        "idTipoEvolucion": "5808d3ce9621181a69adf8f3",
                        "id": "5808d77e9621181a69adf8fe"
                    },

               ];
                    // TiposIndicaciones.getPadres().then(function(data) {
                    //     // $scope.tiposIndicacionesPadre = data;
                    //     $scope.tiposIndicacionesPadre = data;
                    //
                    //
                    //     TiposIndicaciones.getHijas().then(function(data) {
                    //         $scope.tiposIndicacionesHijas = data;
                    //
                    //         angular.forEach($scope.tiposIndicacionesPadre, function(tipo){
                    //             tipo.hijas = $scope.tiposIndicacionesHijas.filter(function(hija) {
                    //                 return (
                    //                     (hija.tipoIndicacion == tipo.id)
                    //                 )
                    //             });
                    //         });
                    //
                    //     });
                    // });
                }

                $scope.filtros.filtrar();

                if ($scope.internacion.drenajes.length) {
                    // cargamos los drenajes al array de drenajesInternacion
                    angular.forEach($scope.internacion.drenajes, function(drenaje) {
                        // if (drenaje.fechaHasta && moment(new Date()).isBefore(drenaje.fechaHasta)){
                        drenaje.$activo = false;
                        if (!drenaje.fechaHasta) {
                            drenaje.$activo = true;
                        }

                        $scope.drenajesInternacion.push(drenaje);
                    });
                }
            }
        },
        widgets: {
            seleccionar: function(valor){

            },
            cargar: function(){
                var found = false;
                var evolucion = null;
                var i = $scope.internacion.evoluciones.length - 1;

                console.log($scope.tipoWidget);

                while (i >= 0 && !found){
                    var _evolucion = $scope.internacion.evoluciones[i];
                    // if ($scope.tipoWidget.nombre == 'Signos vitales' && $scope.internacion.evoluciones[i].tipo == 'Controles' && $scope.internacion.evoluciones[i].signosVitales){
                    //
                    //     evolucion = $scope.internacion.evoluciones[i];
                    //     evolucion.title = "Signos vitales";
                    //     found = true;
                    // }else if ($scope.tipoWidget.nombre == 'Balance' && $scope.internacion.evoluciones[i].tipo == 'Controles' && $scope.internacion.evoluciones[i].signosVitales){
                    //     //
                    //     // evolucion = $scope.internacion.evoluciones[i];
                    //     // evolucion.title = "Signos vitales";
                    //     // found = true;
                    // }

                    if (typeof $scope.tipoWidget.key !== "undefined"){
                        if (typeof _evolucion[$scope.tipoWidget.key] !== "undefined"){
                            var evolucion = {
                                title: $scope.tipoWidget.nombre
                            };
                            evolucion[$scope.tipoWidget.key] = _evolucion[$scope.tipoWidget.key];
                            found = true;
                        }
                    }else if($scope.tipoWidget.id){
                        var evolucion = {
                            title: $scope.tipoWidget.nombre
                        };
                        // evolucion = $scope.internacion[$scope.tipoWidget.id];
                        evolucion[$scope.tipoWidget.id] = $scope.internacion[$scope.tipoWidget.id];

                        // if ($scope.tipoWidget.id == 'problemas'){
                        //     evolucion[$scope.tipoWidget.id]['activos'] = $scope.internacion[$scope.tipoWidget.id].filter(function(p){
                        //         return (p.estado == 'Activo');
                        //     });
                        //     evolucion[$scope.tipoWidget.id]['inactivos'] = $scope.internacion[$scope.tipoWidget.id].filter(function(p){
                        //         return (p.estado == 'Inactivo');
                        //     });
                        // }
                        found = true;
                    }

                    i--;
                }

                if ($scope.tipoWidget.id == 'problemas'){
                    var evolucion = {
                        title: $scope.tipoWidget.nombre
                    };
                    evolucion.problemas = [];
                    evolucion[$scope.tipoWidget.id]['activos'] = $scope.internacion.problemas.filter(function(p){
                        return (p.estado == 'Activo');
                    });

                    evolucion[$scope.tipoWidget.id]['inactivos'] = $scope.internacion.problemas.filter(function(p){
                        return (p.estado == 'Inactivo');
                    });
                }

                    console.log(evolucion);
                if (evolucion){
                    $scope.wigetCargados.push(evolucion);
                }
                console.log($scope.wigetCargados);
                // if ($scope.tipoWidget.nombre == 'Balance'){
                //
                // }else if ($scope.tipoWidget.nombre == 'Signos vitales'){
                //
                //
                // }
            },
            quitar: function(index){
                $scope.wigetCargados.splice(index, 1);
            }
        },
        // Inicia la edición de una evolución
        editarEvolucion: function(evolucion) {
            $scope.show_toolbar = false;
            $scope.drenajes = [];

            // buscamos los datos de la ultima evolucion para poder mostrar
            // el resumen cuando el medico escribe el texto de la evolucion
            // if ($scope.internacion.evoluciones.length) {
            //
            //     // ordenamos cronologicamente
            //     var ordenCronologico = $scope.internacion.evoluciones;
            //     // ordenamos cronolicamente las evoluciones en forma descendiente
            //     ordenCronologico.sort(function(a, b) {
            //         return new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
            //     });
            //
            //
            //     // guardamos fecha y hora de la ultima evolucion
            //     $scope.ultimaEvolucion.fechaHora = ordenCronologico[0].fechaHora;
            //
            //     // buscamos el balance
            //     angular.forEach(ordenCronologico, function(evolucion) {
            //         // if (typeof evolucion.balance != "undefined"){
            //         //     angular.copy($scope.internacion.evoluciones[last].balance, $scope.ultimaEvolucion.balance);
            //         // }
            //
            //         if (!$scope.ultimaEvolucion.balance && typeof evolucion.balance != "undefined") {
            //             if (evolucion.balance.$total_ingresos > 0 || evolucion.balance.$total_egresos > 0) {
            //                 $scope.ultimaEvolucion.balance = evolucion.balance;
            //             }
            //         }
            //
            //         if (!$scope.ultimaEvolucion.signosVitales && typeof evolucion.signosVitales != "undefined") {
            //             $scope.ultimaEvolucion.signosVitales = evolucion.signosVitales;
            //         }
            //     });
            //
            //     // angular.forEach($scope.internacion.evoluciones, function(evolucion){
            //     // for (last ; last > 0; last --){
            //     //     var evolucion= $scope.internacion.evoluciones[last];
            //     //     console.log(evolucion);
            //     // if (!$scope.ultimaEvolucion.signosVitales && typeof evolucion.signosVitales != "undefined"){
            //     //     angular.copy(evolucion.signosVitales, $scope.ultimaEvolucion.signosVitales);
            //     // }
            //     // }
            //     // });
            //
            //     // do {
            //     //     if (typeof $scope.internacion.evoluciones[last].balance != "undefined"){
            //     //         angular.copy($scope.internacion.evoluciones[last].balance, $scope.ultimaEvolucion.balance);
            //     //     }
            //     //
            //     //     last--;
            //     // } while(!$scope.ultimaEvolucion.balance || last == 0);
            //
            //
            //     // $scope.ultimaEvolucion = $scope.internacion.evoluciones[$scope.internacion.evoluciones.length - 2];
            // }

            if (evolucion) { // Modificación
                $scope.tituloFormulario = "Editar evolución";
                $scope.evolucionesEdit = {};

                angular.copy(evolucion, $scope.evolucionesEdit);


                // cargamos los drenajes de la internacion
                if ($scope.drenajesInternacion.length) {
                    angular.forEach($scope.drenajesInternacion, function(drenajeInternacion) {
                        var drenaje = drenajeInternacion;
                        var encontrado = false;
                        // si el drenaje de la evolucion esta dentro de los de la internacion
                        if ($scope.evolucionesEdit.egresos.drenajes.length) {
                            angular.forEach($scope.evolucionesEdit.egresos.drenajes, function(drenajeEvolucion) {

                                if (!encontrado && drenajeInternacion.id == drenajeEvolucion.idDrenaje) {
                                    drenaje.idDrenaje = drenajeEvolucion.idDrenaje;
                                    drenaje.caracteristicaLiquido = drenajeEvolucion.caracteristicaLiquido;
                                    drenaje.cantidad = drenajeEvolucion.cantidad;
                                    drenaje.observaciones = drenajeEvolucion.observaciones;

                                    encontrado = true;

                                    $scope.drenajes.push(drenaje);
                                }
                            });
                        }

                        if (!encontrado && drenajeInternacion.$activo === true) {
                            drenaje.idDrenaje = "";
                            drenaje.caracteristicaLiquido = "";
                            drenaje.cantidad = "";
                            drenaje.observaciones = "";

                            $scope.drenajes.push(drenaje);
                        }

                    });
                }

            } else { // Alta
                $scope.tab = 1;
                $scope.tituloFormulario = "Agregar evolución";

                // // buscamos los datos de la ultima evolucion para poder mostrar
                // // el resumen cuando el medico escribe el texto de la evolucion
                // if ($scope.internacion.evoluciones[$scope.internacion.evoluciones.length - 1]) {
                //     $scope.ultimaEvolucion = $scope.internacion.evoluciones[$scope.internacion.evoluciones.length - 1];
                // }

                // Valores por defecto
                $scope.evolucionesEdit = {
                    fechaHora: new Date(),
                    // tipo: Session.variables.prestaciones_workflow,
                    tipo: 'Servicio',
                    servicio: Session.variables.servicioActual.id,
                    egresos: {
                        drenajes: []
                    }
                };

                // asignamos los drenajes activos
                if ($scope.drenajesInternacion.length) {
                    // cargamos los drenajes
                    angular.forEach($scope.drenajesInternacion, function(drenaje) {
                        drenaje.idDrenaje = "";
                        drenaje.caracteristicaLiquido = "";
                        drenaje.cantidad = "";
                        drenaje.observaciones = "";
                        if (drenaje.$activo) {
                            $scope.drenajes.push(drenaje);
                        }
                    });
                }

            }

        },
        // Cancelar la edición
        cancelarEdicion: function() {
            $scope.evolucionesEdit = null;
            $scope.show_toolbar = true;
        },

        // Guarda la evolución
        guardarEvolucion: function(evolucion) {
            // // si se han evolucionado los drenajes entonces los cargamos
            // if ($scope.drenajes.length > 0) {
            //     $scope.evolucionesEdit.egresos.drenajes = [];
            //     angular.forEach($scope.drenajes, function(drenaje) {
            //         var _drenaje = {
            //             idDrenaje: drenaje.idDrenaje,
            //             caracteristicaLiquido: drenaje.caracteristicaLiquido,
            //             cantidad: drenaje.cantidad,
            //             observaciones: drenaje.observaciones,
            //         }
            //         $scope.evolucionesEdit.egresos.drenajes.push(_drenaje);
            //     });
            //     // angular.copy($scope.drenajes, $scope.evolucionesEdit.egresos.drenajes);
            // }
            // // calculamos valores de glasgow
            // if ($scope.evolucionesEdit.glasgow) {
            //     $scope.evolucionesEdit.glasgow.total = $scope.evolucionesEdit.glasgow.motor + $scope.evolucionesEdit.glasgow.verbal + $scope.evolucionesEdit.glasgow.ocular;
            // }
            // // calculamos valores de riesgo de caidas
            // if ($scope.evolucionesEdit.riesgoCaida) {
            //     $scope.evolucionesEdit.riesgoCaida.total = $scope.evolucionesEdit.riesgoCaida.caidasPrevias + $scope.evolucionesEdit.riesgoCaida.marcha + $scope.evolucionesEdit.riesgoCaida.ayudaDeambular + $scope.evolucionesEdit.riesgoCaida.venoclisis + $scope.evolucionesEdit.riesgoCaida.comorbilidad + $scope.evolucionesEdit.riesgoCaida.estadoMental;
            // }
            // // calculamos valores de riesgo de ulceras por presion
            // if ($scope.evolucionesEdit.riesgoUPP) {
            //     $scope.evolucionesEdit.riesgoUPP.total = $scope.evolucionesEdit.riesgoUPP.estadoFisico + $scope.evolucionesEdit.riesgoUPP.estadoMental + $scope.evolucionesEdit.riesgoUPP.actividad + $scope.evolucionesEdit.riesgoUPP.movilidad + $scope.evolucionesEdit.riesgoUPP.incontinencia;
            // }

            console.log($scope.evolucionesEdit);
            Shared.evolucion.post($scope.internacion.id, evolucion.id || null, $scope.evolucionesEdit, {
                minify: true
            }).then(function(data) {
                Plex.alert('Evolución guardada');

                // actualizamos el listado de evoluciones
                $scope.actualizarEvoluciones(data);
                $scope.cancelarEdicion();

                //if ($scope.volverAlMapa) {
                //    Plex.closeView($scope.cama);
            });
        },

        actualizarEvoluciones: function(data) {
            var found = false;
            $scope.loading = true;

            // calculamos balance de liquidos
            //$scope.calcularBalance(data);

            var length = $scope.internacion.evoluciones.length;
            // buscamos la cama y actualizamos el valor con los datos
            for (var i = 0; i < length; i++) {
                if ($scope.internacion.evoluciones[i].id === data.id) {
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

            $scope.filtros.filtrar();
            // actualizamos el grafico
            // $scope.chart.update++;
        },
        verEvolucion:function(idEvolucion){
            Plex.openView('internacion/verEvolucion/' + $scope.internacion.id + "/" + idEvolucion).then(function() {

            });
        },
    });

    // inicializamos mediante el watch de la variable incluida
    $scope.$watch('include.internacion', function(current, old) {
        // $scope.tipoWidget = {id: '', nombre: 'Seleccione'};
        $scope.init(current);
    });
}]);

angular.module('app').filter('estaActivo', function() {
    return function(collection, keyname) {

        var output = [],
            keys = [];

        angular.forEach(collection, function(item) {
            if (item.activo){
                output.push(item);
            }
        });

        return output;
    };
});
