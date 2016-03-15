angular.module('app').directive('plexAffix', [
    '$window',
    function($window) {
        return function(scope, element) {
            // Init
            var parent = element.parent();
            while (parent.length && parent[0].tagName != "MD-CONTENT")
                parent = parent.parent();
            if (!parent.length)
                parent = angular.element($window);
            var toolbar = $window.document.getElementsByTagName("MD-TOOLBAR")[0];


            element.addClass('plex-affix');
            var spacer = angular.element("<DIV>").addClass('plex-affix-spacer');
            element.parent().append(spacer);
            var initialOffsetTop = -1;

            // Check function
            var check = function() {
                var scrollTop = parent[0].scrollTop; //$window.pageYOffset;
                var clientRect = element[0].getBoundingClientRect();
                var parentRect = parent[0].getBoundingClientRect();
                if (initialOffsetTop < 0) {
                    initialOffsetTop = clientRect.top;
                }

                if (clientRect.top <= parentRect.top && !element.hasClass('affix')) {
                    element.addClass('affix');
                    element.css('top', toolbar.getBoundingClientRect().height + "px");
                    spacer.css('height', clientRect.height + "px");
                }
                console.log(scrollTop);
                if (scrollTop <= 0) {
                    element.removeClass('affix');
                }
            };

            // Eventos
            parent.on('scroll', check);
            scope.$on('$destroy', function() {
                parent.off('scroll', check);
            });
        };
    }
]);
