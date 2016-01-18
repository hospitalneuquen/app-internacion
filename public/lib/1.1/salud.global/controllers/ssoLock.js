'use strict';

appModule.controller('/Lib/Controllers/SSO/Lock', ['$scope', 'SSO', function ($scope, SSO) {
    // Define el modelo
    angular.extend($scope, {
        form: null,
        password: null,
        error: false,
        unlock: function () {
            $scope.$broadcast('$plex-before-submit', this.form);
            if (this.form.$valid)
                // El servicio SSO hace un broadcast con el evento indicando que se desbloqueó (i.e. así Plex actualiza la UI)
                SSO.unlock(this.password).catch(function () {
                    $scope.error = true;
                    $scope.password = null;
                });
        },
        changeUser: function () {
            window.location = "/dotnet/SSO/Logout.aspx?relogin=1&url=" + encodeURIComponent(window.location);
        },
        close: function () {
            window.location = "/dotnet/SSO/Logout.aspx";
        },
        onChangePassword: function () {
            $scope.error = false;
        }
    });
}]);