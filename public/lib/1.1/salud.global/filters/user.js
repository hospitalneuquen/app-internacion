'use strict'

angular.module('global').filter('user', ['$filter', function ($filter) {
    return function (user, format, messageIfNull) {
        // Formato default: ns
        // Ejemplo de formato: "sn" --> Surname + Name
        if (!user || user.id == 0)
            return messageIfNull ? "Usuario no registrado" : undefined;
        else {
            switch (format) {
                case "sn":
                    return user.surname + ", " + user.name;
                    break;
                default:
                    return user.name + " " + user.surname;
            }
        }
    }
}]);