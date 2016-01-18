'use strict';

// 07/08/2015 | jgabriel | No puede usar el servicio Server porque si no se crea la referencia circular Server <- SSO <- Plex
angular.module('global').factory('SSO', ['$rootScope', 'serviceStackRestClient', '$timeout', function ($rootScope, serviceStackRestClient, $timeout) {
    var self = {
        _initCache: null,
        session: null,
        init: function () {
            if (!self._initCache)
                self._initCache = serviceStackRestClient.get('/api/sso/sessions/current').then(function (response) {
                    self.session = response.data;
                })
            return self._initCache;
        },
        menu: function (applicationId) {
            return serviceStackRestClient.get('/api/sso/users/current/menu/' + applicationId).then(function (response) { return (response && response.data) || response; });
        },
        settings: {
            get: function (setting) {
                return serviceStackRestClient.get('/api/sso/users/current/settings/' + setting).then(function (response) { return (response && response.data) || response; });
            },
            post: function (setting, value) {
                return serviceStackRestClient.post('/api/sso/users/current/settings/' + setting, { value: value }).then(function (response) { return (response && response.data) || response; });
            }
        },
        lock: function () {
            self.waitForUnlock();
            return serviceStackRestClient.post('/api/sso/sessions/current/lock').then(function (response) {
                angular.extend(self.session, response.data);
                $rootScope.$broadcast('sso-lock');
                return response.data;
            });
        },
        unlock: function (password) {
            self.waitForUnlock(true);
            return serviceStackRestClient.post('/api/sso/sessions/current/unlock', { password: password }).then(function (response) {
                angular.extend(self.session, response.data);
                $rootScope.$broadcast('sso-unlock');
                return response.data;
            }).catch(function(e){
                // Falló el unlock, por lo que seguimos esperando
                self.waitForUnlock();
                throw e;
            });
        },
        _waitForUnlockTimer: null,
        waitForUnlock: function (cancel) {
            // Observa si la sesión se desbloqueó (por ejemplo, desde otro tab en el browser)
            if (!cancel) {
                self._waitForUnlockTimer = $timeout(function () {
                    serviceStackRestClient.get('/api/sso/sessions/current/state').then(function (response) {
                        if (response && response.data == 0) {
                            // Si todavía no fue cancelada ...
                            if (self._waitForUnlockTimer) {
                                self.waitForUnlock(true);
                                $rootScope.$broadcast('sso-unlock');
                            }
                        } else {
                            self.waitForUnlock();
                        }
                    })
                }, 1000);
            } else {
                if (self._waitForUnlockTimer) {
                    $timeout.cancel(self._waitForUnlockTimer);
                    self._waitForUnlockTimer = null;
                }
            }
        },
    };
    return self;
}]);