(function()
{
    'use strict';
    angular.module('angularLoad', []).service('angularLoad', ['$document', '$q', '$timeout', function($document, $q, $timeout)
        {
            var document = $document[0];
            var promises = {};
            function loader(createElement)
            {
                return function(url)
                    {
                        if (typeof promises[url] === 'undefined')
                        {
                            var deferred = $q.defer();
                            var element = createElement(url);
                            element.onload = element.onreadystatechange = function(e)
                            {
                                $timeout(function()
                                {
                                    deferred.resolve(e)
                                })
                            };
                            element.onerror = function(e)
                            {
                                $timeout(function()
                                {
                                    deferred.reject(e)
                                })
                            };
                            promises[url] = deferred.promise
                        }
                        return promises[url]
                    }
            }
            this.loadScript = loader(function(src)
            {
                var script = document.createElement('script');
                script.src = src;
                document.body.appendChild(script);
                return script
            });
            this.loadCSS = loader(function(href)
            {
                var style = document.createElement('link');
                style.rel = 'stylesheet';
                style.type = 'text/css';
                style.href = href;
                document.head.appendChild(style);
                return style
            });
            this.loadScripts = function(array)
            {
                var nextIndex = 0;
                var mainDeferred = $q.defer();
                function load(url)
                {
                    if (typeof promises[url] === 'undefined')
                    {
                        var deferred = $q.defer();
                        var element = document.createElement('script');
                        element.src = url;
                        document.body.appendChild(element);
                        element.onload = element.onreadystatechange = function(e)
                        {
                            deferred.resolve(e)
                        };
                        element.onerror = function(e)
                        {
                            deferred.reject(e)
                        };
                        promises[url] = deferred.promise
                    }
                    promises[url].then(function()
                    {
                        nextIndex++;
                        if (nextIndex < array.length)
                            load(array[nextIndex]);
                        else
                            $timeout(function()
                            {
                                mainDeferred.resolve()
                            })
                    }, function()
                    {
                        $timeout(function()
                        {
                            mainDeferred.reject()
                        })
                    })
                }
                load(array[nextIndex]);
                return mainDeferred.promise
            }
        }])
})();
(function()
{
    "use strict";
    /**
    	 * Bindonce - Zero watches binding for AngularJs
    	 * @version v0.3.1
    	 * @link https://github.com/Pasvaz/bindonce
    	 * @author Pasquale Vazzana <pasqualevazzana@gmail.com>
    	 * @license MIT License, http://www.opensource.org/licenses/MIT
    	 */
    var bindonceModule = angular.module('pasvaz.bindonce', []);
    bindonceModule.directive('bindonce', function()
    {
        var toBoolean = function(value)
            {
                if (value && value.length !== 0)
                {
                    var v = angular.lowercase("" + value);
                    value = !(v === 'f' || v === '0' || v === 'false' || v === 'no' || v === 'n' || v === '[]')
                }
                else
                {
                    value = false
                }
                return value
            };
        var msie = parseInt((/msie (\d+)/.exec(angular.lowercase(navigator.userAgent)) || [])[1], 10);
        if (isNaN(msie))
        {
            msie = parseInt((/trident\/.*; rv:(\d+)/.exec(angular.lowercase(navigator.userAgent)) || [])[1], 10)
        }
        var bindonceDirective = {
                restrict: "AM", controller: ['$scope', '$element', '$attrs', '$interpolate', function($scope, $element, $attrs, $interpolate)
                        {
                            var showHideBinder = function(elm, attr, value)
                                {
                                    var show = (attr === 'show') ? '' : 'none';
                                    var hide = (attr === 'hide') ? '' : 'none';
                                    elm.css('display', toBoolean(value) ? show : hide)
                                };
                            var classBinder = function(elm, value)
                                {
                                    if (angular.isObject(value) && !angular.isArray(value))
                                    {
                                        var results = [];
                                        angular.forEach(value, function(value, index)
                                        {
                                            if (value)
                                                results.push(index)
                                        });
                                        value = results
                                    }
                                    if (value)
                                    {
                                        elm.addClass(angular.isArray(value) ? value.join(' ') : value)
                                    }
                                };
                            var transclude = function(transcluder, scope)
                                {
                                    transcluder.transclude(scope, function(clone)
                                    {
                                        var parent = transcluder.element.parent();
                                        var afterNode = transcluder.element && transcluder.element[transcluder.element.length - 1];
                                        var parentNode = parent && parent[0] || afterNode && afterNode.parentNode;
                                        var afterNextSibling = (afterNode && afterNode.nextSibling) || null;
                                        angular.forEach(clone, function(node)
                                        {
                                            parentNode.insertBefore(node, afterNextSibling)
                                        })
                                    })
                                };
                            var ctrl = {
                                    watcherRemover: undefined, binders: [], group: $attrs.boName, element: $element, ran: false, addBinder: function(binder)
                                        {
                                            this.binders.push(binder);
                                            if (this.ran)
                                            {
                                                this.runBinders()
                                            }
                                        }, setupWatcher: function(bindonceValue)
                                        {
                                            var that = this;
                                            this.watcherRemover = $scope.$watch(bindonceValue, function(newValue)
                                            {
                                                if (newValue === undefined)
                                                    return;
                                                that.removeWatcher();
                                                that.checkBindonce(newValue)
                                            }, true)
                                        }, checkBindonce: function(value)
                                        {
                                            var that = this,
                                                promise = (value.$promise) ? value.$promise.then : value.then;
                                            if (typeof promise === 'function')
                                            {
                                                promise(function()
                                                {
                                                    that.runBinders()
                                                })
                                            }
                                            else
                                            {
                                                that.runBinders()
                                            }
                                        }, removeWatcher: function()
                                        {
                                            if (this.watcherRemover !== undefined)
                                            {
                                                this.watcherRemover();
                                                this.watcherRemover = undefined
                                            }
                                        }, runBinders: function()
                                        {
                                            while (this.binders.length > 0)
                                            {
                                                var binder = this.binders.shift();
                                                if (this.group && this.group != binder.group)
                                                    continue;
                                                var value = binder.scope.$eval((binder.interpolate) ? $interpolate(binder.value) : binder.value);
                                                switch (binder.attr)
                                                {
                                                    case'boIf':
                                                        if (toBoolean(value))
                                                        {
                                                            transclude(binder, binder.scope.$new())
                                                        }
                                                        break;
                                                    case'boSwitch':
                                                        var selectedTranscludes,
                                                            switchCtrl = binder.controller[0];
                                                        if ((selectedTranscludes = switchCtrl.cases['!' + value] || switchCtrl.cases['?']))
                                                        {
                                                            binder.scope.$eval(binder.attrs.change);
                                                            angular.forEach(selectedTranscludes, function(selectedTransclude)
                                                            {
                                                                transclude(selectedTransclude, binder.scope.$new())
                                                            })
                                                        }
                                                        break;
                                                    case'boSwitchWhen':
                                                        var ctrl = binder.controller[0];
                                                        ctrl.cases['!' + binder.attrs.boSwitchWhen] = (ctrl.cases['!' + binder.attrs.boSwitchWhen] || []);
                                                        ctrl.cases['!' + binder.attrs.boSwitchWhen].push({
                                                            transclude: binder.transclude, element: binder.element
                                                        });
                                                        break;
                                                    case'boSwitchDefault':
                                                        var ctrl = binder.controller[0];
                                                        ctrl.cases['?'] = (ctrl.cases['?'] || []);
                                                        ctrl.cases['?'].push({
                                                            transclude: binder.transclude, element: binder.element
                                                        });
                                                        break;
                                                    case'hide':
                                                    case'show':
                                                        showHideBinder(binder.element, binder.attr, value);
                                                        break;
                                                    case'class':
                                                        classBinder(binder.element, value);
                                                        break;
                                                    case'text':
                                                        binder.element.text(value);
                                                        break;
                                                    case'html':
                                                        binder.element.html(value);
                                                        break;
                                                    case'style':
                                                        binder.element.css(value);
                                                        break;
                                                    case'src':
                                                        binder.element.attr(binder.attr, value);
                                                        if (msie)
                                                            binder.element.prop('src', value);
                                                        break;
                                                    case'attr':
                                                        angular.forEach(binder.attrs, function(attrValue, attrKey)
                                                        {
                                                            var newAttr,
                                                                newValue;
                                                            if (attrKey.match(/^boAttr./) && binder.attrs[attrKey])
                                                            {
                                                                newAttr = attrKey.replace(/^boAttr/, '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
                                                                newValue = binder.scope.$eval(binder.attrs[attrKey]);
                                                                binder.element.attr(newAttr, newValue)
                                                            }
                                                        });
                                                        break;
                                                    case'href':
                                                    case'alt':
                                                    case'title':
                                                    case'id':
                                                    case'value':
                                                        binder.element.attr(binder.attr, value);
                                                        break
                                                }
                                            }
                                            this.ran = true
                                        }
                                };
                            return ctrl
                        }], link: function(scope, elm, attrs, bindonceController)
                    {
                        var value = attrs.bindonce && scope.$eval(attrs.bindonce);
                        if (value !== undefined)
                        {
                            bindonceController.checkBindonce(value)
                        }
                        else
                        {
                            bindonceController.setupWatcher(attrs.bindonce);
                            elm.bind("$destroy", bindonceController.removeWatcher)
                        }
                    }
            };
        return bindonceDirective
    });
    angular.forEach([{
            directiveName: 'boShow', attribute: 'show'
        }, {
            directiveName: 'boHide', attribute: 'hide'
        }, {
            directiveName: 'boClass', attribute: 'class'
        }, {
            directiveName: 'boText', attribute: 'text'
        }, {
            directiveName: 'boBind', attribute: 'text'
        }, {
            directiveName: 'boHtml', attribute: 'html'
        }, {
            directiveName: 'boSrcI', attribute: 'src', interpolate: true
        }, {
            directiveName: 'boSrc', attribute: 'src'
        }, {
            directiveName: 'boHrefI', attribute: 'href', interpolate: true
        }, {
            directiveName: 'boHref', attribute: 'href'
        }, {
            directiveName: 'boAlt', attribute: 'alt'
        }, {
            directiveName: 'boTitle', attribute: 'title'
        }, {
            directiveName: 'boId', attribute: 'id'
        }, {
            directiveName: 'boStyle', attribute: 'style'
        }, {
            directiveName: 'boValue', attribute: 'value'
        }, {
            directiveName: 'boAttr', attribute: 'attr'
        }, {
            directiveName: 'boIf', transclude: 'element', terminal: true, priority: 1000
        }, {
            directiveName: 'boSwitch', require: 'boSwitch', controller: function()
                {
                    this.cases = {}
                }
        }, {
            directiveName: 'boSwitchWhen', transclude: 'element', priority: 800, require: '^boSwitch'
        }, {
            directiveName: 'boSwitchDefault', transclude: 'element', priority: 800, require: '^boSwitch'
        }], function(boDirective)
    {
        var childPriority = 200;
        return bindonceModule.directive(boDirective.directiveName, function()
            {
                var bindonceDirective = {
                        priority: boDirective.priority || childPriority, transclude: boDirective.transclude || false, terminal: boDirective.terminal || false, require: ['^bindonce'].concat(boDirective.require || []), controller: boDirective.controller, compile: function(tElement, tAttrs, transclude)
                            {
                                return function(scope, elm, attrs, controllers)
                                    {
                                        var bindonceController = controllers[0];
                                        var name = attrs.boParent;
                                        if (name && bindonceController.group !== name)
                                        {
                                            var element = bindonceController.element.parent();
                                            bindonceController = undefined;
                                            var parentValue;
                                            while (element[0].nodeType !== 9 && element.length)
                                            {
                                                if ((parentValue = element.data('$bindonceController')) && parentValue.group === name)
                                                {
                                                    bindonceController = parentValue;
                                                    break
                                                }
                                                element = element.parent()
                                            }
                                            if (!bindonceController)
                                            {
                                                throw new Error("No bindonce controller: " + name);
                                            }
                                        }
                                        bindonceController.addBinder({
                                            element: elm, attr: boDirective.attribute || boDirective.directiveName, attrs: attrs, value: attrs[boDirective.directiveName], interpolate: boDirective.interpolate, group: name, transclude: transclude, controller: controllers.slice(1), scope: scope
                                        })
                                    }
                            }
                    };
                return bindonceDirective
            })
    })
})();
if (window.XMLHttpRequest && !(window.FileAPI && FileAPI.shouldLoad))
{
    window.XMLHttpRequest.prototype.setRequestHeader = (function(orig)
    {
        return function(header, value)
            {
                if (header === '__setXHR_')
                {
                    var val = value(this);
                    if (val instanceof Function)
                    {
                        val(this)
                    }
                }
                else
                {
                    orig.apply(this, arguments)
                }
            }
    })(window.XMLHttpRequest.prototype.setRequestHeader)
}
var ngFileUpload = angular.module('ngFileUpload', []);
ngFileUpload.version = '5.0.9';
ngFileUpload.service('Upload', ['$http', '$q', '$timeout', function($http, $q, $timeout)
    {
        function sendHttp(config)
        {
            config.method = config.method || 'POST';
            config.headers = config.headers || {};
            var deferred = $q.defer();
            var promise = deferred.promise;
            config.headers.__setXHR_ = function()
            {
                return function(xhr)
                    {
                        if (!xhr)
                            return;
                        config.__XHR = xhr;
                        if (config.xhrFn)
                            config.xhrFn(xhr);
                        xhr.upload.addEventListener('progress', function(e)
                        {
                            e.config = config;
                            if (deferred.notify)
                            {
                                deferred.notify(e)
                            }
                            else if (promise.progressFunc)
                            {
                                $timeout(function()
                                {
                                    promise.progressFunc(e)
                                })
                            }
                        }, false);
                        xhr.upload.addEventListener('load', function(e)
                        {
                            if (e.lengthComputable)
                            {
                                e.config = config;
                                if (deferred.notify)
                                {
                                    deferred.notify(e)
                                }
                                else if (promise.progressFunc)
                                {
                                    $timeout(function()
                                    {
                                        promise.progressFunc(e)
                                    })
                                }
                            }
                        }, false)
                    }
            };
            $http(config).then(function(r)
            {
                deferred.resolve(r)
            }, function(e)
            {
                deferred.reject(e)
            }, function(n)
            {
                deferred.notify(n)
            });
            promise.success = function(fn)
            {
                promise.then(function(response)
                {
                    fn(response.data, response.status, response.headers, config)
                });
                return promise
            };
            promise.error = function(fn)
            {
                promise.then(null, function(response)
                {
                    fn(response.data, response.status, response.headers, config)
                });
                return promise
            };
            promise.progress = function(fn)
            {
                promise.progressFunc = fn;
                promise.then(null, null, function(update)
                {
                    fn(update)
                });
                return promise
            };
            promise.abort = function()
            {
                if (config.__XHR)
                {
                    $timeout(function()
                    {
                        config.__XHR.abort()
                    })
                }
                return promise
            };
            promise.xhr = function(fn)
            {
                config.xhrFn = (function(origXhrFn)
                {
                    return function()
                        {
                            if (origXhrFn)
                                origXhrFn.apply(promise, arguments);
                            fn.apply(promise, arguments)
                        }
                })(config.xhrFn);
                return promise
            };
            return promise
        }
        this.upload = function(config)
        {
            function addFieldToFormData(formData, val, key)
            {
                if (val !== undefined)
                {
                    if (angular.isDate(val))
                    {
                        val = val.toISOString()
                    }
                    if (angular.isString(val))
                    {
                        formData.append(key, val)
                    }
                    else if (config.sendFieldsAs === 'form')
                    {
                        if (angular.isObject(val))
                        {
                            for (var k in val)
                            {
                                if (val.hasOwnProperty(k))
                                {
                                    addFieldToFormData(formData, val[k], key + '[' + k + ']')
                                }
                            }
                        }
                        else
                        {
                            formData.append(key, val)
                        }
                    }
                    else
                    {
                        val = angular.isString(val) ? val : JSON.stringify(val);
                        if (config.sendFieldsAs === 'json-blob')
                        {
                            formData.append(key, new Blob([val], {type: 'application/json'}))
                        }
                        else
                        {
                            formData.append(key, val)
                        }
                    }
                }
            }
            config.headers = config.headers || {};
            config.headers['Content-Type'] = undefined;
            config.transformRequest = config.transformRequest ? (angular.isArray(config.transformRequest) ? config.transformRequest : [config.transformRequest]) : [];
            config.transformRequest.push(function(data)
            {
                var formData = new FormData;
                var allFields = {};
                var key;
                for (key in config.fields)
                {
                    if (config.fields.hasOwnProperty(key))
                    {
                        allFields[key] = config.fields[key]
                    }
                }
                if (data)
                    allFields.data = data;
                for (key in allFields)
                {
                    if (allFields.hasOwnProperty(key))
                    {
                        var val = allFields[key];
                        if (config.formDataAppender)
                        {
                            config.formDataAppender(formData, key, val)
                        }
                        else
                        {
                            addFieldToFormData(formData, val, key)
                        }
                    }
                }
                if (config.file != null)
                {
                    var fileFormName = config.fileFormDataName || 'file';
                    if (angular.isArray(config.file))
                    {
                        var isFileFormNameString = angular.isString(fileFormName);
                        for (var i = 0; i < config.file.length; i++)
                        {
                            formData.append(isFileFormNameString ? fileFormName : fileFormName[i], config.file[i], (config.fileName && config.fileName[i]) || config.file[i].name)
                        }
                    }
                    else
                    {
                        formData.append(fileFormName, config.file, config.fileName || config.file.name)
                    }
                }
                return formData
            });
            return sendHttp(config)
        };
        this.http = function(config)
        {
            config.transformRequest = config.transformRequest || function(data)
            {
                if ((window.ArrayBuffer && data instanceof window.ArrayBuffer) || data instanceof Blob)
                {
                    return data
                }
                return $http.defaults.transformRequest[0](arguments)
            };
            return sendHttp(config)
        }
    }]);
(function()
{
    ngFileUpload.directive('ngfSelect', ['$parse', '$timeout', '$compile', function($parse, $timeout, $compile)
        {
            return {
                    restrict: 'AEC', require: '?ngModel', link: function(scope, elem, attr, ngModel)
                        {
                            linkFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile)
                        }
                }
        }]);
    function linkFileSelect(scope, elem, attr, ngModel, $parse, $timeout, $compile)
    {
        if (elem.attr('__ngf_gen__'))
        {
            return
        }
        scope.$on('$destroy', function()
        {
            if (elem.$$ngfRefElem)
                elem.$$ngfRefElem.remove()
        });
        var disabled = false;
        if (attr.ngfSelect.search(/\W+$files\W+/) === -1)
        {
            scope.$watch(attr.ngfSelect, function(val)
            {
                disabled = val === false
            })
        }
        function isInputTypeFile()
        {
            return elem[0].tagName.toLowerCase() === 'input' && attr.type && attr.type.toLowerCase() === 'file'
        }
        var isUpdating = false;
        function changeFn(evt)
        {
            if (!isUpdating)
            {
                isUpdating = true;
                try
                {
                    var fileList = evt.__files_ || (evt.target && evt.target.files);
                    var files = [],
                        rejFiles = [];
                    for (var i = 0; i < fileList.length; i++)
                    {
                        var file = fileList.item(i);
                        if (validate(scope, $parse, attr, file, evt))
                        {
                            files.push(file)
                        }
                        else
                        {
                            rejFiles.push(file)
                        }
                    }
                    updateModel($parse, $timeout, scope, ngModel, attr, attr.ngfChange || attr.ngfSelect, files, rejFiles, evt);
                    if (files.length === 0)
                        evt.target.value = files
                }
                finally
                {
                    isUpdating = false
                }
            }
        }
        function bindAttrToFileInput(fileElem)
        {
            if (attr.ngfMultiple)
                fileElem.attr('multiple', $parse(attr.ngfMultiple)(scope));
            if (attr.ngfCapture)
                fileElem.attr('capture', $parse(attr.ngfCapture)(scope));
            if (attr.accept)
                fileElem.attr('accept', attr.accept);
            for (var i = 0; i < elem[0].attributes.length; i++)
            {
                var attribute = elem[0].attributes[i];
                if ((isInputTypeFile() && attribute.name !== 'type') || (attribute.name !== 'type' && attribute.name !== 'class' && attribute.name !== 'id' && attribute.name !== 'style'))
                {
                    fileElem.attr(attribute.name, attribute.value)
                }
            }
        }
        function createFileInput(evt, resetOnClick)
        {
            if (!resetOnClick && (evt || isInputTypeFile()))
                return elem.$$ngfRefElem || elem;
            var fileElem = angular.element('<input type="file">');
            bindAttrToFileInput(fileElem);
            if (isInputTypeFile())
            {
                elem.replaceWith(fileElem);
                elem = fileElem;
                fileElem.attr('__ngf_gen__', true);
                $compile(elem)(scope)
            }
            else
            {
                fileElem.css('visibility', 'hidden').css('position', 'absolute').css('overflow', 'hidden').css('width', '0px').css('height', '0px').css('z-index', '-100000').css('border', 'none').css('margin', '0px').css('padding', '0px').attr('tabindex', '-1');
                if (elem.$$ngfRefElem)
                {
                    elem.$$ngfRefElem.remove()
                }
                elem.$$ngfRefElem = fileElem;
                document.body.appendChild(fileElem[0])
            }
            return fileElem
        }
        function resetModel(evt)
        {
            updateModel($parse, $timeout, scope, ngModel, attr, attr.ngfChange || attr.ngfSelect, [], [], evt, true)
        }
        function clickHandler(evt)
        {
            if (elem.attr('disabled') || disabled)
                return false;
            if (evt != null)
            {
                evt.preventDefault();
                evt.stopPropagation()
            }
            var resetOnClick = $parse(attr.ngfResetOnClick)(scope) !== false;
            var fileElem = createFileInput(evt, resetOnClick);
            function clickAndAssign(evt)
            {
                if (evt)
                {
                    fileElem[0].click()
                }
                if (isInputTypeFile() || !evt)
                {
                    elem.bind('click touchend', clickHandler)
                }
            }
            if (fileElem)
            {
                if (!evt || resetOnClick)
                    fileElem.bind('change', changeFn);
                if (evt && resetOnClick && $parse(attr.ngfResetModelOnClick)(scope) !== false)
                    resetModel(evt);
                if (shouldClickLater(navigator.userAgent))
                {
                    setTimeout(function()
                    {
                        clickAndAssign(evt)
                    }, 0)
                }
                else
                {
                    clickAndAssign(evt)
                }
            }
            return false
        }
        if (window.FileAPI && window.FileAPI.ngfFixIE)
        {
            window.FileAPI.ngfFixIE(elem, createFileInput, bindAttrToFileInput, changeFn)
        }
        else
        {
            clickHandler()
        }
    }
    function shouldClickLater(ua)
    {
        var m = ua.match(/Android[^\d]*(\d+)\.(\d+)/);
        if (m && m.length > 2)
        {
            return parseInt(m[1]) < 4 || (parseInt(m[1]) === 4 && parseInt(m[2]) < 4)
        }
        return /.*Windows.*Safari.*/.test(ua)
    }
    ngFileUpload.validate = function(scope, $parse, attr, file, evt)
    {
        function globStringToRegex(str)
        {
            if (str.length > 2 && str[0] === '/' && str[str.length - 1] === '/')
            {
                return str.substring(1, str.length - 1)
            }
            var split = str.split(','),
                result = '';
            if (split.length > 1)
            {
                for (var i = 0; i < split.length; i++)
                {
                    result += '(' + globStringToRegex(split[i]) + ')';
                    if (i < split.length - 1)
                    {
                        result += '|'
                    }
                }
            }
            else
            {
                if (str.indexOf('.') === 0)
                {
                    str = '*' + str
                }
                result = '^' + str.replace(new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\' + '-]', 'g'), '\\$&') + '$';
                result = result.replace(/\\\*/g, '.*').replace(/\\\?/g, '.')
            }
            return result
        }
        var accept = $parse(attr.ngfAccept)(scope, {
                $file: file, $event: evt
            });
        var fileSizeMax = $parse(attr.ngfMaxSize)(scope, {
                $file: file, $event: evt
            }) || 9007199254740991;
        var fileSizeMin = $parse(attr.ngfMinSize)(scope, {
                $file: file, $event: evt
            }) || -1;
        if (accept != null && angular.isString(accept))
        {
            var regexp = new RegExp(globStringToRegex(accept), 'gi');
            accept = (file.type != null && regexp.test(file.type.toLowerCase())) || (file.name != null && regexp.test(file.name.toLowerCase()))
        }
        return (accept == null || accept) && (file.size == null || (file.size < fileSizeMax && file.size > fileSizeMin))
    };
    ngFileUpload.updateModel = function($parse, $timeout, scope, ngModel, attr, fileChange, files, rejFiles, evt, noDelay)
    {
        function update()
        {
            if ($parse(attr.ngfKeep)(scope) === true)
            {
                var prevFiles = (ngModel.$modelValue || []).slice(0);
                if (!files || !files.length)
                {
                    files = prevFiles
                }
                else if ($parse(attr.ngfKeepDistinct)(scope) === true)
                {
                    var len = prevFiles.length;
                    for (var i = 0; i < files.length; i++)
                    {
                        for (var j = 0; j < len; j++)
                        {
                            if (files[i].name === prevFiles[j].name)
                                break
                        }
                        if (j === len)
                        {
                            prevFiles.push(files[i])
                        }
                    }
                    files = prevFiles
                }
                else
                {
                    files = prevFiles.concat(files)
                }
            }
            if (ngModel)
            {
                $parse(attr.ngModel).assign(scope, files);
                $timeout(function()
                {
                    if (ngModel)
                    {
                        ngModel.$setViewValue(files != null && files.length === 0 ? null : files)
                    }
                })
            }
            if (attr.ngModelRejected)
            {
                $parse(attr.ngModelRejected).assign(scope, rejFiles)
            }
            if (fileChange)
            {
                $parse(fileChange)(scope, {
                    $files: files, $rejectedFiles: rejFiles, $event: evt
                })
            }
        }
        if (noDelay)
        {
            update()
        }
        else
        {
            $timeout(function()
            {
                update()
            })
        }
    };
    var validate = ngFileUpload.validate;
    var updateModel = ngFileUpload.updateModel
})();
(function()
{
    var validate = ngFileUpload.validate;
    var updateModel = ngFileUpload.updateModel;
    ngFileUpload.directive('ngfDrop', ['$parse', '$timeout', '$location', function($parse, $timeout, $location)
        {
            return {
                    restrict: 'AEC', require: '?ngModel', link: function(scope, elem, attr, ngModel)
                        {
                            linkDrop(scope, elem, attr, ngModel, $parse, $timeout, $location)
                        }
                }
        }]);
    ngFileUpload.directive('ngfNoFileDrop', function()
    {
        return function(scope, elem)
            {
                if (dropAvailable())
                    elem.css('display', 'none')
            }
    });
    ngFileUpload.directive('ngfDropAvailable', ['$parse', '$timeout', function($parse, $timeout)
        {
            return function(scope, elem, attr)
                {
                    if (dropAvailable())
                    {
                        var fn = $parse(attr.ngfDropAvailable);
                        $timeout(function()
                        {
                            fn(scope);
                            if (fn.assign)
                            {
                                fn.assign(scope, true)
                            }
                        })
                    }
                }
        }]);
    function linkDrop(scope, elem, attr, ngModel, $parse, $timeout, $location)
    {
        var available = dropAvailable();
        if (attr.dropAvailable)
        {
            $timeout(function()
            {
                if (scope[attr.dropAvailable])
                {
                    scope[attr.dropAvailable].value = available
                }
                else
                {
                    scope[attr.dropAvailable] = available
                }
            })
        }
        if (!available)
        {
            if ($parse(attr.ngfHideOnDropNotAvailable)(scope) === true)
            {
                elem.css('display', 'none')
            }
            return
        }
        var disabled = false;
        if (attr.ngfDrop.search(/\W+$files\W+/) === -1)
        {
            scope.$watch(attr.ngfDrop, function(val)
            {
                disabled = val === false
            })
        }
        var leaveTimeout = null;
        var stopPropagation = $parse(attr.ngfStopPropagation);
        var dragOverDelay = 1;
        var actualDragOverClass;
        elem[0].addEventListener('dragover', function(evt)
        {
            if (elem.attr('disabled') || disabled)
                return;
            evt.preventDefault();
            if (stopPropagation(scope))
                evt.stopPropagation();
            if (navigator.userAgent.indexOf('Chrome') > -1)
            {
                var b = evt.dataTransfer.effectAllowed;
                evt.dataTransfer.dropEffect = ('move' === b || 'linkMove' === b) ? 'move' : 'copy'
            }
            $timeout.cancel(leaveTimeout);
            if (!scope.actualDragOverClass)
            {
                actualDragOverClass = calculateDragOverClass(scope, attr, evt)
            }
            elem.addClass(actualDragOverClass)
        }, false);
        elem[0].addEventListener('dragenter', function(evt)
        {
            if (elem.attr('disabled') || disabled)
                return;
            evt.preventDefault();
            if (stopPropagation(scope))
                evt.stopPropagation()
        }, false);
        elem[0].addEventListener('dragleave', function()
        {
            if (elem.attr('disabled') || disabled)
                return;
            leaveTimeout = $timeout(function()
            {
                elem.removeClass(actualDragOverClass);
                actualDragOverClass = null
            }, dragOverDelay || 1)
        }, false);
        elem[0].addEventListener('drop', function(evt)
        {
            if (elem.attr('disabled') || disabled)
                return;
            evt.preventDefault();
            if (stopPropagation(scope))
                evt.stopPropagation();
            elem.removeClass(actualDragOverClass);
            actualDragOverClass = null;
            extractFiles(evt, function(files, rejFiles)
            {
                updateModel($parse, $timeout, scope, ngModel, attr, attr.ngfChange || attr.ngfDrop, files, rejFiles, evt)
            }, $parse(attr.ngfAllowDir)(scope) !== false, attr.multiple || $parse(attr.ngfMultiple)(scope))
        }, false);
        function calculateDragOverClass(scope, attr, evt)
        {
            var accepted = true;
            var items = evt.dataTransfer.items;
            if (items != null)
            {
                for (var i = 0; i < items.length && accepted; i++)
                {
                    accepted = accepted && (items[i].kind === 'file' || items[i].kind === '') && validate(scope, $parse, attr, items[i], evt)
                }
            }
            var clazz = $parse(attr.ngfDragOverClass)(scope, {$event: evt});
            if (clazz)
            {
                if (clazz.delay)
                    dragOverDelay = clazz.delay;
                if (clazz.accept)
                    clazz = accepted ? clazz.accept : clazz.reject
            }
            return clazz || attr.ngfDragOverClass || 'dragover'
        }
        function extractFiles(evt, callback, allowDir, multiple)
        {
            var files = [],
                rejFiles = [],
                items = evt.dataTransfer.items,
                processing = 0;
            function addFile(file)
            {
                if (validate(scope, $parse, attr, file, evt))
                {
                    files.push(file)
                }
                else
                {
                    rejFiles.push(file)
                }
            }
            function traverseFileTree(files, entry, path)
            {
                if (entry != null)
                {
                    if (entry.isDirectory)
                    {
                        var filePath = (path || '') + entry.name;
                        addFile({
                            name: entry.name, type: 'directory', path: filePath
                        });
                        var dirReader = entry.createReader();
                        var entries = [];
                        processing++;
                        var readEntries = function()
                            {
                                dirReader.readEntries(function(results)
                                {
                                    try
                                    {
                                        if (!results.length)
                                        {
                                            for (var i = 0; i < entries.length; i++)
                                            {
                                                traverseFileTree(files, entries[i], (path ? path : '') + entry.name + '/')
                                            }
                                            processing--
                                        }
                                        else
                                        {
                                            entries = entries.concat(Array.prototype.slice.call(results || [], 0));
                                            readEntries()
                                        }
                                    }
                                    catch(e)
                                    {
                                        processing--;
                                        console.error(e)
                                    }
                                }, function()
                                {
                                    processing--
                                })
                            };
                        readEntries()
                    }
                    else
                    {
                        processing++;
                        entry.file(function(file)
                        {
                            try
                            {
                                processing--;
                                file.path = (path ? path : '') + file.name;
                                addFile(file)
                            }
                            catch(e)
                            {
                                processing--;
                                console.error(e)
                            }
                        }, function()
                        {
                            processing--
                        })
                    }
                }
            }
            if (items && items.length > 0 && $location.protocol() !== 'file')
            {
                for (var i = 0; i < items.length; i++)
                {
                    if (items[i].webkitGetAsEntry && items[i].webkitGetAsEntry() && items[i].webkitGetAsEntry().isDirectory)
                    {
                        var entry = items[i].webkitGetAsEntry();
                        if (entry.isDirectory && !allowDir)
                        {
                            continue
                        }
                        if (entry != null)
                        {
                            traverseFileTree(files, entry)
                        }
                    }
                    else
                    {
                        var f = items[i].getAsFile();
                        if (f != null)
                            addFile(f)
                    }
                    if (!multiple && files.length > 0)
                        break
                }
            }
            else
            {
                var fileList = evt.dataTransfer.files;
                if (fileList != null)
                {
                    for (var j = 0; j < fileList.length; j++)
                    {
                        addFile(fileList.item(j));
                        if (!multiple && files.length > 0)
                        {
                            break
                        }
                    }
                }
            }
            var delays = 0;
            (function waitForProcess(delay)
            {
                $timeout(function()
                {
                    if (!processing)
                    {
                        if (!multiple && files.length > 1)
                        {
                            i = 0;
                            while (files[i].type === 'directory')
                                i++;
                            files = [files[i]]
                        }
                        callback(files, rejFiles)
                    }
                    else
                    {
                        if (delays++ * 10 < 20 * 1000)
                        {
                            waitForProcess(10)
                        }
                    }
                }, delay || 0)
            })()
        }
    }
    ngFileUpload.directive('ngfSrc', ['$parse', '$timeout', function($parse, $timeout)
        {
            return {
                    restrict: 'AE', link: function(scope, elem, attr)
                        {
                            if (window.FileReader)
                            {
                                scope.$watch(attr.ngfSrc, function(file)
                                {
                                    if (file && validate(scope, $parse, attr, file, null) && (!window.FileAPI || navigator.userAgent.indexOf('MSIE 8') === -1 || file.size < 20000) && (!window.FileAPI || navigator.userAgent.indexOf('MSIE 9') === -1 || file.size < 4000000))
                                    {
                                        $timeout(function()
                                        {
                                            var URL = window.URL || window.webkitURL;
                                            if (URL && URL.createObjectURL)
                                            {
                                                elem.attr('src', URL.createObjectURL(file))
                                            }
                                            else
                                            {
                                                var fileReader = new FileReader;
                                                fileReader.readAsDataURL(file);
                                                fileReader.onload = function(e)
                                                {
                                                    $timeout(function()
                                                    {
                                                        elem.attr('src', e.target.result)
                                                    })
                                                }
                                            }
                                        })
                                    }
                                    else
                                    {
                                        elem.attr('src', attr.ngfDefaultSrc || '')
                                    }
                                })
                            }
                        }
                }
        }]);
    function dropAvailable()
    {
        var div = document.createElement('div');
        return ('draggable' in div) && ('ondrop' in div)
    }
})()