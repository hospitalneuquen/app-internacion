'use strict'

angular.module('plex').filter('fromNow', function () {
    return function (date, ignorePrefix) {
        /* 
            Parámetros:
            - date: fecha a formatear
            - ignorePrefix: si es true, indica que no debe agregar el prefijo "Hace..." (ej: Hace 20 días)
        */
        if (date)
            return moment(date).fromNow(ignorePrefix);
        else
            return "";
    }
});