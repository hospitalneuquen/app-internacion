angular.module('app').controller('sandbox/test', ['$scope', 'Plex', 'Server', '$timeout', 'Personas', function($scope, Plex, Server, $timeout, Personas) {
    angular.extend($scope, {
        fields: {
        },
        tab: 0,

        array: [{
            id: '1',
            apellido: 'Garcia',
            nombre: 'Jorge'
        }, {
            id: '2',
            apellido: 'Perez',
            nombre: 'María'
        }, {
            id: '3',
            apellido: 'San Martin',
            nombre: 'Laura'
        }],
        actions: [{
            icon: 'mdi mdi-account',
            text: 'Opción 1',
            handler: function() {
                debugger;
                alert(1);
            }
        }, {
            divider: true
        }, {
            icon: 'mdi mdi-account',
            text: 'Opción 2',
            handler: function() {
                alert(2);
            }
        }, {
            icon: 'mdi mdi-account',
            text: 'Opción 3',
            handler: function() {
                alert(3);
            }
        }],
        buscarPersona: function(query) {
            return Personas.get({
                fulltext: query
            });
        },
        guardar: function() {
            // Debe devolver la promise para que plex-submit muestre la animación
            return $timeout(function() {
                alert("¡Datos guardados!");
            }, 2000);
        }
    });

    //$scope.fields.selectSingle = $scope.data[1];
    // Inicializa vista
    Plex.initView({
        title: "UI Elements",
    });
}]);
