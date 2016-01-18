'use strict';

angular.module('global').factory('Server', ["serviceStackRestClient", "Plex", "$http", "$window", function (serviceStackRestClient, Plex, $http, $window) {
    return {
        onThen: function (response) {
            // 18/11/2014 | jgabriel | Cuando no se devolvía datos (ej: status 204) no devolvía un objeto "response" y no es el comportamiento deseado
            //if (response && response.data)
            if (response && angular.isDefined(response.data))
                return response.data;
            else return response;
        },
        onSuccess: function (response, updateUI) {
            if (updateUI) {
                //Plex.clearAlerts();
                Plex.loading.update(false, updateUI == "big");
            }
            return response;
        },
        onError: function (response, updateUI) {
            if (updateUI) {
                if (response && response.statusCode)
                    switch (response.statusCode) {
                        case 403:
                            if (response.error && response.error.errorCode) {
                                var errorCode = Number(response.error.errorCode);
                                switch (errorCode) {
                                    case 7003: /* Not logged in */
                                        $window.location = "/dotnet/SSO/Login.aspx?url=" + $window.encodeURIComponent($window.location);
                                        break;
                                    case 7004:  /* Locked */
                                        //Plex.showError("La sessión SSO está bloqueada");
                                        Plex.sessionLock(true);
                                        break;
                                    case 7010: /* Security error */
                                        Plex.showError("Utilizar HTTPS para conectarse a este sitio");
                                        break;
                                    default:
                                        Plex.showError();
                                }
                            }
                            else
                                Plex.showError();
                            break;
                        case 405:
                            if (response.response && response.response.data && response.response.data.responseStatus && response.response.data.responseStatus.message)
                                Plex.showWarning(response.response.data.responseStatus.message);
                            else
                                Plex.showError();
                            break;
                        default:
                            Plex.showError();
                    }
                else
                    Plex.showError();
                Plex.loading.update(false, updateUI == "big");
            }
            return response;
        },
        onValidation: function (response, updateUI) {
            if (updateUI) {
                Plex.showWarning(response.response.data.responseStatus.message);
                Plex.loading.update(false, updateUI == "big");
            }
            return response;
        },

        get: function (url, config) {
            // Prepara configuración
            config = angular.extend({
                updateUI: "small"
            }, config);

            // Actualiza UI
            if (config.updateUI)
                Plex.loading.update(true, config.updateUI == "big");

            // Envía el request
            var self = this;
            return serviceStackRestClient.get(url, config)
                .success(function (response) { return self.onSuccess(response, config.updateUI) })
                .error(function (response) { return self.onError(response, config.updateUI) })
                .validation(function (response) { return self.onValidation(response, config.updateUI) })
                .then(function (response) { return self.onThen(response) })
        },
        patch: function (url, data, config) {
            // Prepara configuración
            config = angular.extend({
                updateUI: "small",
                method: "PATCH",
                data: data,
                url: url
            }, config);


            // Actualiza UI
            if (config.updateUI)
                Plex.loading.update(true, config.updateUI == "big");

            // Envía el request
            var self = this;
            return serviceStackRestClient.execute(config)
                .success(function (response) { return self.onSuccess(response, config.updateUI) })
                .error(function (response) { return self.onError(response, config.updateUI) })
                .validation(function (response) { return self.onValidation(response, config.updateUI) })
                .then(function (response) { return self.onThen(response) })
        },
        post: function (url, data, config) {
            // Prepara configuración
            config = angular.extend({
                updateUI: "small"
            }, config);

            // Actualiza UI
            if (config.updateUI)
                Plex.loading.update(true, config.updateUI == "big");

            // Envía el request
            var self = this;
            return serviceStackRestClient.post(url, data, config)
                .success(function (response) { return self.onSuccess(response, config.updateUI) })
                .error(function (response) { return self.onError(response, config.updateUI) })
                .validation(function (response) { return self.onValidation(response, config.updateUI) })
                .then(function (response) { return self.onThen(response) })
        },
        put: function (url, data, config) {
            // Prepara configuración
            config = angular.extend({
                updateUI: "small"
            }, config);

            // Actualiza UI
            if (config.updateUI)
                Plex.loading.update(true, config.updateUI == "big");

            var self = this;
            return serviceStackRestClient.post(url, data, config)
                .success(function (response) { return self.onSuccess(response, config.updateUI) })
                .error(function (response) { return self.onError(response, config.updateUI) })
                .validation(function (response) { return self.onValidation(response, config.updateUI) })
                .then(function (response) { return self.onThen(response) })
        },
        delete: function (url, config) {
            // Prepara configuración
            config = angular.extend({
                updateUI: "small"
            }, config);

            // Actualiza UI
            if (config.updateUI)
                Plex.loading.update(true, config.updateUI == "big");

            var self = this;
            return serviceStackRestClient.delete(url, config)
                .success(function (response) { return self.onSuccess(response, config.updateUI) })
                .error(function (response) { return self.onError(response, config.updateUI) })
                .validation(function (response) { return self.onValidation(response, config.updateUI) })
                .then(function (response) { return self.onThen(response) })
        }
    }
}]);