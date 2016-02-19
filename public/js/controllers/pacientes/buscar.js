'use strict';

angular.module('app').controller('pacientes/buscar', ['$scope', 'Plex', 'Server', '$timeout', 'Personas', function($scope, Plex, Server, $timeout, Personas) {
    angular.extend($scope, {
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
                if (data.length > 0) {
                    Plex.showWarning("Atención: El paciente se encuentra actualmente internado.");
                } else {
                    $scope.internacion.paciente = paciente;
                    $scope.internacion.fechaHora = new Date();
                }
            });
        },

        crear: function() {
            Server.post('/api/internacion/internacion', $scope.internacion, {
                minify: true
            }).then(function(data) {
                //Plex.closeView(data);
                $scope.cargarValoraciones();
            }, function() {

            });
        },

        cargarValoraciones: function(){
            Plex.openView('valoracionEnfermeria').then(function() {

            });
        },

        init: function() {
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
        title: "Seleccione paciente"
    });
}]);
