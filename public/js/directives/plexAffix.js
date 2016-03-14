angular.module('app').directive('plexAffix', [
    '$window',
    function($window) {
        return function(scope, element) {
            // Init
            element.addClass('plex-affix');
            var spacer = angular.element("<DIV>").addClass('plex-affix-spacer');
            element.parent().append(spacer);
            var initialOffsetTop = -1;

            // Check function
            var check = function() {
                var scrollTop = $window.pageYOffset;
                var scrollHeight = $window.document.body.scrollHeight;
                var clientRect = element[0].getBoundingClientRect();
                if (initialOffsetTop < 0) {
                    initialOffsetTop = clientRect.top;
                }

                if (clientRect.top <= 0 && !element.hasClass('affix')) {
                    element.addClass('affix');
                    spacer.css('height', clientRect.height + "px");
                }
                if (scrollTop < initialOffsetTop) {
                    element.removeClass('affix');
                }
            };

            // Eventos
            angular.element($window).on('scroll', check);
            scope.$on('$destroy', function() {
                $window.off('scroll', check);
            });
        };
    }
]);
