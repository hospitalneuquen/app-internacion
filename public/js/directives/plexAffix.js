angular.module('app').provider('$plexAffix', function() {
    'use strict';

    this.$get = [
        '$window',
        'debounce',
        'dimensions',
        function($window, debounce, dimensions) {
            var bodyEl = angular.element($window.document.body);
            var windowEl = angular.element($window);

            function affixFactory(element, config) {
                var $plexAffix = {};
                // Common vars
                var options = angular.extend({}, config);
                var targetEl = options.target;
                var spacer = angular.element("<DIV>").addClass('plex-affix-spacer');
                var reset = 'affix affix-top affix-bottom',
                    initialTop = 0,
                    initialOffsetTop = 0,
                    offsetTop = 0,
                    offsetBottom = 0,
                    affixed = null,
                    unpin = null;
                // Method
                $plexAffix.init = function() {
                    $plexAffix.$parseOffsets();
                    initialOffsetTop = dimensions.offset(element[0]).top + initialTop;
                    // Agrega clases
                    element.addClass('plex-affix');
                    // Agrega el spacer
                    spacer.appendTo(element.parent());
                    // Bind events
                    targetEl.on('scroll', $plexAffix.checkPosition);
                    targetEl.on('click', $plexAffix.checkPositionWithEventLoop);
                    windowEl.on('resize', $plexAffix.$debouncedOnResize);
                    // Both of these checkPosition() calls are necessary for the case where
                    // the user hits refresh after scrolling to the bottom of the page.
                    $plexAffix.checkPosition();
                    $plexAffix.checkPositionWithEventLoop();
                };
                $plexAffix.destroy = function() {
                    // Unbind events
                    targetEl.off('scroll', $plexAffix.checkPosition);
                    targetEl.off('click', $plexAffix.checkPositionWithEventLoop);
                    windowEl.off('resize', $plexAffix.$debouncedOnResize);
                };
                $plexAffix.checkPositionWithEventLoop = function() {
                    setTimeout($plexAffix.checkPosition, 1);
                };
                $plexAffix.checkPosition = function() {
                    // if (!this.$element.is(':visible')) return
                    var scrollTop = getScrollTop();
                    var position = dimensions.offset(element[0]);
                    var elementHeight = dimensions.height(element[0]);
                    // Setea la dimensión del spacer
                    spacer.height(elementHeight);
                    // Get required affix class according to position
                    var affix = getRequiredAffixClass(unpin, position, elementHeight);
                    // Did affix status changed this last check?
                    if (affixed === affix)
                        return;
                    affixed = affix;
                    // Add proper affix class
                    element.removeClass(reset).addClass('affix' + (affix !== 'middle' ? '-' + affix : ''));
                    if (affix === 'top') {
                        unpin = null;
                        element.css('position', options.offsetParent ? '' : 'relative');
                        element.css('top', '');
                    } else if (affix === 'bottom') {
                        if (options.offsetUnpin) {
                            unpin = -(options.offsetUnpin * 1);
                        } else {
                            // Calculate unpin threshold when affixed to bottom.
                            // Hopefully the browser scrolls pixel by pixel.
                            unpin = position.top - scrollTop;
                        }
                        element.css('position', options.offsetParent ? '' : 'relative');
                        element.css('top', options.offsetParent ? '' : bodyEl[0].offsetHeight - offsetBottom - elementHeight - initialOffsetTop + 'px');
                    } else {
                        // affix === 'middle'
                        unpin = null;
                        element.css('position', 'fixed');
                        element.css('top', initialTop + 'px');
                    }
                };
                $plexAffix.$onResize = function() {
                    $plexAffix.$parseOffsets();
                    $plexAffix.checkPosition();
                };
                $plexAffix.$debouncedOnResize = debounce($plexAffix.$onResize, 50);
                $plexAffix.$parseOffsets = function() {
                    // Reset position to calculate correct offsetTop
                    element.css('position', 'relative');
                    var navBar = angular.element(".navbar-fixed-top")[0];
                    var offset = '-' + Math.round(dimensions.height(navBar));
                    initialTop = -offset * 1;
                    offsetTop = dimensions.offset(element[0]).top - dimensions.css(element[0], 'marginTop', true) + offset * 1;
                };
                // Private methods
                function getRequiredAffixClass(unpin, position, elementHeight) {
                    var scrollTop = getScrollTop();
                    var scrollHeight = getScrollHeight();
                    if (scrollTop <= offsetTop) {
                        return 'top';
                    } else if (unpin !== null && scrollTop + unpin <= position.top) {
                        return 'middle';
                    } else if (offsetBottom !== null && position.top + elementHeight + initialTop >= scrollHeight - offsetBottom) {
                        return 'bottom';
                    } else {
                        return 'middle';
                    }
                }

                function getScrollTop() {
                    return targetEl[0] === $window ? $window.pageYOffset : targetEl[0] === $window;
                }

                function getScrollHeight() {
                    return targetEl[0] === $window ? $window.document.body.scrollHeight : targetEl[0].scrollHeight;
                }
                $plexAffix.init();
                return $plexAffix;
            }
            return affixFactory;
        }
    ];
}).directive('plexAffix', [
    '$plexAffix',
    '$window',
    function($plexAffix, $window) {
        return function(scope, element) {
            $plexAffix(element, {
                scope: scope,
                target: angular.element($window),
            });
        };
    }
]);
