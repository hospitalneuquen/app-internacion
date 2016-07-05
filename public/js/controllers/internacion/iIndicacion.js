angular.module('app').controller('internacion/iIndicacion', ['$scope', 'Plex', 'Shared', 'Server', 'Session', 'Global', function($scope, Plex, Shared, Server, Session, Global) {
    'use strict';

    angular.extend($scope, {
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

        indicacionesEvolucionar: [],
        evolucionesEdit: undefined, // Item actual que se está editando

        drenajes: [],

        horarios: ['7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '1', '2', '3', '4', '5', '6'],
        pasarDurante: [{
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
        }],

        tiposIndicaciones: [{
            id: '',
            nombre: 'Seleccione indicación'
        }, {
            id: 'Plan hidratación parenteral',
            nombre: 'Plan hidratación parenteral'
        }, {
            id: 'Plan hidratación enteral',
            nombre: 'Plan hidratación enteral'
        }, {
            id: 'Plan hidratación oral',
            nombre: 'Plan hidratación oral'
        }, {
            id: 'Antibióticos',
            nombre: 'Antibióticos'
        }, {
            id: 'Heparina o profilaxis',
            nombre: 'Heparina o profilaxis'
        }, {
            id: 'Protección gástrica',
            nombre: 'Protección gástrica'
        }, {
            id: 'Otra medicación',
            nombre: 'Otra medicación'
        }, {
            id: 'Controles',
            nombre: 'Controles'
        }, {
            id: 'Cuidados generales',
            nombre: 'Cuidados generales'
        }, {
            id: 'Cuidados especiales',
            nombre: 'Cuidados especiales'
        }, {
            id: 'Nutrición',
            nombre: 'Nutrición'
        }, {
            id: 'Solicitud prestaciones',
            nombre: 'Solicitud prestaciones'
        }, {
            id: 'Otra indicación',
            nombre: 'Otra indicación'
        }],

        // array de estados para filtrar en la vista
        estados: [{
            id: true,
            nombre: 'Activas'
        }, {
            id: false,
            nombre: 'Suspendidas'
        }, {
            id: 'Todas',
            nombre: 'Todas'
        }],
        // array de servicios para filtrar en la vista
        servicios: [{
            id: '',
            nombreCorto: 'Todos'
        }],

        tiposControles: [],

        tiposCuidadosGenerales: [{
            id: 'Rotar decubito',
            nombre: 'Rotar decubito'
        }, {
            id: 'Aspirar secreciones',
            nombre: 'Aspirar secreciones'
        }, {
            id: 'Oxígeno',
            nombre: 'Oxígeno'
        }, {
            id: 'Cabecera 45º',
            nombre: 'Cabecera 45º'
        }, {
            id: 'Colchón aire',
            nombre: 'Colchón aire'
        }],
        // tiposSoluciones: [{
        //     id: 'Solución fisiológica',
        //     nombre: 'Solución fisiológica'
        // }, {
        //     id: 'Dextrosa',
        //     nombre: 'Dextrosa'
        // }, {
        //     id: 'Ringer-Lactato',
        //     nombre: 'Ringer-Lactato'
        // }],

        tiposAgregados: [{
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
        }],

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

        tipoRespiracion: [{
            id: 'Mascara',
            tipo: 'Máscara'
        }, {
            id: 'Bigotera',
            tipo: 'Bigotera'
        }, {
            id: 'Reservorio',
            tipo: 'Reservorio'
        }],
        valoresOxigeno: [],

        tipoNutricionEnteral: [{
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
        }],

        tipoSoporteOral: [{
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
        }],

        //
        informacionNutricionalProteinas: 0,
        informacionNutricionalKcal: 0,
        informacionNutricionalSoporteProteinas: 0,
        informacionNutricionalSoporteKcal: 0,


        cantidadFrascos: 0,
        _frascos: [],
        _frascosEdicion: [],

        filtros: {
            indicaciones: [],
            servicio: null,
            tipoIndicacion: null,
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
                    self.tipoIndicacion = $scope.tiposIndicaciones[0];
                }

                if (!self.servicio) {
                    self.servicio = $scope.servicios[0];
                }

                self.indicaciones = $scope.internacion.indicaciones.filter(function(indicacion) {
                    return (
                        (self.estado.id == 'Todas' || (indicacion.activo === self.estado.id)) &&
                        (!self.servicio.id || (self.servicio && indicacion.servicio && indicacion.servicio.id == self.servicio.id)) &&
                        (!self.tipoIndicacion.id || (self.tipoIndicacion && indicacion.tipo && indicacion.tipo == self.tipoIndicacion.id))
                    )
                });

                // recorremos todas las indicaciones para ejecutar acciones en comun
                angular.forEach(self.indicaciones, function(indicacion) {
                    // sumamos el total de los frascos
                    if (indicacion.tipo == 'Plan hidratación parenteral') {
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
                    }
                });

                // ordenamos
                $scope.indicaciones.ordenar();
            },

        },

        init: function(internacion) {
            // buscamos la internacion
            if (internacion !== null) {
                // asignamos la internacion
                $scope.internacion = internacion;

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
                // $scope.show_comenzar_tratamiento = ($scope.internacion.indicaciones.length) ? true : false;

                // cargamos los valores permitidos para los tipos de controles
                if ($scope.tiposControles.length == 0) {
                    $scope.tiposControles = [];
                    // buscamos los tipos de indicaciones disponibles
                    Server.get("/api/internacion/internacion/indicacion/tipos/controles.tipo").then(function(tiposControles) {
                        angular.forEach(tiposControles, function(indicacion) {
                            $scope.tiposControles.push({
                                id: indicacion,
                                nombre: indicacion
                            });
                        });
                    });
                }

            }
        },

        table: {
            selected: [],
            updateSelected: function(action, id) {
                if (action == 'add' & $scope.table.selected.indexOf(id) == -1) $scope.table.selected.push(id);
                if (action == 'remove' && $scope.table.selected.indexOf(id) != -1) $scope.table.selected.splice($scope.table.selected.indexOf(id), 1);
            },

            updateSelection: function($event, id) {
                var checkbox = $event.target;
                var action = (checkbox.checked ? 'add' : 'remove');
                $scope.table.updateSelected(action, id);
            },

            selectAll: function($event) {
                var checkbox = $event.target;
                var action = (checkbox.checked ? 'add' : 'remove');
                for (var i = 0; i < $scope.filtros.indicaciones.length; i++) {
                    var entity = $scope.filtros.indicaciones[i];
                    $scope.table.updateSelected(action, entity.id);
                }
            },

            getSelectedClass: function(data) {
                return $scope.table.isSelected(data.id) ? 'selected' : '';
            },

            isSelected: function(id) {
                return $scope.table.selected.indexOf(id) >= 0;
            },

            isSelectedAll: function() {
                return $scope.table.selected.length === $scope.filtros.indicaciones.length;
            }
        },

        // actualizamos toda la lista de indicaciones de una internacion
        reload: function() {
            // buscamos la internacion
            Shared.internacion.get($scope.internacion.id).then(function(internacion) {
                $scope.internacion = internacion;

                // asignamos la lista de indicaciones
                $scope.filtros.indicaciones = internacion.indicaciones;

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

                    angular.copy(indicacion, $scope.indicacion);

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
                        $scope.indicacion.servicio = Session.variables.servicioActual
                    }

                    //
                    $scope.indicacion.tipo = Global.getById($scope.tiposIndicaciones, indicacion.tipo);

                    // cargamos el valor de tipo de solucion en caso de ser un plan de hidratacion
                    if ($scope.indicacion.tipo == 'Plan hidratación parenteral' || $scope.indicacion.tipo.nombre == 'Plan hidratación parenteral') {

                        if ($scope.indicacion.planHidratacion.enteralParenteral.agregados.length) {
                            $scope.indicacion.planHidratacion.enteralParenteral.poseeAgregados = true;
                        }

                        // agregamos los frascos de solucion fisiologica
                        if (typeof $scope.indicacion.planHidratacion.enteralParenteral.solucionFisiologica.frascos != "undefined") {
                            var frascos = $scope.indicacion.planHidratacion.enteralParenteral.solucionFisiologica.frascos;
                            $scope.indicacion.planHidratacion.enteralParenteral.solucionFisiologica.frascos = [];
                            // asignamos los frascos
                            angular.forEach(frascos, function(frasco) {
                                $scope.indicacion.planHidratacion.enteralParenteral.solucionFisiologica.frascos.push({
                                    id: frasco,
                                    value: frasco
                                });
                            });
                        }

                        // agregamos los frascos de ringer-lactato
                        if (typeof indicacion.planHidratacion.enteralParenteral.ringerLactato.frascos != "undefined") {
                            var frascos = $scope.indicacion.planHidratacion.enteralParenteral.ringerLactato.frascos;
                            $scope.indicacion.planHidratacion.enteralParenteral.ringerLactato.frascos = [];
                            // asignamos los frascos
                            angular.forEach(frascos, function(frasco) {
                                $scope.indicacion.planHidratacion.enteralParenteral.ringerLactato.frascos.push({
                                    id: frasco,
                                    value: frasco
                                });
                            });
                        }

                        // agregamos los frascos de dextrosa
                        if (typeof indicacion.planHidratacion.enteralParenteral.dextrosa.frascos != "undefined") {
                            var frascos = $scope.indicacion.planHidratacion.enteralParenteral.dextrosa.frascos;
                            $scope.indicacion.planHidratacion.enteralParenteral.dextrosa.frascos = [];
                            // asignamos los frascos
                            angular.forEach(frascos, function(frasco) {
                                $scope.indicacion.planHidratacion.enteralParenteral.dextrosa.frascos.push({
                                    id: frasco,
                                    value: frasco
                                });
                            });
                        }
                    }

                    // plan de hidratacion enteral
                    if ($scope.indicacion.tipo == 'Plan hidratación enteral' || $scope.indicacion.tipo.nombre == 'Plan hidratación enteral') {
                        $scope.planHidratacion.enteralParenteral.pasarDurante = Global.getById($scope.pasarDurante, $scope.planHidratacion.enteralParenteral.pasarDurante);
                    }

                    // cargamos el valor de prioridad en caso de ser una solicitud de prestacion
                    if ($scope.indicacion.tipo == 'Solicitud prestaciones') {
                        $scope.indicacion.prestaciones.prioridad = Global.getById($scope.prestaciones.prioridad, ($scope.indicacion.prestaciones.prioridad.id || $scope.indicacion.prestaciones.prioridad));
                    }

                    if ($scope.indicacion.tipo == 'Cuidados generales') {
                        // $scope.indicacion.cuidadosGenerales.tipo = Global.getById($scope.tiposCuidadosGenerales, ($scope.indicacion.cuidadosGenerales.tipo.id || $scope.indicacion.prestaciones.cuidadosGenerales.tipo));
                        $scope.indicacion.cuidadosGenerales.tipo = Global.getById($scope.tiposCuidadosGenerales, ($scope.indicacion.prestaciones.cuidadosGenerales.tipo));
                    }

                    // cargamos el valor de tipo de preparados en caso de ser nutricion
                    if ($scope.indicacion.tipo == 'Nutrición' || $scope.indicacion.tipo.nombre == 'Nutrición') {
                        $scope.indicacion.nutricion.nutricionEnteral.tipoPreparado.descripcion = Global.getById($scope.tipoNutricionEnteral, ($scope.indicacion.nutricion.nutricionEnteral.tipoPreparado.descripcion.id || $scope.indicacion.nutricion.nutricionEnteral.tipoPreparado.descripcion));
                        $scope.calcularInformacionNutricion('nutricion-enteral');

                        $scope.indicacion.nutricion.soporteOral.tipoPreparado.descripcion = Global.getById($scope.tipoNutricionEnteral, ($scope.indicacion.nutricion.soporteOral.tipoPreparado.descripcion.id || $scope.indicacion.nutricion.soporteOral.tipoPreparado.descripcion));
                        $scope.calcularInformacionNutricion('soporte-oral');
                    }
                } else {
                    $scope.accion = "agregar";

                    $scope.indicacion.fecha = new Date();
                    $scope.indicacion.servicio = Session.variables.servicioActual;
                    // $scope.indicacion.via = 'EV';
                }

            },
            // Guardamos la indicacion
            guardar: function(indicacion, accion) {
                var accion = (accion) ? accion : 'guardada'

                // console.log(indicacion);
                return Shared.indicaciones.post($scope.internacion.id, indicacion.id || null, indicacion, {
                    minify: true
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
                    if ($scope.filtros.indicaciones[i].tipo.nombre == key || $scope.filtros.indicaciones[i].tipo == key) {
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
                    var nombre = (typeof _indicacion.tipo.nombre != "undefined") ? _indicacion.tipo.nombre : _indicacion.tipo;

                    // si es heparina o profilaxis los enviamos debajo del Plan de hidratacion
                    if (nombre == 'Heparina o profilaxis') {

                        var last_position = $scope.indicaciones.getLastPositionOf('Plan hidratación parenteral');
                        last_position = (last_position == -1) ? 0 : last_position;

                        if (last_position == -1) {
                            var last_position = $scope.indicaciones.getLastPositionOf('Plan hidratación enteral');
                            last_position = (last_position == -1) ? 0 : last_position;
                        }

                        if (last_position == -1) {
                            var last_position = $scope.indicaciones.getLastPositionOf('Plan hidratación oral');
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
                            var last_position = $scope.indicaciones.getLastPositionOf('Plan hidratación parenteral');

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

                            var last_position = $scope.indicaciones.getLastPositionOf('Plan hidratación parenteral');

                            // si encontramos plan de hidratacion, entonces lo ponemos debajo
                            // si no, lo ponemos al principio
                            last_position = (last_position == -1) ? 0 : last_position;
                        }
                    }

                    // si es un plan de hidratacion, los enviamos al principio
                    if (nombre == 'Plan hidratación parenteral' || nombre == 'Plan hidratación enteral' || nombre == 'Plan hidratación oral') {
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
                       if (hora == proximo) {
                           indicacion.horarios[hora] = "X";

                           if (indicacion.frecuencia != 'unica' || indicacion.frecuencia != '24') {
                               // sumamos a la hora marcada la frecuencia
                               proximo = parseInt(hora) + parseInt(indicacion.frecuencia);

                               if (proximo > 24) {
                                   proximo = proximo - 24;
                               }
                           }
                       }
                   });

                });
                console.log(indicacionesOrdenadas);
            },

            // actualizamos el listado de evolucione
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
                    $scope.evolucionesEdit = null;
                    $scope.show_toolbar = true;
                },

                // Guarda la evolución
                guardar: function(evolucion) {
                    // si se han evolucionado los drenajes entonces los cargamos
                    if ($scope.drenajes.length > 0) {
                        $scope.evolucionesEdit.egresos.drenajes = [];
                        angular.forEach($scope.drenajes, function(drenaje) {
                            var _drenaje = {
                                idDrenaje: drenaje.idDrenaje,
                                caracteristicaLiquido: drenaje.caracteristicaLiquido,
                                cantidad: drenaje.cantidad,
                                observaciones: drenaje.observaciones,
                            }
                            $scope.evolucionesEdit.egresos.drenajes.push(_drenaje);
                        });
                        // angular.copy($scope.drenajes, $scope.evolucionesEdit.egresos.drenajes);
                    }

                    // $scope.evolucionesEdit.glasgowTotal = $scope.evolucionesEdit.glasgowMotor + $scope.evolucionesEdit.glasgowVerbal + $scope.evolucionesEdit.glasgowOcular;
                    // $scope.evolucionesEdit.riesgoCaida.total = $scope.evolucionesEdit.riesgoCaida.caidasPrevias + $scope.evolucionesEdit.riesgoCaida.marcha + $scope.evolucionesEdit.riesgoCaida.ayudaDeambular + $scope.evolucionesEdit.riesgoCaida.venoclisis + $scope.evolucionesEdit.riesgoCaida.comorbilidad + $scope.evolucionesEdit.riesgoCaida.estadoMental;
                    // $scope.evolucionesEdit.riesgoUPP.total = $scope.evolucionesEdit.riesgoUPP.estadoFisico + $scope.evolucionesEdit.riesgoUPP.estadoMental + $scope.evolucionesEdit.riesgoUPP.actividad + $scope.evolucionesEdit.riesgoUPP.movilidad + $scope.evolucionesEdit.riesgoUPP.incontinencia;

                    console.log($scope.evolucionesEdit);

                    // Shared.evolucion.post($scope.internacion.id, evolucion.id || null, $scope.evolucionesEdit, {
                    //     minify: true
                    // }).then(function(data) {
                    //     Plex.alert('Evolución guardada');
                    //
                    //     // actualizamos el listado de evoluciones
                    //     // $scope.actualizarEvoluciones(data);
                    //     $scope.cancelarEdicion();
                    //
                    //     //if ($scope.volverAlMapa) {
                    //     //    Plex.closeView($scope.cama);
                    // });
                },
            },
            evolucionar: function() {
                // cambiamos el titulo
                $scope.titulo = "Evolucionar indicaciones";

                // mostramos el formulario de evoluciones
                $scope.showFormEvolucion = true;

                // ocultamos formulario de indicaciones y ocultamos toolbar
                $scope.showForm = false;
                $scope.show_toolbar_indicaciones = false;

                // // array de indicaciones donde almacenamos el tipo
                // var indicaciones = [];
                // //
                if ($scope.table.selected.length) {
                    angular.forEach($scope.table.selected, function(idIndicacion) {
                        angular.forEach($scope.filtros.indicaciones, function(indicacion) {
                            if (indicacion.id == idIndicacion) {
                                $scope.indicacionesEvolucionar.push(indicacion);
                            }
                        });
                    });
                }

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

                        $scope.indicacion.planHidratacion.enteralParenteral.agregados.push($scope.agregado);
                        $scope.agregado = {};
                    } else {
                        // asignamos para editar el agregado
                        $scope.editandoAgregado = true;

                        // creamos una copia del agregado
                        $scope.agregado = angular.copy(agregado);

                        // seleccionamos el tipo de agregado
                        $scope.agregado.tipoAgregado = Global.getById($scope.tiposAgregados, (agregado.tipoAgregado.id || agregado.tipoAgregado));

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

                var tipoPreparado = $scope.indicacion.nutricion.nutricionEnteral.tipoPreparado.descripcion != "undefined" ? $scope.indicacion.nutricion.nutricionEnteral.tipoPreparado.descripcion : null;
                var cantidad = $scope.indicacion.nutricion.nutricionEnteral.cantidad != "undefined" ? $scope.indicacion.nutricion.nutricionEnteral.cantidad : null;

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
        }

    });

    // cargamos los valores para los cuidados de oxigenos dependiendo el tipo de mascara
    $scope.$watch('indicacion.cuidadosGenerales.oxigeno.respiracion', function(current, old) {
        var valoresMascara = [28, 30, 35, 40, 50, 60, 70, 80, 100];
        var valoresBigotera = [0.5, 1, 2, 3, 4];
        if (current) {

            $scope.valoresOxigeno = [];

            if (current.tipo == 'Máscara') {
                angular.forEach(valoresMascara, function(valor) {

                    $scope.valoresOxigeno.push({
                        id: valor,
                        value: valor + '%'
                    });
                });
            } else if (current.tipo == 'Bigotera') {
                angular.forEach(valoresBigotera, function(valor) {
                    $scope.valoresOxigeno.push({
                        id: valor,
                        value: valor + 'lt/min'
                    });
                });
            }

        }

    });

    // creamos las opciones para los arrays de seleccion de frascos
    $scope.$watch('cantidadFrascos', function(current, old) {
        if (current) {
            $scope._frascos = [];
            for (var i = 1; i <= current; i++) {
                $scope._frascos.push({
                    id: i,
                    value: i
                });
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

            // switch (current.nombre) {
            //     case 'Plan hidratación parenteral':
            //         $scope.indicacion.planHidratacion.enteralParenteral.tipo = "Enteral";
            //         // $scope.indicacion.planHidratacion.enteralParenteral.velocidadInfunsion.unidad = "ml/hora";
            //         break;
            //     case 'Plan hidratación enteral':
            //         $scope.indicacion.planHidratacion.enteralParenteral.tipo = "Parenteral";
            //         break;
            //     default:
            //     $scope.indicacion.tipo = current.nombre;
            // }

        }
    });

    // inicializamos mediante el watch de la variable incluida
    $scope.$watch('include.internacion', function(current, old) {
        $scope.init(current);
    });
}]);
