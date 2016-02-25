'use strict';

angular.module('app').controller('internaciones/editar', ['$scope', 'Plex', 'plexParams', 'Server', '$timeout', 'Personas', 'Global', function($scope, Plex, plexParams, Server, $timeout, Personas, Global) {
    angular.extend($scope, {
        internacionActual: null,
        personas: {
            data: null,
            query: '',
            timeoutHandler: null,
            actualizar: function() {
                var self = this;
                if (self.timeoutHandler)
                    $timeout.cancel(self.timeoutHandler);

                self.timeoutHandler = $timeout(function() {
                    if (!self.query)
                        return;

                    var params = {};
                    if (isNaN(self.query)) {
                        params.fulltext = self.query;
                    } else {
                        params.documento = self.query;
                    }
                    Personas.get(params).then(function(data) {
                        self.data = data;
                    });
                }, 250);
            }
        },
        pacientes: {
            internacion: undefined
        },
        seleccionarInternacion: function(data) {
            Plex.closeView(data);
        },

        // opciones para el select del tipo de internacion
        tiposInternacion: [{
            id: 'ambulatorio',
            nombre: 'Ambulatorio'
        }, {
            id: 'guardia',
            nombre: 'Guardia'
        }, {
            id: 'derivacion',
            nombre: 'Derivación'
        }, ],
        internacion: {
            paciente: null,
            fechaHora: null,
            tipo: null,
            motivo: null,
            diagnosticoPresuntivo: null,
        },

        seleccionarPersona: function(data) {
            var paciente = data;
            // validamos que el paciente no se encuentre internada
            Server.get('/api/internacion/cama/pacienteInternado/' + data.id, {}, {
                updateUI: false
            }).then(function(data) {
                // si el paciente aparece internado, y es distinto del seleccionado actualmente
                if (paciente.id == $scope.internacionActual.paciente.id){
                    Plex.showWarning("Atención: El paciente se encuentra actualmente internado en esta cama.");
                }else{
                    if (data.length > 0) {
                        Plex.showWarning("Atención: El paciente se encuentra actualmente internado en otra cama.");
                    } else {
                        $scope.internacion.paciente = paciente;
                    }
                }

            });
        },

        guardar: function() {
            Server.patch('/api/internacion/internacion/' + plexParams.idInternacion + '/editarIngreso', $scope.internacion, {
                minify: true
            }).then(function(data) {
                Plex.closeView(data);
            }, function() {

            });
        },

        init: function() {
            // buscamos los datos de la internacion
            Server.get('/api/internacion/internacion/' + plexParams.idInternacion).then(function(data) {
                $scope.internacionActual = data;
                $scope.internacion.paciente = data.paciente;
                $scope.internacion.fechaHora = data.ingreso.fechaHora;
                $scope.internacion.tipo = Global.getById($scope.tiposInternacion, data.ingreso.tipo);
                $scope.internacion.motivo = data.ingreso.motivo;
                $scope.internacion.diagnosticoPresuntivo = data.ingreso.diagnosticoPresuntivo;
            });

            // buscamos los pacientes que estan en el estado 'enIngreso'
            Server.get('/api/internacion/internacion/estado/enIngreso').then(function(data) {
                $scope.pacientes.internacion = data;
            });
        }
    });

    $scope.init();

    // Inicializa watches
    $scope.$watch('personas.query', function() {
        $scope.personas.actualizar();
    });

    Plex.initView({
        title: "Editar internación"
    });
}]);
