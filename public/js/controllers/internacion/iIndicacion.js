angular.module('app').controller('internacion/iIndicacion', ['$scope', 'Plex', 'Shared', 'Server', 'Session', 'Global', '$filter', 'TiposIndicaciones', function($scope, Plex, Shared, Server, Session, Global, $filter,TiposIndicaciones) {
    'use strict';

    angular.extend($scope, {
        accionIndicacion: null,
        ////////////////////////////////////// mover a otro lugar //
        graph : {'width': 360, 'height': 470},
        elements : [],
        tools : ['circle','line'],
        currentTool : 0, // line
        radius : 10,
        x : 0,
        y : 0,
        sw : 55,
        dibujarUlcera: true, // flag que determina si se puede dibujar o no
        draw : function(e, lado) {
            $scope.x = e.offsetX;
            $scope.y = e.offsetY;

            if(typeof $scope.evolucionesEdit.riesgoUPP[lado] == "undefined"){
                $scope.evolucionesEdit.riesgoUPP[lado] = [];
            }

            // dibujamos en la imagen
            if ($scope.dibujarUlcera) {
                // $scope.elements.push({
                $scope.evolucionesEdit.riesgoUPP[lado].push({
                    "tipo": $scope.currentTool,
                    "x": $scope.x,
                    "y": $scope.y,
                    "r": $scope.radius,
                    "f":0,
                    "sw": $scope.sw
                });
            }else{
                // si estamos eliminando entonces permitimos
                // nuevamente poder dibujar
                $scope.dibujarUlcera = true;
            }
        },
        delete: function(i, lado){
            // borramos el elemento del dibujo
            $scope.evolucionesEdit.riesgoUPP[lado].splice(i,1);
            // seteamos flag en falso para que no dibuje
            $scope.dibujarUlcera = false;
        },
        ////////////////////////////////////// FIN mover a otro lugar //

        tab: 0,

        numero_indicacion: parseInt(0),

        status: {
            activo: true
        },

        titulo: 'Indicaciones de la internación',
        show_toolbar_indicaciones: true,
        show_comenzar_tratamiento: true,
        showForm: false,
        accion: null,
        editandoAgregado: false,
        indicacionBorrar: null,

        internacion: undefined,
        indicacion: {}, // Item actual que se está editando / agregando
        agregado: {}, // cuando voy cargando agregados en plan de hidratacion
        // indicacionEdit: undefined, // Item actual que se está editando

        // indicacionesEvolucionar: [],
        evolucionesEdit: undefined, // Item actual que se está editando
        evolucionarIndicacion: undefined,
        // // lo uso para el plan de hidratacion, ya que puedo evolucionar
        // // PHP, PHE, PHOral, Antibioticos EV, Nutricion enteral
        // arrayEvoluciones: [],

        drenajes: [],

        tiposIndicaciones: [],
        tiposIndicacionesFiltros: [{id: '', nombre: 'Todas'}],

        // array de estados para filtrar en la vista
        estados : [],
        servicios : [],
        tiposControles: [],
        tiposAgregados: [],
        frecuencias: [],
        tipoRespiracion: [],
        valoresOxigeno: [],
        tipoNutricionEnteral: [],

        inicializarArrays: function(){
            // obtenemos las camas para armar el mapa
            TiposIndicaciones.get().then(function(data) {
                $scope.tiposIndicaciones = data;
            });

            TiposIndicaciones.getPadres().then(function(data) {
                // $scope.tiposIndicacionesPadre = data;
                $scope.tiposIndicacionesPadre = data;
                $scope.tiposIndicacionesFiltros = $scope.tiposIndicacionesFiltros.concat(data);

                TiposIndicaciones.getHijas().then(function(data) {
                    $scope.tiposIndicacionesHijas = data;

                    angular.forEach($scope.tiposIndicacionesPadre, function(tipo){
                        tipo.hijas = $scope.tiposIndicacionesHijas.filter(function(hija) {
                            return (
                                (hija.tipoIndicacion == tipo.id)
                            )
                        });
                    });

                });
            });

            // // buscamos los tipos de indicaciones disponibles
            // Server.get("/api/internacion/internacion/indicacion/tipos/controles.tipo").then(function(tiposControles) {
            //     angular.forEach(tiposControles, function(indicacion) {
            //         $scope.tiposControles.push({
            //             id: indicacion,
            //             nombre: indicacion
            //         });
            //     });
            // });

            $scope.estados = [{
                id: true,
                nombre: 'Activas'
            }, {
                id: false,
                nombre: 'Suspendidas'
            }, {
                id: 'Todas',
                nombre: 'Todas'
            }];
            // array de servicios para filtrar en la vista
            $scope.servicios = [{
                id: '',
                nombreCorto: 'Todos'
            }];
            $scope.tiposAgregados = [{
                id: 'Ampollas de electrolitos',
                nombre: 'Ampollas de electrolitos'
            }, {
                id: 'Polivitamínicos',
                nombre: 'Polivitamínicos'
            }, {
                id: 'Calcio',
                nombre: 'Calcio'
            }, {
                id: 'Otro',
                nombre: 'Otro'
            }];

            $scope.frecuencias = [{
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
            }];

            $scope.tipoRespiracion = [{
                id: 'Mascara',
                tipo: 'Máscara'
            }, {
                id: 'Bigotera',
                tipo: 'Bigotera'
            }],
            //$scope.valoresOxigeno = [];

            $scope.tipoNutricionEnteral = [{
                id: 'Isocalórico',
                value: 'Isocalórico',
                proteinas: 40,
                kilocalorias: 1000
            }, {
                id: 'Isocalórico c/fibra',
                value: 'Isocalórico c/fibra',
                proteinas: 40,
                kilocalorias: 1000
            }, {
                id: 'Isocalórico p/diabético',
                value: 'Isocalórico p/diabético',
                proteinas: 40,
                kilocalorias: 1000
            }, {
                id: 'Isocalórico respiratorio',
                value: 'Isocalórico respiratorio',
                proteinas: 50,
                kilocalorias: 1000
            }, {
                id: 'Crítico',
                value: 'Crítico',
                proteinas: 50,
                kilocalorias: 1000
            }, {
                id: 'Crítico c/fibra',
                value: 'Crítico c/fibra',
                proteinas: 50,
                kilocalorias: 1000
            }, {
                id: 'Crítico p/diabético',
                value: 'Isocalórico p/diabético',
                proteinas: 50,
                kilocalorias: 1000
            }, {
                id: 'Crítico plus',
                value: 'Crítico plus',
                proteinas: 75,
                kilocalorias: 1500
            }, {
                id: '150/1 Yeyuno',
                value: '150/1 Yeyuno',
                proteinas: 37,
                kilocalorias: 1000
            }, {
                id: '110/1 Yeyuno',
                value: '110/1 Yeyuno',
                proteinas: 45,
                kilocalorias: 1000
            }, {
                id: 'Crítico yeyuno',
                value: 'Crítico yeyuno',
                proteinas: 60,
                kilocalorias: 1000
            }, {
                id: 'Hipercalórico',
                value: 'Hipercalórico',
                proteinas: 55,
                kilocalorias: 1500
            }, {
                id: 'Alitraq',
                value: 'Alitraq',
                proteinas: 15.8,
                kilocalorias: 302
            }];

            $scope.tipoSoporteOral = [{
                id: 'Isocalórico',
                value: 'Isocalórico',
                proteinas: 13,
                kilocalorias: 250
            }, {
                id: 'Hipercalórico',
                value: 'Hipercalórico',
                proteinas: 13,
                kilocalorias: 300
            }, {
                id: 'Hipercalórico p/renales',
                value: 'Hipercalórico p/renales',
                proteinas: 10,
                kilocalorias: 300
            }, {
                id: 'Hipercalórico c/fibra',
                value: 'Hipercalórico c/fibra',
                proteinas: 13,
                kilocalorias: 200
            }, {
                id: 'P/diabético',
                value: 'P/diabético',
                proteinas: 10,
                kilocalorias: 200
            }, {
                id: 'Hipercalórico e heperproteico',
                value: 'Hipercalórico e heperproteico',
                proteinas: 20,
                kilocalorias: 400
            }, {
                id: 'Hipograso',
                value: 'Hipograso',
                proteinas: 15,
                kilocalorias: 300
            }];

            $scope.horarios = ['7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '1', '2', '3', '4', '5', '6'];
            $scope.pasarDurante = [{
                id: '2',
                value: '2hs',
            }, {
                id: '4',
                value: '4hs',
            }, {
                id: '6',
                value: '6hs',
            }, {
                id: '8',
                value: '8hs',
            }, {
                id: '10',
                value: '10hs',
            }, {
                id: '12',
                value: '12hs',
            }, {
                id: '14',
                value: '14hs',
            }, {
                id: '16',
                value: '16hs',
            }, {
                id: '18',
                value: '18hs',
            }, {
                id: '20',
                value: '20hs',
            }, {
                id: '22',
                value: '22hs',
            }, {
                id: '24',
                value: '24hs',
            }];
        },

        // valores para los calculos de informacion nutricional
        informacionNutricionalProteinas: 0,
        informacionNutricionalKcal: 0,
        informacionNutricionalSoporteProteinas: 0,
        informacionNutricionalSoporteKcal: 0,

        // frascos
        cantidadFrascos: 0,
        _frascos: [],
        _frascosEdicion: [],

        filtros: {
            indicaciones: [],
            servicio: null,
            tipoIndicacion: [],
            activo: true,
            estado: null,
            servicio: null,
            filtrar: function() {
                var self = this;

                $scope.show_comenzar_tratamiento = ($scope.internacion.indicaciones.length) ? false : true;

                if (!self.estado) {
                    self.estado = $scope.estados[0];
                }

                if (!self.tipoIndicacion) {
                    self.tipoIndicacion = $scope.tiposIndicacionesPadre[0];
                }

                if (!self.servicio) {
                    self.servicio = $scope.servicios[0];
                }

                if ($scope.internacion.indicaciones.length > 0){

                    self.indicaciones = $scope.internacion.indicaciones.filter(function(indicacion) {
                        return (
                            (self.estado.id == 'Todas' || (indicacion.activo === self.estado.id)) &&
                            (!self.servicio.id || (self.servicio && indicacion.servicio && indicacion.servicio.id == self.servicio.id)) &&
                            (!self.tipoIndicacion.id || (self.tipoIndicacion.id == indicacion.tipoIndicacion.tipoIndicacion.id))
                        )
                    });

                    // recorremos todas las indicaciones para ejecutar acciones en comun
                    angular.forEach(self.indicaciones, function(indicacion) {
                        // sumamos el total de los frascos
                        if (indicacion.tipoIndicacion.nombre == 'Plan de hidratación parenteral') {
                            indicacion.planHidratacion.$frascos = 0;

                            // sumamos los frascos de solucion fisiologica
                            if (typeof indicacion.planHidratacion.enteralParenteral.solucionFisiologica.frascos != "undefined") {
                                indicacion.planHidratacion.$frascos += indicacion.planHidratacion.enteralParenteral.solucionFisiologica.frascos.length;
                            }
                            // sumamos los frascos de ringer-lactato
                            if (typeof indicacion.planHidratacion.enteralParenteral.ringerLactato.frascos != "undefined") {
                                indicacion.planHidratacion.$frascos += indicacion.planHidratacion.enteralParenteral.ringerLactato.frascos.length;
                            }
                            // sumamos los frascos de dextrosa
                            if (typeof indicacion.planHidratacion.enteralParenteral.dextrosa.frascos != "undefined") {
                                indicacion.planHidratacion.$frascos += indicacion.planHidratacion.enteralParenteral.dextrosa.frascos.length;
                            }

                            // si es un plan de hidratacion parenteral agregamos las clases de los frascos
                            if (indicacion.planHidratacion.enteralParenteral.agregados){
                                angular.forEach(indicacion.planHidratacion.enteralParenteral.agregados, function(agregados) {
                                    agregados['clase'] = "";
                                    angular.forEach(agregados.frascos, function(frasco) {
                                        // frascos de ringer lactato
                                        if (indicacion.planHidratacion.enteralParenteral.ringerLactato.frascos.inArray(frasco)) {
                                            agregados.clase = 'ringer-lactato';
                                        }
                                        // frascos de solucion fisiologica
                                        if (indicacion.planHidratacion.enteralParenteral.solucionFisiologica.frascos.inArray(frasco)) {
                                            agregados.clase = 'fisiologica';
                                        }
                                        // frascos de dextrosa
                                        if (indicacion.planHidratacion.enteralParenteral.dextrosa.frascos.inArray(frasco)) {
                                            if (indicacion.planHidratacion.enteralParenteral.dextrosa.dilucion == 5){
                                                agregados.clase = 'dextrosa-al-cinco';
                                            }else if (indicacion.planHidratacion.enteralParenteral.dextrosa.dilucion == 10){
                                                agregados.clase = 'dextrosa-al-diez';
                                            }
                                        }
                                    });
                                });
                            }

                        }
                    });

                    // ordenamos
                    $scope.indicaciones.ordenar();
                }
            },

        },

        init: function(internacion) {
            // buscamos la internacion
            if (internacion !== null) {
                // asignamos la internacion
                $scope.internacion = internacion;

                // inicializamos arrays para filtros y opciones
                $scope.inicializarArrays();

                // asignamos las indicaciones
                $scope.filtros.indicaciones = $scope.internacion.indicaciones;

                // filtramos
                $scope.filtros.filtrar();

                if ($scope.internacion.indicaciones.length) {
                    var services_found = [];

                    angular.forEach($scope.internacion.indicaciones, function(indicacion) {

                        // buscamos los servicios para el filtro de problemas
                        if (indicacion.servicio && indicacion.servicio.id) {
                            if (!services_found.inArray(indicacion.servicio.id)) {
                                $scope.servicios.push(indicacion.servicio);
                                services_found.push(indicacion.servicio.id);
                            }
                        }

                    });
                }

                if ($scope.internacion.drenajes.length > 0) {
                    // cargamos los drenajes al array
                    angular.forEach($scope.internacion.drenajes, function(drenaje) {
                        if (!drenaje.fechaHasta) {
                            $scope.drenajes.push(drenaje);
                        }
                    });
                }

            }


        },
        // table: {
        //     selected: [],
        //     updateSelected: function(action, id) {
        //         if (action == 'add' & $scope.table.selected.indexOf(id) == -1) $scope.table.selected.push(id);
        //         if (action == 'remove' && $scope.table.selected.indexOf(id) != -1) $scope.table.selected.splice($scope.table.selected.indexOf(id), 1);
        //     },
        //
        //     updateSelection: function($event, id) {
        //         var checkbox = $event.target;
        //         var action = (checkbox.checked ? 'add' : 'remove');
        //         $scope.table.updateSelected(action, id);
        //     },
        //
        //     selectAll: function($event) {
        //         var checkbox = $event.target;
        //         var action = (checkbox.checked ? 'add' : 'remove');
        //         for (var i = 0; i < $scope.filtros.indicaciones.length; i++) {
        //             var entity = $scope.filtros.indicaciones[i];
        //             $scope.table.updateSelected(action, entity.id);
        //         }
        //     },
        //
        //     getSelectedClass: function(data) {
        //         return $scope.table.isSelected(data.id) ? 'selected' : '';
        //     },
        //
        //     isSelected: function(id) {
        //         return $scope.table.selected.indexOf(id) >= 0;
        //     },
        //
        //     isSelectedAll: function() {
        //         return $scope.table.selected.length === $scope.filtros.indicaciones.length;
        //     }
        // },

        // actualizamos toda la lista de indicaciones de una internacion
        reload: function() {
            // buscamos la internacion
            Shared.internacion.get($scope.internacion.id).then(function(internacion) {
                $scope.internacion = internacion;

                // asignamos la lista de indicaciones
                $scope.filtros.indicaciones = internacion.indicaciones;

                if ($scope.filtros.indicaciones.length) {
                    // ocultamos el boton de comenzar tratamiento
                    $scope.show_comenzar_tratamiento = false;
                } else {
                    // mostramos el boton de comenzar tratamiento
                    $scope.show_comenzar_tratamiento = true;
                }

                // filtramos las indicaciones
                $scope.filtros.filtrar();
            });
        },

        tratamiento: {
            // comenzamos un tratamiento o lo editamos
            comenzar: function(tratamiento) {
                $scope.show_comenzar_tratamiento = false;

                $scope.indicaciones.editar();
            }
        },

        indicaciones: {
            borrar: false,

            hayQueRenovar: function(indicacion){

            },
            // setTipo: function(){
            //     var tipo = $scope.indicacion.$tipo.id;
            //     switch (tipo) {
            //         case 'Plan hidratación parenteral':
            //             $scope.indicacion.planHidratacion.enteralParenteral.tipo = "Enteral";
            //             // $scope.indicacion.planHidratacion.enteralParenteral.velocidadInfunsion.unidad = "ml/hora";
            //             break;
            //         case 'Plan hidratación enteral':
            //             $scope.indicacion.planHidratacion.enteralParenteral.tipo = "Parenteral";
            //             break;
            //         default:
            //         $scope.indicacion.tipo = $scope.indicacion.$tipo
            //     }
            //
            // },
            editar: function(indicacion) {
                accion: null,

                // mostramos formulario
                $scope.showForm = true;

                // ocultamos toolbar
                $scope.show_toolbar_indicaciones = false;

                if (indicacion) {
                    $scope.accion = "editar";
                    $scope.accionIndicacion = "editar"; // para enviar a la api

                    $scope.indicaciones.duplicar(indicacion);
                } else {
                    $scope.accion = "agregar";

                    $scope.indicacion.fecha = new Date();
                    $scope.indicacion.servicio = Session.variables.servicioActual.id;
                }
            },
            // duplicamos la informacion de la indicacion para poder
            // crear una nueva
            duplicar: function (indicacion){
                // console.log($scope.indicacion);
                // console.log(indicacion);
                angular.copy(indicacion, $scope.indicacion);
                console.log($scope.indicacion);

                // si es una edicion y ya ha sido guardado, entonces
                // deberemos crear el historial, por lo tanto seteamos
                // a null el id y mantenemos el id padre en idIndicacion
                if ($scope.indicacion.id) {

                    // guardamos la referencia de que indicacion es modificada
                    $scope.indicacion.idIndicacion = $scope.indicacion.id;

                    // limpiamos los ids
                    $scope.indicacion.id = null;
                    $scope.indicacion._id = null;

                    // como estamos copiando de un elemento existente
                    // tambien nos viene los datos de auditoria
                    // asique los limpiamos para poder cargarlos nuevamente
                    $scope.indicacion.createdAt = null;
                    $scope.indicacion.createdBy = null;
                    $scope.indicacion.updatedAt = null;
                    $scope.indicacion.updatedBy = null;

                    // seteamos el servicio actual
                    $scope.indicacion.servicio = Session.variables.servicioActual.id;
                }

                // tipo indicacion padre
                $scope.indicacion.tipo = indicacion.tipoIndicacion.tipoIndicacion;

                // cargamos el valor de tipo de solucion en caso de ser un plan de hidratacion
                if ($scope.indicacion.tipoIndicacion.nombre == 'Plan de hidratación parenteral') {

                    if ($scope.indicacion.planHidratacion.enteralParenteral.agregados.length) {
                        $scope.indicacion.planHidratacion.enteralParenteral.poseeAgregados = true;

                        angular.forEach($scope.indicacion.planHidratacion.enteralParenteral.agregados, function(agregado){
                            // agregado.tipoAgregado = Global.getById($scope.tiposAgregados, agregado.$tipoAgregado.id);
                            agregado.$tipoAgregado = Global.getById($scope.$tiposAgregados, agregado.tipoAgregado);
                        });

                    }

                    // agregamos los frascos de solucion fisiologica
                    if (typeof $scope.indicacion.planHidratacion.enteralParenteral.solucionFisiologica.frascos != "undefined") {
                        var frascos = $scope.indicacion.planHidratacion.enteralParenteral.solucionFisiologica.frascos;
                        $scope.indicacion.planHidratacion.enteralParenteral.solucionFisiologica.$frascos = [];
                        // asignamos los frascos
                        angular.forEach(frascos, function(frasco) {
                            $scope.indicacion.planHidratacion.enteralParenteral.solucionFisiologica.$frascos.push({
                                id: frasco,
                                value: frasco
                            });
                        });
                    }

                    // agregamos los frascos de ringer-lactato
                    if (typeof indicacion.planHidratacion.enteralParenteral.ringerLactato.frascos != "undefined") {
                        var frascos = $scope.indicacion.planHidratacion.enteralParenteral.ringerLactato.frascos;
                        $scope.indicacion.planHidratacion.enteralParenteral.ringerLactato.$frascos = [];
                        // asignamos los frascos
                        angular.forEach(frascos, function(frasco) {
                            $scope.indicacion.planHidratacion.enteralParenteral.ringerLactato.$frascos.push({
                                id: frasco,
                                value: frasco
                            });
                        });
                    }

                    // agregamos los frascos de dextrosa
                    if (typeof indicacion.planHidratacion.enteralParenteral.dextrosa.frascos != "undefined") {
                        var frascos = $scope.indicacion.planHidratacion.enteralParenteral.dextrosa.frascos;
                        $scope.indicacion.planHidratacion.enteralParenteral.dextrosa.$frascos = [];
                        // asignamos los frascos
                        angular.forEach(frascos, function(frasco) {
                            $scope.indicacion.planHidratacion.enteralParenteral.dextrosa.$frascos.push({
                                id: frasco,
                                value: frasco
                            });
                        });
                    }
                }

                // plan de hidratacion enteral
                if ($scope.indicacion.tipoIndicacion.nombre == 'Plan de hidratación enteral') {
                    $scope.indicacion.planHidratacion.enteralParenteral.pasarDurante = Global.getById($scope.pasarDurante, $scope.indicacion.planHidratacion.enteralParenteral.pasarDurante);
                }

                // cargamos el valor de prioridad en caso de ser una solicitud de prestacion
                if ($scope.indicacion.tipoIndicacion.nombre == 'Solicitud prestaciones') {
                    $scope.indicacion.prestaciones.prioridad = Global.getById($scope.prestaciones.prioridad, ($scope.indicacion.prestaciones.prioridad.id || $scope.indicacion.prestaciones.prioridad));
                }

                if ($scope.indicacion.tipoIndicacion.nombre == 'Cuidados generales') {
                    // $scope.indicacion.cuidadosGenerales.tipo = Global.getById($scope.tiposCuidadosGenerales, ($scope.indicacion.cuidadosGenerales.tipo.id || $scope.indicacion.prestaciones.cuidadosGenerales.tipo));
                    $scope.indicacion.cuidadosGenerales.tipo = Global.getById($scope.tiposCuidadosGenerales, ($scope.indicacion.prestaciones.cuidadosGenerales.tipo));
                }

                // cargamos el valor de tipo de preparados en caso de ser nutricion
                if ($scope.indicacion.tipoIndicacion.tipoIndicacion.nombre == 'Nutrición') {
                    if ($scope.indicacion.tipoIndicacion.nombre == 'Enteral'){
                        $scope.indicacion.nutricion.enteral.tipoPreparado.descripcion = Global.getById($scope.tipoNutricionEnteral, ($scope.indicacion.nutricion.enteral.tipoPreparado.descripcion || $scope.indicacion.nutricion.enteral.tipoPreparado.descripcion.id));
                        $scope.calcularInformacionNutricion('nutricion-enteral');
                    }

                    if ($scope.indicacion.tipoIndicacion.nombre == 'Soporte oral'){
                        $scope.indicacion.nutricion.soporteOral.tipoPreparado.descripcion = Global.getById($scope.tipoSoporteOral, ($scope.indicacion.nutricion.soporteOral.tipoPreparado.descripcion));
                        $scope.calcularInformacionNutricion('soporte-oral');
                    }
                }

                if ($scope.indicacion.tipoIndicacion.nombre == 'Oxigenoterapia') {
                    // cargamos el select con los valores de oxigenos permitidos
                    $scope.asignarOxigeno($scope.indicacion.medicamento.oxigeno.respiracion);
                    // asignamos los elementos seleccionados a los selects de respiracion y cantidad
                    $scope.indicacion.medicamento.oxigeno.respiracion = Global.getById($scope.tipoRespiracion, $scope.indicacion.medicamento.oxigeno.respiracion);
                    $scope.indicacion.medicamento.oxigeno.cantidad = Global.getById($scope.valoresOxigeno, indicacion.medicamento.oxigeno.cantidad);
                }
                // console.log($scope.indicacion);

                $scope.indicacion.servicio = Session.variables.servicioActual.id;
            },
            // Guardamos la indicacion
            guardar: function(indicacion, accion) {
                var accion = (accion) ? accion : 'guardada'

                if (indicacion.tipoIndicacion.nombre == 'Plan de hidratación parenteral') {

                    // agregamos los frascos de solucion fisiologica
                    if (typeof indicacion.planHidratacion.enteralParenteral.solucionFisiologica != "undefined"
                        && typeof indicacion.planHidratacion.enteralParenteral.solucionFisiologica.$frascos != "undefined") {
                        // transofrmamos todos los fracso del formato objeto a unicamente el campo id
                        indicacion.planHidratacion.enteralParenteral.solucionFisiologica.frascos = Global.minify(indicacion.planHidratacion.enteralParenteral.solucionFisiologica.$frascos);
                    }
                    // agregamos los frascos de ringer lactato
                    if (typeof indicacion.planHidratacion.enteralParenteral.ringerLactato != "undefined"
                        && typeof indicacion.planHidratacion.enteralParenteral.ringerLactato.$frascos != "undefined") {
                        // transofrmamos todos los fracso del formato objeto a unicamente el campo id
                        indicacion.planHidratacion.enteralParenteral.ringerLactato.frascos = Global.minify(indicacion.planHidratacion.enteralParenteral.ringerLactato.$frascos);
                    }
                    // agregamos los frascos de dextrosa
                    if (typeof indicacion.planHidratacion.enteralParenteral.dextrosa != "undefined"
                        && typeof indicacion.planHidratacion.enteralParenteral.dextrosa.$frascos != "undefined") {
                        // transofrmamos todos los fracso del formato objeto a unicamente el campo id
                        indicacion.planHidratacion.enteralParenteral.dextrosa.frascos = Global.minify(indicacion.planHidratacion.enteralParenteral.dextrosa.$frascos);
                    }

                    // if (indicacion.planHidratacion.enteralParenteral.agregados.length){
                    //
                    //     angular.forEach(indicacion.planHidratacion.enteralParenteral.agregados, function(agregado){
                    //         // agregado.tipoAgregado = Global.getById($scope.tiposAgregados, agregado.$tipoAgregado.id);
                    //         agregado.tipoAgregado = Global.minify(agregado.$tipoAgregado);
                    //     });
                    // }
                }

                if (indicacion.tipoIndicacion.nombre == "Nutrición"){
                    if (indicacion.tipoIndicacion.nombre == "Enteral") {
                        indicacion.nutricion.enteral.tipoPreparado.descripcion = Global.minify(indicacion.nutricion.enteral.tipoPreparado.descripcion);
                    }
                    if (indicacion.tipoIndicacion.nombre == "Soporte oral") {
                        indicacion.nutricion.soporteOral.tipoPreparado.descripcion = Global.minify(indicacion.nutricion.soporteOral.tipoPreparado.descripcion);
                    }
                }

                if (indicacion.tipoIndicacion.nombre == "Oxigenoterapia"){
                    indicacion.medicamento.oxigeno.respiracion = Global.minify(indicacion.medicamento.oxigeno.respiracion);
                    indicacion.medicamento.oxigeno.cantidad = Global.minify(indicacion.medicamento.oxigeno.cantidad);
                }

                console.log(indicacion);
                indicacion.accion = $scope.accionIndicacion;
                return Shared.indicaciones.post($scope.internacion.id, null, indicacion, {
                // return Shared.indicaciones.post($scope.internacion.id, $scope.indicacion.idIndicacion || null, $scope.indicacion, {
                    minify: false
                }).then(function(data) {
                    Plex.alert('Indicacion ' + accion);

                    // actualizamos el listado de indicaciones completo
                    // $scope.indicaciones.actualizar(data);
                    $scope.reload();

                    // vaciamos el formulario
                    $scope.indicacion = {};

                    // ocultamos el formulario
                    $scope.showForm = false;

                    // mostramos toolbar
                    $scope.show_toolbar_indicaciones = true;

                });

            },
            // renovar indicacion
            renovar: function (indicacion){
                $scope.accionIndicacion = "renovar"; // para enviar a la api
                // console.log($scope.indicacion);
                $scope.indicaciones.duplicar(indicacion);
                // console.log($scope.indicacion);
                $scope.indicaciones.guardar($scope.indicacion, 'renovada');
            },

            // suspender una indicacion
            suspender: function(indicacion) {
                $scope.indicaciones.borrar = true;
                $scope.indicacionBorrar = indicacion;
            },

            // cancelar la suspension de una indicacion
            cancelarSuspender: function() {
                $scope.indicaciones.borrar = false;
            },

            // confirmar borrado y actualizar indicacion
            confirmarBorrado: function(indicacion) {
                $scope.accionIndicacion = "suspender"; // para enviar a la api
                // seteamos el valor activo en false
                indicacion.activo = false;

                // guardamos la indicacion
                $scope.indicaciones.guardar(indicacion, 'suspendida');
                $scope.indicaciones.borrar = false;
            },

            // buscamos la ultima posicion en el array de indicaciones segun
            // el tipo de indicacion que vamos a agregar
            getLastPositionOf: function(key) {
                var last_position = 0;
                var length = $scope.filtros.indicaciones.length;

                for (var i = 0; i < length; i++) {
                    if ($scope.filtros.indicaciones[i].tipoIndicacion.nombre == key) {
                        last_position = i;
                    }
                }
                // console.log("Last: " + last_position);
                return (last_position > 0) ? last_position : -1;
            },
            ordenar: function() {
                // el orden pedido para las indicaciones es el que vienen
                // usando hace años ya medicos y enfermeros y debera seguir
                // apareciendo en el siguiente orden:
                // 1. Plan de Hidratacion Parenteral
                // 2. Heparina o profilaxis
                // 3. Protección gástrica
                // 4. Antibióticos
                // 5. Otra medicacion
                // 6. De aca en adelante cualquier tipo de indicacion

                var indicacionesOrdenadas = [];

                angular.forEach($scope.filtros.indicaciones, function(_indicacion) {
                    // console.log(_indicacion);
                    var nombre = (typeof _indicacion.tipoIndicacion.nombre != "undefined") ? _indicacion.tipoIndicacion.nombre : _indicacion.tipoIndicacion;

                    // si es heparina o profilaxis los enviamos debajo del Plan de hidratacion
                    if (nombre == 'Heparina o profilaxis') {

                        var last_position = $scope.indicaciones.getLastPositionOf('Plan de hidratación parenteral');
                        last_position = (last_position == -1) ? 0 : last_position;

                        if (last_position == -1) {
                            var last_position = $scope.indicaciones.getLastPositionOf('Plan de hidratación enteral');
                            last_position = (last_position == -1) ? 0 : last_position;
                        }

                        if (last_position == -1) {
                            var last_position = $scope.indicaciones.getLastPositionOf('Plan de hidratación oral');
                            last_position = (last_position == -1) ? 0 : last_position;
                        }

                    }

                    // si es proteccion gastrica los enviamos debajo de heparina
                    // o profilaxis en caso que existan, y si no debajo del Plan de hidratacion
                    if (nombre == 'Protección gástrica') {
                        var last_position = $scope.indicaciones.getLastPositionOf('Heparina o profilaxis');
                        // si no encontramos heparina o profilaxis, entonces
                        // lo colocamos debajo del plan de hidratacion
                        if (last_position == -1) {
                            var last_position = $scope.indicaciones.getLastPositionOf('Plan de hidratación parenteral');

                            // si encontramos plan de hidratacion, entonces lo ponemos debajo
                            // si no, lo ponemos al principio
                            last_position = (last_position == -1) ? 0 : last_position;
                        }
                    }

                    // si es Antibióticos los enviamos debajo de Proteccion gastrica
                    // o profilaxis en caso que existan, y si no debajo del Plan de hidratacion
                    if (nombre == 'Antibióticos') {
                        var last_position = $scope.indicaciones.getLastPositionOf('Protección gástrica');
                        // si no encontramos proteccion gastrica, entonces
                        // lo colocamos debajo de heparina o profilaxis

                        if (last_position == -1) {
                            var last_position = $scope.indicaciones.getLastPositionOf('Heparina o profilaxis');

                            // si encontramos heparina o profilaxis, entonces lo ponemos debajo
                            // si no, lo ponemos al principio
                            last_position = (last_position == -1) ? 0 : last_position;
                        }

                        if (last_position == -1) {

                            var last_position = $scope.indicaciones.getLastPositionOf('Plan de hidratación parenteral');

                            // si encontramos plan de hidratacion, entonces lo ponemos debajo
                            // si no, lo ponemos al principio
                            last_position = (last_position == -1) ? 0 : last_position;
                        }

                        if (last_position == -1) {
                            var last_position = $scope.indicaciones.getLastPositionOf('Plan de hidratación enteral');
                            last_position = (last_position == -1) ? 0 : last_position;
                        }

                        if (last_position == -1) {
                            var last_position = $scope.indicaciones.getLastPositionOf('Plan de hidratación oral');
                            last_position = (last_position == -1) ? 0 : last_position;
                        }
                    }

                    // si es un plan de hidratacion, los enviamos al principio
                    if (nombre == 'Plan de hidratación parenteral' || nombre == 'Plan de hidratación enteral' || nombre == 'Plan de hidratación oral') {
                        indicacionesOrdenadas.unshift(_indicacion);
                    } else {
                        // guardamos en una posicion determinada
                        if (last_position >= 0) {
                            indicacionesOrdenadas.splice(last_position + 1, 0, _indicacion);
                        } else {
                            // o si no hay posicion, lo mandamos al final del array
                            indicacionesOrdenadas.push(_indicacion);
                        }
                    }

                });

                // asignamos las indicaciones ordenadas al listado
                $scope.filtros.indicaciones = indicacionesOrdenadas;

                angular.forEach($scope.filtros.indicaciones, function(indicacion) {

                    // agregamos el array de horarios a marcar
                    indicacion.horarios = [];

                    // determinamos en que momento comienza
                    var fecha = new Date(indicacion.fechaHora || indicacion.createdAt);
                    var proximo = parseInt(fecha.getHours());

                    angular.forEach($scope.horarios, function(hora) {

                        // si la hora es igual al horario de la proxima indicacion
                        // entonces marcamos el horario en la tabla
                        if (hora == proximo ) {
                            //    indicacion.horarios[hora] = '<span class="tips" title="bla bla bal" >I</span>';
                            indicacion.horarios[hora] = {
                                text: 'i',
                                title: 'Indicación pedida por ' + indicacion.createdBy.name + ' a las ' + $filter('date')(indicacion.createdAt, "dd/MM/yyyy HH:mm") + ' hs'
                            }

                            // if (indicacion.frecuencia != 'unica' || indicacion.frecuencia != '24') {
                            //     // sumamos a la hora marcada la frecuencia
                            //     proximo = parseInt(hora) + parseInt(indicacion.frecuencia);
                            //
                            //     if (proximo > 24) {
                            //         proximo = proximo - 24;
                            //     }
                            // }
                        }
                    });

                    // agregamos el array de horarios de voluciones a marcar
                    indicacion.evoluciones = [];

                    // recorremos el listado de evoluciones para saber si
                    // esta indicacion fue evolucionada y en que horarios
                    angular.forEach($scope.internacion.evoluciones, function(evolucion){
                        // si la fecha es la del dia actual, entonces marcamos
                        // el horario en que fue realizada
                        if (moment(moment(new Date()).format('YYYY-MM-DD')).isSame(moment(new Date(evolucion.createdAt)).format('YYYY-MM-DD'))){
                            if (evolucion.idIndicacion == indicacion.id){
                                // determinamos en que momento comienza
                                var fecha = new Date(evolucion.fechaHora || evolucion.createdAt);
                                var hora = parseInt(fecha.getHours());

                                indicacion.evoluciones[hora] = {
                                    text: 'r',
                                    title: 'Realizada por ' + evolucion.createdBy.name + ' a las ' + $filter('date')(evolucion.createdAt, "dd/MM/yyyy HH:mm") + ' hs'
                                }
                            }
                        }
                    });

                });
            },

            // actualizamos el listado de indicaciones
            actualizar: function(indicacion) {
                var found = false;
                $scope.loading = true;

                var length = $scope.internacion.indicaciones.length;

                // buscamos la cama y actualizamos el valor con los datos
                for (var i = 0; i < length; i++) {
                    if ($scope.internacion.indicaciones[i].id === indicacion.id) {
                        // indicacion encontrada, actualizamos datos
                        $scope.internacion.indicaciones[i] = indicacion;
                        found = true;
                        break;
                    }
                }

                // si no lo encontro, entonces es porque acaba de cargarla
                // se la asignamos al resto de las indicaciones
                if (!found) {
                    $scope.internacion.indicaciones.push(indicacion);
                }

                $scope.loading = false;

                $scope.filtros.filtrar();
            },

            // cancelamos la creacion/edicion de un formulario
            cancelar: function() {
                // vaciamos el formulario
                $scope.indicacion = {};

                // mostramos toolbar
                $scope.show_toolbar_indicaciones = true;

                // ocultamos el formulario
                $scope.showForm = false;

                // filtramos las evoluciones
                $scope.filtros.filtrar();
            },

            // evolucionar indicacion
            evolucion: {
                // Cancelar la edición
                cancelar: function() {
                    // seteamos a null las variables para la edicion
                    $scope.evolucionesEdit = null;
                    $scope.evolucionarIndicacion = null;

                    // ocultamos formulario de indicaciones y ocultamos toolbar
                    $scope.showForm = false;
                    $scope.show_toolbar_indicaciones = true;
                },

                // Guarda la evolución
                guardar: function() {
                    // si se han evolucionado los drenajes entonces los cargamos
                    if ($scope.drenajes.length > 0) {
                        // $scope.evolucionesEdit.balance.egresos = {
                        //     drenajes: []
                        // };
                        $scope.evolucionesEdit.balance.egresos['drenajes'] = [];

                        angular.forEach($scope.drenajes, function(drenaje) {
                            var _drenaje = {
                                idDrenaje: drenaje.idDrenaje,
                                caracteristicaLiquido: drenaje.caracteristicaLiquido,
                                cantidad: drenaje.cantidad,
                                observaciones: drenaje.observaciones,
                            }
                            $scope.evolucionesEdit.balance.egresos.drenajes.push(_drenaje);
                        });

                    }

                    // si no tenemos la descripcion cargada, le asignamos automaticamente
                    // el tipo de indicacion que estamos evolucionesEdit
                    // if ($scope.evolucionesEdit.texto){
                    //     var _indicacion = $scope.internacion.indicaciones.filter(function(i){
                    //         return (i.id == $scope.evolucionesEdit.idIndicacion);
                    //     });
                    //
                    //     $scope.evolucionesEdit.texto = _indicacion[0].tipo;
                    //     console.log(_indicacion[0]);
                    //     switch(_indicacion[0].tipo){
                    //         case 'Controles':
                    //             $scope.evolucionesEdit.texto += " - " + _indicacion[0].controles.tipo;
                    //         break;
                    //         case 'Cuidados generales':
                    //             $scope.evolucionesEdit.texto += " - " +  _indicacion[0].cuidadosGenerales.tipo;
                    //         break;
                    //         case 'Cuidados especiales':
                    //             $scope.evolucionesEdit.texto += " - " +  _indicacion[0].cuidadosEspeciales.tipo;
                    //         break;
                    //     }
                    // }

                    if ($scope.evolucionesEdit.texto){
                        var _indicacion = $scope.internacion.indicaciones.filter(function(i){
                            return (i.id == $scope.evolucionesEdit.idIndicacion);
                        });

                        $scope.evolucionesEdit.texto = _indicacion[0].tipoIndicacion.nombre;
                        switch(_indicacion[0].tipoIndicacion.nombre){
                            // case 'Controles':
                            //     $scope.evolucionesEdit.texto += " - " + _indicacion[0].controles.tipo;
                            // break;
                            //
                            // case 'Cuidados generales':
                            //     $scope.evolucionesEdit.texto += " - " + _indicacion[0].cuidadosGenerales.tipo;
                            // break;
                            //
                            // case 'Cuidados especiales':
                            //     $scope.evolucionesEdit.texto += " - " + _indicacion[0].cuidadosEspeciales.tipo;
                            // break;
                            case 'Oxigenoterapia':
                                if (_indicacion[0].oxigeno.accion == "Colocación"){
                                    if (_indicacion[0].oxigeno.respiracion == 'Mascara'){
                                        $scope.evolucionesEdit.texto += _indicacion[0].oxigeno.accion + " - " + "máscara al " + _indicacion[0].oxigeno.cantidad + "%";
                                    }else if(_indicacion[0].oxigeno.respiracion == 'Bigotera'){
                                        $scope.evolucionesEdit.texto += _indicacion[0].oxigeno.accion + " - " + "bigotera a " + _indicacion[0].oxigeno.cantidad + "lt/min";
                                    }
                                } else if (_indicacion[0].oxigeno.accion == "Extracción"){
                                    $scope.evolucionesEdit.texto += "Extracción de suministro de oxígeno";
                                }

                            break;

                            case 'Antibióticos':
                            case 'Heparina o profilaxis':
                            case 'Protección gástrica':
                            case 'Otra medicación':
                                $scope.evolucionesEdit.texto += " - " + $scope.evolucionesEdit.medicamento.descripcion;
                            break;
                        }
                    }

                    // calculamos valores de glasgow
                    if ($scope.evolucionesEdit.glasgow) {
                        $scope.evolucionesEdit.glasgow.total = $scope.evolucionesEdit.glasgow.motor + $scope.evolucionesEdit.glasgow.verbal + $scope.evolucionesEdit.glasgow.ocular;
                    }
                    // calculamos valores de riesgo de caidas
                    if ($scope.evolucionesEdit.riesgoCaida) {
                        $scope.evolucionesEdit.riesgoCaida.total = $scope.evolucionesEdit.riesgoCaida.caidasPrevias + $scope.evolucionesEdit.riesgoCaida.marcha + $scope.evolucionesEdit.riesgoCaida.ayudaDeambular + $scope.evolucionesEdit.riesgoCaida.venoclisis + $scope.evolucionesEdit.riesgoCaida.comorbilidad + $scope.evolucionesEdit.riesgoCaida.estadoMental;
                    }
                    // calculamos valores de riesgo de ulceras por presion
                    if ($scope.evolucionesEdit.riesgoUPP) {
                        $scope.evolucionesEdit.riesgoUPP.total = $scope.evolucionesEdit.riesgoUPP.estadoFisico + $scope.evolucionesEdit.riesgoUPP.estadoMental + $scope.evolucionesEdit.riesgoUPP.actividad + $scope.evolucionesEdit.riesgoUPP.movilidad + $scope.evolucionesEdit.riesgoUPP.incontinencia;
                        // if ($scope.elements.length){
                        //     $scope.evolucionesEdit.riesgoUPP.lesiones = $scope.elements;
                        // }
                    }

                    // hemoterapia
                    if ($scope.evolucionesEdit.hemoterapia) {
                        var hemoterapia = {
                            hemoterapia: $scope.evolucionesEdit.hemoterapia
                        };
                        $scope.evolucionesEdit.balance.ingresos.push(hemoterapia);
                    }

                    // aislamiento
                    if ($scope.evolucionesEdit.tipoIndicacion.nombre == 'Cuidados especiales') {

                        if (_indicacion[0].cuidadosEspeciales.tipo == 'Aislamiento') {
                            $scope.evolucionesEdit.aislamiento['realizado'] = true;
                        }
                    }

                    Shared.evolucion.post($scope.internacion.id, $scope.evolucionesEdit.id || null, $scope.evolucionesEdit, {
                        minify: true
                    }).then(function(data) {
                        Plex.alert('Evolución guardada');

                        // agregamos la evolucion a la internacion
                        // $scope.include.internacion.evoluciones.push(data);

                        $scope.reload();

                        // actualizamos el listado de evoluciones
                        $scope.indicaciones.evolucion.cancelar();
                    });
                },
            },
            evolucionar: function(indicacion) {
                // cambiamos el titulo
                $scope.titulo = "Evolucionar indicaciones";

                // mostramos el formulario de evoluciones
                // $scope.showFormEvolucion = true; // borrar
                //
                // ocultamos formulario de indicaciones y ocultamos toolbar
                $scope.showForm = false;
                $scope.show_toolbar_indicaciones = false;

                // angular.copy(indicacion, $scope.evolucionarIndicacion);
                $scope.evolucionarIndicacion = indicacion;
                $scope.evolucionesEdit = {
                    idIndicacion: indicacion.id,
                    _indicacion: indicacion,
                    tipoIndicacion: (indicacion.tipoIndicacion.id) ? indicacion.tipoIndicacion.id : '',
                    fechaHora: new Date(),
                    // tipo: Session.variables.prestaciones_workflow,
                    tipo: indicacion.tipo,
                    servicio: Session.variables.servicioActual.id,
                    texto: indicacion.tipo,
                };

                if (indicacion.tipoIndicacion.tipoIndicacion.nombre == 'Controles') {
                    $scope.evolucionesEdit.balance = {
                        ingresos: []
                    };
                }else if (indicacion.tipoIndicacion.tipoIndicacion.nombre == 'Medicamentos'
                        && indicacion.tipoIndicacion.nombre != 'Oxigenoterapia'){

                        $scope.evolucionesEdit.medicamento = {
                            suministrado: true,
                            descripcion: indicacion.medicamento.descripcion
                        }
                }else if (indicacion.tipoIndicacion.nombre == 'Oxigenoterapia'){

                    if (indicacion.medicamento.oxigeno.accion == "Colocación"){
                        if (indicacion.medicamento.oxigeno.respiracion == 'Mascara'){
                            var descripcion = indicacion.medicamento.oxigeno.accion + " máscara al " + indicacion.medicamento.oxigeno.cantidad + " %";
                        }else if (indicacion.medicamento.oxigeno.respiracion == 'Bigotera'){
                            var descripcion = indicacion.medicamento.oxigeno.accion + " bigotera a " + indicacion.medicamento.oxigeno.cantidad + " lt/min";
                        }
                    } else if (indicacion.medicamento.oxigeno.accion == "Extracción"){
                        var descripcion = "Extracción de suministro de oxígeno";
                    }

                    $scope.evolucionesEdit.medicamento = {
                        suministrado: true,
                        descripcion: descripcion
                    }
                }else if (indicacion.tipoIndicacion.tipoIndicacion.nombre == 'Cuidados generales'){
                    // if (indicacion.cuidadosGenerales.tipo == 'Rotar decúbito'){
                    //     $scope.evolucionesEdit.rotarDecubito = {
                    //         puntoApoyo: 'Izquierdo',
                    //         posicion: 'Dorsal'
                    //     }
                    // }
                }else if ($scope.evolucionesEdit.tipo == 'Cuidados especiales') {

                    if (indicacion.cuidadosEspeciales.tipo == 'Aislamiento') {
                        $scope.evolucionesEdit.aislamiento = {};
                    }
                }else if (indicacion.tipo == 'Otra indicación'){
                    $scope.evolucionesEdit.otraIndicacion = {
                        realizado: true,
                        descripcion: descripcion
                    }
                }

                // // array de indicaciones donde almacenamos el tipo
                // var indicaciones = [];
                // //
                // if ($scope.table.selected.length) {
                //     angular.forEach($scope.table.selected, function(idIndicacion) {
                //         angular.forEach($scope.filtros.indicaciones, function(indicacion) {
                //             if (indicacion.id == idIndicacion) {
                //                 $scope.indicacionesEvolucionar.push(indicacion);
                //             }
                //         });
                //     });
                // }

            },

            // AGREAGADOS
            agregados: {
                // creacion o edicion de un agregado
                editar: function(agregado) {

                    if (typeof $scope.agregado.frascos == "undefined") {
                        $scope.agregado.frascos = [];
                    }

                    if (!agregado) {
                        // si no se han agregado aun, inicializamos el array de agregados
                        if (typeof $scope.indicacion.planHidratacion.enteralParenteral.agregados == "undefined") {
                            $scope.indicacion.planHidratacion.enteralParenteral.agregados = [];
                        }

                        // $scope.agregado.posicion = $scope.indicacion.planHidratacion.agregados.length;
                        $scope.agregado.posicion = (typeof $scope.indicacion.planHidratacion.enteralParenteral.agregados !== "undefined") ? $scope.indicacion.planHidratacion.enteralParenteral.agregados.length : 0;

                        // asignamos los frascos al agregado
                        angular.forEach($scope.agregado._frascos, function(frasco) {
                            $scope.agregado.frascos.push(frasco.id);
                        });

                        // obtenemos el id del tipo de agregado
                        $scope.agregado.tipoAgregado = Global.minify($scope.agregado.$tipoAgregado);

                        // agregamos al plan de hidratacion
                        $scope.indicacion.planHidratacion.enteralParenteral.agregados.push($scope.agregado);
                        $scope.agregado = {};
                    } else {
                        // asignamos para editar el agregado
                        $scope.editandoAgregado = true;

                        // creamos una copia del agregado
                        $scope.agregado = angular.copy(agregado);

                        // seleccionamos el tipo de agregado
                        $scope.agregado.$tipoAgregado = Global.getById($scope.tiposAgregados, (agregado.tipoAgregado.id || agregado.tipoAgregado));

                        $scope.agregado._frascos = [];
                        // asignamos los frascos
                        angular.forEach($scope.agregado.frascos, function(frasco) {
                            $scope.agregado._frascos.push({
                                id: frasco,
                                value: frasco
                            });
                        });

                    }
                },

                // guardamos la edicion de un agregado
                guardar: function(agregado) {
                    var encontrado = false;

                    angular.forEach($scope.indicacion.planHidratacion.enteralParenteral.agregados, function(_agregado, index) {

                        if (!encontrado) {
                            if (agregado.posicion == _agregado.posicion) {

                                agregado.frascos = [];
                                angular.forEach(agregado._frascos, function(frasco) {
                                    $scope.agregado.frascos.push(frasco.id);
                                });

                                // obtenemos el id del tipo de agregado
                                agregado.tipoAgregado = Global.minify(agregado.$tipoAgregado);

                                $scope.indicacion.planHidratacion.enteralParenteral.agregados[index] = agregado;
                                encontrado = true;
                            }
                        }

                    });

                    $scope.editandoAgregado = false;
                    $scope.agregado = {};
                },
                cancelar: function() {
                    $scope.editandoAgregado = false;
                    $scope.agregado = {};
                }
            },

            //
            prestaciones: {
                prioridad: [{
                    id: 'No prioritario',
                    nombre: 'No prioritario'
                }, {
                    id: 'Urgente',
                    nombre: 'Urgente'
                }, {
                    id: 'Emergencia',
                    nombre: 'Emergencia'
                }],
                buscarTipoPrestacion: function(query) {
                    // buscamos todos las prestaciones para cargar el select con las opciones
                    var buscar = {
                        nombre: query
                    }

                    return Shared.tipoPrestaciones.get(buscar);
                },
            }

        },

        // funciones varias

        // mostramos tablas de informacion nutricional
        calcularInformacionNutricion: function(tipo) {
            if (tipo == 'nutricion-enteral') {

                var tipoPreparado = $scope.indicacion.nutricion.enteral.tipoPreparado.descripcion != "undefined" ? $scope.indicacion.nutricion.enteral.tipoPreparado.descripcion : null;
                var cantidad = $scope.indicacion.nutricion.enteral.cantidad != "undefined" ? $scope.indicacion.nutricion.enteral.cantidad : null;

                if (tipoPreparado && cantidad) {
                    // los calculos estan basados siempre sobre 1000ml de preparado
                    $scope.informacionNutricionalProteinas = cantidad * tipoPreparado.proteinas / 1000;
                    $scope.informacionNutricionalKcal = cantidad * tipoPreparado.kilocalorias / 1000;
                }
            } else if (tipo == 'soporte-oral') {
                var tipoPreparado = $scope.indicacion.nutricion.soporteOral.tipoPreparado.descripcion != "undefined" ? $scope.indicacion.nutricion.soporteOral.tipoPreparado.descripcion : null;
                var cantidad = $scope.indicacion.nutricion.soporteOral.cantidad != "undefined" ? $scope.indicacion.nutricion.soporteOral.cantidad : null;

                if (tipoPreparado && cantidad) {
                    // los calculos estan basados siempre sobre 1000ml de preparado
                    $scope.informacionNutricionalSoporteProteinas = cantidad * tipoPreparado.proteinas / 1000;
                    $scope.informacionNutricionalSoporteKcal = cantidad * tipoPreparado.kilocalorias / 1000;
                }
            }
        },
        deshabilitarOpcion: function(current){
            var opciones = ['nadaPorBoca', 'ayuno', 'general', 'sinSal',
                'acompanante', 'pediatrico', 'licuado', 'blandoConCarne03',
                'blandoSinCarne02', 'liquido01', 'individual',
                'hepatoGastroProtectora', 'astringente', 'sinGluten',
                'hipocalorico', 'insuficienciaRenal', 'todoCocido',
                'hiperConColacion', 'blandoMecanico', 'ricoEnResiduo',
                'diabetico'
            ];

            if (typeof $scope.indicacion.nutricion == "undefined"){
                return false;
            }

            // console.log($scope.indicacion.nutricion.tipo);
            // if (typeof $scope.indicacion.nutricion.tipo != "undefined"){
            //     if ($scope.indicacion.nutricion.tipo == 'nadaPorBoca'){
            //         return true;
            //     }
            // }

            angular.forEach(opciones, function(opcion){
                if ($scope.indicacion.nutricion.oral.nadaPorBoca){
                    return true;
                }
            });

            // nadaPorBoca
            // ayuno
            // general
            // sinSal
            // acompanante
            // pediatrico
            // licuado
            // blandoConCarne03
            // blandoSinCarne02
            // liquido01
            // individual
            // hepatoGastroProtectora
            // astringente
            // sinGluten
            // hipocalorico
            // insuficienciaRenal
            // todoCocido
            // hiperConColacion
            // blandoMecanico
            // ricoEnResiduo
            // diabetico
            return false;
        }

    });

    $scope.asignarOxigeno = function(tipo){
        // alert("yes");
        var valoresMascara = [24, 28, 30, 35, 40, 50, 60, 70, 80, 98, 100];
        var valoresBigotera = [0.5, 1, 2, 3, 4];

        // var tipo = $scope.indicacion.medicamento.oxigeno.respiracion;
        $scope.indicacion.medicamento.oxigeno.cantidad = "";
        $scope.valoresOxigeno = [];

        if (tipo == 'Mascara' || tipo == 'Máscara') {
            angular.forEach(valoresMascara, function(valor) {
                $scope.valoresOxigeno.push({
                    id: valor,
                    value: valor + '%'
                });
            });
        } else if (tipo == 'Bigotera') {
            angular.forEach(valoresBigotera, function(valor) {
                $scope.valoresOxigeno.push({
                    id: valor,
                    value: valor + 'lt/min'
                });
            });
        }
    };

    // cargamos los valores para los cuidados de oxigenos dependiendo el tipo de mascara
    // $scope.$watch('indicacion.medicamento.oxigeno.respiracion', function(current, old) {
    //
    //     if (current && current.tipo) {
    //         $scope.asignarOxigeno(current.tipo);
    //     }
    // });

    // creamos las opciones para los arrays de seleccion de frascos
    $scope.$watch('cantidadFrascos', function(current, old) {
        if (current) {
            $scope._frascos = [];

            if (current > 0){
                for (var i = 1; i <= current; i++) {
                    $scope._frascos.push({
                        id: i,
                        value: i
                    });
                }
            }else{
                $scope.indicacion.planHidratacion.enteralParenteral.dextrosa.$frascos = [];
                $scope.indicacion.planHidratacion.enteralParenteral.solucionFisiologica.$frascos = [];
                $scope.indicacion.planHidratacion.enteralParenteral.ringerLactato.$frascos = [];

                // $scope.indicacion.planHidratacion.enteralParenteral.dextrosa.frascos = [];
                // $scope.indicacion.planHidratacion.enteralParenteral.solucionFisiologica.frascos = [];
                // $scope.indicacion.planHidratacion.enteralParenteral.ringerLactato.frascos = [];
            }
        }

    });

    // calculamos la cantidad de frascos en base a los volumenes cargados
    $scope.$watch('indicacion.planHidratacion.enteralParenteral.dextrosa.cantidad + indicacion.planHidratacion.enteralParenteral.solucionFisiologica.cantidad + indicacion.planHidratacion.enteralParenteral.ringerLactato.cantidad', function(current, old) {
        if (current) {

            var total = 0;

            if (typeof $scope.indicacion.planHidratacion.enteralParenteral.dextrosa != "undefined") {

                if (typeof $scope.indicacion.planHidratacion.enteralParenteral.dextrosa.dilucion == "undefined") {
                    $scope.indicacion.planHidratacion.enteralParenteral.dextrosa.dilucion = 5;
                }

                total += parseInt($scope.indicacion.planHidratacion.enteralParenteral.dextrosa.cantidad) || 0;
            }

            if (typeof $scope.indicacion.planHidratacion.enteralParenteral.solucionFisiologica != "undefined") {
                total += parseInt($scope.indicacion.planHidratacion.enteralParenteral.solucionFisiologica.cantidad) || 0;
            }

            if (typeof $scope.indicacion.planHidratacion.enteralParenteral.ringerLactato != "undefined") {
                total += parseInt($scope.indicacion.planHidratacion.enteralParenteral.ringerLactato.cantidad) || 0;
            }

            $scope.cantidadFrascos = Math.ceil((total / 500));
        }
    });

    // cuando cambiamos el tipo de indicacion
    $scope.$watch('indicacion.tipo', function(current, old) {
        // inicializamos los valores para el plan de hidratacion
        if (typeof current != "undefined") {
            if (typeof $scope.indicacion.id == "undefined") {
                $scope.indicacion.planHidratacion = {}
            }
        }
    });

    $scope.$watch('indicacion.nutricion.oral', function(current, old) {

        if (typeof current != "undefined") {
            $scope.deshabilitarOpcion();
            if (current.nadaPorBoca){

            }

        }
    });

    // inicializamos mediante el watch de la variable incluida
    $scope.$watch('include.internacion', function(current, old) {
        $scope.init(current);
    });
    // $scope.$watch('internacion', function(current, old) {
    //     console.log("CURRENT: ", current);
    //     alert("yes cambios yes");
    // });
}]);
