angular.module('app').controller('internacion/iHojaTratamiento', ['$scope', 'Plex', 'Shared', 'Server', '$timeout', 'Session', 'Global', function($scope, Plex, Shared, Server, $timeout, Session, Global) {
    'use strict';

    angular.extend($scope, {
        show_toolbar_tratamientos: true,
        loading: true,
        dieta: false, controles: false, cuidadosEspeciales: false, cuidadosGenerales: false, preparadoEnteral: false,
        internacion: undefined,
        tratamientosEdit: undefined, // Item actual que se está editando
        // servicios: [{
        //     id: 'solo-hoy',
        //     nombreCorto: "Sólo los de hoy"
        // }, {
        //     id: '',
        //     nombreCorto: 'Todos'
        // }],
        filtros: {
            tratamientos: [],
            servicio: null,
            filtrar: function(){
                var self = this;
                $scope.filtros.problemas = $scope.internacion.problemas;

                // if (!self.servicio) {
                //     $scope.filtros.tratamientos = $scope.internacion.tratamientos;
                // } else {
                //     $scope.filtros.tratamientos = [];
                //     if (self.servicio.id !== "undefined" && self.servicio.id == 'solo-hoy'){
                //         angular.forEach($scope.internacion.tratamientos, function(tratamiento) {
                //             if (self.servicio && tratamiento.fecha == Date.Now()) {
                //                 $scope.filtros.tratamientos.push(tratamiento);
                //             }
                //         });
                //     }else{
                //         angular.forEach($scope.internacion.tratamientos, function(tratamiento) {
                //             if (self.servicio && tratamiento.servicio.id === self.servicio.id) {
                //                 $scope.filtros.tratamientos.push(tratamiento);
                //             }
                //         });
                //     }
                // }
            }

        },

        init: function(internacion) {
            $scope.loading = true;
            $scope.dieta = false;
            $scope.controles = false;
            $scope.cuidadosGenerales = false;
            $scope.cuidadosEspeciales = false;
            $scope.preparadoEnteral = false;
            // buscamos la internacion
            if (internacion !== null) {
                $scope.internacion = internacion;

                $scope.filtros.tratamientos = internacion.tratamientos;
                $scope.loading = false;

                $scope.filtros.filtrar();

            }
        },

        cargarDieta: function(){
            if (!$scope.dieta){
                $scope.dieta = true;
            }else{
                $scope.dieta = false;
            }
        },

        cargarControles: function(){
            if (!$scope.controles){
                $scope.controles = true;
            }else{
                $scope.controles = false;
            }
        },

        cargarCuidadosEspeciales: function(){
            if (!$scope.cuidadosEspeciales){
                $scope.cuidadosEspeciales = true;
            }else{
                $scope.cuidadosEspeciales = false;
            }
        },

        cargarCuidadosGenerales: function(){
            if (!$scope.cuidadosGenerales){
                $scope.cuidadosGenerales = true;
            }else{
                $scope.cuidadosGenerales = false;
            }
        },

        cargarPreparadoEnteral: function(){
            if (!$scope.preparadoEnteral){
                $scope.preparadoEnteral = true;
            }else{
                $scope.preparadoEnteral = false;
            }
        },

        remove: function(item) {
            $scope.internacion.tratamientos.splice($scope.internacion.tratamientos.indexOf(item), 1);
        },

        // Inicia la edición de una evolución
        editarTratamiento: function(tratamiento) {
            $scope.show_toolbar_tratamientos = false;

            if (tratamiento) { // Modificación
                $scope.tituloFormulario = "Editar tratamiento";
                $scope.tratamientosEdit = {};

                angular.copy(tratamiento, $scope.tratamientosEdit);


            } else { // Alta
                $scope.tituloFormulario = "Agregar tratamiento";

                // Valores por defecto
                $scope.tratamientosEdit = {
                    fecha: new Date(),
                    servicio: Session.servicioActual,
                };
            }
        },
        // Cancelar la edición
        cancelarEdicion: function() {
            $scope.tratamientosEdit = null;
            $scope.show_toolbar_tratamientos = true;
        },

        // Guarda el tratamiento
        guardarTratamiento: function(tratamiento) {
            Shared.tratamientos.post($scope.internacion.id, tratamiento.id || null, $scope.tratamientosEdit, {
                minify: true
            }).then(function(data) {
                Plex.alert('Tratamiento guardado');

                // actualizamos el listado de tratamientos
                $scope.actualizartratamientos(data);
                //$scope.cancelarEdicion();
            });
        },

        actualizartratamientos: function(data) {
            var found = false;
            $scope.loading = true;

            var length = $scope.internacion.tratamientos.length;
            for (var i = 0; i < length; i++) {
                if ($scope.internacion.tratamientos[i].id === data.id) {
                    // tratamiento encontrado, actualizamos datos
                    $scope.internacion.tratamientos[i] = data;
                    found = true;
                    break;
                }
            }

            // si no lo encontro, entonces es porque acaba de cargarla
            // se lo asignamos al resto de las tratamientos
            if (!found) {
                $scope.internacion.tratamientos.push(data);
            }

            $scope.loading = false;
        }
    });

    // inicializamos mediante el watch de la variable incluida
    $scope.$watch('include.internacion', function(current, old) {
        $scope.init(current);
    });
}]);
