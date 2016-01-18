/* 07/10/2015 | jgabriel | Basado en angular-load.js / v0.3.0 / (c) 2014, 2015 Uri Shaked / MIT Licence 
 * Incopora el loading de múltiples archivos en forma sincrónica
 */

(function () {
    'use strict';

    angular.module('angularLoad', [])
		.service('angularLoad', ['$document', '$q', '$timeout', function ($document, $q, $timeout) {
		    var document = $document[0];
		    var promises = {};

		    function loader(createElement) {
		        return function (url) {
		            if (typeof promises[url] === 'undefined') {
		                var deferred = $q.defer();
		                var element = createElement(url);

		                element.onload = element.onreadystatechange = function (e) {
		                    $timeout(function () {
		                        deferred.resolve(e);
		                    });
		                };
		                element.onerror = function (e) {
		                    $timeout(function () {
		                        deferred.reject(e);
		                    });
		                };

		                promises[url] = deferred.promise;
		            }

		            return promises[url];
		        };
		    }

		    /**
			 * Dynamically loads the given script
			 * @param src The url of the script to load dynamically
			 * @returns {*} Promise that will be resolved once the script has been loaded.
			 */
		    this.loadScript = loader(function (src) {
		        var script = document.createElement('script');

		        script.src = src;

		        document.body.appendChild(script);
		        return script;
		    });

		    /**
			 * Dynamically loads the given CSS file
			 * @param href The url of the CSS to load dynamically
			 * @returns {*} Promise that will be resolved once the CSS file has been loaded.
			 */
		    this.loadCSS = loader(function (href) {
		        var style = document.createElement('link');

		        style.rel = 'stylesheet';
		        style.type = 'text/css';
		        style.href = href;

		        document.head.appendChild(style);
		        return style;
		    });

		    /**
			 * Dynamically loads the given scripts in order
			 * @param array The urls of the scripts to load dynamically
			 * @returns {*} Promise that will be resolved once the scripts have been loaded.
			 */
		    this.loadScripts = function (array) {
		        var nextIndex = 0;
		        var mainDeferred = $q.defer();

		        function load(url) {
		            if (typeof promises[url] === 'undefined') {
		                var deferred = $q.defer();
		                var element = document.createElement('script');
		                element.src = url;
		                document.body.appendChild(element);

		                element.onload = element.onreadystatechange = function (e) {
		                    //$timeout(function () {
		                    deferred.resolve(e);
		                    //});
		                };
		                element.onerror = function (e) {
		                    //$timeout(function () {
		                    deferred.reject(e);
		                    //});
		                };

		                promises[url] = deferred.promise;
		            }
		            promises[url].then(
                        function () {
                            nextIndex++;
                            if (nextIndex < array.length)
                                load(array[nextIndex]);
                            else
                                $timeout(function () {
                                    mainDeferred.resolve();
                                });
                        },
                        function () {
                            $timeout(function () {
                                mainDeferred.reject();
                            });
                        }
                    );
		        }
		        load(array[nextIndex])
		        return mainDeferred.promise;
		    };
		}]);
})();
