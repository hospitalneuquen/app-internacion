'use strict';

angular.module('appModule').controller('PruebaController', ['$scope', 'Plex', 'Server', '$timeout', function($scope, Plex, Server, $timeout) {
    // Comentario de prueba 6
    angular.extend($scope, {
        miFormulario: null,
        nombre: "Pedro",
        fecha: new Date(),
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

                    var url = (isNaN(self.query) ? 'fulltext' : 'documento') + "=" + self.query;
                    Server.get('http://localhost:3001/persona?' + encodeURI(url)).then(function(data) {
                        self.data = data;
                    });
                }, 250);
            }
        },
        guardar: function() {
            alert("yes");
            var dto = {

                }
                //if (miFormulario.$valid)
                //Server.post('api/internacion/', dto)
        }

    });

    // Inicializa watches
    $scope.$watch('personas.query', function() {
        $scope.personas.actualizar();
    });

    // Inicializa vista
    Plex.initView({
        title: "Test page",
        actions: [{
            title: "Camas",
            icon: "fa fa-bed",
            handler: function() {
                Plex.openView('camas').then(function() {})
            }
        }]
    });
}]);
