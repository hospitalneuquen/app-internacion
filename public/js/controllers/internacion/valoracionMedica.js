angular.module('app').controller('internacion/valoracionMedica', ['$scope', 'Plex', 'plexParams', 'Shared', 'Session', function($scope, Plex, plexParams, Shared, Session) {
    angular.extend($scope, {
        internacion: null,

        init: function() {
            Shared.internacion.get(plexParams.idInternacion).then(function(data) {
                $scope.internacion = data;
            });

        },

        removeHipotesis: function(hipotesis) {
            $scope.internacion.ingreso.medico.impresionDiagnostica.listaHipotesis.splice($scope.internacion.ingreso.medico.impresionDiagnostica.listaHipotesis.indexOf(hipotesis), 1);
        },

        removeSindromeSignos: function(sindrome) {
            $scope.internacion.ingreso.medico.impresionDiagnostica.listaSindromesSignos.splice($scope.internacion.ingreso.medico.impresionDiagnostica.listaSindromesSignos.indexOf(sindrome), 1);
        },

        removeSignoGuia: function(positivo) {
            $scope.internacion.ingreso.medico.impresionDiagnostica.listaPositivos.splice($scope.internacion.ingreso.medico.impresionDiagnostica.listaPositivos.indexOf(positivo), 1);
        },

        agregarHipotesis: function() {
            if (typeof $scope.internacion.ingreso.medico == "undefined") {
                $scope.internacion.ingreso.medico = {};
            }
            if (typeof $scope.internacion.ingreso.medico.impresionDiagnostica == "undefined") {
                $scope.internacion.ingreso.medico.impresionDiagnostica = {};
            }
            if (typeof $scope.internacion.ingreso.medico.impresionDiagnostica.listaHipotesis == "undefined") {
                $scope.internacion.ingreso.medico.impresionDiagnostica.listaHipotesis = [];
            }

            $scope.internacion.ingreso.medico.impresionDiagnostica.listaHipotesis.push($scope.hipotesis);

            $scope.hipotesis = {};
        },

        confirmarHipotesis: function(hipotesis){
            if (typeof $scope.hipotesis == "undefined") {
                $scope.hipotesis = {};
            }
            $scope.hipotesis.confirmada = true;
            for (var i = 0; i < $scope.internacion.ingreso.medico.impresionDiagnostica.listaHipotesis.length; i++) {
                if ($scope.internacion.ingreso.medico.impresionDiagnostica.listaHipotesis[i].nombre === hipotesis.nombre) {
                    // hipotesis encontrada, actualizamos datos
                    $scope.internacion.ingreso.medico.impresionDiagnostica.listaHipotesis[i].confirmada = $scope.hipotesis.confirmada;
                    break;
                }
            }
            if (typeof $scope.problema == "undefined") {
                $scope.problema = {};
            }

            $scope.problema.diagnosticoTexto = hipotesis.nombre;
            $scope.problema.descripcion = hipotesis.nombre;
            $scope.problema.estado = "Activo";
            $scope.problema.servicio = Session.variables.servicioActual;
            $scope.problema.fechaDesde = new Date();
            $scope.internacion.problemas.push($scope.problema);

        },

        agregarSindromeSignos: function() {
            if (typeof $scope.internacion.ingreso.medico == "undefined") {
                $scope.internacion.ingreso.medico = {};
            }
            if (typeof $scope.internacion.ingreso.medico.impresionDiagnostica == "undefined") {
                $scope.internacion.ingreso.medico.impresionDiagnostica = {};
            }
            if (typeof $scope.internacion.ingreso.medico.impresionDiagnostica.listaSindromesSignos == "undefined") {
                $scope.internacion.ingreso.medico.impresionDiagnostica.listaSindromesSignos = [];
            }
            if (typeof $scope.internacion.ingreso.medico.impresionDiagnostica.listaSindromesSignos.listaSignos == "undefined") {
                $scope.internacion.ingreso.medico.impresionDiagnostica.listaSindromesSignos.listaSignos = [];
            }

            angular.forEach($scope.sindrome.listaSignos, function(signo) {
                $scope.internacion.ingreso.medico.impresionDiagnostica.listaSindromesSignos.listaSignos.push(signo);
            });
            $scope.internacion.ingreso.medico.impresionDiagnostica.listaSindromesSignos.push($scope.sindrome);

            $scope.sindrome = {};
        },

        checkIfEnterKeyWasPressed: function($event, input) {
            var keyCode = $event.which || $event.keyCode;
            if (keyCode === 13) {
                if (input == 1 && $scope.positivo !== "") {
                    if (typeof $scope.internacion.ingreso.medico == "undefined") {
                        $scope.internacion.ingreso.medico = {};
                    }
                    if (typeof $scope.internacion.ingreso.medico.impresionDiagnostica == "undefined") {
                        $scope.internacion.ingreso.medico.impresionDiagnostica = {};
                    }
                    if (typeof $scope.internacion.ingreso.medico.impresionDiagnostica.listaPositivos == "undefined") {
                        $scope.internacion.ingreso.medico.impresionDiagnostica.listaPositivos = [];
                    }

                    $scope.internacion.ingreso.medico.impresionDiagnostica.listaPositivos.push($scope.positivo);

                    $scope.positivo = "";
                }
            }

        },

        guardar: function() {
            var data = {
                ingreso: $scope.internacion.ingreso
            };

console.log(data);
            // return Shared.internacion.post(plexParams.idInternacion, data).then(function(internacion) {
            //
            //     if ($scope.problema){
            //         Shared.problemas.post($scope.internacion.id, $scope.problema.id || null, $scope.problema, {
            //             minify: true
            //         }).then(function(){
            //             Plex.alert("Valoración médica guardada. Recuerde editar la lista de problemas si desea agregar la codificación CIE-10 de la hipótesis confirmada (problema activo).");
            //             Plex.closeView();
            //         });
            //     }else{
            //         if (internacion) {
            //             Plex.alert("Valoración médica guardada");
            //         }
            //
            //     }
            //
            //     Plex.closeView(internacion);
            // });


            // Shared.internacion.post(plexParams.idInternacion, data).then(function(internacion) {
            //     if (internacion) {
            //         Plex.alert("Valoración médica guardada");
            //     }
            //     Plex.closeView(internacion);
            // });

            // return Shared.internacion.post(plexParams.idInternacion, data).then(function(internacion) {
            //     if (internacion) {
            //         Plex.alert("Valoración médica guardada");
            //     }
            //     Plex.closeView(internacion);
            // });
        },
        cancelar: function() {
            Plex.closeView();
        },
    });

    // Init
    $scope.init();
    Plex.initView({
        title: "Valoración médica inicial"
    });
}]);
