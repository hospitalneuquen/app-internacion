'use strict'

angular.module('plex').directive("plexFilter", ["$filter", function ($filter) {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelController) {
            if (attrs.plexFilter && attrs.plexFilter != "") {
                var index = attrs.plexFilter.indexOf(":")
                var filterName = index < 0 ? attrs.plexFilter : attrs.plexFilter.substr(0, index).trim();
                var filterParam = index < 0 ? undefined : eval(attrs.plexFilter.substr(index + 1).trim());
                var filter = $filter(filterName);
                ngModelController.$formatters.push(function (data) {
                    return filter(data, filterParam);
                });
            }
        }
    }
}]);