'use strict';
angular.module('global', []);
angular.module('global').factory('Global', ['$q', function($q)
    {
        return {
                _initPromises: [], _searchCache: [], init: function(promise)
                    {
                        this._initPromises.push(promise)
                    }, waitInit: function()
                    {
                        return $q.all(this._initPromises)
                    }, matchText: function(term, text)
                    {
                        return Select2.util.stripDiacritics('' + text).toUpperCase().indexOf(Select2.util.stripDiacritics('' + term).toUpperCase()) >= 0
                    }, getMatches: function(promise, query, getTextFunction, orderBy)
                    {
                        if (!getTextFunction)
                            getTextFunction = function(item)
                            {
                                return item.nombre
                            };
                        if (query)
                        {
                            var self = this;
                            promise = promise.then(function(data)
                            {
                                if (angular.isString(query))
                                {
                                    var matches = [];
                                    for (var i = 0; i < data.length; i++)
                                    {
                                        if (self.matchText(query, getTextFunction(data[i])))
                                            matches.push(data[i])
                                    }
                                    return matches
                                }
                                else if (angular.isArray(query))
                                {
                                    var matches = [];
                                    for (var j = 0; j < query.length; j++)
                                    {
                                        for (var i = 0; i < data.length; i++)
                                        {
                                            if ((angular.isNumber(query[j]) && data[i].id == query[j]) || (angular.isObject(query[j]) && 'id' in query[j] && data[i].id == query[j].id))
                                                matches.push(data[i])
                                        }
                                    }
                                    return matches
                                }
                                else
                                {
                                    for (var i = 0; i < data.length; i++)
                                    {
                                        if ((angular.isNumber(query) && data[i].id == query) || (angular.isObject(query) && 'id' in query && data[i].id == query.id))
                                            return data[i]
                                    }
                                    return data
                                }
                            })
                        }
                        return promise.then(function(data)
                            {
                                if (orderBy)
                                    data = $filter("orderBy")(data, orderBy);
                                return data
                            })
                    }, getById: function(array, id, showError)
                    {
                        if (array)
                            for (var i = 0; i < array.length; i++)
                            {
                                if (array[i].id == id)
                                    return array[i]
                            }
                        if (showError)
                            throw"Id no encontrado";
                        return null
                    }, indexById: function(array, id)
                    {
                        if (array)
                            for (var i = 0; i < array.length; i++)
                            {
                                if (array[i].id == id)
                                    return i
                            }
                        return -1
                    }, compareDate: function(date1, date2)
                    {
                        var d1 = new Date(date1);
                        var d2 = new Date(date2);
                        d1.setHours(0, 0, 0, 0);
                        d2.setHours(0, 0, 0, 0);
                        return (d1.getTime() - d2.getTime()) / (1000 * 60 * 60 * 24)
                    }, compareDateTime: function(date1, date2)
                    {
                        return date1.getTime() - date2.getTime()
                    }, isToday: function(date)
                    {
                        return this.compareDate(date, new Date) == 0
                    }, cache: {
                        data: {}, get: function(key, id, params)
                            {
                                return this.data[key + '/' + id + '/' + JSON.stringify(params)]
                            }, put: function(key, id, params, value)
                            {
                                this.data[key + '/' + id + '/' + JSON.stringify(params)] = value
                            }, invalidate: function(key, id)
                            {
                                for (var k in this.data)
                                {
                                    if (k.indexOf(key + '/' + id + '/') == 0)
                                    {
                                        console.log('cache - invalidate ' + k);
                                        delete this.data[k]
                                    }
                                }
                            }
                    }, watchCount: function()
                    {
                        var root = $(document.getElementsByTagName('body'));
                        var watchers = [];
                        var f = function(element)
                            {
                                if (element.data().hasOwnProperty('$scope'))
                                {
                                    angular.forEach(element.data().$scope.$$watchers, function(watcher)
                                    {
                                        watchers.push(watcher)
                                    })
                                }
                                angular.forEach(element.children(), function(childElement)
                                {
                                    f($(childElement))
                                })
                            };
                        f(root);
                        console.log("Watch count: " + watchers.length);
                        return watchers.length
                    }, strings: {
                        capitalizeWords: function(string)
                        {
                            return string.replace(/\w\S*/g, function(txt)
                                {
                                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                                })
                        }, format: function()
                            {
                                var theString = arguments[0];
                                for (var i = 1; i < arguments.length; i++)
                                {
                                    var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
                                    theString = theString.replace(regEx, arguments[i])
                                }
                                return theString
                            }
                    }
            }
    }]);
angular.module('global').factory('Server', ["serviceStackRestClient", "Plex", "$http", "$window", function(serviceStackRestClient, Plex, $http, $window)
    {
        return {
                onThen: function(response)
                {
                    if (response && angular.isDefined(response.data))
                        return response.data;
                    else
                        return response
                }, onSuccess: function(response, updateUI)
                    {
                        if (updateUI)
                        {
                            Plex.loading.update(false, updateUI == "big")
                        }
                        return response
                    }, onError: function(response, updateUI)
                    {
                        if (updateUI)
                        {
                            if (response && response.statusCode)
                                switch (response.statusCode)
                                {
                                    case 403:
                                        if (response.error && response.error.errorCode)
                                        {
                                            var errorCode = Number(response.error.errorCode);
                                            switch (errorCode)
                                            {
                                                case 7003:
                                                    $window.location = "/dotnet/SSO/Login.aspx?url=" + $window.encodeURIComponent($window.location);
                                                    break;
                                                case 7004:
                                                    Plex.sessionLock(true);
                                                    break;
                                                case 7010:
                                                    Plex.showError("Utilizar HTTPS para conectarse a este sitio");
                                                    break;
                                                default:
                                                    Plex.showError()
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
                                        Plex.showError()
                                }
                            else
                                Plex.showError();
                            Plex.loading.update(false, updateUI == "big")
                        }
                        return response
                    }, onValidation: function(response, updateUI)
                    {
                        if (updateUI)
                        {
                            Plex.showWarning(response.response.data.responseStatus.message);
                            Plex.loading.update(false, updateUI == "big")
                        }
                        return response
                    }, get: function(url, config)
                    {
                        config = angular.extend({updateUI: "small"}, config);
                        if (config.updateUI)
                            Plex.loading.update(true, config.updateUI == "big");
                        var self = this;
                        return serviceStackRestClient.get(url, config).success(function(response)
                            {
                                return self.onSuccess(response, config.updateUI)
                            }).error(function(response)
                            {
                                return self.onError(response, config.updateUI)
                            }).validation(function(response)
                            {
                                return self.onValidation(response, config.updateUI)
                            }).then(function(response)
                            {
                                return self.onThen(response)
                            })
                    }, patch: function(url, data, config)
                    {
                        config = angular.extend({
                            updateUI: "small", method: "PATCH", data: data, url: url
                        }, config);
                        if (config.updateUI)
                            Plex.loading.update(true, config.updateUI == "big");
                        var self = this;
                        return serviceStackRestClient.execute(config).success(function(response)
                            {
                                return self.onSuccess(response, config.updateUI)
                            }).error(function(response)
                            {
                                return self.onError(response, config.updateUI)
                            }).validation(function(response)
                            {
                                return self.onValidation(response, config.updateUI)
                            }).then(function(response)
                            {
                                return self.onThen(response)
                            })
                    }, post: function(url, data, config)
                    {
                        config = angular.extend({updateUI: "small"}, config);
                        if (config.updateUI)
                            Plex.loading.update(true, config.updateUI == "big");
                        var self = this;
                        return serviceStackRestClient.post(url, data, config).success(function(response)
                            {
                                return self.onSuccess(response, config.updateUI)
                            }).error(function(response)
                            {
                                return self.onError(response, config.updateUI)
                            }).validation(function(response)
                            {
                                return self.onValidation(response, config.updateUI)
                            }).then(function(response)
                            {
                                return self.onThen(response)
                            })
                    }, put: function(url, data, config)
                    {
                        config = angular.extend({updateUI: "small"}, config);
                        if (config.updateUI)
                            Plex.loading.update(true, config.updateUI == "big");
                        var self = this;
                        return serviceStackRestClient.post(url, data, config).success(function(response)
                            {
                                return self.onSuccess(response, config.updateUI)
                            }).error(function(response)
                            {
                                return self.onError(response, config.updateUI)
                            }).validation(function(response)
                            {
                                return self.onValidation(response, config.updateUI)
                            }).then(function(response)
                            {
                                return self.onThen(response)
                            })
                    }, delete: function(url, config)
                    {
                        config = angular.extend({updateUI: "small"}, config);
                        if (config.updateUI)
                            Plex.loading.update(true, config.updateUI == "big");
                        var self = this;
                        return serviceStackRestClient.delete(url, config).success(function(response)
                            {
                                return self.onSuccess(response, config.updateUI)
                            }).error(function(response)
                            {
                                return self.onError(response, config.updateUI)
                            }).validation(function(response)
                            {
                                return self.onValidation(response, config.updateUI)
                            }).then(function(response)
                            {
                                return self.onThen(response)
                            })
                    }
            }
    }]);
angular.module('global').factory('SSO', ['$rootScope', 'serviceStackRestClient', '$timeout', function($rootScope, serviceStackRestClient, $timeout)
    {
        var self = {
                _initCache: null, session: null, init: function()
                    {
                      return $timeout(function(){});
                      
                        if (!self._initCache)
                            self._initCache = serviceStackRestClient.get('/api/sso/sessions/current').then(function(response)
                            {
                                self.session = response.data
                            });
                        return self._initCache
                    }, menu: function(applicationId)
                    {
                        return serviceStackRestClient.get('/api/sso/users/current/menu/' + applicationId).then(function(response)
                            {
                                return (response && response.data) || response
                            })
                    }, settings: {
                        get: function(setting)
                        {
                            return serviceStackRestClient.get('/api/sso/users/current/settings/' + setting).then(function(response)
                                {
                                    return (response && response.data) || response
                                })
                        }, post: function(setting, value)
                            {
                                return serviceStackRestClient.post('/api/sso/users/current/settings/' + setting, {value: value}).then(function(response)
                                    {
                                        return (response && response.data) || response
                                    })
                            }
                    }, lock: function()
                    {
                        self.waitForUnlock();
                        return serviceStackRestClient.post('/api/sso/sessions/current/lock').then(function(response)
                            {
                                angular.extend(self.session, response.data);
                                $rootScope.$broadcast('sso-lock');
                                return response.data
                            })
                    }, unlock: function(password)
                    {
                        self.waitForUnlock(true);
                        return serviceStackRestClient.post('/api/sso/sessions/current/unlock', {password: password}).then(function(response)
                            {
                                angular.extend(self.session, response.data);
                                $rootScope.$broadcast('sso-unlock');
                                return response.data
                            }).catch(function(e)
                            {
                                self.waitForUnlock();
                                throw e;
                            })
                    }, _waitForUnlockTimer: null, waitForUnlock: function(cancel)
                    {
                        if (!cancel)
                        {
                            self._waitForUnlockTimer = $timeout(function()
                            {
                                serviceStackRestClient.get('/api/sso/sessions/current/state').then(function(response)
                                {
                                    if (response && response.data == 0)
                                    {
                                        if (self._waitForUnlockTimer)
                                        {
                                            self.waitForUnlock(true);
                                            $rootScope.$broadcast('sso-unlock')
                                        }
                                    }
                                    else
                                    {
                                        self.waitForUnlock()
                                    }
                                })
                            }, 1000)
                        }
                        else
                        {
                            if (self._waitForUnlockTimer)
                            {
                                $timeout.cancel(self._waitForUnlockTimer);
                                self._waitForUnlockTimer = null
                            }
                        }
                    }
            };
        return self
    }]);
angular.module('global').filter('user', ['$filter', function($filter)
    {
        return function(user, format, messageIfNull)
            {
                if (!user || user.id == 0)
                    return messageIfNull ? "Usuario no registrado" : undefined;
                else
                {
                    switch (format)
                    {
                        case"sn":
                            return user.surname + ", " + user.name;
                            break;
                        default:
                            return user.name + " " + user.surname
                    }
                }
            }
    }]);
//! moment.js
//! version : 2.5.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
(function(undefined)
{
    var moment,
        VERSION = "2.5.1",
        global = this,
        round = Math.round,
        i,
        YEAR = 0,
        MONTH = 1,
        DATE = 2,
        HOUR = 3,
        MINUTE = 4,
        SECOND = 5,
        MILLISECOND = 6,
        languages = {},
        momentProperties = {
            _isAMomentObject: null, _i: null, _f: null, _l: null, _strict: null, _isUTC: null, _offset: null, _pf: null, _lang: null
        },
        hasModule = (typeof module !== 'undefined' && module.exports && typeof require !== 'undefined'),
        aspNetJsonRegex = /^\/?Date\((\-?\d+)/i,
        aspNetTimeSpanJsonRegex = /(\-)?(?:(\d*)\.)?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,
        isoDurationRegex = /^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/,
        formattingTokens = /(\[[^\[]*\])|(\\)?(Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,4}|X|zz?|ZZ?|.)/g,
        localFormattingTokens = /(\[[^\[]*\])|(\\)?(LT|LL?L?L?|l{1,4})/g,
        parseTokenOneOrTwoDigits = /\d\d?/,
        parseTokenOneToThreeDigits = /\d{1,3}/,
        parseTokenOneToFourDigits = /\d{1,4}/,
        parseTokenOneToSixDigits = /[+\-]?\d{1,6}/,
        parseTokenDigits = /\d+/,
        parseTokenWord = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,
        parseTokenTimezone = /Z|[\+\-]\d\d:?\d\d/gi,
        parseTokenT = /T/i,
        parseTokenTimestampMs = /[\+\-]?\d+(\.\d{1,3})?/,
        parseTokenOrdinal = /\d{1,2}/,
        parseTokenOneDigit = /\d/,
        parseTokenTwoDigits = /\d\d/,
        parseTokenThreeDigits = /\d{3}/,
        parseTokenFourDigits = /\d{4}/,
        parseTokenSixDigits = /[+-]?\d{6}/,
        parseTokenSignedNumber = /[+-]?\d+/,
        isoRegex = /^\s*(?:[+-]\d{6}|\d{4})-(?:(\d\d-\d\d)|(W\d\d$)|(W\d\d-\d)|(\d\d\d))((T| )(\d\d(:\d\d(:\d\d(\.\d+)?)?)?)?([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
        isoFormat = 'YYYY-MM-DDTHH:mm:ssZ',
        isoDates = [['YYYYYY-MM-DD', /[+-]\d{6}-\d{2}-\d{2}/], ['YYYY-MM-DD', /\d{4}-\d{2}-\d{2}/], ['GGGG-[W]WW-E', /\d{4}-W\d{2}-\d/], ['GGGG-[W]WW', /\d{4}-W\d{2}/], ['YYYY-DDD', /\d{4}-\d{3}/]],
        isoTimes = [['HH:mm:ss.SSSS', /(T| )\d\d:\d\d:\d\d\.\d{1,3}/], ['HH:mm:ss', /(T| )\d\d:\d\d:\d\d/], ['HH:mm', /(T| )\d\d:\d\d/], ['HH', /(T| )\d\d/]],
        parseTimezoneChunker = /([\+\-]|\d\d)/gi,
        proxyGettersAndSetters = 'Date|Hours|Minutes|Seconds|Milliseconds'.split('|'),
        unitMillisecondFactors = {
            Milliseconds: 1, Seconds: 1e3, Minutes: 6e4, Hours: 36e5, Days: 864e5, Months: 2592e6, Years: 31536e6
        },
        unitAliases = {
            ms: 'millisecond', s: 'second', m: 'minute', h: 'hour', d: 'day', D: 'date', w: 'week', W: 'isoWeek', M: 'month', y: 'year', DDD: 'dayOfYear', e: 'weekday', E: 'isoWeekday', gg: 'weekYear', GG: 'isoWeekYear'
        },
        camelFunctions = {
            dayofyear: 'dayOfYear', isoweekday: 'isoWeekday', isoweek: 'isoWeek', weekyear: 'weekYear', isoweekyear: 'isoWeekYear'
        },
        formatFunctions = {},
        ordinalizeTokens = 'DDD w W M D d'.split(' '),
        paddedTokens = 'M D H h m s w W'.split(' '),
        formatTokenFunctions = {
            M: function()
            {
                return this.month() + 1
            }, MMM: function(format)
                {
                    return this.lang().monthsShort(this, format)
                }, MMMM: function(format)
                {
                    return this.lang().months(this, format)
                }, D: function()
                {
                    return this.date()
                }, DDD: function()
                {
                    return this.dayOfYear()
                }, d: function()
                {
                    return this.day()
                }, dd: function(format)
                {
                    return this.lang().weekdaysMin(this, format)
                }, ddd: function(format)
                {
                    return this.lang().weekdaysShort(this, format)
                }, dddd: function(format)
                {
                    return this.lang().weekdays(this, format)
                }, w: function()
                {
                    return this.week()
                }, W: function()
                {
                    return this.isoWeek()
                }, YY: function()
                {
                    return leftZeroFill(this.year() % 100, 2)
                }, YYYY: function()
                {
                    return leftZeroFill(this.year(), 4)
                }, YYYYY: function()
                {
                    return leftZeroFill(this.year(), 5)
                }, YYYYYY: function()
                {
                    var y = this.year(),
                        sign = y >= 0 ? '+' : '-';
                    return sign + leftZeroFill(Math.abs(y), 6)
                }, gg: function()
                {
                    return leftZeroFill(this.weekYear() % 100, 2)
                }, gggg: function()
                {
                    return leftZeroFill(this.weekYear(), 4)
                }, ggggg: function()
                {
                    return leftZeroFill(this.weekYear(), 5)
                }, GG: function()
                {
                    return leftZeroFill(this.isoWeekYear() % 100, 2)
                }, GGGG: function()
                {
                    return leftZeroFill(this.isoWeekYear(), 4)
                }, GGGGG: function()
                {
                    return leftZeroFill(this.isoWeekYear(), 5)
                }, e: function()
                {
                    return this.weekday()
                }, E: function()
                {
                    return this.isoWeekday()
                }, a: function()
                {
                    return this.lang().meridiem(this.hours(), this.minutes(), true)
                }, A: function()
                {
                    return this.lang().meridiem(this.hours(), this.minutes(), false)
                }, H: function()
                {
                    return this.hours()
                }, h: function()
                {
                    return this.hours() % 12 || 12
                }, m: function()
                {
                    return this.minutes()
                }, s: function()
                {
                    return this.seconds()
                }, S: function()
                {
                    return toInt(this.milliseconds() / 100)
                }, SS: function()
                {
                    return leftZeroFill(toInt(this.milliseconds() / 10), 2)
                }, SSS: function()
                {
                    return leftZeroFill(this.milliseconds(), 3)
                }, SSSS: function()
                {
                    return leftZeroFill(this.milliseconds(), 3)
                }, Z: function()
                {
                    var a = -this.zone(),
                        b = "+";
                    if (a < 0)
                    {
                        a = -a;
                        b = "-"
                    }
                    return b + leftZeroFill(toInt(a / 60), 2) + ":" + leftZeroFill(toInt(a) % 60, 2)
                }, ZZ: function()
                {
                    var a = -this.zone(),
                        b = "+";
                    if (a < 0)
                    {
                        a = -a;
                        b = "-"
                    }
                    return b + leftZeroFill(toInt(a / 60), 2) + leftZeroFill(toInt(a) % 60, 2)
                }, z: function()
                {
                    return this.zoneAbbr()
                }, zz: function()
                {
                    return this.zoneName()
                }, X: function()
                {
                    return this.unix()
                }, Q: function()
                {
                    return this.quarter()
                }
        },
        lists = ['months', 'monthsShort', 'weekdays', 'weekdaysShort', 'weekdaysMin'];
    function defaultParsingFlags()
    {
        return {
                empty: false, unusedTokens: [], unusedInput: [], overflow: -2, charsLeftOver: 0, nullInput: false, invalidMonth: null, invalidFormat: false, userInvalidated: false, iso: false
            }
    }
    function padToken(func, count)
    {
        return function(a)
            {
                return leftZeroFill(func.call(this, a), count)
            }
    }
    function ordinalizeToken(func, period)
    {
        return function(a)
            {
                return this.lang().ordinal(func.call(this, a), period)
            }
    }
    while (ordinalizeTokens.length)
    {
        i = ordinalizeTokens.pop();
        formatTokenFunctions[i + 'o'] = ordinalizeToken(formatTokenFunctions[i], i)
    }
    while (paddedTokens.length)
    {
        i = paddedTokens.pop();
        formatTokenFunctions[i + i] = padToken(formatTokenFunctions[i], 2)
    }
    formatTokenFunctions.DDDD = padToken(formatTokenFunctions.DDD, 3);
    function Language(){}
    function Moment(config)
    {
        checkOverflow(config);
        extend(this, config)
    }
    function Duration(duration)
    {
        var normalizedInput = normalizeObjectUnits(duration),
            years = normalizedInput.year || 0,
            months = normalizedInput.month || 0,
            weeks = normalizedInput.week || 0,
            days = normalizedInput.day || 0,
            hours = normalizedInput.hour || 0,
            minutes = normalizedInput.minute || 0,
            seconds = normalizedInput.second || 0,
            milliseconds = normalizedInput.millisecond || 0;
        this._milliseconds = +milliseconds + seconds * 1e3 + minutes * 6e4 + hours * 36e5;
        this._days = +days + weeks * 7;
        this._months = +months + years * 12;
        this._data = {};
        this._bubble()
    }
    function extend(a, b)
    {
        for (var i in b)
        {
            if (b.hasOwnProperty(i))
            {
                a[i] = b[i]
            }
        }
        if (b.hasOwnProperty("toString"))
        {
            a.toString = b.toString
        }
        if (b.hasOwnProperty("valueOf"))
        {
            a.valueOf = b.valueOf
        }
        return a
    }
    function cloneMoment(m)
    {
        var result = {},
            i;
        for (i in m)
        {
            if (m.hasOwnProperty(i) && momentProperties.hasOwnProperty(i))
            {
                result[i] = m[i]
            }
        }
        return result
    }
    function absRound(number)
    {
        if (number < 0)
        {
            return Math.ceil(number)
        }
        else
        {
            return Math.floor(number)
        }
    }
    function leftZeroFill(number, targetLength, forceSign)
    {
        var output = '' + Math.abs(number),
            sign = number >= 0;
        while (output.length < targetLength)
        {
            output = '0' + output
        }
        return (sign ? (forceSign ? '+' : '') : '-') + output
    }
    function addOrSubtractDurationFromMoment(mom, duration, isAdding, ignoreUpdateOffset)
    {
        var milliseconds = duration._milliseconds,
            days = duration._days,
            months = duration._months,
            minutes,
            hours;
        if (milliseconds)
        {
            mom._d.setTime(+mom._d + milliseconds * isAdding)
        }
        if (days || months)
        {
            minutes = mom.minute();
            hours = mom.hour()
        }
        if (days)
        {
            mom.date(mom.date() + days * isAdding)
        }
        if (months)
        {
            mom.month(mom.month() + months * isAdding)
        }
        if (milliseconds && !ignoreUpdateOffset)
        {
            moment.updateOffset(mom, days || months)
        }
        if (days || months)
        {
            mom.minute(minutes);
            mom.hour(hours)
        }
    }
    function isArray(input)
    {
        return Object.prototype.toString.call(input) === '[object Array]'
    }
    function isDate(input)
    {
        return Object.prototype.toString.call(input) === '[object Date]' || input instanceof Date
    }
    function compareArrays(array1, array2, dontConvert)
    {
        var len = Math.min(array1.length, array2.length),
            lengthDiff = Math.abs(array1.length - array2.length),
            diffs = 0,
            i;
        for (i = 0; i < len; i++)
        {
            if ((dontConvert && array1[i] !== array2[i]) || (!dontConvert && toInt(array1[i]) !== toInt(array2[i])))
            {
                diffs++
            }
        }
        return diffs + lengthDiff
    }
    function normalizeUnits(units)
    {
        if (units)
        {
            var lowered = units.toLowerCase().replace(/(.)s$/, '$1');
            units = unitAliases[units] || camelFunctions[lowered] || lowered
        }
        return units
    }
    function normalizeObjectUnits(inputObject)
    {
        var normalizedInput = {},
            normalizedProp,
            prop;
        for (prop in inputObject)
        {
            if (inputObject.hasOwnProperty(prop))
            {
                normalizedProp = normalizeUnits(prop);
                if (normalizedProp)
                {
                    normalizedInput[normalizedProp] = inputObject[prop]
                }
            }
        }
        return normalizedInput
    }
    function makeList(field)
    {
        var count,
            setter;
        if (field.indexOf('week') === 0)
        {
            count = 7;
            setter = 'day'
        }
        else if (field.indexOf('month') === 0)
        {
            count = 12;
            setter = 'month'
        }
        else
        {
            return
        }
        moment[field] = function(format, index)
        {
            var i,
                getter,
                method = moment.fn._lang[field],
                results = [];
            if (typeof format === 'number')
            {
                index = format;
                format = undefined
            }
            getter = function(i)
            {
                var m = moment().utc().set(setter, i);
                return method.call(moment.fn._lang, m, format || '')
            };
            if (index != null)
            {
                return getter(index)
            }
            else
            {
                for (i = 0; i < count; i++)
                {
                    results.push(getter(i))
                }
                return results
            }
        }
    }
    function toInt(argumentForCoercion)
    {
        var coercedNumber = +argumentForCoercion,
            value = 0;
        if (coercedNumber !== 0 && isFinite(coercedNumber))
        {
            if (coercedNumber >= 0)
            {
                value = Math.floor(coercedNumber)
            }
            else
            {
                value = Math.ceil(coercedNumber)
            }
        }
        return value
    }
    function daysInMonth(year, month)
    {
        return new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
    }
    function weeksInYear(year, dow, doy)
    {
        return weekOfYear(moment([year, 11, 31 + dow - doy]), dow, doy).week
    }
    function daysInYear(year)
    {
        return isLeapYear(year) ? 366 : 365
    }
    function isLeapYear(year)
    {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    }
    function checkOverflow(m)
    {
        var overflow;
        if (m._a && m._pf.overflow === -2)
        {
            overflow = m._a[MONTH] < 0 || m._a[MONTH] > 11 ? MONTH : m._a[DATE] < 1 || m._a[DATE] > daysInMonth(m._a[YEAR], m._a[MONTH]) ? DATE : m._a[HOUR] < 0 || m._a[HOUR] > 23 ? HOUR : m._a[MINUTE] < 0 || m._a[MINUTE] > 59 ? MINUTE : m._a[SECOND] < 0 || m._a[SECOND] > 59 ? SECOND : m._a[MILLISECOND] < 0 || m._a[MILLISECOND] > 999 ? MILLISECOND : -1;
            if (m._pf._overflowDayOfYear && (overflow < YEAR || overflow > DATE))
            {
                overflow = DATE
            }
            m._pf.overflow = overflow
        }
    }
    function isValid(m)
    {
        if (m._isValid == null)
        {
            m._isValid = !isNaN(m._d.getTime()) && m._pf.overflow < 0 && !m._pf.empty && !m._pf.invalidMonth && !m._pf.nullInput && !m._pf.invalidFormat && !m._pf.userInvalidated;
            if (m._strict)
            {
                m._isValid = m._isValid && m._pf.charsLeftOver === 0 && m._pf.unusedTokens.length === 0
            }
        }
        return m._isValid
    }
    function normalizeLanguage(key)
    {
        return key ? key.toLowerCase().replace('_', '-') : key
    }
    function makeAs(input, model)
    {
        return model._isUTC ? moment(input).zone(model._offset || 0) : moment(input).local()
    }
    extend(Language.prototype, {
        set: function(config)
        {
            var prop,
                i;
            for (i in config)
            {
                prop = config[i];
                if (typeof prop === 'function')
                {
                    this[i] = prop
                }
                else
                {
                    this['_' + i] = prop
                }
            }
        }, _months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), months: function(m)
            {
                return this._months[m.month()]
            }, _monthsShort: "Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"), monthsShort: function(m)
            {
                return this._monthsShort[m.month()]
            }, monthsParse: function(monthName)
            {
                var i,
                    mom,
                    regex;
                if (!this._monthsParse)
                {
                    this._monthsParse = []
                }
                for (i = 0; i < 12; i++)
                {
                    if (!this._monthsParse[i])
                    {
                        mom = moment.utc([2000, i]);
                        regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                        this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i')
                    }
                    if (this._monthsParse[i].test(monthName))
                    {
                        return i
                    }
                }
            }, _weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), weekdays: function(m)
            {
                return this._weekdays[m.day()]
            }, _weekdaysShort: "Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"), weekdaysShort: function(m)
            {
                return this._weekdaysShort[m.day()]
            }, _weekdaysMin: "Su_Mo_Tu_We_Th_Fr_Sa".split("_"), weekdaysMin: function(m)
            {
                return this._weekdaysMin[m.day()]
            }, weekdaysParse: function(weekdayName)
            {
                var i,
                    mom,
                    regex;
                if (!this._weekdaysParse)
                {
                    this._weekdaysParse = []
                }
                for (i = 0; i < 7; i++)
                {
                    if (!this._weekdaysParse[i])
                    {
                        mom = moment([2000, 1]).day(i);
                        regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                        this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i')
                    }
                    if (this._weekdaysParse[i].test(weekdayName))
                    {
                        return i
                    }
                }
            }, _longDateFormat: {
                LT: "h:mm A", L: "MM/DD/YYYY", LL: "MMMM D YYYY", LLL: "MMMM D YYYY LT", LLLL: "dddd, MMMM D YYYY LT"
            }, longDateFormat: function(key)
            {
                var output = this._longDateFormat[key];
                if (!output && this._longDateFormat[key.toUpperCase()])
                {
                    output = this._longDateFormat[key.toUpperCase()].replace(/MMMM|MM|DD|dddd/g, function(val)
                    {
                        return val.slice(1)
                    });
                    this._longDateFormat[key] = output
                }
                return output
            }, isPM: function(input)
            {
                return ((input + '').toLowerCase().charAt(0) === 'p')
            }, _meridiemParse: /[ap]\.?m?\.?/i, meridiem: function(hours, minutes, isLower)
            {
                if (hours > 11)
                {
                    return isLower ? 'pm' : 'PM'
                }
                else
                {
                    return isLower ? 'am' : 'AM'
                }
            }, _calendar: {
                sameDay: '[Today at] LT', nextDay: '[Tomorrow at] LT', nextWeek: 'dddd [at] LT', lastDay: '[Yesterday at] LT', lastWeek: '[Last] dddd [at] LT', sameElse: 'L'
            }, calendar: function(key, mom)
            {
                var output = this._calendar[key];
                return typeof output === 'function' ? output.apply(mom) : output
            }, _relativeTime: {
                future: "in %s", past: "%s ago", s: "a few seconds", m: "a minute", mm: "%d minutes", h: "an hour", hh: "%d hours", d: "a day", dd: "%d days", M: "a month", MM: "%d months", y: "a year", yy: "%d years"
            }, relativeTime: function(number, withoutSuffix, string, isFuture)
            {
                var output = this._relativeTime[string];
                return (typeof output === 'function') ? output(number, withoutSuffix, string, isFuture) : output.replace(/%d/i, number)
            }, pastFuture: function(diff, output)
            {
                var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
                return typeof format === 'function' ? format(output) : format.replace(/%s/i, output)
            }, ordinal: function(number)
            {
                return this._ordinal.replace("%d", number)
            }, _ordinal: "%d", preparse: function(string)
            {
                return string
            }, postformat: function(string)
            {
                return string
            }, week: function(mom)
            {
                return weekOfYear(mom, this._week.dow, this._week.doy).week
            }, _week: {
                dow: 0, doy: 6
            }, _invalidDate: 'Invalid date', invalidDate: function()
            {
                return this._invalidDate
            }
    });
    function loadLang(key, values)
    {
        values.abbr = key;
        if (!languages[key])
        {
            languages[key] = new Language
        }
        languages[key].set(values);
        return languages[key]
    }
    function unloadLang(key)
    {
        delete languages[key]
    }
    function getLangDefinition(key)
    {
        var i = 0,
            j,
            lang,
            next,
            split,
            get = function(k)
            {
                if (!languages[k] && hasModule)
                {
                    try
                    {
                        require('./lang/' + k)
                    }
                    catch(e) {}
                }
                return languages[k]
            };
        if (!key)
        {
            return moment.fn._lang
        }
        if (!isArray(key))
        {
            lang = get(key);
            if (lang)
            {
                return lang
            }
            key = [key]
        }
        while (i < key.length)
        {
            split = normalizeLanguage(key[i]).split('-');
            j = split.length;
            next = normalizeLanguage(key[i + 1]);
            next = next ? next.split('-') : null;
            while (j > 0)
            {
                lang = get(split.slice(0, j).join('-'));
                if (lang)
                {
                    return lang
                }
                if (next && next.length >= j && compareArrays(split, next, true) >= j - 1)
                {
                    break
                }
                j--
            }
            i++
        }
        return moment.fn._lang
    }
    function removeFormattingTokens(input)
    {
        if (input.match(/\[[\s\S]/))
        {
            return input.replace(/^\[|\]$/g, "")
        }
        return input.replace(/\\/g, "")
    }
    function makeFormatFunction(format)
    {
        var array = format.match(formattingTokens),
            i,
            length;
        for (i = 0, length = array.length; i < length; i++)
        {
            if (formatTokenFunctions[array[i]])
            {
                array[i] = formatTokenFunctions[array[i]]
            }
            else
            {
                array[i] = removeFormattingTokens(array[i])
            }
        }
        return function(mom)
            {
                var output = "";
                for (i = 0; i < length; i++)
                {
                    output += array[i] instanceof Function ? array[i].call(mom, format) : array[i]
                }
                return output
            }
    }
    function formatMoment(m, format)
    {
        if (!m.isValid())
        {
            return m.lang().invalidDate()
        }
        format = expandFormat(format, m.lang());
        if (!formatFunctions[format])
        {
            formatFunctions[format] = makeFormatFunction(format)
        }
        return formatFunctions[format](m)
    }
    function expandFormat(format, lang)
    {
        var i = 5;
        function replaceLongDateFormatTokens(input)
        {
            return lang.longDateFormat(input) || input
        }
        localFormattingTokens.lastIndex = 0;
        while (i >= 0 && localFormattingTokens.test(format))
        {
            format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
            localFormattingTokens.lastIndex = 0;
            i -= 1
        }
        return format
    }
    function getParseRegexForToken(token, config)
    {
        var a,
            strict = config._strict;
        switch (token)
        {
            case'DDDD':
                return parseTokenThreeDigits;
            case'YYYY':
            case'GGGG':
            case'gggg':
                return strict ? parseTokenFourDigits : parseTokenOneToFourDigits;
            case'Y':
            case'G':
            case'g':
                return parseTokenSignedNumber;
            case'YYYYYY':
            case'YYYYY':
            case'GGGGG':
            case'ggggg':
                return strict ? parseTokenSixDigits : parseTokenOneToSixDigits;
            case'S':
                if (strict)
                {
                    return parseTokenOneDigit
                }
            case'SS':
                if (strict)
                {
                    return parseTokenTwoDigits
                }
            case'SSS':
                if (strict)
                {
                    return parseTokenThreeDigits
                }
            case'DDD':
                return parseTokenOneToThreeDigits;
            case'MMM':
            case'MMMM':
            case'dd':
            case'ddd':
            case'dddd':
                return parseTokenWord;
            case'a':
            case'A':
                return getLangDefinition(config._l)._meridiemParse;
            case'X':
                return parseTokenTimestampMs;
            case'Z':
            case'ZZ':
                return parseTokenTimezone;
            case'T':
                return parseTokenT;
            case'SSSS':
                return parseTokenDigits;
            case'MM':
            case'DD':
            case'YY':
            case'GG':
            case'gg':
            case'HH':
            case'hh':
            case'mm':
            case'ss':
            case'ww':
            case'WW':
                return strict ? parseTokenTwoDigits : parseTokenOneOrTwoDigits;
            case'M':
            case'D':
            case'd':
            case'H':
            case'h':
            case'm':
            case's':
            case'w':
            case'W':
            case'e':
            case'E':
                return parseTokenOneOrTwoDigits;
            case'Do':
                return parseTokenOrdinal;
            default:
                a = new RegExp(regexpEscape(unescapeFormat(token.replace('\\', '')), "i"));
                return a
        }
    }
    function timezoneMinutesFromString(string)
    {
        string = string || "";
        var possibleTzMatches = (string.match(parseTokenTimezone) || []),
            tzChunk = possibleTzMatches[possibleTzMatches.length - 1] || [],
            parts = (tzChunk + '').match(parseTimezoneChunker) || ['-', 0, 0],
            minutes = +(parts[1] * 60) + toInt(parts[2]);
        return parts[0] === '+' ? -minutes : minutes
    }
    function addTimeToArrayFromToken(token, input, config)
    {
        var a,
            datePartArray = config._a;
        switch (token)
        {
            case'M':
            case'MM':
                if (input != null)
                {
                    datePartArray[MONTH] = toInt(input) - 1
                }
                break;
            case'MMM':
            case'MMMM':
                a = getLangDefinition(config._l).monthsParse(input);
                if (a != null)
                {
                    datePartArray[MONTH] = a
                }
                else
                {
                    config._pf.invalidMonth = input
                }
                break;
            case'D':
            case'DD':
                if (input != null)
                {
                    datePartArray[DATE] = toInt(input)
                }
                break;
            case'Do':
                if (input != null)
                {
                    datePartArray[DATE] = toInt(parseInt(input, 10))
                }
                break;
            case'DDD':
            case'DDDD':
                if (input != null)
                {
                    config._dayOfYear = toInt(input)
                }
                break;
            case'YY':
                datePartArray[YEAR] = toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
                break;
            case'YYYY':
            case'YYYYY':
            case'YYYYYY':
                datePartArray[YEAR] = toInt(input);
                break;
            case'a':
            case'A':
                config._isPm = getLangDefinition(config._l).isPM(input);
                break;
            case'H':
            case'HH':
            case'h':
            case'hh':
                datePartArray[HOUR] = toInt(input);
                break;
            case'm':
            case'mm':
                datePartArray[MINUTE] = toInt(input);
                break;
            case's':
            case'ss':
                datePartArray[SECOND] = toInt(input);
                break;
            case'S':
            case'SS':
            case'SSS':
            case'SSSS':
                datePartArray[MILLISECOND] = toInt(('0.' + input) * 1000);
                break;
            case'X':
                config._d = new Date(parseFloat(input) * 1000);
                break;
            case'Z':
            case'ZZ':
                config._useUTC = true;
                config._tzm = timezoneMinutesFromString(input);
                break;
            case'w':
            case'ww':
            case'W':
            case'WW':
            case'd':
            case'dd':
            case'ddd':
            case'dddd':
            case'e':
            case'E':
                token = token.substr(0, 1);
            case'gg':
            case'gggg':
            case'GG':
            case'GGGG':
            case'GGGGG':
                token = token.substr(0, 2);
                if (input)
                {
                    config._w = config._w || {};
                    config._w[token] = input
                }
                break
        }
    }
    function dateFromConfig(config)
    {
        var i,
            date,
            input = [],
            currentDate,
            yearToUse,
            fixYear,
            w,
            temp,
            lang,
            weekday,
            week;
        if (config._d)
        {
            return
        }
        currentDate = currentDateArray(config);
        if (config._w && config._a[DATE] == null && config._a[MONTH] == null)
        {
            fixYear = function(val)
            {
                var int_val = parseInt(val, 10);
                return val ? (val.length < 3 ? (int_val > 68 ? 1900 + int_val : 2000 + int_val) : int_val) : (config._a[YEAR] == null ? moment().weekYear() : config._a[YEAR])
            };
            w = config._w;
            if (w.GG != null || w.W != null || w.E != null)
            {
                temp = dayOfYearFromWeeks(fixYear(w.GG), w.W || 1, w.E, 4, 1)
            }
            else
            {
                lang = getLangDefinition(config._l);
                weekday = w.d != null ? parseWeekday(w.d, lang) : (w.e != null ? parseInt(w.e, 10) + lang._week.dow : 0);
                week = parseInt(w.w, 10) || 1;
                if (w.d != null && weekday < lang._week.dow)
                {
                    week++
                }
                temp = dayOfYearFromWeeks(fixYear(w.gg), week, weekday, lang._week.doy, lang._week.dow)
            }
            config._a[YEAR] = temp.year;
            config._dayOfYear = temp.dayOfYear
        }
        if (config._dayOfYear)
        {
            yearToUse = config._a[YEAR] == null ? currentDate[YEAR] : config._a[YEAR];
            if (config._dayOfYear > daysInYear(yearToUse))
            {
                config._pf._overflowDayOfYear = true
            }
            date = makeUTCDate(yearToUse, 0, config._dayOfYear);
            config._a[MONTH] = date.getUTCMonth();
            config._a[DATE] = date.getUTCDate()
        }
        for (i = 0; i < 3 && config._a[i] == null; ++i)
        {
            config._a[i] = input[i] = currentDate[i]
        }
        for (; i < 7; i++)
        {
            config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i]
        }
        input[HOUR] += toInt((config._tzm || 0) / 60);
        input[MINUTE] += toInt((config._tzm || 0) % 60);
        config._d = (config._useUTC ? makeUTCDate : makeDate).apply(null, input)
    }
    function dateFromObject(config)
    {
        var normalizedInput;
        if (config._d)
        {
            return
        }
        normalizedInput = normalizeObjectUnits(config._i);
        config._a = [normalizedInput.year, normalizedInput.month, normalizedInput.day, normalizedInput.hour, normalizedInput.minute, normalizedInput.second, normalizedInput.millisecond];
        dateFromConfig(config)
    }
    function currentDateArray(config)
    {
        var now = new Date;
        if (config._useUTC)
        {
            return [now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()]
        }
        else
        {
            return [now.getFullYear(), now.getMonth(), now.getDate()]
        }
    }
    function makeDateFromStringAndFormat(config)
    {
        config._a = [];
        config._pf.empty = true;
        var lang = getLangDefinition(config._l),
            string = '' + config._i,
            i,
            parsedInput,
            tokens,
            token,
            skipped,
            stringLength = string.length,
            totalParsedInputLength = 0;
        tokens = expandFormat(config._f, lang).match(formattingTokens) || [];
        for (i = 0; i < tokens.length; i++)
        {
            token = tokens[i];
            parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
            if (parsedInput)
            {
                skipped = string.substr(0, string.indexOf(parsedInput));
                if (skipped.length > 0)
                {
                    config._pf.unusedInput.push(skipped)
                }
                string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                totalParsedInputLength += parsedInput.length
            }
            if (formatTokenFunctions[token])
            {
                if (parsedInput)
                {
                    config._pf.empty = false
                }
                else
                {
                    config._pf.unusedTokens.push(token)
                }
                addTimeToArrayFromToken(token, parsedInput, config)
            }
            else if (config._strict && !parsedInput)
            {
                config._pf.unusedTokens.push(token)
            }
        }
        config._pf.charsLeftOver = stringLength - totalParsedInputLength;
        if (string.length > 0)
        {
            config._pf.unusedInput.push(string)
        }
        if (config._isPm && config._a[HOUR] < 12)
        {
            config._a[HOUR] += 12
        }
        if (config._isPm === false && config._a[HOUR] === 12)
        {
            config._a[HOUR] = 0
        }
        dateFromConfig(config);
        checkOverflow(config)
    }
    function unescapeFormat(s)
    {
        return s.replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function(matched, p1, p2, p3, p4)
            {
                return p1 || p2 || p3 || p4
            })
    }
    function regexpEscape(s)
    {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    }
    function makeDateFromStringAndArray(config)
    {
        var tempConfig,
            bestMoment,
            scoreToBeat,
            i,
            currentScore;
        if (config._f.length === 0)
        {
            config._pf.invalidFormat = true;
            config._d = new Date(NaN);
            return
        }
        for (i = 0; i < config._f.length; i++)
        {
            currentScore = 0;
            tempConfig = extend({}, config);
            tempConfig._pf = defaultParsingFlags();
            tempConfig._f = config._f[i];
            makeDateFromStringAndFormat(tempConfig);
            if (!isValid(tempConfig))
            {
                continue
            }
            currentScore += tempConfig._pf.charsLeftOver;
            currentScore += tempConfig._pf.unusedTokens.length * 10;
            tempConfig._pf.score = currentScore;
            if (scoreToBeat == null || currentScore < scoreToBeat)
            {
                scoreToBeat = currentScore;
                bestMoment = tempConfig
            }
        }
        extend(config, bestMoment || tempConfig)
    }
    function makeDateFromString(config)
    {
        var i,
            l,
            string = config._i,
            match = isoRegex.exec(string);
        if (match)
        {
            config._pf.iso = true;
            for (i = 0, l = isoDates.length; i < l; i++)
            {
                if (isoDates[i][1].exec(string))
                {
                    config._f = isoDates[i][0] + (match[6] || " ");
                    break
                }
            }
            for (i = 0, l = isoTimes.length; i < l; i++)
            {
                if (isoTimes[i][1].exec(string))
                {
                    config._f += isoTimes[i][0];
                    break
                }
            }
            if (string.match(parseTokenTimezone))
            {
                config._f += "Z"
            }
            makeDateFromStringAndFormat(config)
        }
        else
        {
            config._d = new Date(string)
        }
    }
    function makeDateFromInput(config)
    {
        var input = config._i,
            matched = aspNetJsonRegex.exec(input);
        if (input === undefined)
        {
            config._d = new Date
        }
        else if (matched)
        {
            config._d = new Date(+matched[1])
        }
        else if (typeof input === 'string')
        {
            makeDateFromString(config)
        }
        else if (isArray(input))
        {
            config._a = input.slice(0);
            dateFromConfig(config)
        }
        else if (isDate(input))
        {
            config._d = new Date(+input)
        }
        else if (typeof(input) === 'object')
        {
            dateFromObject(config)
        }
        else
        {
            config._d = new Date(input)
        }
    }
    function makeDate(y, m, d, h, M, s, ms)
    {
        var date = new Date(y, m, d, h, M, s, ms);
        if (y < 1970)
        {
            date.setFullYear(y)
        }
        return date
    }
    function makeUTCDate(y)
    {
        var date = new Date(Date.UTC.apply(null, arguments));
        if (y < 1970)
        {
            date.setUTCFullYear(y)
        }
        return date
    }
    function parseWeekday(input, language)
    {
        if (typeof input === 'string')
        {
            if (!isNaN(input))
            {
                input = parseInt(input, 10)
            }
            else
            {
                input = language.weekdaysParse(input);
                if (typeof input !== 'number')
                {
                    return null
                }
            }
        }
        return input
    }
    function substituteTimeAgo(string, number, withoutSuffix, isFuture, lang)
    {
        return lang.relativeTime(number || 1, !!withoutSuffix, string, isFuture)
    }
    function relativeTime(milliseconds, withoutSuffix, lang)
    {
        var seconds = round(Math.abs(milliseconds) / 1000),
            minutes = round(seconds / 60),
            hours = round(minutes / 60),
            days = round(hours / 24),
            years = round(days / 365),
            args = seconds < 45 && ['s', seconds] || minutes === 1 && ['m'] || minutes < 45 && ['mm', minutes] || hours === 1 && ['h'] || hours < 22 && ['hh', hours] || days === 1 && ['d'] || days <= 25 && ['dd', days] || days <= 45 && ['M'] || days < 345 && ['MM', round(days / 30)] || years === 1 && ['y'] || ['yy', years];
        args[2] = withoutSuffix;
        args[3] = milliseconds > 0;
        args[4] = lang;
        return substituteTimeAgo.apply({}, args)
    }
    function weekOfYear(mom, firstDayOfWeek, firstDayOfWeekOfYear)
    {
        var end = firstDayOfWeekOfYear - firstDayOfWeek,
            daysToDayOfWeek = firstDayOfWeekOfYear - mom.day(),
            adjustedMoment;
        if (daysToDayOfWeek > end)
        {
            daysToDayOfWeek -= 7
        }
        if (daysToDayOfWeek < end - 7)
        {
            daysToDayOfWeek += 7
        }
        adjustedMoment = moment(mom).add('d', daysToDayOfWeek);
        return {
                week: Math.ceil(adjustedMoment.dayOfYear() / 7), year: adjustedMoment.year()
            }
    }
    function dayOfYearFromWeeks(year, week, weekday, firstDayOfWeekOfYear, firstDayOfWeek)
    {
        var d = makeUTCDate(year, 0, 1).getUTCDay(),
            daysToAdd,
            dayOfYear;
        weekday = weekday != null ? weekday : firstDayOfWeek;
        daysToAdd = firstDayOfWeek - d + (d > firstDayOfWeekOfYear ? 7 : 0) - (d < firstDayOfWeek ? 7 : 0);
        dayOfYear = 7 * (week - 1) + (weekday - firstDayOfWeek) + daysToAdd + 1;
        return {
                year: dayOfYear > 0 ? year : year - 1, dayOfYear: dayOfYear > 0 ? dayOfYear : daysInYear(year - 1) + dayOfYear
            }
    }
    function makeMoment(config)
    {
        var input = config._i,
            format = config._f;
        if (input === null)
        {
            return moment.invalid({nullInput: true})
        }
        if (typeof input === 'string')
        {
            config._i = input = getLangDefinition().preparse(input)
        }
        if (moment.isMoment(input))
        {
            config = cloneMoment(input);
            config._d = new Date(+input._d)
        }
        else if (format)
        {
            if (isArray(format))
            {
                makeDateFromStringAndArray(config)
            }
            else
            {
                makeDateFromStringAndFormat(config)
            }
        }
        else
        {
            makeDateFromInput(config)
        }
        return new Moment(config)
    }
    moment = function(input, format, lang, strict)
    {
        var c;
        if (typeof(lang) === "boolean")
        {
            strict = lang;
            lang = undefined
        }
        c = {};
        c._isAMomentObject = true;
        c._i = input;
        c._f = format;
        c._l = lang;
        c._strict = strict;
        c._isUTC = false;
        c._pf = defaultParsingFlags();
        return makeMoment(c)
    };
    moment.utc = function(input, format, lang, strict)
    {
        var c;
        if (typeof(lang) === "boolean")
        {
            strict = lang;
            lang = undefined
        }
        c = {};
        c._isAMomentObject = true;
        c._useUTC = true;
        c._isUTC = true;
        c._l = lang;
        c._i = input;
        c._f = format;
        c._strict = strict;
        c._pf = defaultParsingFlags();
        return makeMoment(c).utc()
    };
    moment.unix = function(input)
    {
        return moment(input * 1000)
    };
    moment.duration = function(input, key)
    {
        var duration = input,
            match = null,
            sign,
            ret,
            parseIso;
        if (moment.isDuration(input))
        {
            duration = {
                ms: input._milliseconds, d: input._days, M: input._months
            }
        }
        else if (typeof input === 'number')
        {
            duration = {};
            if (key)
            {
                duration[key] = input
            }
            else
            {
                duration.milliseconds = input
            }
        }
        else if (!!(match = aspNetTimeSpanJsonRegex.exec(input)))
        {
            sign = (match[1] === "-") ? -1 : 1;
            duration = {
                y: 0, d: toInt(match[DATE]) * sign, h: toInt(match[HOUR]) * sign, m: toInt(match[MINUTE]) * sign, s: toInt(match[SECOND]) * sign, ms: toInt(match[MILLISECOND]) * sign
            }
        }
        else if (!!(match = isoDurationRegex.exec(input)))
        {
            sign = (match[1] === "-") ? -1 : 1;
            parseIso = function(inp)
            {
                var res = inp && parseFloat(inp.replace(',', '.'));
                return (isNaN(res) ? 0 : res) * sign
            };
            duration = {
                y: parseIso(match[2]), M: parseIso(match[3]), d: parseIso(match[4]), h: parseIso(match[5]), m: parseIso(match[6]), s: parseIso(match[7]), w: parseIso(match[8])
            }
        }
        ret = new Duration(duration);
        if (moment.isDuration(input) && input.hasOwnProperty('_lang'))
        {
            ret._lang = input._lang
        }
        return ret
    };
    moment.version = VERSION;
    moment.defaultFormat = isoFormat;
    moment.updateOffset = function(){};
    moment.lang = function(key, values)
    {
        var r;
        if (!key)
        {
            return moment.fn._lang._abbr
        }
        if (values)
        {
            loadLang(normalizeLanguage(key), values)
        }
        else if (values === null)
        {
            unloadLang(key);
            key = 'en'
        }
        else if (!languages[key])
        {
            getLangDefinition(key)
        }
        r = moment.duration.fn._lang = moment.fn._lang = getLangDefinition(key);
        return r._abbr
    };
    moment.langData = function(key)
    {
        if (key && key._lang && key._lang._abbr)
        {
            key = key._lang._abbr
        }
        return getLangDefinition(key)
    };
    moment.isMoment = function(obj)
    {
        return obj instanceof Moment || (obj != null && obj.hasOwnProperty('_isAMomentObject'))
    };
    moment.isDuration = function(obj)
    {
        return obj instanceof Duration
    };
    for (i = lists.length - 1; i >= 0; --i)
    {
        makeList(lists[i])
    }
    moment.normalizeUnits = function(units)
    {
        return normalizeUnits(units)
    };
    moment.invalid = function(flags)
    {
        var m = moment.utc(NaN);
        if (flags != null)
        {
            extend(m._pf, flags)
        }
        else
        {
            m._pf.userInvalidated = true
        }
        return m
    };
    moment.parseZone = function()
    {
        return moment.apply(null, arguments).parseZone()
    };
    extend(moment.fn = Moment.prototype, {
        clone: function()
        {
            return moment(this)
        }, valueOf: function()
            {
                return +this._d + ((this._offset || 0) * 60000)
            }, unix: function()
            {
                return Math.floor(+this / 1000)
            }, toString: function()
            {
                return this.clone().lang('en').format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")
            }, toDate: function()
            {
                return this._offset ? new Date(+this) : this._d
            }, toISOString: function()
            {
                var m = moment(this).utc();
                if (0 < m.year() && m.year() <= 9999)
                {
                    return formatMoment(m, 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
                }
                else
                {
                    return formatMoment(m, 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]')
                }
            }, toArray: function()
            {
                var m = this;
                return [m.year(), m.month(), m.date(), m.hours(), m.minutes(), m.seconds(), m.milliseconds()]
            }, isValid: function()
            {
                return isValid(this)
            }, isDSTShifted: function()
            {
                if (this._a)
                {
                    return this.isValid() && compareArrays(this._a, (this._isUTC ? moment.utc(this._a) : moment(this._a)).toArray()) > 0
                }
                return false
            }, parsingFlags: function()
            {
                return extend({}, this._pf)
            }, invalidAt: function()
            {
                return this._pf.overflow
            }, utc: function()
            {
                return this.zone(0)
            }, local: function()
            {
                this.zone(0);
                this._isUTC = false;
                return this
            }, format: function(inputString)
            {
                var output = formatMoment(this, inputString || moment.defaultFormat);
                return this.lang().postformat(output)
            }, add: function(input, val)
            {
                var dur;
                if (typeof input === 'string')
                {
                    dur = moment.duration(+val, input)
                }
                else
                {
                    dur = moment.duration(input, val)
                }
                addOrSubtractDurationFromMoment(this, dur, 1);
                return this
            }, subtract: function(input, val)
            {
                var dur;
                if (typeof input === 'string')
                {
                    dur = moment.duration(+val, input)
                }
                else
                {
                    dur = moment.duration(input, val)
                }
                addOrSubtractDurationFromMoment(this, dur, -1);
                return this
            }, diff: function(input, units, asFloat)
            {
                var that = makeAs(input, this),
                    zoneDiff = (this.zone() - that.zone()) * 6e4,
                    diff,
                    output;
                units = normalizeUnits(units);
                if (units === 'year' || units === 'month')
                {
                    diff = (this.daysInMonth() + that.daysInMonth()) * 432e5;
                    output = ((this.year() - that.year()) * 12) + (this.month() - that.month());
                    output += ((this - moment(this).startOf('month')) - (that - moment(that).startOf('month'))) / diff;
                    output -= ((this.zone() - moment(this).startOf('month').zone()) - (that.zone() - moment(that).startOf('month').zone())) * 6e4 / diff;
                    if (units === 'year')
                    {
                        output = output / 12
                    }
                }
                else
                {
                    diff = (this - that);
                    output = units === 'second' ? diff / 1e3 : units === 'minute' ? diff / 6e4 : units === 'hour' ? diff / 36e5 : units === 'day' ? (diff - zoneDiff) / 864e5 : units === 'week' ? (diff - zoneDiff) / 6048e5 : diff
                }
                return asFloat ? output : absRound(output)
            }, from: function(time, withoutSuffix)
            {
                return moment.duration(this.diff(time)).lang(this.lang()._abbr).humanize(!withoutSuffix)
            }, fromNow: function(withoutSuffix)
            {
                return this.from(moment(), withoutSuffix)
            }, calendar: function()
            {
                var sod = makeAs(moment(), this).startOf('day'),
                    diff = this.diff(sod, 'days', true),
                    format = diff < -6 ? 'sameElse' : diff < -1 ? 'lastWeek' : diff < 0 ? 'lastDay' : diff < 1 ? 'sameDay' : diff < 2 ? 'nextDay' : diff < 7 ? 'nextWeek' : 'sameElse';
                return this.format(this.lang().calendar(format, this))
            }, isLeapYear: function()
            {
                return isLeapYear(this.year())
            }, isDST: function()
            {
                return (this.zone() < this.clone().month(0).zone() || this.zone() < this.clone().month(5).zone())
            }, day: function(input)
            {
                var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
                if (input != null)
                {
                    input = parseWeekday(input, this.lang());
                    return this.add({d: input - day})
                }
                else
                {
                    return day
                }
            }, month: function(input)
            {
                var utc = this._isUTC ? 'UTC' : '',
                    dayOfMonth;
                if (input != null)
                {
                    if (typeof input === 'string')
                    {
                        input = this.lang().monthsParse(input);
                        if (typeof input !== 'number')
                        {
                            return this
                        }
                    }
                    dayOfMonth = Math.min(this.date(), daysInMonth(this.year(), input));
                    this._d['set' + utc + 'Month'](input, dayOfMonth);
                    moment.updateOffset(this, true);
                    return this
                }
                else
                {
                    return this._d['get' + utc + 'Month']()
                }
            }, startOf: function(units)
            {
                units = normalizeUnits(units);
                switch (units)
                {
                    case'year':
                        this.month(0);
                    case'month':
                        this.date(1);
                    case'week':
                    case'isoWeek':
                    case'day':
                        this.hours(0);
                    case'hour':
                        this.minutes(0);
                    case'minute':
                        this.seconds(0);
                    case'second':
                        this.milliseconds(0)
                }
                if (units === 'week')
                {
                    this.weekday(0)
                }
                else if (units === 'isoWeek')
                {
                    this.isoWeekday(1)
                }
                return this
            }, endOf: function(units)
            {
                units = normalizeUnits(units);
                return this.startOf(units).add((units === 'isoWeek' ? 'week' : units), 1).subtract('ms', 1)
            }, isAfter: function(input, units)
            {
                units = typeof units !== 'undefined' ? units : 'millisecond';
                return +this.clone().startOf(units) > +moment(input).startOf(units)
            }, isBefore: function(input, units)
            {
                units = typeof units !== 'undefined' ? units : 'millisecond';
                return +this.clone().startOf(units) < +moment(input).startOf(units)
            }, isSame: function(input, units)
            {
                units = units || 'ms';
                return +this.clone().startOf(units) === +makeAs(input, this).startOf(units)
            }, min: function(other)
            {
                other = moment.apply(null, arguments);
                return other < this ? this : other
            }, max: function(other)
            {
                other = moment.apply(null, arguments);
                return other > this ? this : other
            }, zone: function(input, adjust)
            {
                adjust = (adjust == null ? true : false);
                var offset = this._offset || 0;
                if (input != null)
                {
                    if (typeof input === "string")
                    {
                        input = timezoneMinutesFromString(input)
                    }
                    if (Math.abs(input) < 16)
                    {
                        input = input * 60
                    }
                    this._offset = input;
                    this._isUTC = true;
                    if (offset !== input && adjust)
                    {
                        addOrSubtractDurationFromMoment(this, moment.duration(offset - input, 'm'), 1, true)
                    }
                }
                else
                {
                    return this._isUTC ? offset : this._d.getTimezoneOffset()
                }
                return this
            }, zoneAbbr: function()
            {
                return this._isUTC ? "UTC" : ""
            }, zoneName: function()
            {
                return this._isUTC ? "Coordinated Universal Time" : ""
            }, parseZone: function()
            {
                if (this._tzm)
                {
                    this.zone(this._tzm)
                }
                else if (typeof this._i === 'string')
                {
                    this.zone(this._i)
                }
                return this
            }, hasAlignedHourOffset: function(input)
            {
                if (!input)
                {
                    input = 0
                }
                else
                {
                    input = moment(input).zone()
                }
                return (this.zone() - input) % 60 === 0
            }, daysInMonth: function()
            {
                return daysInMonth(this.year(), this.month())
            }, dayOfYear: function(input)
            {
                var dayOfYear = round((moment(this).startOf('day') - moment(this).startOf('year')) / 864e5) + 1;
                return input == null ? dayOfYear : this.add("d", (input - dayOfYear))
            }, quarter: function()
            {
                return Math.ceil((this.month() + 1.0) / 3.0)
            }, weekYear: function(input)
            {
                var year = weekOfYear(this, this.lang()._week.dow, this.lang()._week.doy).year;
                return input == null ? year : this.add("y", (input - year))
            }, isoWeekYear: function(input)
            {
                var year = weekOfYear(this, 1, 4).year;
                return input == null ? year : this.add("y", (input - year))
            }, week: function(input)
            {
                var week = this.lang().week(this);
                return input == null ? week : this.add("d", (input - week) * 7)
            }, isoWeek: function(input)
            {
                var week = weekOfYear(this, 1, 4).week;
                return input == null ? week : this.add("d", (input - week) * 7)
            }, weekday: function(input)
            {
                var weekday = (this.day() + 7 - this.lang()._week.dow) % 7;
                return input == null ? weekday : this.add("d", input - weekday)
            }, isoWeekday: function(input)
            {
                return input == null ? this.day() || 7 : this.day(this.day() % 7 ? input : input - 7)
            }, isoWeeksInYear: function()
            {
                return weeksInYear(this.year(), 1, 4)
            }, weeksInYear: function()
            {
                var weekInfo = this._lang._week;
                return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy)
            }, get: function(units)
            {
                units = normalizeUnits(units);
                return this[units]()
            }, set: function(units, value)
            {
                units = normalizeUnits(units);
                if (typeof this[units] === 'function')
                {
                    this[units](value)
                }
                return this
            }, lang: function(key)
            {
                if (key === undefined)
                {
                    return this._lang
                }
                else
                {
                    this._lang = getLangDefinition(key);
                    return this
                }
            }
    });
    function makeGetterAndSetter(name, key)
    {
        var defaultIgnoreOffsetTransitions = key === 'date' || key === 'month' || key === 'year';
        moment.fn[name] = moment.fn[name + 's'] = function(input, ignoreOffsetTransitions)
        {
            var utc = this._isUTC ? 'UTC' : '';
            if (ignoreOffsetTransitions == null)
            {
                ignoreOffsetTransitions = defaultIgnoreOffsetTransitions
            }
            if (input != null)
            {
                this._d['set' + utc + key](input);
                moment.updateOffset(this, ignoreOffsetTransitions);
                return this
            }
            else
            {
                return this._d['get' + utc + key]()
            }
        }
    }
    for (i = 0; i < proxyGettersAndSetters.length; i++)
    {
        makeGetterAndSetter(proxyGettersAndSetters[i].toLowerCase().replace(/s$/, ''), proxyGettersAndSetters[i])
    }
    makeGetterAndSetter('year', 'FullYear');
    moment.fn.days = moment.fn.day;
    moment.fn.months = moment.fn.month;
    moment.fn.weeks = moment.fn.week;
    moment.fn.isoWeeks = moment.fn.isoWeek;
    moment.fn.toJSON = moment.fn.toISOString;
    extend(moment.duration.fn = Duration.prototype, {
        _bubble: function()
        {
            var milliseconds = this._milliseconds,
                days = this._days,
                months = this._months,
                data = this._data,
                seconds,
                minutes,
                hours,
                years;
            data.milliseconds = milliseconds % 1000;
            seconds = absRound(milliseconds / 1000);
            data.seconds = seconds % 60;
            minutes = absRound(seconds / 60);
            data.minutes = minutes % 60;
            hours = absRound(minutes / 60);
            data.hours = hours % 24;
            days += absRound(hours / 24);
            data.days = days % 30;
            months += absRound(days / 30);
            data.months = months % 12;
            years = absRound(months / 12);
            data.years = years
        }, weeks: function()
            {
                return absRound(this.days() / 7)
            }, valueOf: function()
            {
                return this._milliseconds + this._days * 864e5 + (this._months % 12) * 2592e6 + toInt(this._months / 12) * 31536e6
            }, humanize: function(withSuffix)
            {
                var difference = +this,
                    output = relativeTime(difference, !withSuffix, this.lang());
                if (withSuffix)
                {
                    output = this.lang().pastFuture(difference, output)
                }
                return this.lang().postformat(output)
            }, add: function(input, val)
            {
                var dur = moment.duration(input, val);
                this._milliseconds += dur._milliseconds;
                this._days += dur._days;
                this._months += dur._months;
                this._bubble();
                return this
            }, subtract: function(input, val)
            {
                var dur = moment.duration(input, val);
                this._milliseconds -= dur._milliseconds;
                this._days -= dur._days;
                this._months -= dur._months;
                this._bubble();
                return this
            }, get: function(units)
            {
                units = normalizeUnits(units);
                return this[units.toLowerCase() + 's']()
            }, as: function(units)
            {
                units = normalizeUnits(units);
                return this['as' + units.charAt(0).toUpperCase() + units.slice(1) + 's']()
            }, lang: moment.fn.lang, toIsoString: function()
            {
                var years = Math.abs(this.years()),
                    months = Math.abs(this.months()),
                    days = Math.abs(this.days()),
                    hours = Math.abs(this.hours()),
                    minutes = Math.abs(this.minutes()),
                    seconds = Math.abs(this.seconds() + this.milliseconds() / 1000);
                if (!this.asSeconds())
                {
                    return 'P0D'
                }
                return (this.asSeconds() < 0 ? '-' : '') + 'P' + (years ? years + 'Y' : '') + (months ? months + 'M' : '') + (days ? days + 'D' : '') + ((hours || minutes || seconds) ? 'T' : '') + (hours ? hours + 'H' : '') + (minutes ? minutes + 'M' : '') + (seconds ? seconds + 'S' : '')
            }
    });
    function makeDurationGetter(name)
    {
        moment.duration.fn[name] = function()
        {
            return this._data[name]
        }
    }
    function makeDurationAsGetter(name, factor)
    {
        moment.duration.fn['as' + name] = function()
        {
            return +this / factor
        }
    }
    for (i in unitMillisecondFactors)
    {
        if (unitMillisecondFactors.hasOwnProperty(i))
        {
            makeDurationAsGetter(i, unitMillisecondFactors[i]);
            makeDurationGetter(i.toLowerCase())
        }
    }
    makeDurationAsGetter('Weeks', 6048e5);
    moment.duration.fn.asMonths = function()
    {
        return (+this - this.years() * 31536e6) / 2592e6 + this.years() * 12
    };
    moment.lang('en', {ordinal: function(number)
        {
            var b = number % 10,
                output = (toInt(number % 100 / 10) === 1) ? 'th' : (b === 1) ? 'st' : (b === 2) ? 'nd' : (b === 3) ? 'rd' : 'th';
            return number + output
        }});
    function makeGlobal(deprecate)
    {
        var warned = false,
            local_moment = moment;
        if (typeof ender !== 'undefined')
        {
            return
        }
        if (deprecate)
        {
            global.moment = function()
            {
                if (!warned && console && console.warn)
                {
                    warned = true;
                    console.warn("Accessing Moment through the global scope is " + "deprecated, and will be removed in an upcoming " + "release.")
                }
                return local_moment.apply(null, arguments)
            };
            extend(global.moment, local_moment)
        }
        else
        {
            global['moment'] = moment
        }
    }
    makeGlobal()
}).call(this);
(function(factory)
{
    factory(window.moment)
}(function(moment)
{
    var monthsShortDot = "ene._feb._mar._abr._may._jun._jul._ago._sep._oct._nov._dic.".split("_"),
        monthsShort = "ene_feb_mar_abr_may_jun_jul_ago_sep_oct_nov_dic".split("_");
    return moment.lang('es', {
            months: "enero_febrero_marzo_abril_mayo_junio_julio_agosto_septiembre_octubre_noviembre_diciembre".split("_"), monthsShort: function(m, format)
                {
                    if (/-MMM-/.test(format))
                    {
                        return monthsShort[m.month()]
                    }
                    else
                    {
                        return monthsShortDot[m.month()]
                    }
                }, weekdays: "domingo_lunes_martes_miércoles_jueves_viernes_sábado".split("_"), weekdaysShort: "dom._lun._mar._mié._jue._vie._sáb.".split("_"), weekdaysMin: "Do_Lu_Ma_Mi_Ju_Vi_Sá".split("_"), longDateFormat: {
                    LT: "H:mm", L: "DD/MM/YYYY", LL: "D [de] MMMM [de] YYYY", LLL: "D [de] MMMM [de] YYYY LT", LLLL: "dddd, D [de] MMMM [de] YYYY LT"
                }, calendar: {
                    sameDay: function()
                    {
                        return '[hoy a la' + ((this.hours() !== 1) ? 's' : '') + '] LT'
                    }, nextDay: function()
                        {
                            return '[mañana a la' + ((this.hours() !== 1) ? 's' : '') + '] LT'
                        }, nextWeek: function()
                        {
                            return 'dddd [a la' + ((this.hours() !== 1) ? 's' : '') + '] LT'
                        }, lastDay: function()
                        {
                            return '[ayer a la' + ((this.hours() !== 1) ? 's' : '') + '] LT'
                        }, lastWeek: function()
                        {
                            return '[el] dddd [pasado a la' + ((this.hours() !== 1) ? 's' : '') + '] LT'
                        }, sameElse: 'L'
                }, relativeTime: {
                    future: "en %s", past: "hace %s", s: "unos segundos", m: "un minuto", mm: "%d minutos", h: "una hora", hh: "%d horas", d: "un día", dd: "%d días", M: "un mes", MM: "%d meses", y: "un año", yy: "%d años"
                }, ordinal: '%dº', week: {
                    dow: 1, doy: 4
                }
        })
}));
(function($)
{
    if (typeof $.fn.each2 == "undefined")
    {
        $.extend($.fn, {each2: function(c)
            {
                var j = $([0]),
                    i = -1,
                    l = this.length;
                while (++i < l && (j.context = j[0] = this[i]) && c.call(j[0], i, j) !== false)
                    ;
                return this
            }})
    }
})(jQuery);
(function($, undefined)
{
    if (window.Select2 !== undefined)
    {
        return
    }
    var AbstractSelect2,
        SingleSelect2,
        MultiSelect2,
        nextUid,
        sizer,
        lastMousePosition = {
            x: 0, y: 0
        },
        $document,
        scrollBarDimensions,
        KEY = {
            TAB: 9, ENTER: 13, ESC: 27, SPACE: 32, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, SHIFT: 16, CTRL: 17, ALT: 18, PAGE_UP: 33, PAGE_DOWN: 34, HOME: 36, END: 35, BACKSPACE: 8, DELETE: 46, isArrow: function(k)
                {
                    k = k.which ? k.which : k;
                    switch (k)
                    {
                        case KEY.LEFT:
                        case KEY.RIGHT:
                        case KEY.UP:
                        case KEY.DOWN:
                            return true
                    }
                    return false
                }, isControl: function(e)
                {
                    var k = e.which;
                    switch (k)
                    {
                        case KEY.SHIFT:
                        case KEY.CTRL:
                        case KEY.ALT:
                            return true
                    }
                    if (e.metaKey)
                        return true;
                    return false
                }, isFunctionKey: function(k)
                {
                    k = k.which ? k.which : k;
                    return k >= 112 && k <= 123
                }
        },
        MEASURE_SCROLLBAR_TEMPLATE = "<div class='select2-measure-scrollbar'></div>",
        DIACRITICS = {
            "\u24B6": "A", "\uFF21": "A", "\u00C0": "A", "\u00C1": "A", "\u00C2": "A", "\u1EA6": "A", "\u1EA4": "A", "\u1EAA": "A", "\u1EA8": "A", "\u00C3": "A", "\u0100": "A", "\u0102": "A", "\u1EB0": "A", "\u1EAE": "A", "\u1EB4": "A", "\u1EB2": "A", "\u0226": "A", "\u01E0": "A", "\u00C4": "A", "\u01DE": "A", "\u1EA2": "A", "\u00C5": "A", "\u01FA": "A", "\u01CD": "A", "\u0200": "A", "\u0202": "A", "\u1EA0": "A", "\u1EAC": "A", "\u1EB6": "A", "\u1E00": "A", "\u0104": "A", "\u023A": "A", "\u2C6F": "A", "\uA732": "AA", "\u00C6": "AE", "\u01FC": "AE", "\u01E2": "AE", "\uA734": "AO", "\uA736": "AU", "\uA738": "AV", "\uA73A": "AV", "\uA73C": "AY", "\u24B7": "B", "\uFF22": "B", "\u1E02": "B", "\u1E04": "B", "\u1E06": "B", "\u0243": "B", "\u0182": "B", "\u0181": "B", "\u24B8": "C", "\uFF23": "C", "\u0106": "C", "\u0108": "C", "\u010A": "C", "\u010C": "C", "\u00C7": "C", "\u1E08": "C", "\u0187": "C", "\u023B": "C", "\uA73E": "C", "\u24B9": "D", "\uFF24": "D", "\u1E0A": "D", "\u010E": "D", "\u1E0C": "D", "\u1E10": "D", "\u1E12": "D", "\u1E0E": "D", "\u0110": "D", "\u018B": "D", "\u018A": "D", "\u0189": "D", "\uA779": "D", "\u01F1": "DZ", "\u01C4": "DZ", "\u01F2": "Dz", "\u01C5": "Dz", "\u24BA": "E", "\uFF25": "E", "\u00C8": "E", "\u00C9": "E", "\u00CA": "E", "\u1EC0": "E", "\u1EBE": "E", "\u1EC4": "E", "\u1EC2": "E", "\u1EBC": "E", "\u0112": "E", "\u1E14": "E", "\u1E16": "E", "\u0114": "E", "\u0116": "E", "\u00CB": "E", "\u1EBA": "E", "\u011A": "E", "\u0204": "E", "\u0206": "E", "\u1EB8": "E", "\u1EC6": "E", "\u0228": "E", "\u1E1C": "E", "\u0118": "E", "\u1E18": "E", "\u1E1A": "E", "\u0190": "E", "\u018E": "E", "\u24BB": "F", "\uFF26": "F", "\u1E1E": "F", "\u0191": "F", "\uA77B": "F", "\u24BC": "G", "\uFF27": "G", "\u01F4": "G", "\u011C": "G", "\u1E20": "G", "\u011E": "G", "\u0120": "G", "\u01E6": "G", "\u0122": "G", "\u01E4": "G", "\u0193": "G", "\uA7A0": "G", "\uA77D": "G", "\uA77E": "G", "\u24BD": "H", "\uFF28": "H", "\u0124": "H", "\u1E22": "H", "\u1E26": "H", "\u021E": "H", "\u1E24": "H", "\u1E28": "H", "\u1E2A": "H", "\u0126": "H", "\u2C67": "H", "\u2C75": "H", "\uA78D": "H", "\u24BE": "I", "\uFF29": "I", "\u00CC": "I", "\u00CD": "I", "\u00CE": "I", "\u0128": "I", "\u012A": "I", "\u012C": "I", "\u0130": "I", "\u00CF": "I", "\u1E2E": "I", "\u1EC8": "I", "\u01CF": "I", "\u0208": "I", "\u020A": "I", "\u1ECA": "I", "\u012E": "I", "\u1E2C": "I", "\u0197": "I", "\u24BF": "J", "\uFF2A": "J", "\u0134": "J", "\u0248": "J", "\u24C0": "K", "\uFF2B": "K", "\u1E30": "K", "\u01E8": "K", "\u1E32": "K", "\u0136": "K", "\u1E34": "K", "\u0198": "K", "\u2C69": "K", "\uA740": "K", "\uA742": "K", "\uA744": "K", "\uA7A2": "K", "\u24C1": "L", "\uFF2C": "L", "\u013F": "L", "\u0139": "L", "\u013D": "L", "\u1E36": "L", "\u1E38": "L", "\u013B": "L", "\u1E3C": "L", "\u1E3A": "L", "\u0141": "L", "\u023D": "L", "\u2C62": "L", "\u2C60": "L", "\uA748": "L", "\uA746": "L", "\uA780": "L", "\u01C7": "LJ", "\u01C8": "Lj", "\u24C2": "M", "\uFF2D": "M", "\u1E3E": "M", "\u1E40": "M", "\u1E42": "M", "\u2C6E": "M", "\u019C": "M", "\u24C3": "N", "\uFF2E": "N", "\u01F8": "N", "\u0143": "N", "\u00D1": "N", "\u1E44": "N", "\u0147": "N", "\u1E46": "N", "\u0145": "N", "\u1E4A": "N", "\u1E48": "N", "\u0220": "N", "\u019D": "N", "\uA790": "N", "\uA7A4": "N", "\u01CA": "NJ", "\u01CB": "Nj", "\u24C4": "O", "\uFF2F": "O", "\u00D2": "O", "\u00D3": "O", "\u00D4": "O", "\u1ED2": "O", "\u1ED0": "O", "\u1ED6": "O", "\u1ED4": "O", "\u00D5": "O", "\u1E4C": "O", "\u022C": "O", "\u1E4E": "O", "\u014C": "O", "\u1E50": "O", "\u1E52": "O", "\u014E": "O", "\u022E": "O", "\u0230": "O", "\u00D6": "O", "\u022A": "O", "\u1ECE": "O", "\u0150": "O", "\u01D1": "O", "\u020C": "O", "\u020E": "O", "\u01A0": "O", "\u1EDC": "O", "\u1EDA": "O", "\u1EE0": "O", "\u1EDE": "O", "\u1EE2": "O", "\u1ECC": "O", "\u1ED8": "O", "\u01EA": "O", "\u01EC": "O", "\u00D8": "O", "\u01FE": "O", "\u0186": "O", "\u019F": "O", "\uA74A": "O", "\uA74C": "O", "\u01A2": "OI", "\uA74E": "OO", "\u0222": "OU", "\u24C5": "P", "\uFF30": "P", "\u1E54": "P", "\u1E56": "P", "\u01A4": "P", "\u2C63": "P", "\uA750": "P", "\uA752": "P", "\uA754": "P", "\u24C6": "Q", "\uFF31": "Q", "\uA756": "Q", "\uA758": "Q", "\u024A": "Q", "\u24C7": "R", "\uFF32": "R", "\u0154": "R", "\u1E58": "R", "\u0158": "R", "\u0210": "R", "\u0212": "R", "\u1E5A": "R", "\u1E5C": "R", "\u0156": "R", "\u1E5E": "R", "\u024C": "R", "\u2C64": "R", "\uA75A": "R", "\uA7A6": "R", "\uA782": "R", "\u24C8": "S", "\uFF33": "S", "\u1E9E": "S", "\u015A": "S", "\u1E64": "S", "\u015C": "S", "\u1E60": "S", "\u0160": "S", "\u1E66": "S", "\u1E62": "S", "\u1E68": "S", "\u0218": "S", "\u015E": "S", "\u2C7E": "S", "\uA7A8": "S", "\uA784": "S", "\u24C9": "T", "\uFF34": "T", "\u1E6A": "T", "\u0164": "T", "\u1E6C": "T", "\u021A": "T", "\u0162": "T", "\u1E70": "T", "\u1E6E": "T", "\u0166": "T", "\u01AC": "T", "\u01AE": "T", "\u023E": "T", "\uA786": "T", "\uA728": "TZ", "\u24CA": "U", "\uFF35": "U", "\u00D9": "U", "\u00DA": "U", "\u00DB": "U", "\u0168": "U", "\u1E78": "U", "\u016A": "U", "\u1E7A": "U", "\u016C": "U", "\u00DC": "U", "\u01DB": "U", "\u01D7": "U", "\u01D5": "U", "\u01D9": "U", "\u1EE6": "U", "\u016E": "U", "\u0170": "U", "\u01D3": "U", "\u0214": "U", "\u0216": "U", "\u01AF": "U", "\u1EEA": "U", "\u1EE8": "U", "\u1EEE": "U", "\u1EEC": "U", "\u1EF0": "U", "\u1EE4": "U", "\u1E72": "U", "\u0172": "U", "\u1E76": "U", "\u1E74": "U", "\u0244": "U", "\u24CB": "V", "\uFF36": "V", "\u1E7C": "V", "\u1E7E": "V", "\u01B2": "V", "\uA75E": "V", "\u0245": "V", "\uA760": "VY", "\u24CC": "W", "\uFF37": "W", "\u1E80": "W", "\u1E82": "W", "\u0174": "W", "\u1E86": "W", "\u1E84": "W", "\u1E88": "W", "\u2C72": "W", "\u24CD": "X", "\uFF38": "X", "\u1E8A": "X", "\u1E8C": "X", "\u24CE": "Y", "\uFF39": "Y", "\u1EF2": "Y", "\u00DD": "Y", "\u0176": "Y", "\u1EF8": "Y", "\u0232": "Y", "\u1E8E": "Y", "\u0178": "Y", "\u1EF6": "Y", "\u1EF4": "Y", "\u01B3": "Y", "\u024E": "Y", "\u1EFE": "Y", "\u24CF": "Z", "\uFF3A": "Z", "\u0179": "Z", "\u1E90": "Z", "\u017B": "Z", "\u017D": "Z", "\u1E92": "Z", "\u1E94": "Z", "\u01B5": "Z", "\u0224": "Z", "\u2C7F": "Z", "\u2C6B": "Z", "\uA762": "Z", "\u24D0": "a", "\uFF41": "a", "\u1E9A": "a", "\u00E0": "a", "\u00E1": "a", "\u00E2": "a", "\u1EA7": "a", "\u1EA5": "a", "\u1EAB": "a", "\u1EA9": "a", "\u00E3": "a", "\u0101": "a", "\u0103": "a", "\u1EB1": "a", "\u1EAF": "a", "\u1EB5": "a", "\u1EB3": "a", "\u0227": "a", "\u01E1": "a", "\u00E4": "a", "\u01DF": "a", "\u1EA3": "a", "\u00E5": "a", "\u01FB": "a", "\u01CE": "a", "\u0201": "a", "\u0203": "a", "\u1EA1": "a", "\u1EAD": "a", "\u1EB7": "a", "\u1E01": "a", "\u0105": "a", "\u2C65": "a", "\u0250": "a", "\uA733": "aa", "\u00E6": "ae", "\u01FD": "ae", "\u01E3": "ae", "\uA735": "ao", "\uA737": "au", "\uA739": "av", "\uA73B": "av", "\uA73D": "ay", "\u24D1": "b", "\uFF42": "b", "\u1E03": "b", "\u1E05": "b", "\u1E07": "b", "\u0180": "b", "\u0183": "b", "\u0253": "b", "\u24D2": "c", "\uFF43": "c", "\u0107": "c", "\u0109": "c", "\u010B": "c", "\u010D": "c", "\u00E7": "c", "\u1E09": "c", "\u0188": "c", "\u023C": "c", "\uA73F": "c", "\u2184": "c", "\u24D3": "d", "\uFF44": "d", "\u1E0B": "d", "\u010F": "d", "\u1E0D": "d", "\u1E11": "d", "\u1E13": "d", "\u1E0F": "d", "\u0111": "d", "\u018C": "d", "\u0256": "d", "\u0257": "d", "\uA77A": "d", "\u01F3": "dz", "\u01C6": "dz", "\u24D4": "e", "\uFF45": "e", "\u00E8": "e", "\u00E9": "e", "\u00EA": "e", "\u1EC1": "e", "\u1EBF": "e", "\u1EC5": "e", "\u1EC3": "e", "\u1EBD": "e", "\u0113": "e", "\u1E15": "e", "\u1E17": "e", "\u0115": "e", "\u0117": "e", "\u00EB": "e", "\u1EBB": "e", "\u011B": "e", "\u0205": "e", "\u0207": "e", "\u1EB9": "e", "\u1EC7": "e", "\u0229": "e", "\u1E1D": "e", "\u0119": "e", "\u1E19": "e", "\u1E1B": "e", "\u0247": "e", "\u025B": "e", "\u01DD": "e", "\u24D5": "f", "\uFF46": "f", "\u1E1F": "f", "\u0192": "f", "\uA77C": "f", "\u24D6": "g", "\uFF47": "g", "\u01F5": "g", "\u011D": "g", "\u1E21": "g", "\u011F": "g", "\u0121": "g", "\u01E7": "g", "\u0123": "g", "\u01E5": "g", "\u0260": "g", "\uA7A1": "g", "\u1D79": "g", "\uA77F": "g", "\u24D7": "h", "\uFF48": "h", "\u0125": "h", "\u1E23": "h", "\u1E27": "h", "\u021F": "h", "\u1E25": "h", "\u1E29": "h", "\u1E2B": "h", "\u1E96": "h", "\u0127": "h", "\u2C68": "h", "\u2C76": "h", "\u0265": "h", "\u0195": "hv", "\u24D8": "i", "\uFF49": "i", "\u00EC": "i", "\u00ED": "i", "\u00EE": "i", "\u0129": "i", "\u012B": "i", "\u012D": "i", "\u00EF": "i", "\u1E2F": "i", "\u1EC9": "i", "\u01D0": "i", "\u0209": "i", "\u020B": "i", "\u1ECB": "i", "\u012F": "i", "\u1E2D": "i", "\u0268": "i", "\u0131": "i", "\u24D9": "j", "\uFF4A": "j", "\u0135": "j", "\u01F0": "j", "\u0249": "j", "\u24DA": "k", "\uFF4B": "k", "\u1E31": "k", "\u01E9": "k", "\u1E33": "k", "\u0137": "k", "\u1E35": "k", "\u0199": "k", "\u2C6A": "k", "\uA741": "k", "\uA743": "k", "\uA745": "k", "\uA7A3": "k", "\u24DB": "l", "\uFF4C": "l", "\u0140": "l", "\u013A": "l", "\u013E": "l", "\u1E37": "l", "\u1E39": "l", "\u013C": "l", "\u1E3D": "l", "\u1E3B": "l", "\u017F": "l", "\u0142": "l", "\u019A": "l", "\u026B": "l", "\u2C61": "l", "\uA749": "l", "\uA781": "l", "\uA747": "l", "\u01C9": "lj", "\u24DC": "m", "\uFF4D": "m", "\u1E3F": "m", "\u1E41": "m", "\u1E43": "m", "\u0271": "m", "\u026F": "m", "\u24DD": "n", "\uFF4E": "n", "\u01F9": "n", "\u0144": "n", "\u00F1": "n", "\u1E45": "n", "\u0148": "n", "\u1E47": "n", "\u0146": "n", "\u1E4B": "n", "\u1E49": "n", "\u019E": "n", "\u0272": "n", "\u0149": "n", "\uA791": "n", "\uA7A5": "n", "\u01CC": "nj", "\u24DE": "o", "\uFF4F": "o", "\u00F2": "o", "\u00F3": "o", "\u00F4": "o", "\u1ED3": "o", "\u1ED1": "o", "\u1ED7": "o", "\u1ED5": "o", "\u00F5": "o", "\u1E4D": "o", "\u022D": "o", "\u1E4F": "o", "\u014D": "o", "\u1E51": "o", "\u1E53": "o", "\u014F": "o", "\u022F": "o", "\u0231": "o", "\u00F6": "o", "\u022B": "o", "\u1ECF": "o", "\u0151": "o", "\u01D2": "o", "\u020D": "o", "\u020F": "o", "\u01A1": "o", "\u1EDD": "o", "\u1EDB": "o", "\u1EE1": "o", "\u1EDF": "o", "\u1EE3": "o", "\u1ECD": "o", "\u1ED9": "o", "\u01EB": "o", "\u01ED": "o", "\u00F8": "o", "\u01FF": "o", "\u0254": "o", "\uA74B": "o", "\uA74D": "o", "\u0275": "o", "\u01A3": "oi", "\u0223": "ou", "\uA74F": "oo", "\u24DF": "p", "\uFF50": "p", "\u1E55": "p", "\u1E57": "p", "\u01A5": "p", "\u1D7D": "p", "\uA751": "p", "\uA753": "p", "\uA755": "p", "\u24E0": "q", "\uFF51": "q", "\u024B": "q", "\uA757": "q", "\uA759": "q", "\u24E1": "r", "\uFF52": "r", "\u0155": "r", "\u1E59": "r", "\u0159": "r", "\u0211": "r", "\u0213": "r", "\u1E5B": "r", "\u1E5D": "r", "\u0157": "r", "\u1E5F": "r", "\u024D": "r", "\u027D": "r", "\uA75B": "r", "\uA7A7": "r", "\uA783": "r", "\u24E2": "s", "\uFF53": "s", "\u00DF": "s", "\u015B": "s", "\u1E65": "s", "\u015D": "s", "\u1E61": "s", "\u0161": "s", "\u1E67": "s", "\u1E63": "s", "\u1E69": "s", "\u0219": "s", "\u015F": "s", "\u023F": "s", "\uA7A9": "s", "\uA785": "s", "\u1E9B": "s", "\u24E3": "t", "\uFF54": "t", "\u1E6B": "t", "\u1E97": "t", "\u0165": "t", "\u1E6D": "t", "\u021B": "t", "\u0163": "t", "\u1E71": "t", "\u1E6F": "t", "\u0167": "t", "\u01AD": "t", "\u0288": "t", "\u2C66": "t", "\uA787": "t", "\uA729": "tz", "\u24E4": "u", "\uFF55": "u", "\u00F9": "u", "\u00FA": "u", "\u00FB": "u", "\u0169": "u", "\u1E79": "u", "\u016B": "u", "\u1E7B": "u", "\u016D": "u", "\u00FC": "u", "\u01DC": "u", "\u01D8": "u", "\u01D6": "u", "\u01DA": "u", "\u1EE7": "u", "\u016F": "u", "\u0171": "u", "\u01D4": "u", "\u0215": "u", "\u0217": "u", "\u01B0": "u", "\u1EEB": "u", "\u1EE9": "u", "\u1EEF": "u", "\u1EED": "u", "\u1EF1": "u", "\u1EE5": "u", "\u1E73": "u", "\u0173": "u", "\u1E77": "u", "\u1E75": "u", "\u0289": "u", "\u24E5": "v", "\uFF56": "v", "\u1E7D": "v", "\u1E7F": "v", "\u028B": "v", "\uA75F": "v", "\u028C": "v", "\uA761": "vy", "\u24E6": "w", "\uFF57": "w", "\u1E81": "w", "\u1E83": "w", "\u0175": "w", "\u1E87": "w", "\u1E85": "w", "\u1E98": "w", "\u1E89": "w", "\u2C73": "w", "\u24E7": "x", "\uFF58": "x", "\u1E8B": "x", "\u1E8D": "x", "\u24E8": "y", "\uFF59": "y", "\u1EF3": "y", "\u00FD": "y", "\u0177": "y", "\u1EF9": "y", "\u0233": "y", "\u1E8F": "y", "\u00FF": "y", "\u1EF7": "y", "\u1E99": "y", "\u1EF5": "y", "\u01B4": "y", "\u024F": "y", "\u1EFF": "y", "\u24E9": "z", "\uFF5A": "z", "\u017A": "z", "\u1E91": "z", "\u017C": "z", "\u017E": "z", "\u1E93": "z", "\u1E95": "z", "\u01B6": "z", "\u0225": "z", "\u0240": "z", "\u2C6C": "z", "\uA763": "z"
        };
    $document = $(document);
    nextUid = (function()
    {
        var counter = 1;
        return function()
            {
                return counter++
            }
    }());
    function stripDiacritics(str)
    {
        var ret,
            i,
            l,
            c;
        if (!str || str.length < 1)
            return str;
        ret = "";
        for (i = 0, l = str.length; i < l; i++)
        {
            c = str.charAt(i);
            ret += DIACRITICS[c] || c
        }
        return ret
    }
    function indexOf(value, array)
    {
        var i = 0,
            l = array.length;
        for (; i < l; i = i + 1)
        {
            if (equal(value, array[i]))
                return i
        }
        return -1
    }
    function measureScrollbar()
    {
        var $template = $(MEASURE_SCROLLBAR_TEMPLATE);
        $template.appendTo('body');
        var dim = {
                width: $template.width() - $template[0].clientWidth, height: $template.height() - $template[0].clientHeight
            };
        $template.remove();
        return dim
    }
    function equal(a, b)
    {
        if (a === b)
            return true;
        if (a === undefined || b === undefined)
            return false;
        if (a === null || b === null)
            return false;
        if (a.constructor === String)
            return a + '' === b + '';
        if (b.constructor === String)
            return b + '' === a + '';
        return false
    }
    function splitVal(string, separator)
    {
        var val,
            i,
            l;
        if (string === null || string.length < 1)
            return [];
        val = string.split(separator);
        for (i = 0, l = val.length; i < l; i = i + 1)
            val[i] = $.trim(val[i]);
        return val
    }
    function getSideBorderPadding(element)
    {
        return element.outerWidth(false) - element.width()
    }
    function installKeyUpChangeEvent(element)
    {
        var key = "keyup-change-value";
        element.on("keydown", function()
        {
            if ($.data(element, key) === undefined)
            {
                $.data(element, key, element.val())
            }
        });
        element.on("keyup", function()
        {
            var val = $.data(element, key);
            if (val !== undefined && element.val() !== val)
            {
                $.removeData(element, key);
                element.trigger("keyup-change")
            }
        })
    }
    $document.on("mousemove", function(e)
    {
        lastMousePosition.x = e.pageX;
        lastMousePosition.y = e.pageY
    });
    function installFilteredMouseMove(element)
    {
        element.on("mousemove", function(e)
        {
            var lastpos = lastMousePosition;
            if (lastpos === undefined || lastpos.x !== e.pageX || lastpos.y !== e.pageY)
            {
                $(e.target).trigger("mousemove-filtered", e)
            }
        })
    }
    function debounce(quietMillis, fn, ctx)
    {
        ctx = ctx || undefined;
        var timeout;
        return function()
            {
                var args = arguments;
                window.clearTimeout(timeout);
                timeout = window.setTimeout(function()
                {
                    fn.apply(ctx, args)
                }, quietMillis)
            }
    }
    function thunk(formula)
    {
        var evaluated = false,
            value;
        return function()
            {
                if (evaluated === false)
                {
                    value = formula();
                    evaluated = true
                }
                return value
            }
    }
    ;
    function installDebouncedScroll(threshold, element)
    {
        var notify = debounce(threshold, function(e)
            {
                element.trigger("scroll-debounced", e)
            });
        element.on("scroll", function(e)
        {
            if (indexOf(e.target, element.get()) >= 0)
                notify(e)
        })
    }
    function focus($el)
    {
        if ($el[0] === document.activeElement)
            return;
        window.setTimeout(function()
        {
            var el = $el[0],
                pos = $el.val().length,
                range;
            $el.focus();
            if ($el.is(":visible") && el === document.activeElement)
            {
                if (el.setSelectionRange)
                {
                    el.setSelectionRange(pos, pos)
                }
                else if (el.createTextRange)
                {
                    range = el.createTextRange();
                    range.collapse(false);
                    range.select()
                }
            }
        }, 0)
    }
    function getCursorInfo(el)
    {
        el = $(el)[0];
        var offset = 0;
        var length = 0;
        if ('selectionStart' in el)
        {
            offset = el.selectionStart;
            length = el.selectionEnd - offset
        }
        else if ('selection' in document)
        {
            el.focus();
            var sel = document.selection.createRange();
            length = document.selection.createRange().text.length;
            sel.moveStart('character', -el.value.length);
            offset = sel.text.length - length
        }
        return {
                offset: offset, length: length
            }
    }
    function killEvent(event)
    {
        event.preventDefault();
        event.stopPropagation()
    }
    function killEventImmediately(event)
    {
        event.preventDefault();
        event.stopImmediatePropagation()
    }
    function measureTextWidth(e)
    {
        if (!sizer)
        {
            var style = e[0].currentStyle || window.getComputedStyle(e[0], null);
            sizer = $(document.createElement("div")).css({
                position: "absolute", left: "-10000px", top: "-10000px", display: "none", fontSize: style.fontSize, fontFamily: style.fontFamily, fontStyle: style.fontStyle, fontWeight: style.fontWeight, letterSpacing: style.letterSpacing, textTransform: style.textTransform, whiteSpace: "nowrap"
            });
            sizer.attr("class", "select2-sizer");
            $("body").append(sizer)
        }
        sizer.text(e.val());
        return sizer.width()
    }
    function syncCssClasses(dest, src, adapter)
    {
        var classes,
            replacements = [],
            adapted;
        classes = dest.attr("class");
        if (classes)
        {
            classes = '' + classes;
            $(classes.split(" ")).each2(function()
            {
                if (this.indexOf("select2-") === 0)
                {
                    replacements.push(this)
                }
            })
        }
        classes = src.attr("class");
        if (classes)
        {
            classes = '' + classes;
            $(classes.split(" ")).each2(function()
            {
                if (this.indexOf("select2-") !== 0)
                {
                    adapted = adapter(this);
                    if (adapted)
                    {
                        replacements.push(this)
                    }
                }
            })
        }
        dest.attr("class", replacements.join(" "))
    }
    function markMatch(text, term, markup, escapeMarkup)
    {
        var match = stripDiacritics(text.toUpperCase()).indexOf(stripDiacritics(term.toUpperCase())),
            tl = term.length;
        if (match < 0)
        {
            markup.push(escapeMarkup(text));
            return
        }
        markup.push(escapeMarkup(text.substring(0, match)));
        markup.push("<span class='select2-match'>");
        markup.push(escapeMarkup(text.substring(match, match + tl)));
        markup.push("</span>");
        markup.push(escapeMarkup(text.substring(match + tl, text.length)))
    }
    function defaultEscapeMarkup(markup)
    {
        var replace_map = {
                '\\': '&#92;', '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', "/": '&#47;'
            };
        return String(markup).replace(/[&<>"'\/\\]/g, function(match)
            {
                return replace_map[match]
            })
    }
    function ajax(options)
    {
        var timeout,
            handler = null,
            quietMillis = options.quietMillis || 100,
            ajaxUrl = options.url,
            self = this;
        return function(query)
            {
                window.clearTimeout(timeout);
                timeout = window.setTimeout(function()
                {
                    var data = options.data,
                        url = ajaxUrl,
                        transport = options.transport || $.fn.select2.ajaxDefaults.transport,
                        deprecated = {
                            type: options.type || 'GET', cache: options.cache || false, jsonpCallback: options.jsonpCallback || undefined, dataType: options.dataType || "json"
                        },
                        params = $.extend({}, $.fn.select2.ajaxDefaults.params, deprecated);
                    data = data ? data.call(self, query.term, query.page, query.context) : null;
                    url = (typeof url === 'function') ? url.call(self, query.term, query.page, query.context) : url;
                    if (handler)
                    {
                        handler.abort()
                    }
                    if (options.params)
                    {
                        if ($.isFunction(options.params))
                        {
                            $.extend(params, options.params.call(self))
                        }
                        else
                        {
                            $.extend(params, options.params)
                        }
                    }
                    $.extend(params, {
                        url: url, dataType: options.dataType, data: data, success: function(data)
                            {
                                var results = options.results(data, query.page);
                                query.callback(results)
                            }
                    });
                    handler = transport.call(self, params)
                }, quietMillis)
            }
    }
    function local(options)
    {
        var data = options,
            dataText,
            tmp,
            text = function(item)
            {
                return "" + item.text
            };
        if ($.isArray(data))
        {
            tmp = data;
            data = {results: tmp}
        }
        if ($.isFunction(data) === false)
        {
            tmp = data;
            data = function()
            {
                return tmp
            }
        }
        var dataItem = data();
        if (dataItem.text)
        {
            text = dataItem.text;
            if (!$.isFunction(text))
            {
                dataText = dataItem.text;
                text = function(item)
                {
                    return item[dataText]
                }
            }
        }
        return function(query)
            {
                var t = query.term,
                    filtered = {results: []},
                    process;
                if (t === "")
                {
                    query.callback(data());
                    return
                }
                process = function(datum, collection)
                {
                    var group,
                        attr;
                    datum = datum[0];
                    if (datum.children)
                    {
                        group = {};
                        for (attr in datum)
                        {
                            if (datum.hasOwnProperty(attr))
                                group[attr] = datum[attr]
                        }
                        group.children = [];
                        $(datum.children).each2(function(i, childDatum)
                        {
                            process(childDatum, group.children)
                        });
                        if (group.children.length || query.matcher(t, text(group), datum))
                        {
                            collection.push(group)
                        }
                    }
                    else
                    {
                        if (query.matcher(t, text(datum), datum))
                        {
                            collection.push(datum)
                        }
                    }
                };
                $(data().results).each2(function(i, datum)
                {
                    process(datum, filtered.results)
                });
                query.callback(filtered)
            }
    }
    function tags(data)
    {
        var isFunc = $.isFunction(data);
        return function(query)
            {
                var t = query.term,
                    filtered = {results: []};
                $(isFunc ? data() : data).each(function()
                {
                    var isObject = this.text !== undefined,
                        text = isObject ? this.text : this;
                    if (t === "" || query.matcher(t, text))
                    {
                        filtered.results.push(isObject ? this : {
                            id: this, text: this
                        })
                    }
                });
                query.callback(filtered)
            }
    }
    function checkFormatter(formatter, formatterName)
    {
        if ($.isFunction(formatter))
            return true;
        if (!formatter)
            return false;
        throw new Error(formatterName + " must be a function or a falsy value");
    }
    function evaluate(val)
    {
        return $.isFunction(val) ? val() : val
    }
    function countResults(results)
    {
        var count = 0;
        $.each(results, function(i, item)
        {
            if (item.children)
            {
                count += countResults(item.children)
            }
            else
            {
                count++
            }
        });
        return count
    }
    function defaultTokenizer(input, selection, selectCallback, opts)
    {
        var original = input,
            dupe = false,
            token,
            index,
            i,
            l,
            separator;
        if (!opts.createSearchChoice || !opts.tokenSeparators || opts.tokenSeparators.length < 1)
            return undefined;
        while (true)
        {
            index = -1;
            for (i = 0, l = opts.tokenSeparators.length; i < l; i++)
            {
                separator = opts.tokenSeparators[i];
                index = input.indexOf(separator);
                if (index >= 0)
                    break
            }
            if (index < 0)
                break;
            token = input.substring(0, index);
            input = input.substring(index + separator.length);
            if (token.length > 0)
            {
                token = opts.createSearchChoice.call(this, token, selection);
                if (token !== undefined && token !== null && opts.id(token) !== undefined && opts.id(token) !== null)
                {
                    dupe = false;
                    for (i = 0, l = selection.length; i < l; i++)
                    {
                        if (equal(opts.id(token), opts.id(selection[i])))
                        {
                            dupe = true;
                            break
                        }
                    }
                    if (!dupe)
                        selectCallback(token)
                }
            }
        }
        if (original !== input)
            return input
    }
    function clazz(SuperClass, methods)
    {
        var constructor = function(){};
        constructor.prototype = new SuperClass;
        constructor.prototype.constructor = constructor;
        constructor.prototype.parent = SuperClass.prototype;
        constructor.prototype = $.extend(constructor.prototype, methods);
        return constructor
    }
    AbstractSelect2 = clazz(Object, {
        bind: function(func)
        {
            var self = this;
            return function()
                {
                    func.apply(self, arguments)
                }
        }, init: function(opts)
            {
                var results,
                    search,
                    resultsSelector = ".select2-results",
                    disabled,
                    readonly;
                this.opts = opts = this.prepareOpts(opts);
                this.id = opts.id;
                if (opts.element.data("select2") !== undefined && opts.element.data("select2") !== null)
                {
                    opts.element.data("select2").destroy()
                }
                this.container = this.createContainer();
                this.containerId = "s2id_" + (opts.element.attr("id") || "autogen" + nextUid());
                this.containerSelector = "#" + this.containerId.replace(/([;&,\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
                this.container.attr("id", this.containerId);
                this.body = thunk(function()
                {
                    return opts.element.closest("body")
                });
                syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);
                this.container.attr("style", opts.element.attr("style"));
                this.container.css(evaluate(opts.containerCss));
                this.container.addClass(evaluate(opts.containerCssClass));
                this.elementTabIndex = this.opts.element.attr("tabindex");
                this.opts.element.data("select2", this).attr("tabindex", "-1").before(this.container);
                this.container.data("select2", this);
                this.dropdown = this.container.find(".select2-drop");
                this.dropdown.addClass(evaluate(opts.dropdownCssClass));
                this.dropdown.data("select2", this);
                syncCssClasses(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);
                this.results = results = this.container.find(resultsSelector);
                this.search = search = this.container.find("input.select2-input");
                this.queryCount = 0;
                this.resultsPage = 0;
                this.context = null;
                this.initContainer();
                installFilteredMouseMove(this.results);
                this.dropdown.on("mousemove-filtered touchstart touchmove touchend", resultsSelector, this.bind(this.highlightUnderEvent));
                installDebouncedScroll(80, this.results);
                this.dropdown.on("scroll-debounced", resultsSelector, this.bind(this.loadMoreIfNeeded));
                $(this.container).on("change", ".select2-input", function(e)
                {
                    e.stopPropagation()
                });
                $(this.dropdown).on("change", ".select2-input", function(e)
                {
                    e.stopPropagation()
                });
                if ($.fn.mousewheel)
                {
                    results.mousewheel(function(e, delta, deltaX, deltaY)
                    {
                        var top = results.scrollTop(),
                            height;
                        if (deltaY > 0 && top - deltaY <= 0)
                        {
                            results.scrollTop(0);
                            killEvent(e)
                        }
                        else if (deltaY < 0 && results.get(0).scrollHeight - results.scrollTop() + deltaY <= results.height())
                        {
                            results.scrollTop(results.get(0).scrollHeight - results.height());
                            killEvent(e)
                        }
                    })
                }
                installKeyUpChangeEvent(search);
                search.on("keyup-change input paste", this.bind(this.updateResults));
                search.on("focus", function()
                {
                    search.addClass("select2-focused")
                });
                search.on("blur", function()
                {
                    search.removeClass("select2-focused")
                });
                this.dropdown.on("mouseup", resultsSelector, this.bind(function(e)
                {
                    if ($(e.target).closest(".select2-result-selectable").length > 0)
                    {
                        this.highlightUnderEvent(e);
                        this.selectHighlighted(e)
                    }
                }));
                this.dropdown.on("click mouseup mousedown", function(e)
                {
                    e.stopPropagation()
                });
                if ($.isFunction(this.opts.initSelection))
                {
                    this.initSelection();
                    this.monitorSource()
                }
                if (opts.maximumInputLength !== null)
                {
                    this.search.attr("maxlength", opts.maximumInputLength)
                }
                var disabled = opts.element.prop("disabled");
                if (disabled === undefined)
                    disabled = false;
                this.enable(!disabled);
                var readonly = opts.element.prop("readonly");
                if (readonly === undefined)
                    readonly = false;
                this.readonly(readonly);
                scrollBarDimensions = scrollBarDimensions || measureScrollbar();
                this.autofocus = opts.element.prop("autofocus");
                opts.element.prop("autofocus", false);
                if (this.autofocus)
                    this.focus();
                this.nextSearchTerm = undefined
            }, destroy: function()
            {
                var element = this.opts.element,
                    select2 = element.data("select2");
                this.close();
                if (this.propertyObserver)
                {
                    delete this.propertyObserver;
                    this.propertyObserver = null
                }
                if (select2 !== undefined)
                {
                    select2.container.remove();
                    select2.dropdown.remove();
                    element.removeClass("select2-offscreen").removeData("select2").off(".select2").prop("autofocus", this.autofocus || false);
                    if (this.elementTabIndex)
                    {
                        element.attr({tabindex: this.elementTabIndex})
                    }
                    else
                    {
                        element.removeAttr("tabindex")
                    }
                    element.show()
                }
            }, optionToData: function(element)
            {
                if (element.is("option"))
                {
                    return {
                            id: element.prop("value"), text: element.text(), element: element.get(), css: element.attr("class"), disabled: element.prop("disabled"), locked: equal(element.attr("locked"), "locked") || equal(element.data("locked"), true)
                        }
                }
                else if (element.is("optgroup"))
                {
                    return {
                            text: element.attr("label"), children: [], element: element.get(), css: element.attr("class")
                        }
                }
            }, prepareOpts: function(opts)
            {
                var element,
                    select,
                    idKey,
                    ajaxUrl,
                    self = this;
                element = opts.element;
                if (element.get(0).tagName.toLowerCase() === "select")
                {
                    this.select = select = opts.element
                }
                if (select)
                {
                    $.each(["id", "multiple", "ajax", "query", "createSearchChoice", "initSelection", "data", "tags"], function()
                    {
                        if (this in opts)
                        {
                            throw new Error("Option '" + this + "' is not allowed for Select2 when attached to a <select> element.");
                        }
                    })
                }
                opts = $.extend({}, {populateResults: function(container, results, query)
                    {
                        var populate,
                            data,
                            result,
                            children,
                            id = this.opts.id;
                        populate = function(results, container, depth)
                        {
                            var i,
                                l,
                                result,
                                selectable,
                                disabled,
                                compound,
                                node,
                                label,
                                innerContainer,
                                formatted;
                            results = opts.sortResults(results, container, query);
                            for (i = 0, l = results.length; i < l; i = i + 1)
                            {
                                result = results[i];
                                disabled = (result.disabled === true);
                                selectable = (!disabled) && (id(result) !== undefined);
                                compound = result.children && result.children.length > 0;
                                node = $("<li></li>");
                                node.addClass("select2-results-dept-" + depth);
                                node.addClass("select2-result");
                                node.addClass(selectable ? "select2-result-selectable" : "select2-result-unselectable");
                                if (disabled)
                                {
                                    node.addClass("select2-disabled")
                                }
                                if (compound)
                                {
                                    node.addClass("select2-result-with-children")
                                }
                                node.addClass(self.opts.formatResultCssClass(result));
                                label = $(document.createElement("div"));
                                label.addClass("select2-result-label");
                                formatted = opts.formatResult(result, label, query, self.opts.escapeMarkup);
                                if (formatted !== undefined)
                                {
                                    label.html(formatted)
                                }
                                node.append(label);
                                if (compound)
                                {
                                    innerContainer = $("<ul></ul>");
                                    innerContainer.addClass("select2-result-sub");
                                    populate(result.children, innerContainer, depth + 1);
                                    node.append(innerContainer)
                                }
                                node.data("select2-data", result);
                                container.append(node)
                            }
                        };
                        populate(results, container, 0)
                    }}, $.fn.select2.defaults, opts);
                if (typeof(opts.id) !== "function")
                {
                    idKey = opts.id;
                    opts.id = function(e)
                    {
                        return e[idKey]
                    }
                }
                if ($.isArray(opts.element.data("select2Tags")))
                {
                    if ("tags" in opts)
                    {
                        throw"tags specified as both an attribute 'data-select2-tags' and in options of Select2 " + opts.element.attr("id");
                    }
                    opts.tags = opts.element.data("select2Tags")
                }
                if (select)
                {
                    opts.query = this.bind(function(query)
                    {
                        var data = {
                                results: [], more: false
                            },
                            term = query.term,
                            children,
                            placeholderOption,
                            process;
                        process = function(element, collection)
                        {
                            var group;
                            if (element.is("option"))
                            {
                                if (query.matcher(term, element.text(), element))
                                {
                                    collection.push(self.optionToData(element))
                                }
                            }
                            else if (element.is("optgroup"))
                            {
                                group = self.optionToData(element);
                                element.children().each2(function(i, elm)
                                {
                                    process(elm, group.children)
                                });
                                if (group.children.length > 0)
                                {
                                    collection.push(group)
                                }
                            }
                        };
                        children = element.children();
                        if (this.getPlaceholder() !== undefined && children.length > 0)
                        {
                            placeholderOption = this.getPlaceholderOption();
                            if (placeholderOption)
                            {
                                children = children.not(placeholderOption)
                            }
                        }
                        children.each2(function(i, elm)
                        {
                            process(elm, data.results)
                        });
                        query.callback(data)
                    });
                    opts.id = function(e)
                    {
                        return e.id
                    };
                    opts.formatResultCssClass = function(data)
                    {
                        return data.css
                    }
                }
                else
                {
                    if (!("query" in opts))
                    {
                        if ("ajax" in opts)
                        {
                            ajaxUrl = opts.element.data("ajax-url");
                            if (ajaxUrl && ajaxUrl.length > 0)
                            {
                                opts.ajax.url = ajaxUrl
                            }
                            opts.query = ajax.call(opts.element, opts.ajax)
                        }
                        else if ("data" in opts)
                        {
                            opts.query = local(opts.data)
                        }
                        else if ("tags" in opts)
                        {
                            opts.query = tags(opts.tags);
                            if (opts.createSearchChoice === undefined)
                            {
                                opts.createSearchChoice = function(term)
                                {
                                    return {
                                            id: $.trim(term), text: $.trim(term)
                                        }
                                }
                            }
                            if (opts.initSelection === undefined)
                            {
                                opts.initSelection = function(element, callback)
                                {
                                    var data = [];
                                    $(splitVal(element.val(), opts.separator)).each(function()
                                    {
                                        var id = this,
                                            text = this,
                                            tags = opts.tags;
                                        if ($.isFunction(tags))
                                            tags = tags();
                                        $(tags).each(function()
                                        {
                                            if (equal(this.id, id))
                                            {
                                                text = this.text;
                                                return false
                                            }
                                        });
                                        data.push({
                                            id: id, text: text
                                        })
                                    });
                                    callback(data)
                                }
                            }
                        }
                    }
                }
                if (typeof(opts.query) !== "function")
                {
                    throw"query function not defined for Select2 " + opts.element.attr("id");
                }
                return opts
            }, monitorSource: function()
            {
                var el = this.opts.element,
                    sync;
                el.on("change.select2", this.bind(function(e)
                {
                    if (this.opts.element.data("select2-change-triggered") !== true)
                    {
                        this.initSelection()
                    }
                }));
                sync = this.bind(function()
                {
                    var enabled,
                        readonly,
                        self = this;
                    var disabled = el.prop("disabled");
                    if (disabled === undefined)
                        disabled = false;
                    this.enable(!disabled);
                    var readonly = el.prop("readonly");
                    if (readonly === undefined)
                        readonly = false;
                    this.readonly(readonly);
                    syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);
                    this.container.addClass(evaluate(this.opts.containerCssClass));
                    syncCssClasses(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);
                    this.dropdown.addClass(evaluate(this.opts.dropdownCssClass))
                });
                el.on("propertychange.select2 DOMAttrModified.select2", sync);
                if (this.mutationCallback === undefined)
                {
                    this.mutationCallback = function(mutations)
                    {
                        mutations.forEach(sync)
                    }
                }
                if (typeof WebKitMutationObserver !== "undefined")
                {
                    if (this.propertyObserver)
                    {
                        delete this.propertyObserver;
                        this.propertyObserver = null
                    }
                    this.propertyObserver = new WebKitMutationObserver(this.mutationCallback);
                    this.propertyObserver.observe(el.get(0), {
                        attributes: true, subtree: false
                    })
                }
            }, triggerSelect: function(data)
            {
                var evt = $.Event("select2-selecting", {
                        val: this.id(data), object: data
                    });
                this.opts.element.trigger(evt);
                return !evt.isDefaultPrevented()
            }, triggerChange: function(details)
            {
                details = details || {};
                details = $.extend({}, details, {
                    type: "change", val: this.val()
                });
                this.opts.element.data("select2-change-triggered", true);
                this.opts.element.trigger(details);
                this.opts.element.data("select2-change-triggered", false);
                this.opts.element.click();
                if (this.opts.blurOnChange)
                    this.opts.element.blur()
            }, isInterfaceEnabled: function()
            {
                return this.enabledInterface === true
            }, enableInterface: function()
            {
                var enabled = this._enabled && !this._readonly,
                    disabled = !enabled;
                if (enabled === this.enabledInterface)
                    return false;
                this.container.toggleClass("select2-container-disabled", disabled);
                this.close();
                this.enabledInterface = enabled;
                return true
            }, enable: function(enabled)
            {
                if (enabled === undefined)
                    enabled = true;
                if (this._enabled === enabled)
                    return;
                this._enabled = enabled;
                this.opts.element.prop("disabled", !enabled);
                this.enableInterface()
            }, disable: function()
            {
                this.enable(false)
            }, readonly: function(enabled)
            {
                if (enabled === undefined)
                    enabled = false;
                if (this._readonly === enabled)
                    return false;
                this._readonly = enabled;
                this.opts.element.prop("readonly", enabled);
                this.enableInterface();
                return true
            }, opened: function()
            {
                return this.container.hasClass("select2-dropdown-open")
            }, positionDropdown: function()
            {
                var $dropdown = this.dropdown,
                    offset = this.container.offset(),
                    height = this.container.outerHeight(false),
                    width = this.container.outerWidth(false),
                    dropHeight = $dropdown.outerHeight(false),
                    viewPortRight = $(window).scrollLeft() + $(window).width(),
                    viewportBottom = $(window).scrollTop() + $(window).height(),
                    dropTop = offset.top + height,
                    dropLeft = offset.left,
                    enoughRoomBelow = dropTop + dropHeight <= viewportBottom,
                    enoughRoomAbove = (offset.top - dropHeight) >= this.body().scrollTop(),
                    dropWidth = $dropdown.outerWidth(false),
                    enoughRoomOnRight = dropLeft + dropWidth <= viewPortRight,
                    aboveNow = $dropdown.hasClass("select2-drop-above"),
                    bodyOffset,
                    above,
                    css,
                    resultsListNode;
                if (this.opts.dropdownAutoWidth)
                {
                    resultsListNode = $('.select2-results', $dropdown)[0];
                    $dropdown.addClass('select2-drop-auto-width');
                    $dropdown.css('width', '');
                    dropWidth = $dropdown.outerWidth(false) + (resultsListNode.scrollHeight === resultsListNode.clientHeight ? 0 : scrollBarDimensions.width);
                    dropWidth > width ? width = dropWidth : dropWidth = width;
                    enoughRoomOnRight = dropLeft + dropWidth <= viewPortRight
                }
                else
                {
                    this.container.removeClass('select2-drop-auto-width')
                }
                if (this.body().css('position') !== 'static')
                {
                    bodyOffset = this.body().offset();
                    dropTop -= bodyOffset.top;
                    dropLeft -= bodyOffset.left
                }
                if (aboveNow)
                {
                    above = true;
                    if (!enoughRoomAbove && enoughRoomBelow)
                        above = false
                }
                else
                {
                    above = false;
                    if (!enoughRoomBelow && enoughRoomAbove)
                        above = true
                }
                if (!enoughRoomOnRight)
                {
                    dropLeft = offset.left + width - dropWidth
                }
                if (above)
                {
                    dropTop = offset.top - dropHeight;
                    this.container.addClass("select2-drop-above");
                    $dropdown.addClass("select2-drop-above")
                }
                else
                {
                    this.container.removeClass("select2-drop-above");
                    $dropdown.removeClass("select2-drop-above")
                }
                css = $.extend({
                    top: dropTop, left: dropLeft, width: width
                }, evaluate(this.opts.dropdownCss));
                $dropdown.css(css)
            }, shouldOpen: function()
            {
                var event;
                if (this.opened())
                    return false;
                if (this._enabled === false || this._readonly === true)
                    return false;
                event = $.Event("select2-opening");
                this.opts.element.trigger(event);
                return !event.isDefaultPrevented()
            }, clearDropdownAlignmentPreference: function()
            {
                this.container.removeClass("select2-drop-above");
                this.dropdown.removeClass("select2-drop-above")
            }, open: function()
            {
                if (!this.shouldOpen())
                    return false;
                this.opening();
                return true
            }, opening: function()
            {
                var cid = this.containerId,
                    scroll = "scroll." + cid,
                    resize = "resize." + cid,
                    orient = "orientationchange." + cid,
                    mask,
                    maskCss;
                this.container.addClass("select2-dropdown-open").addClass("select2-container-active");
                this.clearDropdownAlignmentPreference();
                if (this.dropdown[0] !== this.body().children().last()[0])
                {
                    this.dropdown.detach().appendTo(this.body())
                }
                mask = $("#select2-drop-mask");
                if (mask.length == 0)
                {
                    mask = $(document.createElement("div"));
                    mask.attr("id", "select2-drop-mask").attr("class", "select2-drop-mask");
                    mask.hide();
                    mask.appendTo(this.body());
                    mask.on("mousedown touchstart click", function(e)
                    {
                        var dropdown = $("#select2-drop"),
                            self;
                        if (dropdown.length > 0)
                        {
                            self = dropdown.data("select2");
                            if (self.opts.selectOnBlur)
                            {
                                self.selectHighlighted({noFocus: true})
                            }
                            self.close({focus: false});
                            e.preventDefault();
                            e.stopPropagation()
                        }
                    })
                }
                if (this.dropdown.prev()[0] !== mask[0])
                {
                    this.dropdown.before(mask)
                }
                $("#select2-drop").removeAttr("id");
                this.dropdown.attr("id", "select2-drop");
                mask.show();
                this.positionDropdown();
                this.dropdown.show();
                this.positionDropdown();
                this.dropdown.addClass("select2-drop-active");
                var that = this;
                this.container.parents().add(window).each(function()
                {
                    $(this).on(resize + " " + scroll + " " + orient, function(e)
                    {
                        that.positionDropdown()
                    })
                })
            }, close: function()
            {
                if (!this.opened())
                    return;
                var cid = this.containerId,
                    scroll = "scroll." + cid,
                    resize = "resize." + cid,
                    orient = "orientationchange." + cid;
                this.container.parents().add(window).each(function()
                {
                    $(this).off(scroll).off(resize).off(orient)
                });
                this.clearDropdownAlignmentPreference();
                $("#select2-drop-mask").hide();
                this.dropdown.removeAttr("id");
                this.dropdown.hide();
                this.container.removeClass("select2-dropdown-open");
                this.results.empty();
                this.clearSearch();
                this.search.removeClass("select2-active");
                this.opts.element.trigger($.Event("select2-close"))
            }, externalSearch: function(term)
            {
                this.open();
                this.search.val(term);
                this.updateResults(false)
            }, clearSearch: function(){}, getMaximumSelectionSize: function()
            {
                return evaluate(this.opts.maximumSelectionSize)
            }, ensureHighlightVisible: function()
            {
                var results = this.results,
                    children,
                    index,
                    child,
                    hb,
                    rb,
                    y,
                    more;
                index = this.highlight();
                if (index < 0)
                    return;
                if (index == 0)
                {
                    results.scrollTop(0);
                    return
                }
                children = this.findHighlightableChoices().find('.select2-result-label');
                child = $(children[index]);
                hb = child.offset().top + child.outerHeight(true);
                if (index === children.length - 1)
                {
                    more = results.find("li.select2-more-results");
                    if (more.length > 0)
                    {
                        hb = more.offset().top + more.outerHeight(true)
                    }
                }
                rb = results.offset().top + results.outerHeight(true);
                if (hb > rb)
                {
                    results.scrollTop(results.scrollTop() + (hb - rb))
                }
                y = child.offset().top - results.offset().top;
                if (y < 0 && child.css('display') != 'none')
                {
                    results.scrollTop(results.scrollTop() + y)
                }
            }, findHighlightableChoices: function()
            {
                return this.results.find(".select2-result-selectable:not(.select2-selected):not(.select2-disabled)")
            }, moveHighlight: function(delta)
            {
                var choices = this.findHighlightableChoices(),
                    index = this.highlight();
                while (index > -1 && index < choices.length)
                {
                    index += delta;
                    var choice = $(choices[index]);
                    if (choice.hasClass("select2-result-selectable") && !choice.hasClass("select2-disabled") && !choice.hasClass("select2-selected"))
                    {
                        this.highlight(index);
                        break
                    }
                }
            }, highlight: function(index)
            {
                var choices = this.findHighlightableChoices(),
                    choice,
                    data;
                if (arguments.length === 0)
                {
                    return indexOf(choices.filter(".select2-highlighted")[0], choices.get())
                }
                if (index >= choices.length)
                    index = choices.length - 1;
                if (index < 0)
                    index = 0;
                this.removeHighlight();
                choice = $(choices[index]);
                choice.addClass("select2-highlighted");
                this.ensureHighlightVisible();
                data = choice.data("select2-data");
                if (data)
                {
                    this.opts.element.trigger({
                        type: "select2-highlight", val: this.id(data), choice: data
                    })
                }
            }, removeHighlight: function()
            {
                this.results.find(".select2-highlighted").removeClass("select2-highlighted")
            }, countSelectableResults: function()
            {
                return this.findHighlightableChoices().length
            }, highlightUnderEvent: function(event)
            {
                var el = $(event.target).closest(".select2-result-selectable");
                if (el.length > 0 && !el.is(".select2-highlighted"))
                {
                    var choices = this.findHighlightableChoices();
                    this.highlight(choices.index(el))
                }
                else if (el.length == 0)
                {
                    this.removeHighlight()
                }
            }, loadMoreIfNeeded: function()
            {
                var results = this.results,
                    more = results.find("li.select2-more-results"),
                    below,
                    offset = -1,
                    page = this.resultsPage + 1,
                    self = this,
                    term = this.search.val(),
                    context = this.context;
                if (more.length === 0)
                    return;
                below = more.offset().top - results.offset().top - results.height();
                if (below <= this.opts.loadMorePadding)
                {
                    more.addClass("select2-active");
                    this.opts.query({
                        element: this.opts.element, term: term, page: page, context: context, matcher: this.opts.matcher, callback: this.bind(function(data)
                            {
                                if (!self.opened())
                                    return;
                                self.opts.populateResults.call(this, results, data.results, {
                                    term: term, page: page, context: context
                                });
                                self.postprocessResults(data, false, false);
                                if (data.more === true)
                                {
                                    more.detach().appendTo(results).text(self.opts.formatLoadMore(page + 1));
                                    window.setTimeout(function()
                                    {
                                        self.loadMoreIfNeeded()
                                    }, 10)
                                }
                                else
                                {
                                    more.remove()
                                }
                                self.positionDropdown();
                                self.resultsPage = page;
                                self.context = data.context;
                                this.opts.element.trigger({
                                    type: "select2-loaded", items: data
                                })
                            })
                    })
                }
            }, tokenize: function(){}, updateResults: function(initial)
            {
                var search = this.search,
                    results = this.results,
                    opts = this.opts,
                    data,
                    self = this,
                    input,
                    term = search.val(),
                    lastTerm = $.data(this.container, "select2-last-term"),
                    queryNumber;
                if (initial !== true && lastTerm && equal(term, lastTerm))
                    return;
                $.data(this.container, "select2-last-term", term);
                if (initial !== true && (this.showSearchInput === false || !this.opened()))
                {
                    return
                }
                function postRender()
                {
                    search.removeClass("select2-active");
                    self.positionDropdown()
                }
                function render(html)
                {
                    results.html(html);
                    postRender()
                }
                queryNumber = ++this.queryCount;
                var maxSelSize = this.getMaximumSelectionSize();
                if (maxSelSize >= 1)
                {
                    data = this.data();
                    if ($.isArray(data) && data.length >= maxSelSize && checkFormatter(opts.formatSelectionTooBig, "formatSelectionTooBig"))
                    {
                        render("<li class='select2-selection-limit'>" + opts.formatSelectionTooBig(maxSelSize) + "</li>");
                        return
                    }
                }
                if (search.val().length < opts.minimumInputLength)
                {
                    if (checkFormatter(opts.formatInputTooShort, "formatInputTooShort"))
                    {
                        render("<li class='select2-no-results'>" + opts.formatInputTooShort(search.val(), opts.minimumInputLength) + "</li>")
                    }
                    else
                    {
                        render("")
                    }
                    if (initial && this.showSearch)
                        this.showSearch(true);
                    return
                }
                if (opts.maximumInputLength && search.val().length > opts.maximumInputLength)
                {
                    if (checkFormatter(opts.formatInputTooLong, "formatInputTooLong"))
                    {
                        render("<li class='select2-no-results'>" + opts.formatInputTooLong(search.val(), opts.maximumInputLength) + "</li>")
                    }
                    else
                    {
                        render("")
                    }
                    return
                }
                if (opts.formatSearching && this.findHighlightableChoices().length === 0)
                {
                    render("<li class='select2-searching'>" + opts.formatSearching() + "</li>")
                }
                search.addClass("select2-active");
                this.removeHighlight();
                input = this.tokenize();
                if (input != undefined && input != null)
                {
                    search.val(input)
                }
                this.resultsPage = 1;
                opts.query({
                    element: opts.element, term: search.val(), page: this.resultsPage, context: null, matcher: opts.matcher, callback: this.bind(function(data)
                        {
                            var def;
                            if (queryNumber != this.queryCount)
                            {
                                return
                            }
                            if (!this.opened())
                            {
                                this.search.removeClass("select2-active");
                                return
                            }
                            this.context = (data.context === undefined) ? null : data.context;
                            if (this.opts.createSearchChoice && search.val() !== "")
                            {
                                def = this.opts.createSearchChoice.call(self, search.val(), data.results);
                                if (def !== undefined && def !== null && self.id(def) !== undefined && self.id(def) !== null)
                                {
                                    if ($(data.results).filter(function()
                                    {
                                        return equal(self.id(this), self.id(def))
                                    }).length === 0)
                                    {
                                        data.results.unshift(def)
                                    }
                                }
                            }
                            if (data.results.length === 0 && checkFormatter(opts.formatNoMatches, "formatNoMatches"))
                            {
                                render("<li class='select2-no-results'>" + opts.formatNoMatches(search.val()) + "</li>");
                                return
                            }
                            results.empty();
                            self.opts.populateResults.call(this, results, data.results, {
                                term: search.val(), page: this.resultsPage, context: null
                            });
                            if (data.more === true && checkFormatter(opts.formatLoadMore, "formatLoadMore"))
                            {
                                results.append("<li class='select2-more-results'>" + self.opts.escapeMarkup(opts.formatLoadMore(this.resultsPage)) + "</li>");
                                window.setTimeout(function()
                                {
                                    self.loadMoreIfNeeded()
                                }, 10)
                            }
                            this.postprocessResults(data, initial);
                            postRender();
                            this.opts.element.trigger({
                                type: "select2-loaded", items: data
                            })
                        })
                })
            }, cancel: function()
            {
                this.close()
            }, blur: function()
            {
                if (this.opts.selectOnBlur)
                    this.selectHighlighted({noFocus: true});
                this.close();
                this.container.removeClass("select2-container-active");
                if (this.search[0] === document.activeElement)
                {
                    this.search.blur()
                }
                this.clearSearch();
                this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus")
            }, focusSearch: function()
            {
                focus(this.search)
            }, selectHighlighted: function(options)
            {
                var index = this.highlight(),
                    highlighted = this.results.find(".select2-highlighted"),
                    data = highlighted.closest('.select2-result').data("select2-data");
                if (data)
                {
                    this.highlight(index);
                    this.onSelect(data, options)
                }
                else if (options && options.noFocus)
                {
                    this.close()
                }
            }, getPlaceholder: function()
            {
                var placeholderOption;
                return this.opts.element.attr("placeholder") || this.opts.element.attr("data-placeholder") || this.opts.element.data("placeholder") || this.opts.placeholder || ((placeholderOption = this.getPlaceholderOption()) !== undefined ? placeholderOption.text() : undefined)
            }, getPlaceholderOption: function()
            {
                if (this.select)
                {
                    var firstOption = this.select.children().first();
                    if (this.opts.placeholderOption !== undefined)
                    {
                        return (this.opts.placeholderOption === "first" && firstOption) || (typeof this.opts.placeholderOption === "function" && this.opts.placeholderOption(this.select))
                    }
                    else if (firstOption.text() === "" && firstOption.val() === "")
                    {
                        return firstOption
                    }
                }
            }, initContainerWidth: function()
            {
                function resolveContainerWidth()
                {
                    var style,
                        attrs,
                        matches,
                        i,
                        l;
                    if (this.opts.width === "off")
                    {
                        return null
                    }
                    else if (this.opts.width === "element")
                    {
                        return this.opts.element.outerWidth(false) === 0 ? 'auto' : this.opts.element.outerWidth(false) + 'px'
                    }
                    else if (this.opts.width === "copy" || this.opts.width === "resolve")
                    {
                        style = this.opts.element.attr('style');
                        if (style !== undefined)
                        {
                            attrs = style.split(';');
                            for (i = 0, l = attrs.length; i < l; i = i + 1)
                            {
                                matches = attrs[i].replace(/\s/g, '').match(/[^-]width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i);
                                if (matches !== null && matches.length >= 1)
                                    return matches[1]
                            }
                        }
                        if (this.opts.width === "resolve")
                        {
                            style = this.opts.element.css('width');
                            if (style.indexOf("%") > 0)
                                return style;
                            return (this.opts.element.outerWidth(false) === 0 ? 'auto' : this.opts.element.outerWidth(false) + 'px')
                        }
                        return null
                    }
                    else if ($.isFunction(this.opts.width))
                    {
                        return this.opts.width()
                    }
                    else
                    {
                        return this.opts.width
                    }
                }
                ;
                var width = resolveContainerWidth.call(this);
                if (width !== null)
                {
                    this.container.css("width", width)
                }
            }
    });
    SingleSelect2 = clazz(AbstractSelect2, {
        createContainer: function()
        {
            var container = $(document.createElement("div")).attr({"class": "select2-container"}).html(["<a href='javascript:void(0)' onclick='return false;' class='select2-choice' tabindex='-1'>", "   <span class='select2-chosen'>&nbsp;</span><abbr class='select2-search-choice-close'></abbr>", "   <span class='select2-arrow'><b></b></span>", "</a>", "<input class='select2-focusser select2-offscreen' type='text'/>", "<div class='select2-drop select2-display-none'>", "   <div class='select2-search'>", "       <input type='text' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input'/>", "   </div>", "   <ul class='select2-results'>", "   </ul>", "</div>"].join(""));
            return container
        }, enableInterface: function()
            {
                if (this.parent.enableInterface.apply(this, arguments))
                {
                    this.focusser.prop("disabled", !this.isInterfaceEnabled())
                }
            }, opening: function()
            {
                var el,
                    range,
                    len;
                if (this.opts.minimumResultsForSearch >= 0)
                {
                    this.showSearch(true)
                }
                this.parent.opening.apply(this, arguments);
                if (this.showSearchInput !== false)
                {
                    this.search.val(this.focusser.val())
                }
                this.search.focus();
                el = this.search.get(0);
                if (el.createTextRange)
                {
                    range = el.createTextRange();
                    range.collapse(false);
                    range.select()
                }
                else if (el.setSelectionRange)
                {
                    len = this.search.val().length;
                    el.setSelectionRange(len, len)
                }
                if (this.search.val() === "")
                {
                    if (this.nextSearchTerm != undefined)
                    {
                        this.search.val(this.nextSearchTerm);
                        this.search.select()
                    }
                }
                this.focusser.prop("disabled", true).val("");
                this.updateResults(true);
                this.opts.element.trigger($.Event("select2-open"))
            }, close: function(params)
            {
                if (!this.opened())
                    return;
                this.parent.close.apply(this, arguments);
                params = params || {focus: true};
                this.focusser.removeAttr("disabled");
                if (params.focus)
                {
                    this.focusser.focus()
                }
            }, focus: function()
            {
                if (this.opened())
                {
                    this.close()
                }
                else
                {
                    this.focusser.removeAttr("disabled");
                    this.focusser.focus()
                }
            }, isFocused: function()
            {
                return this.container.hasClass("select2-container-active")
            }, cancel: function()
            {
                this.parent.cancel.apply(this, arguments);
                this.focusser.removeAttr("disabled");
                this.focusser.focus()
            }, destroy: function()
            {
                $("label[for='" + this.focusser.attr('id') + "']").attr('for', this.opts.element.attr("id"));
                this.parent.destroy.apply(this, arguments)
            }, initContainer: function()
            {
                var selection,
                    container = this.container,
                    dropdown = this.dropdown;
                if (this.opts.minimumResultsForSearch < 0)
                {
                    this.showSearch(false)
                }
                else
                {
                    this.showSearch(true)
                }
                this.selection = selection = container.find(".select2-choice");
                this.focusser = container.find(".select2-focusser");
                this.focusser.attr("id", "s2id_autogen" + nextUid());
                $("label[for='" + this.opts.element.attr("id") + "']").attr('for', this.focusser.attr('id'));
                this.focusser.attr("tabindex", this.elementTabIndex);
                this.search.on("keydown", this.bind(function(e)
                {
                    if (!this.isInterfaceEnabled())
                        return;
                    if (e.which === KEY.PAGE_UP || e.which === KEY.PAGE_DOWN)
                    {
                        killEvent(e);
                        return
                    }
                    switch (e.which)
                    {
                        case KEY.UP:
                        case KEY.DOWN:
                            this.moveHighlight((e.which === KEY.UP) ? -1 : 1);
                            killEvent(e);
                            return;
                        case KEY.ENTER:
                            this.selectHighlighted();
                            killEvent(e);
                            return;
                        case KEY.TAB:
                            if (this.opts.selectOnBlur)
                            {
                                this.selectHighlighted({noFocus: true})
                            }
                            return;
                        case KEY.ESC:
                            this.cancel(e);
                            killEvent(e);
                            return
                    }
                }));
                this.search.on("blur", this.bind(function(e)
                {
                    if (document.activeElement === this.body().get(0))
                    {
                        window.setTimeout(this.bind(function()
                        {
                            this.search.focus()
                        }), 0)
                    }
                }));
                this.focusser.on("keydown", this.bind(function(e)
                {
                    if (!this.isInterfaceEnabled())
                        return;
                    if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e) || e.which === KEY.ESC)
                    {
                        return
                    }
                    if (this.opts.openOnEnter === false && e.which === KEY.ENTER)
                    {
                        killEvent(e);
                        return
                    }
                    if (e.which == KEY.DOWN || e.which == KEY.UP || (e.which == KEY.ENTER && this.opts.openOnEnter))
                    {
                        if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey)
                            return;
                        this.open();
                        killEvent(e);
                        return
                    }
                    if (e.which == KEY.DELETE || e.which == KEY.BACKSPACE)
                    {
                        if (this.opts.allowClear)
                        {
                            this.clear()
                        }
                        killEvent(e);
                        return
                    }
                }));
                installKeyUpChangeEvent(this.focusser);
                this.focusser.on("keyup-change input", this.bind(function(e)
                {
                    if (this.opts.minimumResultsForSearch >= 0)
                    {
                        e.stopPropagation();
                        if (this.opened())
                            return;
                        this.open()
                    }
                }));
                selection.on("mousedown", "abbr", this.bind(function(e)
                {
                    if (!this.isInterfaceEnabled())
                        return;
                    this.clear();
                    killEventImmediately(e);
                    this.close();
                    this.selection.focus()
                }));
                selection.on("mousedown", this.bind(function(e)
                {
                    if (!this.container.hasClass("select2-container-active"))
                    {
                        this.opts.element.trigger($.Event("select2-focus"))
                    }
                    if (this.opened())
                    {
                        this.close()
                    }
                    else if (this.isInterfaceEnabled())
                    {
                        this.open()
                    }
                    killEvent(e)
                }));
                dropdown.on("mousedown", this.bind(function()
                {
                    this.search.focus()
                }));
                selection.on("focus", this.bind(function(e)
                {
                    killEvent(e)
                }));
                this.focusser.on("focus", this.bind(function()
                {
                    if (!this.container.hasClass("select2-container-active"))
                    {
                        this.opts.element.trigger($.Event("select2-focus"))
                    }
                    this.container.addClass("select2-container-active")
                })).on("blur", this.bind(function()
                {
                    if (!this.opened())
                    {
                        this.container.removeClass("select2-container-active");
                        this.opts.element.trigger($.Event("select2-blur"))
                    }
                }));
                this.search.on("focus", this.bind(function()
                {
                    if (!this.container.hasClass("select2-container-active"))
                    {
                        this.opts.element.trigger($.Event("select2-focus"))
                    }
                    this.container.addClass("select2-container-active")
                }));
                this.initContainerWidth();
                this.opts.element.addClass("select2-offscreen");
                this.setPlaceholder()
            }, clear: function(triggerChange)
            {
                var data = this.selection.data("select2-data");
                if (data)
                {
                    var placeholderOption = this.getPlaceholderOption();
                    this.opts.element.val(placeholderOption ? placeholderOption.val() : "");
                    this.selection.find(".select2-chosen").empty();
                    this.selection.removeData("select2-data");
                    this.setPlaceholder();
                    if (triggerChange !== false)
                    {
                        this.opts.element.trigger({
                            type: "select2-removed", val: this.id(data), choice: data
                        });
                        this.triggerChange({removed: data})
                    }
                }
            }, initSelection: function()
            {
                var self = this;
                this.opts.initSelection.call(null, this.opts.element, function(selected)
                {
                    if (selected !== undefined && selected !== null)
                    {
                        self.updateSelection(selected);
                        self.close();
                        self.setPlaceholder()
                    }
                })
            }, isPlaceholderOptionSelected: function()
            {
                var placeholderOption;
                if (!this.opts.placeholder)
                    return false;
                return ((placeholderOption = this.getPlaceholderOption()) !== undefined && placeholderOption.is(':selected')) || (this.opts.element.val() === "") || (this.opts.element.val() === undefined) || (this.opts.element.val() === null)
            }, prepareOpts: function()
            {
                var opts = this.parent.prepareOpts.apply(this, arguments),
                    self = this;
                if (opts.element.get(0).tagName.toLowerCase() === "select")
                {
                    opts.initSelection = function(element, callback)
                    {
                        var selected = element.find(":selected");
                        callback(self.optionToData(selected))
                    }
                }
                else if ("data" in opts)
                {
                    opts.initSelection = opts.initSelection || function(element, callback)
                    {
                        var id = element.val();
                        var match = null;
                        opts.query({
                            matcher: function(term, text, el)
                            {
                                var is_match = equal(id, opts.id(el));
                                if (is_match)
                                {
                                    match = el
                                }
                                return is_match
                            }, callback: !$.isFunction(callback) ? $.noop : function()
                                {
                                    callback(match)
                                }
                        })
                    }
                }
                return opts
            }, getPlaceholder: function()
            {
                if (this.select)
                {
                    if (this.getPlaceholderOption() === undefined)
                    {
                        return undefined
                    }
                }
                return this.parent.getPlaceholder.apply(this, arguments)
            }, setPlaceholder: function()
            {
                var placeholder = this.getPlaceholder();
                if (this.isPlaceholderOptionSelected() && placeholder !== undefined)
                {
                    if (this.select && this.getPlaceholderOption() === undefined)
                        return;
                    this.selection.find(".select2-chosen").html(this.opts.escapeMarkup(placeholder));
                    this.selection.addClass("select2-default");
                    this.container.removeClass("select2-allowclear")
                }
            }, postprocessResults: function(data, initial, noHighlightUpdate)
            {
                var selected = 0,
                    self = this,
                    showSearchInput = true;
                this.findHighlightableChoices().each2(function(i, elm)
                {
                    if (equal(self.id(elm.data("select2-data")), self.opts.element.val()))
                    {
                        selected = i;
                        return false
                    }
                });
                if (noHighlightUpdate !== false)
                {
                    if (initial === true && selected >= 0)
                    {
                        this.highlight(selected)
                    }
                    else
                    {
                        this.highlight(0)
                    }
                }
                if (initial === true)
                {
                    var min = this.opts.minimumResultsForSearch;
                    if (min >= 0)
                    {
                        this.showSearch(countResults(data.results) >= min)
                    }
                }
            }, showSearch: function(showSearchInput)
            {
                if (this.showSearchInput === showSearchInput)
                    return;
                this.showSearchInput = showSearchInput;
                this.dropdown.find(".select2-search").toggleClass("select2-search-hidden", !showSearchInput);
                this.dropdown.find(".select2-search").toggleClass("select2-offscreen", !showSearchInput);
                $(this.dropdown, this.container).toggleClass("select2-with-searchbox", showSearchInput)
            }, onSelect: function(data, options)
            {
                if (!this.triggerSelect(data))
                {
                    return
                }
                var old = this.opts.element.val(),
                    oldData = this.data();
                this.opts.element.val(this.id(data));
                this.updateSelection(data);
                this.opts.element.trigger({
                    type: "select2-selected", val: this.id(data), choice: data
                });
                this.nextSearchTerm = this.opts.nextSearchTerm(data, this.search.val());
                this.close();
                if (!options || !options.noFocus)
                    this.selection.focus();
                if (!equal(old, this.id(data)))
                {
                    this.triggerChange({
                        added: data, removed: oldData
                    })
                }
            }, updateSelection: function(data)
            {
                var container = this.selection.find(".select2-chosen"),
                    formatted,
                    cssClass;
                this.selection.data("select2-data", data);
                container.empty();
                if (data !== null)
                {
                    formatted = this.opts.formatSelection(data, container, this.opts.escapeMarkup)
                }
                if (formatted !== undefined)
                {
                    container.append(formatted)
                }
                cssClass = this.opts.formatSelectionCssClass(data, container);
                if (cssClass !== undefined)
                {
                    container.addClass(cssClass)
                }
                this.selection.removeClass("select2-default");
                if (this.opts.allowClear && this.getPlaceholder() !== undefined)
                {
                    this.container.addClass("select2-allowclear")
                }
            }, val: function()
            {
                var val,
                    triggerChange = false,
                    data = null,
                    self = this,
                    oldData = this.data();
                if (arguments.length === 0)
                {
                    return this.opts.element.val()
                }
                val = arguments[0];
                if (arguments.length > 1)
                {
                    triggerChange = arguments[1]
                }
                if (this.select)
                {
                    this.select.val(val).find(":selected").each2(function(i, elm)
                    {
                        data = self.optionToData(elm);
                        return false
                    });
                    this.updateSelection(data);
                    this.setPlaceholder();
                    if (triggerChange)
                    {
                        this.triggerChange({
                            added: data, removed: oldData
                        })
                    }
                }
                else
                {
                    if (!val && val !== 0)
                    {
                        this.clear(triggerChange);
                        return
                    }
                    if (this.opts.initSelection === undefined)
                    {
                        throw new Error("cannot call val() if initSelection() is not defined");
                    }
                    this.opts.element.val(val);
                    this.opts.initSelection(this.opts.element, function(data)
                    {
                        self.opts.element.val(!data ? "" : self.id(data));
                        self.updateSelection(data);
                        self.setPlaceholder();
                        if (triggerChange)
                        {
                            self.triggerChange({
                                added: data, removed: oldData
                            })
                        }
                    })
                }
            }, clearSearch: function()
            {
                this.search.val("");
                this.focusser.val("")
            }, data: function(value)
            {
                var data,
                    triggerChange = false;
                if (arguments.length === 0)
                {
                    data = this.selection.data("select2-data");
                    if (data == undefined)
                        data = null;
                    return data
                }
                else
                {
                    if (arguments.length > 1)
                    {
                        triggerChange = arguments[1]
                    }
                    if (!value)
                    {
                        this.clear(triggerChange)
                    }
                    else
                    {
                        data = this.data();
                        this.opts.element.val(!value ? "" : this.id(value));
                        this.updateSelection(value);
                        if (triggerChange)
                        {
                            this.triggerChange({
                                added: value, removed: data
                            })
                        }
                    }
                }
            }
    });
    MultiSelect2 = clazz(AbstractSelect2, {
        createContainer: function()
        {
            var container = $(document.createElement("div")).attr({"class": "select2-container select2-container-multi"}).html(["<ul class='select2-choices'>", "  <li class='select2-search-field'>", "    <input type='text' autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' class='select2-input'>", "  </li>", "</ul>", "<div class='select2-drop select2-drop-multi select2-display-none'>", "   <ul class='select2-results'>", "   </ul>", "</div>"].join(""));
            return container
        }, prepareOpts: function()
            {
                var opts = this.parent.prepareOpts.apply(this, arguments),
                    self = this;
                if (opts.element.get(0).tagName.toLowerCase() === "select")
                {
                    opts.initSelection = function(element, callback)
                    {
                        var data = [];
                        element.find(":selected").each2(function(i, elm)
                        {
                            data.push(self.optionToData(elm))
                        });
                        callback(data)
                    }
                }
                else if ("data" in opts)
                {
                    opts.initSelection = opts.initSelection || function(element, callback)
                    {
                        var ids = splitVal(element.val(), opts.separator);
                        var matches = [];
                        opts.query({
                            matcher: function(term, text, el)
                            {
                                var is_match = $.grep(ids, function(id)
                                    {
                                        return equal(id, opts.id(el))
                                    }).length;
                                if (is_match)
                                {
                                    matches.push(el)
                                }
                                return is_match
                            }, callback: !$.isFunction(callback) ? $.noop : function()
                                {
                                    var ordered = [];
                                    for (var i = 0; i < ids.length; i++)
                                    {
                                        var id = ids[i];
                                        for (var j = 0; j < matches.length; j++)
                                        {
                                            var match = matches[j];
                                            if (equal(id, opts.id(match)))
                                            {
                                                ordered.push(match);
                                                matches.splice(j, 1);
                                                break
                                            }
                                        }
                                    }
                                    callback(ordered)
                                }
                        })
                    }
                }
                return opts
            }, selectChoice: function(choice)
            {
                var selected = this.container.find(".select2-search-choice-focus");
                if (selected.length && choice && choice[0] == selected[0])
                {}
                else
                {
                    if (selected.length)
                    {
                        this.opts.element.trigger("choice-deselected", selected)
                    }
                    selected.removeClass("select2-search-choice-focus");
                    if (choice && choice.length)
                    {
                        this.close();
                        choice.addClass("select2-search-choice-focus");
                        this.opts.element.trigger("choice-selected", choice)
                    }
                }
            }, destroy: function()
            {
                $("label[for='" + this.search.attr('id') + "']").attr('for', this.opts.element.attr("id"));
                this.parent.destroy.apply(this, arguments)
            }, initContainer: function()
            {
                var selector = ".select2-choices",
                    selection;
                this.searchContainer = this.container.find(".select2-search-field");
                this.selection = selection = this.container.find(selector);
                var _this = this;
                this.selection.on("click", ".select2-search-choice", function(e)
                {
                    _this.search[0].focus();
                    _this.selectChoice($(this))
                });
                this.search.attr("id", "s2id_autogen" + nextUid());
                $("label[for='" + this.opts.element.attr("id") + "']").attr('for', this.search.attr('id'));
                this.search.on("input paste", this.bind(function()
                {
                    if (!this.isInterfaceEnabled())
                        return;
                    if (!this.opened())
                    {
                        this.open()
                    }
                }));
                this.search.attr("tabindex", this.elementTabIndex);
                this.keydowns = 0;
                this.search.on("keydown", this.bind(function(e)
                {
                    if (!this.isInterfaceEnabled())
                        return;
                    ++this.keydowns;
                    var selected = selection.find(".select2-search-choice-focus");
                    var prev = selected.prev(".select2-search-choice:not(.select2-locked)");
                    var next = selected.next(".select2-search-choice:not(.select2-locked)");
                    var pos = getCursorInfo(this.search);
                    if (selected.length && (e.which == KEY.LEFT || e.which == KEY.RIGHT || e.which == KEY.BACKSPACE || e.which == KEY.DELETE || e.which == KEY.ENTER))
                    {
                        var selectedChoice = selected;
                        if (e.which == KEY.LEFT && prev.length)
                        {
                            selectedChoice = prev
                        }
                        else if (e.which == KEY.RIGHT)
                        {
                            selectedChoice = next.length ? next : null
                        }
                        else if (e.which === KEY.BACKSPACE)
                        {
                            this.unselect(selected.first());
                            this.search.width(10);
                            selectedChoice = prev.length ? prev : next
                        }
                        else if (e.which == KEY.DELETE)
                        {
                            this.unselect(selected.first());
                            this.search.width(10);
                            selectedChoice = next.length ? next : null
                        }
                        else if (e.which == KEY.ENTER)
                        {
                            selectedChoice = null
                        }
                        this.selectChoice(selectedChoice);
                        killEvent(e);
                        if (!selectedChoice || !selectedChoice.length)
                        {
                            this.open()
                        }
                        return
                    }
                    else if (((e.which === KEY.BACKSPACE && this.keydowns == 1) || e.which == KEY.LEFT) && (pos.offset == 0 && !pos.length))
                    {
                        this.selectChoice(selection.find(".select2-search-choice:not(.select2-locked)").last());
                        killEvent(e);
                        return
                    }
                    else
                    {
                        this.selectChoice(null)
                    }
                    if (this.opened())
                    {
                        switch (e.which)
                        {
                            case KEY.UP:
                            case KEY.DOWN:
                                this.moveHighlight((e.which === KEY.UP) ? -1 : 1);
                                killEvent(e);
                                return;
                            case KEY.ENTER:
                                this.selectHighlighted();
                                killEvent(e);
                                return;
                            case KEY.TAB:
                                if (this.opts.selectOnBlur)
                                {
                                    this.selectHighlighted({noFocus: true})
                                }
                                this.close();
                                return;
                            case KEY.ESC:
                                this.cancel(e);
                                killEvent(e);
                                return
                        }
                    }
                    if (e.which === KEY.TAB || KEY.isControl(e) || KEY.isFunctionKey(e) || e.which === KEY.BACKSPACE || e.which === KEY.ESC)
                    {
                        return
                    }
                    if (e.which === KEY.ENTER)
                    {
                        if (this.opts.openOnEnter === false)
                        {
                            return
                        }
                        else if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey)
                        {
                            return
                        }
                    }
                    this.open();
                    if (e.which === KEY.PAGE_UP || e.which === KEY.PAGE_DOWN)
                    {
                        killEvent(e)
                    }
                    if (e.which === KEY.ENTER)
                    {
                        killEvent(e)
                    }
                }));
                this.search.on("keyup", this.bind(function(e)
                {
                    this.keydowns = 0;
                    this.resizeSearch()
                }));
                this.search.on("blur", this.bind(function(e)
                {
                    this.container.removeClass("select2-container-active");
                    this.search.removeClass("select2-focused");
                    this.selectChoice(null);
                    if (!this.opened())
                        this.clearSearch();
                    e.stopImmediatePropagation();
                    this.opts.element.trigger($.Event("select2-blur"))
                }));
                this.container.on("click", selector, this.bind(function(e)
                {
                    if (!this.isInterfaceEnabled())
                        return;
                    if ($(e.target).closest(".select2-search-choice").length > 0)
                    {
                        return
                    }
                    this.selectChoice(null);
                    this.clearPlaceholder();
                    if (!this.container.hasClass("select2-container-active"))
                    {
                        this.opts.element.trigger($.Event("select2-focus"))
                    }
                    this.open();
                    this.focusSearch();
                    e.preventDefault()
                }));
                this.container.on("focus", selector, this.bind(function()
                {
                    if (!this.isInterfaceEnabled())
                        return;
                    if (!this.container.hasClass("select2-container-active"))
                    {
                        this.opts.element.trigger($.Event("select2-focus"))
                    }
                    this.container.addClass("select2-container-active");
                    this.dropdown.addClass("select2-drop-active");
                    this.clearPlaceholder()
                }));
                this.initContainerWidth();
                this.opts.element.addClass("select2-offscreen");
                this.clearSearch()
            }, enableInterface: function()
            {
                if (this.parent.enableInterface.apply(this, arguments))
                {
                    this.search.prop("disabled", !this.isInterfaceEnabled())
                }
            }, initSelection: function()
            {
                var data;
                if (this.opts.element.val() === "" && this.opts.element.text() === "")
                {
                    this.updateSelection([]);
                    this.close();
                    this.clearSearch()
                }
                if (this.select || this.opts.element.val() !== "")
                {
                    var self = this;
                    this.opts.initSelection.call(null, this.opts.element, function(data)
                    {
                        if (data !== undefined && data !== null)
                        {
                            self.updateSelection(data);
                            self.close();
                            self.clearSearch()
                        }
                    })
                }
            }, clearSearch: function()
            {
                var placeholder = this.getPlaceholder(),
                    maxWidth = this.getMaxSearchWidth();
                if (placeholder !== undefined && this.getVal().length === 0 && this.search.hasClass("select2-focused") === false)
                {
                    this.search.val(placeholder).addClass("select2-default");
                    this.search.width(maxWidth > 0 ? maxWidth : this.container.css("width"))
                }
                else
                {
                    this.search.val("").width(10)
                }
            }, clearPlaceholder: function()
            {
                if (this.search.hasClass("select2-default"))
                {
                    this.search.val("").removeClass("select2-default")
                }
            }, opening: function()
            {
                this.clearPlaceholder();
                this.resizeSearch();
                this.parent.opening.apply(this, arguments);
                this.focusSearch();
                this.updateResults(true);
                this.search.focus();
                this.opts.element.trigger($.Event("select2-open"))
            }, close: function()
            {
                if (!this.opened())
                    return;
                this.parent.close.apply(this, arguments)
            }, focus: function()
            {
                this.close();
                this.search.focus()
            }, isFocused: function()
            {
                return this.search.hasClass("select2-focused")
            }, updateSelection: function(data)
            {
                var ids = [],
                    filtered = [],
                    self = this;
                $(data).each(function()
                {
                    if (indexOf(self.id(this), ids) < 0)
                    {
                        ids.push(self.id(this));
                        filtered.push(this)
                    }
                });
                data = filtered;
                this.selection.find(".select2-search-choice").remove();
                $(data).each(function()
                {
                    self.addSelectedChoice(this)
                });
                self.postprocessResults()
            }, tokenize: function()
            {
                var input = this.search.val();
                input = this.opts.tokenizer.call(this, input, this.data(), this.bind(this.onSelect), this.opts);
                if (input != null && input != undefined)
                {
                    this.search.val(input);
                    if (input.length > 0)
                    {
                        this.open()
                    }
                }
            }, onSelect: function(data, options)
            {
                if (!this.triggerSelect(data))
                {
                    return
                }
                this.addSelectedChoice(data);
                this.opts.element.trigger({
                    type: "selected", val: this.id(data), choice: data
                });
                if (this.select || !this.opts.closeOnSelect)
                    this.postprocessResults(data, false, this.opts.closeOnSelect === true);
                if (this.opts.closeOnSelect)
                {
                    this.close();
                    this.search.width(10)
                }
                else
                {
                    if (this.countSelectableResults() > 0)
                    {
                        this.search.width(10);
                        this.resizeSearch();
                        if (this.getMaximumSelectionSize() > 0 && this.val().length >= this.getMaximumSelectionSize())
                        {
                            this.updateResults(true)
                        }
                        this.positionDropdown()
                    }
                    else
                    {
                        this.close();
                        this.search.width(10)
                    }
                }
                this.triggerChange({added: data});
                if (!options || !options.noFocus)
                    this.focusSearch()
            }, cancel: function()
            {
                this.close();
                this.focusSearch()
            }, addSelectedChoice: function(data)
            {
                var enableChoice = !data.locked,
                    enabledItem = $("<li class='select2-search-choice'>" + "    <div></div>" + "    <a href='#' onclick='return false;' class='select2-search-choice-close' tabindex='-1'></a>" + "</li>"),
                    disabledItem = $("<li class='select2-search-choice select2-locked'>" + "<div></div>" + "</li>");
                var choice = enableChoice ? enabledItem : disabledItem,
                    id = this.id(data),
                    val = this.getVal(),
                    formatted,
                    cssClass;
                formatted = this.opts.formatSelection(data, choice.find("div"), this.opts.escapeMarkup);
                if (formatted != undefined)
                {
                    choice.find("div").replaceWith("<div>" + formatted + "</div>")
                }
                cssClass = this.opts.formatSelectionCssClass(data, choice.find("div"));
                if (cssClass != undefined)
                {
                    choice.addClass(cssClass)
                }
                if (enableChoice)
                {
                    choice.find(".select2-search-choice-close").on("mousedown", killEvent).on("click dblclick", this.bind(function(e)
                    {
                        if (!this.isInterfaceEnabled())
                            return;
                        $(e.target).closest(".select2-search-choice").fadeOut('fast', this.bind(function()
                        {
                            this.unselect($(e.target));
                            this.selection.find(".select2-search-choice-focus").removeClass("select2-search-choice-focus");
                            this.close();
                            this.focusSearch()
                        })).dequeue();
                        killEvent(e)
                    })).on("focus", this.bind(function()
                    {
                        if (!this.isInterfaceEnabled())
                            return;
                        this.container.addClass("select2-container-active");
                        this.dropdown.addClass("select2-drop-active")
                    }))
                }
                choice.data("select2-data", data);
                choice.insertBefore(this.searchContainer);
                val.push(id);
                this.setVal(val)
            }, unselect: function(selected)
            {
                var val = this.getVal(),
                    data,
                    index;
                selected = selected.closest(".select2-search-choice");
                if (selected.length === 0)
                {
                    throw"Invalid argument: " + selected + ". Must be .select2-search-choice";
                }
                data = selected.data("select2-data");
                if (!data)
                {
                    return
                }
                index = indexOf(this.id(data), val);
                if (index >= 0)
                {
                    val.splice(index, 1);
                    this.setVal(val);
                    if (this.select)
                        this.postprocessResults()
                }
                selected.remove();
                this.opts.element.trigger({
                    type: "removed", val: this.id(data), choice: data
                });
                this.triggerChange({removed: data})
            }, postprocessResults: function(data, initial, noHighlightUpdate)
            {
                var val = this.getVal(),
                    choices = this.results.find(".select2-result"),
                    compound = this.results.find(".select2-result-with-children"),
                    self = this;
                choices.each2(function(i, choice)
                {
                    var id = self.id(choice.data("select2-data"));
                    if (indexOf(id, val) >= 0)
                    {
                        choice.addClass("select2-selected");
                        choice.find(".select2-result-selectable").addClass("select2-selected")
                    }
                });
                compound.each2(function(i, choice)
                {
                    if (!choice.is('.select2-result-selectable') && choice.find(".select2-result-selectable:not(.select2-selected)").length === 0)
                    {
                        choice.addClass("select2-selected")
                    }
                });
                if (this.highlight() == -1 && noHighlightUpdate !== false)
                {
                    self.highlight(0)
                }
                if (!this.opts.createSearchChoice && !choices.filter('.select2-result:not(.select2-selected)').length > 0)
                {
                    if (!data || data && !data.more && this.results.find(".select2-no-results").length === 0)
                    {
                        if (checkFormatter(self.opts.formatNoMatches, "formatNoMatches"))
                        {
                            this.results.append("<li class='select2-no-results'>" + self.opts.formatNoMatches(self.search.val()) + "</li>")
                        }
                    }
                }
            }, getMaxSearchWidth: function()
            {
                return this.selection.width() - getSideBorderPadding(this.search)
            }, resizeSearch: function()
            {
                var minimumWidth,
                    left,
                    maxWidth,
                    containerLeft,
                    searchWidth,
                    sideBorderPadding = getSideBorderPadding(this.search);
                minimumWidth = measureTextWidth(this.search) + 10;
                left = this.search.offset().left;
                maxWidth = this.selection.width();
                containerLeft = this.selection.offset().left;
                searchWidth = maxWidth - (left - containerLeft) - sideBorderPadding;
                if (searchWidth < minimumWidth)
                {
                    searchWidth = maxWidth - sideBorderPadding
                }
                if (searchWidth < 40)
                {
                    searchWidth = maxWidth - sideBorderPadding
                }
                if (searchWidth <= 0)
                {
                    searchWidth = minimumWidth
                }
                this.search.width(searchWidth)
            }, getVal: function()
            {
                var val;
                if (this.select)
                {
                    val = this.select.val();
                    return val === null ? [] : val
                }
                else
                {
                    val = this.opts.element.val();
                    return splitVal(val, this.opts.separator)
                }
            }, setVal: function(val)
            {
                var unique;
                if (this.select)
                {
                    this.select.val(val)
                }
                else
                {
                    unique = [];
                    $(val).each(function()
                    {
                        if (indexOf(this, unique) < 0)
                            unique.push(this)
                    });
                    this.opts.element.val(unique.length === 0 ? "" : unique.join(this.opts.separator))
                }
            }, buildChangeDetails: function(old, current)
            {
                var current = current.slice(0),
                    old = old.slice(0);
                for (var i = 0; i < current.length; i++)
                {
                    for (var j = 0; j < old.length; j++)
                    {
                        if (equal(this.opts.id(current[i]), this.opts.id(old[j])))
                        {
                            current.splice(i, 1);
                            i--;
                            old.splice(j, 1);
                            j--
                        }
                    }
                }
                return {
                        added: current, removed: old
                    }
            }, val: function(val, triggerChange)
            {
                var oldData,
                    self = this,
                    changeDetails;
                if (arguments.length === 0)
                {
                    return this.getVal()
                }
                oldData = this.data();
                if (!oldData.length)
                    oldData = [];
                if (!val && val !== 0)
                {
                    this.opts.element.val("");
                    this.updateSelection([]);
                    this.clearSearch();
                    if (triggerChange)
                    {
                        this.triggerChange({
                            added: this.data(), removed: oldData
                        })
                    }
                    return
                }
                this.setVal(val);
                if (this.select)
                {
                    this.opts.initSelection(this.select, this.bind(this.updateSelection));
                    if (triggerChange)
                    {
                        this.triggerChange(this.buildChangeDetails(oldData, this.data()))
                    }
                }
                else
                {
                    if (this.opts.initSelection === undefined)
                    {
                        throw new Error("val() cannot be called if initSelection() is not defined");
                    }
                    this.opts.initSelection(this.opts.element, function(data)
                    {
                        var ids = $.map(data, self.id);
                        self.setVal(ids);
                        self.updateSelection(data);
                        self.clearSearch();
                        if (triggerChange)
                        {
                            self.triggerChange(self.buildChangeDetails(oldData, this.data()))
                        }
                    })
                }
                this.clearSearch()
            }, onSortStart: function()
            {
                if (this.select)
                {
                    throw new Error("Sorting of elements is not supported when attached to <select>. Attach to <input type='hidden'/> instead.");
                }
                this.search.width(0);
                this.searchContainer.hide()
            }, onSortEnd: function()
            {
                var val = [],
                    self = this;
                this.searchContainer.show();
                this.searchContainer.appendTo(this.searchContainer.parent());
                this.resizeSearch();
                this.selection.find(".select2-search-choice").each(function()
                {
                    val.push(self.opts.id($(this).data("select2-data")))
                });
                this.setVal(val);
                this.triggerChange()
            }, data: function(values, triggerChange)
            {
                var self = this,
                    ids,
                    old;
                if (arguments.length === 0)
                {
                    return this.selection.find(".select2-search-choice").map(function()
                        {
                            return $(this).data("select2-data")
                        }).get()
                }
                else
                {
                    old = this.data();
                    if (!values)
                    {
                        values = []
                    }
                    ids = $.map(values, function(e)
                    {
                        return self.opts.id(e)
                    });
                    this.setVal(ids);
                    this.updateSelection(values);
                    this.clearSearch();
                    if (triggerChange)
                    {
                        this.triggerChange(this.buildChangeDetails(old, this.data()))
                    }
                }
            }
    });
    $.fn.select2 = function()
    {
        var args = Array.prototype.slice.call(arguments, 0),
            opts,
            select2,
            method,
            value,
            multiple,
            allowedMethods = ["val", "destroy", "opened", "open", "close", "focus", "isFocused", "container", "dropdown", "onSortStart", "onSortEnd", "enable", "disable", "readonly", "positionDropdown", "data", "search"],
            valueMethods = ["opened", "isFocused", "container", "dropdown"],
            propertyMethods = ["val", "data"],
            methodsMap = {search: "externalSearch"};
        this.each(function()
        {
            if (args.length === 0 || typeof(args[0]) === "object")
            {
                opts = args.length === 0 ? {} : $.extend({}, args[0]);
                opts.element = $(this);
                if (opts.element.get(0).tagName.toLowerCase() === "select")
                {
                    multiple = opts.element.prop("multiple")
                }
                else
                {
                    multiple = opts.multiple || false;
                    if ("tags" in opts)
                    {
                        opts.multiple = multiple = true
                    }
                }
                select2 = multiple ? new MultiSelect2 : new SingleSelect2;
                select2.init(opts)
            }
            else if (typeof(args[0]) === "string")
            {
                if (indexOf(args[0], allowedMethods) < 0)
                {
                    throw"Unknown method: " + args[0];
                }
                value = undefined;
                select2 = $(this).data("select2");
                if (select2 === undefined)
                    return;
                method = args[0];
                if (method === "container")
                {
                    value = select2.container
                }
                else if (method === "dropdown")
                {
                    value = select2.dropdown
                }
                else
                {
                    if (methodsMap[method])
                        method = methodsMap[method];
                    value = select2[method].apply(select2, args.slice(1))
                }
                if (indexOf(args[0], valueMethods) >= 0 || (indexOf(args[0], propertyMethods) && args.length == 1))
                {
                    return false
                }
            }
            else
            {
                throw"Invalid arguments to select2 plugin: " + args;
            }
        });
        return (value === undefined) ? this : value
    };
    $.fn.select2.defaults = {
        width: "copy", loadMorePadding: 0, closeOnSelect: true, openOnEnter: true, containerCss: {}, dropdownCss: {}, containerCssClass: "", dropdownCssClass: "", formatResult: function(result, container, query, escapeMarkup)
            {
                var markup = [];
                markMatch(result.text, query.term, markup, escapeMarkup);
                return markup.join("")
            }, formatSelection: function(data, container, escapeMarkup)
            {
                return data ? escapeMarkup(data.text) : undefined
            }, sortResults: function(results, container, query)
            {
                return results
            }, formatResultCssClass: function(data)
            {
                return undefined
            }, formatSelectionCssClass: function(data, container)
            {
                return undefined
            }, formatNoMatches: function()
            {
                return "No matches found"
            }, formatInputTooShort: function(input, min)
            {
                var n = min - input.length;
                return "Please enter " + n + " more character" + (n == 1 ? "" : "s")
            }, formatInputTooLong: function(input, max)
            {
                var n = input.length - max;
                return "Please delete " + n + " character" + (n == 1 ? "" : "s")
            }, formatSelectionTooBig: function(limit)
            {
                return "You can only select " + limit + " item" + (limit == 1 ? "" : "s")
            }, formatLoadMore: function(pageNumber)
            {
                return "Loading more results..."
            }, formatSearching: function()
            {
                return "Searching..."
            }, minimumResultsForSearch: 0, minimumInputLength: 0, maximumInputLength: null, maximumSelectionSize: 0, id: function(e)
            {
                return e.id
            }, matcher: function(term, text)
            {
                return stripDiacritics('' + text).toUpperCase().indexOf(stripDiacritics('' + term).toUpperCase()) >= 0
            }, separator: ",", tokenSeparators: [], tokenizer: defaultTokenizer, escapeMarkup: defaultEscapeMarkup, blurOnChange: false, selectOnBlur: false, adaptContainerCssClass: function(c)
            {
                return c
            }, adaptDropdownCssClass: function(c)
            {
                return null
            }, nextSearchTerm: function(selectedObject, currentSearchTerm)
            {
                return undefined
            }
    };
    $.fn.select2.ajaxDefaults = {
        transport: $.ajax, params: {
                type: "GET", cache: false, dataType: "json"
            }
    };
    window.Select2 = {
        query: {
            ajax: ajax, local: local, tags: tags
        }, util: {
                debounce: debounce, markMatch: markMatch, escapeMarkup: defaultEscapeMarkup, stripDiacritics: stripDiacritics
            }, "class": {
                abstract: AbstractSelect2, single: SingleSelect2, multi: MultiSelect2
            }
    }
}(jQuery));
(function($)
{
    $.extend($.fn.select2.defaults, {
        formatNoMatches: function()
        {
            return "No se encontraron resultados"
        }, formatInputTooShort: function(input, min)
            {
                var n = min - input.length;
                return "Por favor, introduzca " + n + " car" + (n == 1 ? "á" : "a") + "cter" + (n == 1 ? "" : "es")
            }, formatInputTooLong: function(input, max)
            {
                var n = input.length - max;
                return "Por favor, elimine " + n + " car" + (n == 1 ? "á" : "a") + "cter" + (n == 1 ? "" : "es")
            }, formatSelectionTooBig: function(limit)
            {
                return "Sólo puede seleccionar " + limit + " elemento" + (limit == 1 ? "" : "s")
            }, formatLoadMore: function(pageNumber)
            {
                return "Cargando más resultados..."
            }, formatSearching: function()
            {
                return "Buscando..."
            }
    })
})(jQuery);
!function(e, t)
{
    "function" == typeof define && define.amd ? define(e) : "undefined" != typeof module && "object" == typeof exports ? module.exports = e() : t.rangy = e()
}(function()
{
    function e(e, t)
    {
        var n = typeof e[t];
        return n == N || !(n != C || !e[t]) || "unknown" == n
    }
    function t(e, t)
    {
        return !(typeof e[t] != C || !e[t])
    }
    function n(e, t)
    {
        return typeof e[t] != E
    }
    function r(e)
    {
        return function(t, n)
            {
                for (var r = n.length; r--; )
                    if (!e(t, n[r]))
                        return !1;
                return !0
            }
    }
    function o(e)
    {
        return e && O(e, T) && D(e, w)
    }
    function i(e)
    {
        return t(e, "body") ? e.body : e.getElementsByTagName("body")[0]
    }
    function a(t)
    {
        typeof console != E && e(console, "log") && console.log(t)
    }
    function s(e, t)
    {
        b && t ? alert(e) : a(e)
    }
    function c(e)
    {
        I.initialized = !0,
        I.supported = !1,
        s("Rangy is not supported in this environment. Reason: " + e, I.config.alertOnFail)
    }
    function d(e)
    {
        s("Rangy warning: " + e, I.config.alertOnWarn)
    }
    function f(e)
    {
        return e.message || e.description || String(e)
    }
    function u()
    {
        if (b && !I.initialized)
        {
            var t,
                n = !1,
                r = !1;
            e(document, "createRange") && (t = document.createRange(), O(t, y) && D(t, S) && (n = !0));
            var s = i(document);
            if (!s || "body" != s.nodeName.toLowerCase())
                return void c("No body element found");
            if (s && e(s, "createTextRange") && (t = s.createTextRange(), o(t) && (r = !0)), !n && !r)
                return void c("Neither Range nor TextRange are available");
            I.initialized = !0,
            I.features = {
                implementsDomRange: n, implementsTextRange: r
            };
            var d,
                u;
            for (var l in x)
                (d = x[l]) instanceof p && d.init(d, I);
            for (var h = 0, g = M.length; g > h; ++h)
                try
                {
                    M[h](I)
                }
                catch(m)
                {
                    u = "Rangy init listener threw an exception. Continuing. Detail: " + f(m),
                    a(u)
                }
        }
    }
    function l(e, t, n)
    {
        n && (e += " in module " + n.name),
        I.warn("DEPRECATED: " + e + " is deprecated. Please use " + t + " instead.")
    }
    function h(e, t, n, r)
    {
        e[t] = function()
        {
            return l(t, n, r), e[n].apply(e, P.toArray(arguments))
        }
    }
    function g(e)
    {
        e = e || window,
        u();
        for (var t = 0, n = k.length; n > t; ++t)
            k[t](e)
    }
    function p(e, t, n)
    {
        this.name = e,
        this.dependencies = t,
        this.initialized = !1,
        this.supported = !1,
        this.initializer = n
    }
    function m(e, t, n)
    {
        var r = new p(e, t, function(t)
            {
                if (!t.initialized)
                {
                    t.initialized = !0;
                    try
                    {
                        n(I, t),
                        t.supported = !0
                    }
                    catch(r)
                    {
                        var o = "Module '" + e + "' failed to load: " + f(r);
                        a(o),
                        r.stack && a(r.stack)
                    }
                }
            });
        return x[e] = r, r
    }
    function R(){}
    function v(){}
    var C = "object",
        N = "function",
        E = "undefined",
        S = ["startContainer", "startOffset", "endContainer", "endOffset", "collapsed", "commonAncestorContainer"],
        y = ["setStart", "setStartBefore", "setStartAfter", "setEnd", "setEndBefore", "setEndAfter", "collapse", "selectNode", "selectNodeContents", "compareBoundaryPoints", "deleteContents", "extractContents", "cloneContents", "insertNode", "surroundContents", "cloneRange", "toString", "detach"],
        w = ["boundingHeight", "boundingLeft", "boundingTop", "boundingWidth", "htmlText", "text"],
        T = ["collapse", "compareEndPoints", "duplicate", "moveToElementText", "parentElement", "select", "setEndPoint", "getBoundingClientRect"],
        O = r(e),
        _ = r(t),
        D = r(n),
        A = [].forEach ? function(e, t)
        {
            e.forEach(t)
        } : function(e, t)
        {
            for (var n = 0, r = e.length; r > n; ++n)
                t(e[n], n)
        },
        x = {},
        b = typeof window != E && typeof document != E,
        P = {
            isHostMethod: e, isHostObject: t, isHostProperty: n, areHostMethods: O, areHostObjects: _, areHostProperties: D, isTextRange: o, getBody: i, forEach: A
        },
        I = {
            version: "1.3.0", initialized: !1, isBrowser: b, supported: !0, util: P, features: {}, modules: x, config: {
                    alertOnFail: !1, alertOnWarn: !1, preferTextRange: !1, autoInitialize: typeof rangyAutoInitialize == E ? !0 : rangyAutoInitialize
                }
        };
    I.fail = c,
    I.warn = d;
    var B;
    ({}).hasOwnProperty ? (P.extend = B = function(e, t, n)
    {
        var r,
            o;
        for (var i in t)
            t.hasOwnProperty(i) && (r = e[i], o = t[i], n && null !== r && "object" == typeof r && null !== o && "object" == typeof o && B(r, o, !0), e[i] = o);
        return t.hasOwnProperty("toString") && (e.toString = t.toString), e
    }, P.createOptions = function(e, t)
    {
        var n = {};
        return B(n, t), e && B(n, e), n
    }) : c("hasOwnProperty not supported"),
    b || c("Rangy can only run in a browser"),
    function()
    {
        var e;
        if (b)
        {
            var t = document.createElement("div");
            t.appendChild(document.createElement("span"));
            var n = [].slice;
            try
            {
                1 == n.call(t.childNodes, 0)[0].nodeType && (e = function(e)
                {
                    return n.call(e, 0)
                })
            }
            catch(r) {}
        }
        e || (e = function(e)
        {
            for (var t = [], n = 0, r = e.length; r > n; ++n)
                t[n] = e[n];
            return t
        }),
        P.toArray = e
    }();
    var H;
    b && (e(document, "addEventListener") ? H = function(e, t, n)
    {
        e.addEventListener(t, n, !1)
    } : e(document, "attachEvent") ? H = function(e, t, n)
    {
        e.attachEvent("on" + t, n)
    } : c("Document does not have required addEventListener or attachEvent method"), P.addListener = H);
    var M = [];
    P.deprecationNotice = l,
    P.createAliasForDeprecatedMethod = h,
    I.init = u,
    I.addInitListener = function(e)
    {
        I.initialized ? e(I) : M.push(e)
    };
    var k = [];
    I.addShimListener = function(e)
    {
        k.push(e)
    },
    b && (I.shim = I.createMissingNativeApi = g, h(I, "createMissingNativeApi", "shim")),
    p.prototype = {
        init: function()
        {
            for (var e, t, n = this.dependencies || [], r = 0, o = n.length; o > r; ++r)
            {
                if (t = n[r], e = x[t], !(e && e instanceof p))
                    throw new Error("required module '" + t + "' not found");
                if (e.init(), !e.supported)
                    throw new Error("required module '" + t + "' not supported");
            }
            this.initializer(this)
        }, fail: function(e)
            {
                throw this.initialized = !0, this.supported = !1, new Error(e);
            }, warn: function(e)
            {
                I.warn("Module " + this.name + ": " + e)
            }, deprecationNotice: function(e, t)
            {
                I.warn("DEPRECATED: " + e + " in module " + this.name + " is deprecated. Please use " + t + " instead")
            }, createError: function(e)
            {
                return new Error("Error in Rangy " + this.name + " module: " + e)
            }
    },
    I.createModule = function(e)
    {
        var t,
            n;
        2 == arguments.length ? (t = arguments[1], n = []) : (t = arguments[2], n = arguments[1]);
        var r = m(e, n, t);
        I.initialized && I.supported && r.init()
    },
    I.createCoreModule = function(e, t, n)
    {
        m(e, t, n)
    },
    I.RangePrototype = R,
    I.rangePrototype = new R,
    I.selectionPrototype = new v,
    I.createCoreModule("DomUtil", [], function(e, t)
    {
        function n(e)
        {
            var t;
            return typeof e.namespaceURI == b || null === (t = e.namespaceURI) || "http://www.w3.org/1999/xhtml" == t
        }
        function r(e)
        {
            var t = e.parentNode;
            return 1 == t.nodeType ? t : null
        }
        function o(e)
        {
            for (var t = 0; e = e.previousSibling; )
                ++t;
            return t
        }
        function i(e)
        {
            switch (e.nodeType)
            {
                case 7:
                case 10:
                    return 0;
                case 3:
                case 8:
                    return e.length;
                default:
                    return e.childNodes.length
            }
        }
        function a(e, t)
        {
            var n,
                r = [];
            for (n = e; n; n = n.parentNode)
                r.push(n);
            for (n = t; n; n = n.parentNode)
                if (M(r, n))
                    return n;
            return null
        }
        function s(e, t, n)
        {
            for (var r = n ? t : t.parentNode; r; )
            {
                if (r === e)
                    return !0;
                r = r.parentNode
            }
            return !1
        }
        function c(e, t)
        {
            return s(e, t, !0)
        }
        function d(e, t, n)
        {
            for (var r, o = n ? e : e.parentNode; o; )
            {
                if (r = o.parentNode, r === t)
                    return o;
                o = r
            }
            return null
        }
        function f(e)
        {
            var t = e.nodeType;
            return 3 == t || 4 == t || 8 == t
        }
        function u(e)
        {
            if (!e)
                return !1;
            var t = e.nodeType;
            return 3 == t || 8 == t
        }
        function l(e, t)
        {
            var n = t.nextSibling,
                r = t.parentNode;
            return n ? r.insertBefore(e, n) : r.appendChild(e), e
        }
        function h(e, t, n)
        {
            var r = e.cloneNode(!1);
            if (r.deleteData(0, t), e.deleteData(t, e.length - t), l(r, e), n)
                for (var i, a = 0; i = n[a++]; )
                    i.node == e && i.offset > t ? (i.node = r, i.offset -= t) : i.node == e.parentNode && i.offset > o(e) && ++i.offset;
            return r
        }
        function g(e)
        {
            if (9 == e.nodeType)
                return e;
            if (typeof e.ownerDocument != b)
                return e.ownerDocument;
            if (typeof e.document != b)
                return e.document;
            if (e.parentNode)
                return g(e.parentNode);
            throw t.createError("getDocument: no document found for node");
        }
        function p(e)
        {
            var n = g(e);
            if (typeof n.defaultView != b)
                return n.defaultView;
            if (typeof n.parentWindow != b)
                return n.parentWindow;
            throw t.createError("Cannot get a window object for node");
        }
        function m(e)
        {
            if (typeof e.contentDocument != b)
                return e.contentDocument;
            if (typeof e.contentWindow != b)
                return e.contentWindow.document;
            throw t.createError("getIframeDocument: No Document object found for iframe element");
        }
        function R(e)
        {
            if (typeof e.contentWindow != b)
                return e.contentWindow;
            if (typeof e.contentDocument != b)
                return e.contentDocument.defaultView;
            throw t.createError("getIframeWindow: No Window object found for iframe element");
        }
        function v(e)
        {
            return e && P.isHostMethod(e, "setTimeout") && P.isHostObject(e, "document")
        }
        function C(e, t, n)
        {
            var r;
            if (e ? P.isHostProperty(e, "nodeType") ? r = 1 == e.nodeType && "iframe" == e.tagName.toLowerCase() ? m(e) : g(e) : v(e) && (r = e.document) : r = document, !r)
                throw t.createError(n + "(): Parameter must be a Window object or DOM node");
            return r
        }
        function N(e)
        {
            for (var t; t = e.parentNode; )
                e = t;
            return e
        }
        function E(e, n, r, i)
        {
            var s,
                c,
                f,
                u,
                l;
            if (e == r)
                return n === i ? 0 : i > n ? -1 : 1;
            if (s = d(r, e, !0))
                return n <= o(s) ? -1 : 1;
            if (s = d(e, r, !0))
                return o(s) < i ? -1 : 1;
            if (c = a(e, r), !c)
                throw new Error("comparePoints error: nodes have no common ancestor");
            if (f = e === c ? c : d(e, c, !0), u = r === c ? c : d(r, c, !0), f === u)
                throw t.createError("comparePoints got to case 4 and childA and childB are the same!");
            for (l = c.firstChild; l; )
            {
                if (l === f)
                    return -1;
                if (l === u)
                    return 1;
                l = l.nextSibling
            }
        }
        function S(e)
        {
            var t;
            try
            {
                return t = e.parentNode, !1
            }
            catch(n)
            {
                return !0
            }
        }
        function y(e)
        {
            if (!e)
                return "[No node]";
            if (k && S(e))
                return "[Broken node]";
            if (f(e))
                return '"' + e.data + '"';
            if (1 == e.nodeType)
            {
                var t = e.id ? ' id="' + e.id + '"' : "";
                return "<" + e.nodeName + t + ">[index:" + o(e) + ",length:" + e.childNodes.length + "][" + (e.innerHTML || "[innerHTML not supported]").slice(0, 25) + "]"
            }
            return e.nodeName
        }
        function w(e)
        {
            for (var t, n = g(e).createDocumentFragment(); t = e.firstChild; )
                n.appendChild(t);
            return n
        }
        function T(e, t, n)
        {
            var r = I(e),
                o = e.createElement("div");
            o.contentEditable = "" + !!n,
            t && (o.innerHTML = t);
            var i = r.firstChild;
            return i ? r.insertBefore(o, i) : r.appendChild(o), o
        }
        function O(e)
        {
            return e.parentNode.removeChild(e)
        }
        function _(e)
        {
            this.root = e,
            this._next = e
        }
        function D(e)
        {
            return new _(e)
        }
        function A(e, t)
        {
            this.node = e,
            this.offset = t
        }
        function x(e)
        {
            this.code = this[e],
            this.codeName = e,
            this.message = "DOMException: " + this.codeName
        }
        var b = "undefined",
            P = e.util,
            I = P.getBody;
        P.areHostMethods(document, ["createDocumentFragment", "createElement", "createTextNode"]) || t.fail("document missing a Node creation method"),
        P.isHostMethod(document, "getElementsByTagName") || t.fail("document missing getElementsByTagName method");
        var B = document.createElement("div");
        P.areHostMethods(B, ["insertBefore", "appendChild", "cloneNode"] || !P.areHostObjects(B, ["previousSibling", "nextSibling", "childNodes", "parentNode"])) || t.fail("Incomplete Element implementation"),
        P.isHostProperty(B, "innerHTML") || t.fail("Element is missing innerHTML property");
        var H = document.createTextNode("test");
        P.areHostMethods(H, ["splitText", "deleteData", "insertData", "appendData", "cloneNode"] || !P.areHostObjects(B, ["previousSibling", "nextSibling", "childNodes", "parentNode"]) || !P.areHostProperties(H, ["data"])) || t.fail("Incomplete Text Node implementation");
        var M = function(e, t)
            {
                for (var n = e.length; n--; )
                    if (e[n] === t)
                        return !0;
                return !1
            },
            k = !1;
        !function()
        {
            var t = document.createElement("b");
            t.innerHTML = "1";
            var n = t.firstChild;
            t.innerHTML = "<br />",
            k = S(n),
            e.features.crashyTextNodes = k
        }();
        var L;
        typeof window.getComputedStyle != b ? L = function(e, t)
        {
            return p(e).getComputedStyle(e, null)[t]
        } : typeof document.documentElement.currentStyle != b ? L = function(e, t)
        {
            return e.currentStyle ? e.currentStyle[t] : ""
        } : t.fail("No means of obtaining computed style properties found"),
        _.prototype = {
            _current: null, hasNext: function()
                {
                    return !!this._next
                }, next: function()
                {
                    var e,
                        t,
                        n = this._current = this._next;
                    if (this._current)
                        if (e = n.firstChild)
                            this._next = e;
                        else
                        {
                            for (t = null; n !== this.root && !(t = n.nextSibling); )
                                n = n.parentNode;
                            this._next = t
                        }
                    return this._current
                }, detach: function()
                {
                    this._current = this._next = this.root = null
                }
        },
        A.prototype = {
            equals: function(e)
            {
                return !!e && this.node === e.node && this.offset == e.offset
            }, inspect: function()
                {
                    return "[DomPosition(" + y(this.node) + ":" + this.offset + ")]"
                }, toString: function()
                {
                    return this.inspect()
                }
        },
        x.prototype = {
            INDEX_SIZE_ERR: 1, HIERARCHY_REQUEST_ERR: 3, WRONG_DOCUMENT_ERR: 4, NO_MODIFICATION_ALLOWED_ERR: 7, NOT_FOUND_ERR: 8, NOT_SUPPORTED_ERR: 9, INVALID_STATE_ERR: 11, INVALID_NODE_TYPE_ERR: 24
        },
        x.prototype.toString = function()
        {
            return this.message
        },
        e.dom = {
            arrayContains: M, isHtmlNamespace: n, parentElement: r, getNodeIndex: o, getNodeLength: i, getCommonAncestor: a, isAncestorOf: s, isOrIsAncestorOf: c, getClosestAncestorIn: d, isCharacterDataNode: f, isTextOrCommentNode: u, insertAfter: l, splitDataNode: h, getDocument: g, getWindow: p, getIframeWindow: R, getIframeDocument: m, getBody: I, isWindow: v, getContentDocument: C, getRootContainer: N, comparePoints: E, isBrokenNode: S, inspectNode: y, getComputedStyleProperty: L, createTestElement: T, removeNode: O, fragmentFromNodeChildren: w, createIterator: D, DomPosition: A
        },
        e.DOMException = x
    }),
    I.createCoreModule("DomRange", ["DomUtil"], function(e)
    {
        function t(e, t)
        {
            return 3 != e.nodeType && (F(e, t.startContainer) || F(e, t.endContainer))
        }
        function n(e)
        {
            return e.document || j(e.startContainer)
        }
        function r(e)
        {
            return Q(e.startContainer)
        }
        function o(e)
        {
            return new M(e.parentNode, W(e))
        }
        function i(e)
        {
            return new M(e.parentNode, W(e) + 1)
        }
        function a(e, t, n)
        {
            var r = 11 == e.nodeType ? e.firstChild : e;
            return L(t) ? n == t.length ? B.insertAfter(e, t) : t.parentNode.insertBefore(e, 0 == n ? t : U(t, n)) : n >= t.childNodes.length ? t.appendChild(e) : t.insertBefore(e, t.childNodes[n]), r
        }
        function s(e, t, r)
        {
            if (w(e), w(t), n(t) != n(e))
                throw new k("WRONG_DOCUMENT_ERR");
            var o = z(e.startContainer, e.startOffset, t.endContainer, t.endOffset),
                i = z(e.endContainer, e.endOffset, t.startContainer, t.startOffset);
            return r ? 0 >= o && i >= 0 : 0 > o && i > 0
        }
        function c(e)
        {
            for (var t, r, o, i = n(e.range).createDocumentFragment(); r = e.next(); )
            {
                if (t = e.isPartiallySelectedSubtree(), r = r.cloneNode(!t), t && (o = e.getSubtreeIterator(), r.appendChild(c(o)), o.detach()), 10 == r.nodeType)
                    throw new k("HIERARCHY_REQUEST_ERR");
                i.appendChild(r)
            }
            return i
        }
        function d(e, t, n)
        {
            var r,
                o;
            n = n || {stop: !1};
            for (var i, a; i = e.next(); )
                if (e.isPartiallySelectedSubtree())
                {
                    if (t(i) === !1)
                        return void(n.stop = !0);
                    if (a = e.getSubtreeIterator(), d(a, t, n), a.detach(), n.stop)
                        return
                }
                else
                    for (r = B.createIterator(i); o = r.next(); )
                        if (t(o) === !1)
                            return void(n.stop = !0)
        }
        function f(e)
        {
            for (var t; e.next(); )
                e.isPartiallySelectedSubtree() ? (t = e.getSubtreeIterator(), f(t), t.detach()) : e.remove()
        }
        function u(e)
        {
            for (var t, r, o = n(e.range).createDocumentFragment(); t = e.next(); )
            {
                if (e.isPartiallySelectedSubtree() ? (t = t.cloneNode(!1), r = e.getSubtreeIterator(), t.appendChild(u(r)), r.detach()) : e.remove(), 10 == t.nodeType)
                    throw new k("HIERARCHY_REQUEST_ERR");
                o.appendChild(t)
            }
            return o
        }
        function l(e, t, n)
        {
            var r,
                o = !(!t || !t.length),
                i = !!n;
            o && (r = new RegExp("^(" + t.join("|") + ")$"));
            var a = [];
            return d(new g(e, !1), function(t)
                {
                    if (!(o && !r.test(t.nodeType) || i && !n(t)))
                    {
                        var s = e.startContainer;
                        if (t != s || !L(s) || e.startOffset != s.length)
                        {
                            var c = e.endContainer;
                            t == c && L(c) && 0 == e.endOffset || a.push(t)
                        }
                    }
                }), a
        }
        function h(e)
        {
            var t = "undefined" == typeof e.getName ? "Range" : e.getName();
            return "[" + t + "(" + B.inspectNode(e.startContainer) + ":" + e.startOffset + ", " + B.inspectNode(e.endContainer) + ":" + e.endOffset + ")]"
        }
        function g(e, t)
        {
            if (this.range = e, this.clonePartiallySelectedTextNodes = t, !e.collapsed)
            {
                this.sc = e.startContainer,
                this.so = e.startOffset,
                this.ec = e.endContainer,
                this.eo = e.endOffset;
                var n = e.commonAncestorContainer;
                this.sc === this.ec && L(this.sc) ? (this.isSingleCharacterDataNode = !0, this._first = this._last = this._next = this.sc) : (this._first = this._next = this.sc !== n || L(this.sc) ? V(this.sc, n, !0) : this.sc.childNodes[this.so], this._last = this.ec !== n || L(this.ec) ? V(this.ec, n, !0) : this.ec.childNodes[this.eo - 1])
            }
        }
        function p(e)
        {
            return function(t, n)
                {
                    for (var r, o = n ? t : t.parentNode; o; )
                    {
                        if (r = o.nodeType, Y(e, r))
                            return o;
                        o = o.parentNode
                    }
                    return null
                }
        }
        function m(e, t)
        {
            if (rt(e, t))
                throw new k("INVALID_NODE_TYPE_ERR");
        }
        function R(e, t)
        {
            if (!Y(t, e.nodeType))
                throw new k("INVALID_NODE_TYPE_ERR");
        }
        function v(e, t)
        {
            if (0 > t || t > (L(e) ? e.length : e.childNodes.length))
                throw new k("INDEX_SIZE_ERR");
        }
        function C(e, t)
        {
            if (tt(e, !0) !== tt(t, !0))
                throw new k("WRONG_DOCUMENT_ERR");
        }
        function N(e)
        {
            if (nt(e, !0))
                throw new k("NO_MODIFICATION_ALLOWED_ERR");
        }
        function E(e, t)
        {
            if (!e)
                throw new k(t);
        }
        function S(e, t)
        {
            return t <= (L(e) ? e.length : e.childNodes.length)
        }
        function y(e)
        {
            return !!e.startContainer && !!e.endContainer && !(G && (B.isBrokenNode(e.startContainer) || B.isBrokenNode(e.endContainer))) && Q(e.startContainer) == Q(e.endContainer) && S(e.startContainer, e.startOffset) && S(e.endContainer, e.endOffset)
        }
        function w(e)
        {
            if (!y(e))
                throw new Error("Range error: Range is not valid. This usually happens after DOM mutation. Range: (" + e.inspect() + ")");
        }
        function T(e, t)
        {
            w(e);
            var n = e.startContainer,
                r = e.startOffset,
                o = e.endContainer,
                i = e.endOffset,
                a = n === o;
            L(o) && i > 0 && i < o.length && U(o, i, t),
            L(n) && r > 0 && r < n.length && (n = U(n, r, t), a ? (i -= r, o = n) : o == n.parentNode && i >= W(n) && i++, r = 0),
            e.setStartAndEnd(n, r, o, i)
        }
        function O(e)
        {
            w(e);
            var t = e.commonAncestorContainer.parentNode.cloneNode(!1);
            return t.appendChild(e.cloneContents()), t.innerHTML
        }
        function _(e)
        {
            e.START_TO_START = dt,
            e.START_TO_END = ft,
            e.END_TO_END = ut,
            e.END_TO_START = lt,
            e.NODE_BEFORE = ht,
            e.NODE_AFTER = gt,
            e.NODE_BEFORE_AND_AFTER = pt,
            e.NODE_INSIDE = mt
        }
        function D(e)
        {
            _(e),
            _(e.prototype)
        }
        function A(e, t)
        {
            return function()
                {
                    w(this);
                    var n,
                        r,
                        o = this.startContainer,
                        a = this.startOffset,
                        s = this.commonAncestorContainer,
                        c = new g(this, !0);
                    o !== s && (n = V(o, s, !0), r = i(n), o = r.node, a = r.offset),
                    d(c, N),
                    c.reset();
                    var f = e(c);
                    return c.detach(), t(this, o, a, o, a), f
                }
        }
        function x(n, r)
        {
            function a(e, t)
            {
                return function(n)
                    {
                        R(n, Z),
                        R(Q(n), $);
                        var r = (e ? o : i)(n);
                        (t ? s : c)(this, r.node, r.offset)
                    }
            }
            function s(e, t, n)
            {
                var o = e.endContainer,
                    i = e.endOffset;
                (t !== e.startContainer || n !== e.startOffset) && ((Q(t) != Q(o) || 1 == z(t, n, o, i)) && (o = t, i = n), r(e, t, n, o, i))
            }
            function c(e, t, n)
            {
                var o = e.startContainer,
                    i = e.startOffset;
                (t !== e.endContainer || n !== e.endOffset) && ((Q(t) != Q(o) || -1 == z(t, n, o, i)) && (o = t, i = n), r(e, o, i, t, n))
            }
            var d = function(){};
            d.prototype = e.rangePrototype,
            n.prototype = new d,
            H.extend(n.prototype, {
                setStart: function(e, t)
                {
                    m(e, !0),
                    v(e, t),
                    s(this, e, t)
                }, setEnd: function(e, t)
                    {
                        m(e, !0),
                        v(e, t),
                        c(this, e, t)
                    }, setStartAndEnd: function()
                    {
                        var e = arguments,
                            t = e[0],
                            n = e[1],
                            o = t,
                            i = n;
                        switch (e.length)
                        {
                            case 3:
                                i = e[2];
                                break;
                            case 4:
                                o = e[2],
                                i = e[3]
                        }
                        r(this, t, n, o, i)
                    }, setBoundary: function(e, t, n)
                    {
                        this["set" + (n ? "Start" : "End")](e, t)
                    }, setStartBefore: a(!0, !0), setStartAfter: a(!1, !0), setEndBefore: a(!0, !1), setEndAfter: a(!1, !1), collapse: function(e)
                    {
                        w(this),
                        e ? r(this, this.startContainer, this.startOffset, this.startContainer, this.startOffset) : r(this, this.endContainer, this.endOffset, this.endContainer, this.endOffset)
                    }, selectNodeContents: function(e)
                    {
                        m(e, !0),
                        r(this, e, 0, e, q(e))
                    }, selectNode: function(e)
                    {
                        m(e, !1),
                        R(e, Z);
                        var t = o(e),
                            n = i(e);
                        r(this, t.node, t.offset, n.node, n.offset)
                    }, extractContents: A(u, r), deleteContents: A(f, r), canSurroundContents: function()
                    {
                        w(this),
                        N(this.startContainer),
                        N(this.endContainer);
                        var e = new g(this, !0),
                            n = e._first && t(e._first, this) || e._last && t(e._last, this);
                        return e.detach(), !n
                    }, splitBoundaries: function()
                    {
                        T(this)
                    }, splitBoundariesPreservingPositions: function(e)
                    {
                        T(this, e)
                    }, normalizeBoundaries: function()
                    {
                        w(this);
                        var e,
                            t = this.startContainer,
                            n = this.startOffset,
                            o = this.endContainer,
                            i = this.endOffset,
                            a = function(e)
                            {
                                var t = e.nextSibling;
                                t && t.nodeType == e.nodeType && (o = e, i = e.length, e.appendData(t.data), X(t))
                            },
                            s = function(e)
                            {
                                var r = e.previousSibling;
                                if (r && r.nodeType == e.nodeType)
                                {
                                    t = e;
                                    var a = e.length;
                                    if (n = r.length, e.insertData(0, r.data), X(r), t == o)
                                        i += n,
                                        o = t;
                                    else if (o == e.parentNode)
                                    {
                                        var s = W(e);
                                        i == s ? (o = e, i = a) : i > s && i--
                                    }
                                }
                            },
                            c = !0;
                        if (L(o))
                            i == o.length ? a(o) : 0 == i && (e = o.previousSibling, e && e.nodeType == o.nodeType && (i = e.length, t == o && (c = !1), e.appendData(o.data), X(o), o = e));
                        else
                        {
                            if (i > 0)
                            {
                                var d = o.childNodes[i - 1];
                                d && L(d) && a(d)
                            }
                            c = !this.collapsed
                        }
                        if (c)
                        {
                            if (L(t))
                                0 == n ? s(t) : n == t.length && (e = t.nextSibling, e && e.nodeType == t.nodeType && (o == e && (o = t, i += t.length), t.appendData(e.data), X(e)));
                            else if (n < t.childNodes.length)
                            {
                                var f = t.childNodes[n];
                                f && L(f) && s(f)
                            }
                        }
                        else
                            t = o,
                            n = i;
                        r(this, t, n, o, i)
                    }, collapseToPoint: function(e, t)
                    {
                        m(e, !0),
                        v(e, t),
                        this.setStartAndEnd(e, t)
                    }
            }),
            D(n)
        }
        function b(e)
        {
            e.collapsed = e.startContainer === e.endContainer && e.startOffset === e.endOffset,
            e.commonAncestorContainer = e.collapsed ? e.startContainer : B.getCommonAncestor(e.startContainer, e.endContainer)
        }
        function P(e, t, n, r, o)
        {
            e.startContainer = t,
            e.startOffset = n,
            e.endContainer = r,
            e.endOffset = o,
            e.document = B.getDocument(t),
            b(e)
        }
        function I(e)
        {
            this.startContainer = e,
            this.startOffset = 0,
            this.endContainer = e,
            this.endOffset = 0,
            this.document = e,
            b(this)
        }
        var B = e.dom,
            H = e.util,
            M = B.DomPosition,
            k = e.DOMException,
            L = B.isCharacterDataNode,
            W = B.getNodeIndex,
            F = B.isOrIsAncestorOf,
            j = B.getDocument,
            z = B.comparePoints,
            U = B.splitDataNode,
            V = B.getClosestAncestorIn,
            q = B.getNodeLength,
            Y = B.arrayContains,
            Q = B.getRootContainer,
            G = e.features.crashyTextNodes,
            X = B.removeNode;
        g.prototype = {
            _current: null, _next: null, _first: null, _last: null, isSingleCharacterDataNode: !1, reset: function()
                {
                    this._current = null,
                    this._next = this._first
                }, hasNext: function()
                {
                    return !!this._next
                }, next: function()
                {
                    var e = this._current = this._next;
                    return e && (this._next = e !== this._last ? e.nextSibling : null, L(e) && this.clonePartiallySelectedTextNodes && (e === this.ec && (e = e.cloneNode(!0)).deleteData(this.eo, e.length - this.eo), this._current === this.sc && (e = e.cloneNode(!0)).deleteData(0, this.so))), e
                }, remove: function()
                {
                    var e,
                        t,
                        n = this._current;
                    !L(n) || n !== this.sc && n !== this.ec ? n.parentNode && X(n) : (e = n === this.sc ? this.so : 0, t = n === this.ec ? this.eo : n.length, e != t && n.deleteData(e, t - e))
                }, isPartiallySelectedSubtree: function()
                {
                    var e = this._current;
                    return t(e, this.range)
                }, getSubtreeIterator: function()
                {
                    var e;
                    if (this.isSingleCharacterDataNode)
                        e = this.range.cloneRange(),
                        e.collapse(!1);
                    else
                    {
                        e = new I(n(this.range));
                        var t = this._current,
                            r = t,
                            o = 0,
                            i = t,
                            a = q(t);
                        F(t, this.sc) && (r = this.sc, o = this.so),
                        F(t, this.ec) && (i = this.ec, a = this.eo),
                        P(e, r, o, i, a)
                    }
                    return new g(e, this.clonePartiallySelectedTextNodes)
                }, detach: function()
                {
                    this.range = this._current = this._next = this._first = this._last = this.sc = this.so = this.ec = this.eo = null
                }
        };
        var Z = [1, 3, 4, 5, 7, 8, 10],
            $ = [2, 9, 11],
            J = [5, 6, 10, 12],
            K = [1, 3, 4, 5, 7, 8, 10, 11],
            et = [1, 3, 4, 5, 7, 8],
            tt = p([9, 11]),
            nt = p(J),
            rt = p([6, 10, 12]),
            ot = document.createElement("style"),
            it = !1;
        try
        {
            ot.innerHTML = "<b>x</b>",
            it = 3 == ot.firstChild.nodeType
        }
        catch(at) {}
        e.features.htmlParsingConforms = it;
        var st = it ? function(e)
            {
                var t = this.startContainer,
                    n = j(t);
                if (!t)
                    throw new k("INVALID_STATE_ERR");
                var r = null;
                return 1 == t.nodeType ? r = t : L(t) && (r = B.parentElement(t)), r = null === r || "HTML" == r.nodeName && B.isHtmlNamespace(j(r).documentElement) && B.isHtmlNamespace(r) ? n.createElement("body") : r.cloneNode(!1), r.innerHTML = e, B.fragmentFromNodeChildren(r)
            } : function(e)
            {
                var t = n(this),
                    r = t.createElement("body");
                return r.innerHTML = e, B.fragmentFromNodeChildren(r)
            },
            ct = ["startContainer", "startOffset", "endContainer", "endOffset", "collapsed", "commonAncestorContainer"],
            dt = 0,
            ft = 1,
            ut = 2,
            lt = 3,
            ht = 0,
            gt = 1,
            pt = 2,
            mt = 3;
        H.extend(e.rangePrototype, {
            compareBoundaryPoints: function(e, t)
            {
                w(this),
                C(this.startContainer, t.startContainer);
                var n,
                    r,
                    o,
                    i,
                    a = e == lt || e == dt ? "start" : "end",
                    s = e == ft || e == dt ? "start" : "end";
                return n = this[a + "Container"], r = this[a + "Offset"], o = t[s + "Container"], i = t[s + "Offset"], z(n, r, o, i)
            }, insertNode: function(e)
                {
                    if (w(this), R(e, K), N(this.startContainer), F(e, this.startContainer))
                        throw new k("HIERARCHY_REQUEST_ERR");
                    var t = a(e, this.startContainer, this.startOffset);
                    this.setStartBefore(t)
                }, cloneContents: function()
                {
                    w(this);
                    var e,
                        t;
                    if (this.collapsed)
                        return n(this).createDocumentFragment();
                    if (this.startContainer === this.endContainer && L(this.startContainer))
                        return e = this.startContainer.cloneNode(!0), e.data = e.data.slice(this.startOffset, this.endOffset), t = n(this).createDocumentFragment(), t.appendChild(e), t;
                    var r = new g(this, !0);
                    return e = c(r), r.detach(), e
                }, canSurroundContents: function()
                {
                    w(this),
                    N(this.startContainer),
                    N(this.endContainer);
                    var e = new g(this, !0),
                        n = e._first && t(e._first, this) || e._last && t(e._last, this);
                    return e.detach(), !n
                }, surroundContents: function(e)
                {
                    if (R(e, et), !this.canSurroundContents())
                        throw new k("INVALID_STATE_ERR");
                    var t = this.extractContents();
                    if (e.hasChildNodes())
                        for (; e.lastChild; )
                            e.removeChild(e.lastChild);
                    a(e, this.startContainer, this.startOffset),
                    e.appendChild(t),
                    this.selectNode(e)
                }, cloneRange: function()
                {
                    w(this);
                    for (var e, t = new I(n(this)), r = ct.length; r--; )
                        e = ct[r],
                        t[e] = this[e];
                    return t
                }, toString: function()
                {
                    w(this);
                    var e = this.startContainer;
                    if (e === this.endContainer && L(e))
                        return 3 == e.nodeType || 4 == e.nodeType ? e.data.slice(this.startOffset, this.endOffset) : "";
                    var t = [],
                        n = new g(this, !0);
                    return d(n, function(e)
                        {
                            (3 == e.nodeType || 4 == e.nodeType) && t.push(e.data)
                        }), n.detach(), t.join("")
                }, compareNode: function(e)
                {
                    w(this);
                    var t = e.parentNode,
                        n = W(e);
                    if (!t)
                        throw new k("NOT_FOUND_ERR");
                    var r = this.comparePoint(t, n),
                        o = this.comparePoint(t, n + 1);
                    return 0 > r ? o > 0 ? pt : ht : o > 0 ? gt : mt
                }, comparePoint: function(e, t)
                {
                    return w(this), E(e, "HIERARCHY_REQUEST_ERR"), C(e, this.startContainer), z(e, t, this.startContainer, this.startOffset) < 0 ? -1 : z(e, t, this.endContainer, this.endOffset) > 0 ? 1 : 0
                }, createContextualFragment: st, toHtml: function()
                {
                    return O(this)
                }, intersectsNode: function(e, t)
                {
                    if (w(this), Q(e) != r(this))
                        return !1;
                    var n = e.parentNode,
                        o = W(e);
                    if (!n)
                        return !0;
                    var i = z(n, o, this.endContainer, this.endOffset),
                        a = z(n, o + 1, this.startContainer, this.startOffset);
                    return t ? 0 >= i && a >= 0 : 0 > i && a > 0
                }, isPointInRange: function(e, t)
                {
                    return w(this), E(e, "HIERARCHY_REQUEST_ERR"), C(e, this.startContainer), z(e, t, this.startContainer, this.startOffset) >= 0 && z(e, t, this.endContainer, this.endOffset) <= 0
                }, intersectsRange: function(e)
                {
                    return s(this, e, !1)
                }, intersectsOrTouchesRange: function(e)
                {
                    return s(this, e, !0)
                }, intersection: function(e)
                {
                    if (this.intersectsRange(e))
                    {
                        var t = z(this.startContainer, this.startOffset, e.startContainer, e.startOffset),
                            n = z(this.endContainer, this.endOffset, e.endContainer, e.endOffset),
                            r = this.cloneRange();
                        return -1 == t && r.setStart(e.startContainer, e.startOffset), 1 == n && r.setEnd(e.endContainer, e.endOffset), r
                    }
                    return null
                }, union: function(e)
                {
                    if (this.intersectsOrTouchesRange(e))
                    {
                        var t = this.cloneRange();
                        return -1 == z(e.startContainer, e.startOffset, this.startContainer, this.startOffset) && t.setStart(e.startContainer, e.startOffset), 1 == z(e.endContainer, e.endOffset, this.endContainer, this.endOffset) && t.setEnd(e.endContainer, e.endOffset), t
                    }
                    throw new k("Ranges do not intersect");
                }, containsNode: function(e, t)
                {
                    return t ? this.intersectsNode(e, !1) : this.compareNode(e) == mt
                }, containsNodeContents: function(e)
                {
                    return this.comparePoint(e, 0) >= 0 && this.comparePoint(e, q(e)) <= 0
                }, containsRange: function(e)
                {
                    var t = this.intersection(e);
                    return null !== t && e.equals(t)
                }, containsNodeText: function(e)
                {
                    var t = this.cloneRange();
                    t.selectNode(e);
                    var n = t.getNodes([3]);
                    if (n.length > 0)
                    {
                        t.setStart(n[0], 0);
                        var r = n.pop();
                        return t.setEnd(r, r.length), this.containsRange(t)
                    }
                    return this.containsNodeContents(e)
                }, getNodes: function(e, t)
                {
                    return w(this), l(this, e, t)
                }, getDocument: function()
                {
                    return n(this)
                }, collapseBefore: function(e)
                {
                    this.setEndBefore(e),
                    this.collapse(!1)
                }, collapseAfter: function(e)
                {
                    this.setStartAfter(e),
                    this.collapse(!0)
                }, getBookmark: function(t)
                {
                    var r = n(this),
                        o = e.createRange(r);
                    t = t || B.getBody(r),
                    o.selectNodeContents(t);
                    var i = this.intersection(o),
                        a = 0,
                        s = 0;
                    return i && (o.setEnd(i.startContainer, i.startOffset), a = o.toString().length, s = a + i.toString().length), {
                            start: a, end: s, containerNode: t
                        }
                }, moveToBookmark: function(e)
                {
                    var t = e.containerNode,
                        n = 0;
                    this.setStart(t, 0),
                    this.collapse(!0);
                    for (var r, o, i, a, s = [t], c = !1, d = !1; !d && (r = s.pop()); )
                        if (3 == r.nodeType)
                            o = n + r.length,
                            !c && e.start >= n && e.start <= o && (this.setStart(r, e.start - n), c = !0),
                            c && e.end >= n && e.end <= o && (this.setEnd(r, e.end - n), d = !0),
                            n = o;
                        else
                            for (a = r.childNodes, i = a.length; i--; )
                                s.push(a[i])
                }, getName: function()
                {
                    return "DomRange"
                }, equals: function(e)
                {
                    return I.rangesEqual(this, e)
                }, isValid: function()
                {
                    return y(this)
                }, inspect: function()
                {
                    return h(this)
                }, detach: function(){}
        }),
        x(I, P),
        H.extend(I, {
            rangeProperties: ct, RangeIterator: g, copyComparisonConstants: D, createPrototypeRange: x, inspect: h, toHtml: O, getRangeDocument: n, rangesEqual: function(e, t)
                {
                    return e.startContainer === t.startContainer && e.startOffset === t.startOffset && e.endContainer === t.endContainer && e.endOffset === t.endOffset
                }
        }),
        e.DomRange = I
    }),
    I.createCoreModule("WrappedRange", ["DomRange"], function(e, t)
    {
        var n,
            r,
            o = e.dom,
            i = e.util,
            a = o.DomPosition,
            s = e.DomRange,
            c = o.getBody,
            d = o.getContentDocument,
            f = o.isCharacterDataNode;
        if (e.features.implementsDomRange && !function()
        {
            function r(e)
            {
                for (var t, n = l.length; n--; )
                    t = l[n],
                    e[t] = e.nativeRange[t];
                e.collapsed = e.startContainer === e.endContainer && e.startOffset === e.endOffset
            }
            function a(e, t, n, r, o)
            {
                var i = e.startContainer !== t || e.startOffset != n,
                    a = e.endContainer !== r || e.endOffset != o,
                    s = !e.equals(e.nativeRange);
                (i || a || s) && (e.setEnd(r, o), e.setStart(t, n))
            }
            var f,
                u,
                l = s.rangeProperties;
            n = function(e)
            {
                if (!e)
                    throw t.createError("WrappedRange: Range must be specified");
                this.nativeRange = e,
                r(this)
            },
            s.createPrototypeRange(n, a),
            f = n.prototype,
            f.selectNode = function(e)
            {
                this.nativeRange.selectNode(e),
                r(this)
            },
            f.cloneContents = function()
            {
                return this.nativeRange.cloneContents()
            },
            f.surroundContents = function(e)
            {
                this.nativeRange.surroundContents(e),
                r(this)
            },
            f.collapse = function(e)
            {
                this.nativeRange.collapse(e),
                r(this)
            },
            f.cloneRange = function()
            {
                return new n(this.nativeRange.cloneRange())
            },
            f.refresh = function()
            {
                r(this)
            },
            f.toString = function()
            {
                return this.nativeRange.toString()
            };
            var h = document.createTextNode("test");
            c(document).appendChild(h);
            var g = document.createRange();
            g.setStart(h, 0),
            g.setEnd(h, 0);
            try
            {
                g.setStart(h, 1),
                f.setStart = function(e, t)
                {
                    this.nativeRange.setStart(e, t),
                    r(this)
                },
                f.setEnd = function(e, t)
                {
                    this.nativeRange.setEnd(e, t),
                    r(this)
                },
                u = function(e)
                {
                    return function(t)
                        {
                            this.nativeRange[e](t),
                            r(this)
                        }
                }
            }
            catch(p)
            {
                f.setStart = function(e, t)
                {
                    try
                    {
                        this.nativeRange.setStart(e, t)
                    }
                    catch(n)
                    {
                        this.nativeRange.setEnd(e, t),
                        this.nativeRange.setStart(e, t)
                    }
                    r(this)
                },
                f.setEnd = function(e, t)
                {
                    try
                    {
                        this.nativeRange.setEnd(e, t)
                    }
                    catch(n)
                    {
                        this.nativeRange.setStart(e, t),
                        this.nativeRange.setEnd(e, t)
                    }
                    r(this)
                },
                u = function(e, t)
                {
                    return function(n)
                        {
                            try
                            {
                                this.nativeRange[e](n)
                            }
                            catch(o)
                            {
                                this.nativeRange[t](n),
                                this.nativeRange[e](n)
                            }
                            r(this)
                        }
                }
            }
            f.setStartBefore = u("setStartBefore", "setEndBefore"),
            f.setStartAfter = u("setStartAfter", "setEndAfter"),
            f.setEndBefore = u("setEndBefore", "setStartBefore"),
            f.setEndAfter = u("setEndAfter", "setStartAfter"),
            f.selectNodeContents = function(e)
            {
                this.setStartAndEnd(e, 0, o.getNodeLength(e))
            },
            g.selectNodeContents(h),
            g.setEnd(h, 3);
            var m = document.createRange();
            m.selectNodeContents(h),
            m.setEnd(h, 4),
            m.setStart(h, 2),
            f.compareBoundaryPoints = -1 == g.compareBoundaryPoints(g.START_TO_END, m) && 1 == g.compareBoundaryPoints(g.END_TO_START, m) ? function(e, t)
            {
                return t = t.nativeRange || t, e == t.START_TO_END ? e = t.END_TO_START : e == t.END_TO_START && (e = t.START_TO_END), this.nativeRange.compareBoundaryPoints(e, t)
            } : function(e, t)
            {
                return this.nativeRange.compareBoundaryPoints(e, t.nativeRange || t)
            };
            var R = document.createElement("div");
            R.innerHTML = "123";
            var v = R.firstChild,
                C = c(document);
            C.appendChild(R),
            g.setStart(v, 1),
            g.setEnd(v, 2),
            g.deleteContents(),
            "13" == v.data && (f.deleteContents = function()
            {
                this.nativeRange.deleteContents(),
                r(this)
            }, f.extractContents = function()
            {
                var e = this.nativeRange.extractContents();
                return r(this), e
            }),
            C.removeChild(R),
            C = null,
            i.isHostMethod(g, "createContextualFragment") && (f.createContextualFragment = function(e)
            {
                return this.nativeRange.createContextualFragment(e)
            }),
            c(document).removeChild(h),
            f.getName = function()
            {
                return "WrappedRange"
            },
            e.WrappedRange = n,
            e.createNativeRange = function(e)
            {
                return e = d(e, t, "createNativeRange"), e.createRange()
            }
        }(), e.features.implementsTextRange)
        {
            var u = function(e)
                {
                    var t = e.parentElement(),
                        n = e.duplicate();
                    n.collapse(!0);
                    var r = n.parentElement();
                    n = e.duplicate(),
                    n.collapse(!1);
                    var i = n.parentElement(),
                        a = r == i ? r : o.getCommonAncestor(r, i);
                    return a == t ? a : o.getCommonAncestor(t, a)
                },
                l = function(e)
                {
                    return 0 == e.compareEndPoints("StartToEnd", e)
                },
                h = function(e, t, n, r, i)
                {
                    var s = e.duplicate();
                    s.collapse(n);
                    var c = s.parentElement();
                    if (o.isOrIsAncestorOf(t, c) || (c = t), !c.canHaveHTML)
                    {
                        var d = new a(c.parentNode, o.getNodeIndex(c));
                        return {
                                boundaryPosition: d, nodeInfo: {
                                        nodeIndex: d.offset, containerElement: d.node
                                    }
                            }
                    }
                    var u = o.getDocument(c).createElement("span");
                    u.parentNode && o.removeNode(u);
                    for (var l, h, g, p, m, R = n ? "StartToStart" : "StartToEnd", v = i && i.containerElement == c ? i.nodeIndex : 0, C = c.childNodes.length, N = C, E = N; ; )
                    {
                        if (E == C ? c.appendChild(u) : c.insertBefore(u, c.childNodes[E]), s.moveToElementText(u), l = s.compareEndPoints(R, e), 0 == l || v == N)
                            break;
                        if (-1 == l)
                        {
                            if (N == v + 1)
                                break;
                            v = E
                        }
                        else
                            N = N == v + 1 ? v : E;
                        E = Math.floor((v + N) / 2),
                        c.removeChild(u)
                    }
                    if (m = u.nextSibling, -1 == l && m && f(m))
                    {
                        s.setEndPoint(n ? "EndToStart" : "EndToEnd", e);
                        var S;
                        if (/[\r\n]/.test(m.data))
                        {
                            var y = s.duplicate(),
                                w = y.text.replace(/\r\n/g, "\r").length;
                            for (S = y.moveStart("character", w); -1 == (l = y.compareEndPoints("StartToEnd", y)); )
                                S++,
                                y.moveStart("character", 1)
                        }
                        else
                            S = s.text.length;
                        p = new a(m, S)
                    }
                    else
                        h = (r || !n) && u.previousSibling,
                        g = (r || n) && u.nextSibling,
                        p = g && f(g) ? new a(g, 0) : h && f(h) ? new a(h, h.data.length) : new a(c, o.getNodeIndex(u));
                    return o.removeNode(u), {
                            boundaryPosition: p, nodeInfo: {
                                    nodeIndex: E, containerElement: c
                                }
                        }
                },
                g = function(e, t)
                {
                    var n,
                        r,
                        i,
                        a,
                        s = e.offset,
                        d = o.getDocument(e.node),
                        u = c(d).createTextRange(),
                        l = f(e.node);
                    return l ? (n = e.node, r = n.parentNode) : (a = e.node.childNodes, n = s < a.length ? a[s] : null, r = e.node), i = d.createElement("span"), i.innerHTML = "&#feff;", n ? r.insertBefore(i, n) : r.appendChild(i), u.moveToElementText(i), u.collapse(!t), r.removeChild(i), l && u[t ? "moveStart" : "moveEnd"]("character", s), u
                };
            r = function(e)
            {
                this.textRange = e,
                this.refresh()
            },
            r.prototype = new s(document),
            r.prototype.refresh = function()
            {
                var e,
                    t,
                    n,
                    r = u(this.textRange);
                l(this.textRange) ? t = e = h(this.textRange, r, !0, !0).boundaryPosition : (n = h(this.textRange, r, !0, !1), e = n.boundaryPosition, t = h(this.textRange, r, !1, !1, n.nodeInfo).boundaryPosition),
                this.setStart(e.node, e.offset),
                this.setEnd(t.node, t.offset)
            },
            r.prototype.getName = function()
            {
                return "WrappedTextRange"
            },
            s.copyComparisonConstants(r);
            var p = function(e)
                {
                    if (e.collapsed)
                        return g(new a(e.startContainer, e.startOffset), !0);
                    var t = g(new a(e.startContainer, e.startOffset), !0),
                        n = g(new a(e.endContainer, e.endOffset), !1),
                        r = c(s.getRangeDocument(e)).createTextRange();
                    return r.setEndPoint("StartToStart", t), r.setEndPoint("EndToEnd", n), r
                };
            if (r.rangeToTextRange = p, r.prototype.toTextRange = function()
            {
                return p(this)
            }, e.WrappedTextRange = r, !e.features.implementsDomRange || e.config.preferTextRange)
            {
                var m = function(e)
                    {
                        return e("return this;")()
                    }(Function);
                "undefined" == typeof m.Range && (m.Range = r),
                e.createNativeRange = function(e)
                {
                    return e = d(e, t, "createNativeRange"), c(e).createTextRange()
                },
                e.WrappedRange = r
            }
        }
        e.createRange = function(n)
        {
            return n = d(n, t, "createRange"), new e.WrappedRange(e.createNativeRange(n))
        },
        e.createRangyRange = function(e)
        {
            return e = d(e, t, "createRangyRange"), new s(e)
        },
        i.createAliasForDeprecatedMethod(e, "createIframeRange", "createRange"),
        i.createAliasForDeprecatedMethod(e, "createIframeRangyRange", "createRangyRange"),
        e.addShimListener(function(t)
        {
            var n = t.document;
            "undefined" == typeof n.createRange && (n.createRange = function()
            {
                return e.createRange(n)
            }),
            n = t = null
        })
    }),
    I.createCoreModule("WrappedSelection", ["DomRange", "WrappedRange"], function(e, t)
    {
        function n(e)
        {
            return "string" == typeof e ? /^backward(s)?$/i.test(e) : !!e
        }
        function r(e, n)
        {
            if (e)
            {
                if (D.isWindow(e))
                    return e;
                if (e instanceof R)
                    return e.win;
                var r = D.getContentDocument(e, t, n);
                return D.getWindow(r)
            }
            return window
        }
        function o(e)
        {
            return r(e, "getWinSelection").getSelection()
        }
        function i(e)
        {
            return r(e, "getDocSelection").document.selection
        }
        function a(e)
        {
            var t = !1;
            return e.anchorNode && (t = 1 == D.comparePoints(e.anchorNode, e.anchorOffset, e.focusNode, e.focusOffset)), t
        }
        function s(e, t, n)
        {
            var r = n ? "end" : "start",
                o = n ? "start" : "end";
            e.anchorNode = t[r + "Container"],
            e.anchorOffset = t[r + "Offset"],
            e.focusNode = t[o + "Container"],
            e.focusOffset = t[o + "Offset"]
        }
        function c(e)
        {
            var t = e.nativeSelection;
            e.anchorNode = t.anchorNode,
            e.anchorOffset = t.anchorOffset,
            e.focusNode = t.focusNode,
            e.focusOffset = t.focusOffset
        }
        function d(e)
        {
            e.anchorNode = e.focusNode = null,
            e.anchorOffset = e.focusOffset = 0,
            e.rangeCount = 0,
            e.isCollapsed = !0,
            e._ranges.length = 0
        }
        function f(t)
        {
            var n;
            return t instanceof b ? (n = e.createNativeRange(t.getDocument()), n.setEnd(t.endContainer, t.endOffset), n.setStart(t.startContainer, t.startOffset)) : t instanceof P ? n = t.nativeRange : H.implementsDomRange && t instanceof D.getWindow(t.startContainer).Range && (n = t), n
        }
        function u(e)
        {
            if (!e.length || 1 != e[0].nodeType)
                return !1;
            for (var t = 1, n = e.length; n > t; ++t)
                if (!D.isAncestorOf(e[0], e[t]))
                    return !1;
            return !0
        }
        function l(e)
        {
            var n = e.getNodes();
            if (!u(n))
                throw t.createError("getSingleElementFromRange: range " + e.inspect() + " did not consist of a single element");
            return n[0]
        }
        function h(e)
        {
            return !!e && "undefined" != typeof e.text
        }
        function g(e, t)
        {
            var n = new P(t);
            e._ranges = [n],
            s(e, n, !1),
            e.rangeCount = 1,
            e.isCollapsed = n.collapsed
        }
        function p(t)
        {
            if (t._ranges.length = 0, "None" == t.docSelection.type)
                d(t);
            else
            {
                var n = t.docSelection.createRange();
                if (h(n))
                    g(t, n);
                else
                {
                    t.rangeCount = n.length;
                    for (var r, o = k(n.item(0)), i = 0; i < t.rangeCount; ++i)
                        r = e.createRange(o),
                        r.selectNode(n.item(i)),
                        t._ranges.push(r);
                    t.isCollapsed = 1 == t.rangeCount && t._ranges[0].collapsed,
                    s(t, t._ranges[t.rangeCount - 1], !1)
                }
            }
        }
        function m(e, n)
        {
            for (var r = e.docSelection.createRange(), o = l(n), i = k(r.item(0)), a = L(i).createControlRange(), s = 0, c = r.length; c > s; ++s)
                a.add(r.item(s));
            try
            {
                a.add(o)
            }
            catch(d)
            {
                throw t.createError("addRange(): Element within the specified Range could not be added to control selection (does it have layout?)");
            }
            a.select(),
            p(e)
        }
        function R(e, t, n)
        {
            this.nativeSelection = e,
            this.docSelection = t,
            this._ranges = [],
            this.win = n,
            this.refresh()
        }
        function v(e)
        {
            e.win = e.anchorNode = e.focusNode = e._ranges = null,
            e.rangeCount = e.anchorOffset = e.focusOffset = 0,
            e.detached = !0
        }
        function C(e, t)
        {
            for (var n, r, o = tt.length; o--; )
                if (n = tt[o], r = n.selection, "deleteAll" == t)
                    v(r);
                else if (n.win == e)
                    return "delete" == t ? (tt.splice(o, 1), !0) : r;
            return "deleteAll" == t && (tt.length = 0), null
        }
        function N(e, n)
        {
            for (var r, o = k(n[0].startContainer), i = L(o).createControlRange(), a = 0, s = n.length; s > a; ++a)
            {
                r = l(n[a]);
                try
                {
                    i.add(r)
                }
                catch(c)
                {
                    throw t.createError("setRanges(): Element within one of the specified Ranges could not be added to control selection (does it have layout?)");
                }
            }
            i.select(),
            p(e)
        }
        function E(e, t)
        {
            if (e.win.document != k(t))
                throw new I("WRONG_DOCUMENT_ERR");
        }
        function S(t)
        {
            return function(n, r)
                {
                    var o;
                    this.rangeCount ? (o = this.getRangeAt(0), o["set" + (t ? "Start" : "End")](n, r)) : (o = e.createRange(this.win.document), o.setStartAndEnd(n, r)),
                    this.setSingleRange(o, this.isBackward())
                }
        }
        function y(e)
        {
            var t = [],
                n = new B(e.anchorNode, e.anchorOffset),
                r = new B(e.focusNode, e.focusOffset),
                o = "function" == typeof e.getName ? e.getName() : "Selection";
            if ("undefined" != typeof e.rangeCount)
                for (var i = 0, a = e.rangeCount; a > i; ++i)
                    t[i] = b.inspect(e.getRangeAt(i));
            return "[" + o + "(Ranges: " + t.join(", ") + ")(anchor: " + n.inspect() + ", focus: " + r.inspect() + "]"
        }
        e.config.checkSelectionRanges = !0;
        var w,
            T,
            O = "boolean",
            _ = "number",
            D = e.dom,
            A = e.util,
            x = A.isHostMethod,
            b = e.DomRange,
            P = e.WrappedRange,
            I = e.DOMException,
            B = D.DomPosition,
            H = e.features,
            M = "Control",
            k = D.getDocument,
            L = D.getBody,
            W = b.rangesEqual,
            F = x(window, "getSelection"),
            j = A.isHostObject(document, "selection");
        H.implementsWinGetSelection = F,
        H.implementsDocSelection = j;
        var z = j && (!F || e.config.preferTextRange);
        if (z)
            w = i,
            e.isSelectionValid = function(e)
            {
                var t = r(e, "isSelectionValid").document,
                    n = t.selection;
                return "None" != n.type || k(n.createRange().parentElement()) == t
            };
        else
        {
            if (!F)
                return t.fail("Neither document.selection or window.getSelection() detected."), !1;
            w = o,
            e.isSelectionValid = function()
            {
                return !0
            }
        }
        e.getNativeSelection = w;
        var U = w();
        if (!U)
            return t.fail("Native selection was null (possibly issue 138?)"), !1;
        var V = e.createNativeRange(document),
            q = L(document),
            Y = A.areHostProperties(U, ["anchorNode", "focusNode", "anchorOffset", "focusOffset"]);
        H.selectionHasAnchorAndFocus = Y;
        var Q = x(U, "extend");
        H.selectionHasExtend = Q;
        var G = typeof U.rangeCount == _;
        H.selectionHasRangeCount = G;
        var X = !1,
            Z = !0,
            $ = Q ? function(t, n)
            {
                var r = b.getRangeDocument(n),
                    o = e.createRange(r);
                o.collapseToPoint(n.endContainer, n.endOffset),
                t.addRange(f(o)),
                t.extend(n.startContainer, n.startOffset)
            } : null;
        A.areHostMethods(U, ["addRange", "getRangeAt", "removeAllRanges"]) && typeof U.rangeCount == _ && H.implementsDomRange && !function()
        {
            var t = window.getSelection();
            if (t)
            {
                for (var n = t.rangeCount, r = n > 1, o = [], i = a(t), s = 0; n > s; ++s)
                    o[s] = t.getRangeAt(s);
                var c = D.createTestElement(document, "", !1),
                    d = c.appendChild(document.createTextNode("   ")),
                    f = document.createRange();
                if (f.setStart(d, 1), f.collapse(!0), t.removeAllRanges(), t.addRange(f), Z = 1 == t.rangeCount, t.removeAllRanges(), !r)
                {
                    var u = window.navigator.appVersion.match(/Chrome\/(.*?) /);
                    if (u && parseInt(u[1]) >= 36)
                        X = !1;
                    else
                    {
                        var l = f.cloneRange();
                        f.setStart(d, 0),
                        l.setEnd(d, 3),
                        l.setStart(d, 2),
                        t.addRange(f),
                        t.addRange(l),
                        X = 2 == t.rangeCount
                    }
                }
                for (D.removeNode(c), t.removeAllRanges(), s = 0; n > s; ++s)
                    0 == s && i ? $ ? $(t, o[s]) : (e.warn("Rangy initialization: original selection was backwards but selection has been restored forwards because the browser does not support Selection.extend"), t.addRange(o[s])) : t.addRange(o[s])
            }
        }(),
        H.selectionSupportsMultipleRanges = X,
        H.collapsedNonEditableSelectionsSupported = Z;
        var J,
            K = !1;
        q && x(q, "createControlRange") && (J = q.createControlRange(), A.areHostProperties(J, ["item", "add"]) && (K = !0)),
        H.implementsControlRange = K,
        T = Y ? function(e)
        {
            return e.anchorNode === e.focusNode && e.anchorOffset === e.focusOffset
        } : function(e)
        {
            return e.rangeCount ? e.getRangeAt(e.rangeCount - 1).collapsed : !1
        };
        var et;
        x(U, "getRangeAt") ? et = function(e, t)
        {
            try
            {
                return e.getRangeAt(t)
            }
            catch(n)
            {
                return null
            }
        } : Y && (et = function(t)
        {
            var n = k(t.anchorNode),
                r = e.createRange(n);
            return r.setStartAndEnd(t.anchorNode, t.anchorOffset, t.focusNode, t.focusOffset), r.collapsed !== this.isCollapsed && r.setStartAndEnd(t.focusNode, t.focusOffset, t.anchorNode, t.anchorOffset), r
        }),
        R.prototype = e.selectionPrototype;
        var tt = [],
            nt = function(e)
            {
                if (e && e instanceof R)
                    return e.refresh(), e;
                e = r(e, "getNativeSelection");
                var t = C(e),
                    n = w(e),
                    o = j ? i(e) : null;
                return t ? (t.nativeSelection = n, t.docSelection = o, t.refresh()) : (t = new R(n, o, e), tt.push({
                        win: e, selection: t
                    })), t
            };
        e.getSelection = nt,
        A.createAliasForDeprecatedMethod(e, "getIframeSelection", "getSelection");
        var rt = R.prototype;
        if (!z && Y && A.areHostMethods(U, ["removeAllRanges", "addRange"]))
        {
            rt.removeAllRanges = function()
            {
                this.nativeSelection.removeAllRanges(),
                d(this)
            };
            var ot = function(e, t)
                {
                    $(e.nativeSelection, t),
                    e.refresh()
                };
            rt.addRange = G ? function(t, r)
            {
                if (K && j && this.docSelection.type == M)
                    m(this, t);
                else if (n(r) && Q)
                    ot(this, t);
                else
                {
                    var o;
                    X ? o = this.rangeCount : (this.removeAllRanges(), o = 0);
                    var i = f(t).cloneRange();
                    try
                    {
                        this.nativeSelection.addRange(i)
                    }
                    catch(a) {}
                    if (this.rangeCount = this.nativeSelection.rangeCount, this.rangeCount == o + 1)
                    {
                        if (e.config.checkSelectionRanges)
                        {
                            var c = et(this.nativeSelection, this.rangeCount - 1);
                            c && !W(c, t) && (t = new P(c))
                        }
                        this._ranges[this.rangeCount - 1] = t,
                        s(this, t, st(this.nativeSelection)),
                        this.isCollapsed = T(this)
                    }
                    else
                        this.refresh()
                }
            } : function(e, t)
            {
                n(t) && Q ? ot(this, e) : (this.nativeSelection.addRange(f(e)), this.refresh())
            },
            rt.setRanges = function(e)
            {
                if (K && j && e.length > 1)
                    N(this, e);
                else
                {
                    this.removeAllRanges();
                    for (var t = 0, n = e.length; n > t; ++t)
                        this.addRange(e[t])
                }
            }
        }
        else
        {
            if (!(x(U, "empty") && x(V, "select") && K && z))
                return t.fail("No means of selecting a Range or TextRange was found"), !1;
            rt.removeAllRanges = function()
            {
                try
                {
                    if (this.docSelection.empty(), "None" != this.docSelection.type)
                    {
                        var e;
                        if (this.anchorNode)
                            e = k(this.anchorNode);
                        else if (this.docSelection.type == M)
                        {
                            var t = this.docSelection.createRange();
                            t.length && (e = k(t.item(0)))
                        }
                        if (e)
                        {
                            var n = L(e).createTextRange();
                            n.select(),
                            this.docSelection.empty()
                        }
                    }
                }
                catch(r) {}
                d(this)
            },
            rt.addRange = function(t)
            {
                this.docSelection.type == M ? m(this, t) : (e.WrappedTextRange.rangeToTextRange(t).select(), this._ranges[0] = t, this.rangeCount = 1, this.isCollapsed = this._ranges[0].collapsed, s(this, t, !1))
            },
            rt.setRanges = function(e)
            {
                this.removeAllRanges();
                var t = e.length;
                t > 1 ? N(this, e) : t && this.addRange(e[0])
            }
        }
        rt.getRangeAt = function(e)
        {
            if (0 > e || e >= this.rangeCount)
                throw new I("INDEX_SIZE_ERR");
            return this._ranges[e].cloneRange()
        };
        var it;
        if (z)
            it = function(t)
            {
                var n;
                e.isSelectionValid(t.win) ? n = t.docSelection.createRange() : (n = L(t.win.document).createTextRange(), n.collapse(!0)),
                t.docSelection.type == M ? p(t) : h(n) ? g(t, n) : d(t)
            };
        else if (x(U, "getRangeAt") && typeof U.rangeCount == _)
            it = function(t)
            {
                if (K && j && t.docSelection.type == M)
                    p(t);
                else if (t._ranges.length = t.rangeCount = t.nativeSelection.rangeCount, t.rangeCount)
                {
                    for (var n = 0, r = t.rangeCount; r > n; ++n)
                        t._ranges[n] = new e.WrappedRange(t.nativeSelection.getRangeAt(n));
                    s(t, t._ranges[t.rangeCount - 1], st(t.nativeSelection)),
                    t.isCollapsed = T(t)
                }
                else
                    d(t)
            };
        else
        {
            if (!Y || typeof U.isCollapsed != O || typeof V.collapsed != O || !H.implementsDomRange)
                return t.fail("No means of obtaining a Range or TextRange from the user's selection was found"), !1;
            it = function(e)
            {
                var t,
                    n = e.nativeSelection;
                n.anchorNode ? (t = et(n, 0), e._ranges = [t], e.rangeCount = 1, c(e), e.isCollapsed = T(e)) : d(e)
            }
        }
        rt.refresh = function(e)
        {
            var t = e ? this._ranges.slice(0) : null,
                n = this.anchorNode,
                r = this.anchorOffset;
            if (it(this), e)
            {
                var o = t.length;
                if (o != this._ranges.length)
                    return !0;
                if (this.anchorNode != n || this.anchorOffset != r)
                    return !0;
                for (; o--; )
                    if (!W(t[o], this._ranges[o]))
                        return !0;
                return !1
            }
        };
        var at = function(e, t)
            {
                var n = e.getAllRanges();
                e.removeAllRanges();
                for (var r = 0, o = n.length; o > r; ++r)
                    W(t, n[r]) || e.addRange(n[r]);
                e.rangeCount || d(e)
            };
        rt.removeRange = K && j ? function(e)
        {
            if (this.docSelection.type == M)
            {
                for (var t, n = this.docSelection.createRange(), r = l(e), o = k(n.item(0)), i = L(o).createControlRange(), a = !1, s = 0, c = n.length; c > s; ++s)
                    t = n.item(s),
                    t !== r || a ? i.add(n.item(s)) : a = !0;
                i.select(),
                p(this)
            }
            else
                at(this, e)
        } : function(e)
        {
            at(this, e)
        };
        var st;
        !z && Y && H.implementsDomRange ? (st = a, rt.isBackward = function()
        {
            return st(this)
        }) : st = rt.isBackward = function()
        {
            return !1
        },
        rt.isBackwards = rt.isBackward,
        rt.toString = function()
        {
            for (var e = [], t = 0, n = this.rangeCount; n > t; ++t)
                e[t] = "" + this._ranges[t];
            return e.join("")
        },
        rt.collapse = function(t, n)
        {
            E(this, t);
            var r = e.createRange(t);
            r.collapseToPoint(t, n),
            this.setSingleRange(r),
            this.isCollapsed = !0
        },
        rt.collapseToStart = function()
        {
            if (!this.rangeCount)
                throw new I("INVALID_STATE_ERR");
            var e = this._ranges[0];
            this.collapse(e.startContainer, e.startOffset)
        },
        rt.collapseToEnd = function()
        {
            if (!this.rangeCount)
                throw new I("INVALID_STATE_ERR");
            var e = this._ranges[this.rangeCount - 1];
            this.collapse(e.endContainer, e.endOffset)
        },
        rt.selectAllChildren = function(t)
        {
            E(this, t);
            var n = e.createRange(t);
            n.selectNodeContents(t),
            this.setSingleRange(n)
        },
        rt.deleteFromDocument = function()
        {
            if (K && j && this.docSelection.type == M)
            {
                for (var e, t = this.docSelection.createRange(); t.length; )
                    e = t.item(0),
                    t.remove(e),
                    D.removeNode(e);
                this.refresh()
            }
            else if (this.rangeCount)
            {
                var n = this.getAllRanges();
                if (n.length)
                {
                    this.removeAllRanges();
                    for (var r = 0, o = n.length; o > r; ++r)
                        n[r].deleteContents();
                    this.addRange(n[o - 1])
                }
            }
        },
        rt.eachRange = function(e, t)
        {
            for (var n = 0, r = this._ranges.length; r > n; ++n)
                if (e(this.getRangeAt(n)))
                    return t
        },
        rt.getAllRanges = function()
        {
            var e = [];
            return this.eachRange(function(t)
                {
                    e.push(t)
                }), e
        },
        rt.setSingleRange = function(e, t)
        {
            this.removeAllRanges(),
            this.addRange(e, t)
        },
        rt.callMethodOnEachRange = function(e, t)
        {
            var n = [];
            return this.eachRange(function(r)
                {
                    n.push(r[e].apply(r, t || []))
                }), n
        },
        rt.setStart = S(!0),
        rt.setEnd = S(!1),
        e.rangePrototype.select = function(e)
        {
            nt(this.getDocument()).setSingleRange(this, e)
        },
        rt.changeEachRange = function(e)
        {
            var t = [],
                n = this.isBackward();
            this.eachRange(function(n)
            {
                e(n),
                t.push(n)
            }),
            this.removeAllRanges(),
            n && 1 == t.length ? this.addRange(t[0], "backward") : this.setRanges(t)
        },
        rt.containsNode = function(e, t)
        {
            return this.eachRange(function(n)
                {
                    return n.containsNode(e, t)
                }, !0) || !1
        },
        rt.getBookmark = function(e)
        {
            return {
                    backward: this.isBackward(), rangeBookmarks: this.callMethodOnEachRange("getBookmark", [e])
                }
        },
        rt.moveToBookmark = function(t)
        {
            for (var n, r, o = [], i = 0; n = t.rangeBookmarks[i++]; )
                r = e.createRange(this.win),
                r.moveToBookmark(n),
                o.push(r);
            t.backward ? this.setSingleRange(o[0], "backward") : this.setRanges(o)
        },
        rt.saveRanges = function()
        {
            return {
                    backward: this.isBackward(), ranges: this.callMethodOnEachRange("cloneRange")
                }
        },
        rt.restoreRanges = function(e)
        {
            this.removeAllRanges();
            for (var t, n = 0; t = e.ranges[n]; ++n)
                this.addRange(t, e.backward && 0 == n)
        },
        rt.toHtml = function()
        {
            var e = [];
            return this.eachRange(function(t)
                {
                    e.push(b.toHtml(t))
                }), e.join("")
        },
        H.implementsTextRange && (rt.getNativeTextRange = function()
        {
            var n;
            if (n = this.docSelection)
            {
                var r = n.createRange();
                if (h(r))
                    return r;
                throw t.createError("getNativeTextRange: selection is a control selection");
            }
            if (this.rangeCount > 0)
                return e.WrappedTextRange.rangeToTextRange(this.getRangeAt(0));
            throw t.createError("getNativeTextRange: selection contains no range");
        }),
        rt.getName = function()
        {
            return "WrappedSelection"
        },
        rt.inspect = function()
        {
            return y(this)
        },
        rt.detach = function()
        {
            C(this.win, "delete"),
            v(this)
        },
        R.detachAll = function()
        {
            C(null, "deleteAll")
        },
        R.inspect = y,
        R.isDirectionBackward = n,
        e.Selection = R,
        e.selectionPrototype = rt,
        e.addShimListener(function(e)
        {
            "undefined" == typeof e.getSelection && (e.getSelection = function()
            {
                return nt(e)
            }),
            e = null
        })
    });
    var L = !1,
        W = function()
        {
            L || (L = !0, !I.initialized && I.config.autoInitialize && u())
        };
    return b && ("complete" == document.readyState ? W() : (e(document, "addEventListener") && document.addEventListener("DOMContentLoaded", W, !1), H(window, "load", W))), I
}, this);
!function(e, n)
{
    "function" == typeof define && define.amd ? define(["./rangy-core"], e) : "undefined" != typeof module && "object" == typeof exports ? module.exports = e(require("rangy")) : e(n.rangy)
}(function(e)
{
    return e.createModule("SaveRestore", ["WrappedRange"], function(e, n)
        {
            function r(e, n)
            {
                return (n || document).getElementById(e)
            }
            function t(e, n)
            {
                var r,
                    t = "selectionBoundary_" + +new Date + "_" + ("" + Math.random()).slice(2),
                    a = m.getDocument(e.startContainer),
                    o = e.cloneRange();
                return o.collapse(n), r = a.createElement("span"), r.id = t, r.style.lineHeight = "0", r.style.display = "none", r.className = "rangySelectionBoundary", r.appendChild(a.createTextNode(k)), o.insertNode(r), r
            }
            function a(e, t, a, o)
            {
                var s = r(a, e);
                s ? (t[o ? "setStartBefore" : "setEndBefore"](s), p(s)) : n.warn("Marker element has been removed. Cannot restore selection.")
            }
            function o(e, n)
            {
                return n.compareBoundaryPoints(e.START_TO_START, e)
            }
            function s(n, r)
            {
                var a,
                    o,
                    s = e.DomRange.getRangeDocument(n),
                    i = n.toString(),
                    d = v(r);
                return n.collapsed ? (o = t(n, !1), {
                        document: s, markerId: o.id, collapsed: !0
                    }) : (o = t(n, !1), a = t(n, !0), {
                            document: s, startMarkerId: a.id, endMarkerId: o.id, collapsed: !1, backward: d, toString: function()
                                {
                                    return "original text: '" + i + "', new text: '" + n.toString() + "'"
                                }
                        })
            }
            function i(t, o)
            {
                var s = t.document;
                "undefined" == typeof o && (o = !0);
                var i = e.createRange(s);
                if (t.collapsed)
                {
                    var d = r(t.markerId, s);
                    if (d)
                    {
                        d.style.display = "inline";
                        var l = d.previousSibling;
                        l && 3 == l.nodeType ? (p(d), i.collapseToPoint(l, l.length)) : (i.collapseBefore(d), p(d))
                    }
                    else
                        n.warn("Marker element has been removed. Cannot restore selection.")
                }
                else
                    a(s, i, t.startMarkerId, !0),
                    a(s, i, t.endMarkerId, !1);
                return o && i.normalizeBoundaries(), i
            }
            function d(n, t)
            {
                var a,
                    i,
                    d = [],
                    l = v(t);
                n = n.slice(0),
                n.sort(o);
                for (var c = 0, u = n.length; u > c; ++c)
                    d[c] = s(n[c], l);
                for (c = u - 1; c >= 0; --c)
                    a = n[c],
                    i = e.DomRange.getRangeDocument(a),
                    a.collapsed ? a.collapseAfter(r(d[c].markerId, i)) : (a.setEndBefore(r(d[c].endMarkerId, i)), a.setStartAfter(r(d[c].startMarkerId, i)));
                return d
            }
            function l(r)
            {
                if (!e.isSelectionValid(r))
                    return n.warn("Cannot save selection. This usually happens when the selection is collapsed and the selection document has lost focus."), null;
                var t = e.getSelection(r),
                    a = t.getAllRanges(),
                    o = 1 == a.length && t.isBackward(),
                    s = d(a, o);
                return o ? t.setSingleRange(a[0], o) : t.setRanges(a), {
                        win: r, rangeInfos: s, restored: !1
                    }
            }
            function c(e)
            {
                for (var n = [], r = e.length, t = r - 1; t >= 0; t--)
                    n[t] = i(e[t], !0);
                return n
            }
            function u(n, r)
            {
                if (!n.restored)
                {
                    var t = n.rangeInfos,
                        a = e.getSelection(n.win),
                        o = c(t),
                        s = t.length;
                    1 == s && r && e.features.selectionHasExtend && t[0].backward ? (a.removeAllRanges(), a.addRange(o[0], !0)) : a.setRanges(o),
                    n.restored = !0
                }
            }
            function f(e, n)
            {
                var t = r(n, e);
                t && p(t)
            }
            function g(e)
            {
                for (var n, r = e.rangeInfos, t = 0, a = r.length; a > t; ++t)
                    n = r[t],
                    n.collapsed ? f(e.doc, n.markerId) : (f(e.doc, n.startMarkerId), f(e.doc, n.endMarkerId))
            }
            var m = e.dom,
                p = m.removeNode,
                v = e.Selection.isDirectionBackward,
                k = "﻿";
            e.util.extend(e, {
                saveRange: s, restoreRange: i, saveRanges: d, restoreRanges: c, saveSelection: l, restoreSelection: u, removeMarkerElement: f, removeMarkers: g
            })
        }), e
}, this);
angular.module('textAngularSetup', []).value('taOptions', {
    forceTextAngularSanitize: true, keyMappings: [], toolbar: [['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'quote'], ['bold', 'italics', 'underline', 'strikeThrough', 'ul', 'ol', 'redo', 'undo', 'clear'], ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull', 'indent', 'outdent'], ['html', 'insertImage', 'insertLink', 'insertVideo', 'wordcount', 'charcount']], classes: {
            focussed: "focussed", toolbar: "btn-toolbar", toolbarGroup: "btn-group", toolbarButton: "btn btn-default", toolbarButtonActive: "active", disabled: "disabled", textEditor: 'form-control', htmlEditor: 'form-control'
        }, defaultTagAttributes: {a: {target: ""}}, setup: {
            textEditorSetup: function($element){}, htmlEditorSetup: function($element){}
        }, defaultFileDropHandler: function(file, insertAction)
        {
            var reader = new FileReader;
            if (file.type.substring(0, 5) === 'image')
            {
                reader.onload = function()
                {
                    if (reader.result !== '')
                        insertAction('insertImage', reader.result, true)
                };
                reader.readAsDataURL(file);
                return true
            }
            return false
        }
}).value('taSelectableElements', ['a', 'img']).value('taCustomRenderers', [{
        selector: 'img', customAttribute: 'ta-insert-video', renderLogic: function(element)
            {
                var iframe = angular.element('<iframe></iframe>');
                var attributes = element.prop("attributes");
                angular.forEach(attributes, function(attr)
                {
                    iframe.attr(attr.name, attr.value)
                });
                iframe.attr('src', iframe.attr('ta-insert-video'));
                element.replaceWith(iframe)
            }
    }]).value('taTranslations', {
    html: {tooltip: 'Toggle html / Rich Text'}, heading: {tooltip: 'Heading '}, p: {tooltip: 'Paragraph'}, pre: {tooltip: 'Preformatted text'}, ul: {tooltip: 'Unordered List'}, ol: {tooltip: 'Ordered List'}, quote: {tooltip: 'Quote/unquote selection or paragraph'}, undo: {tooltip: 'Undo'}, redo: {tooltip: 'Redo'}, bold: {tooltip: 'Bold'}, italic: {tooltip: 'Italic'}, underline: {tooltip: 'Underline'}, strikeThrough: {tooltip: 'Strikethrough'}, justifyLeft: {tooltip: 'Align text left'}, justifyRight: {tooltip: 'Align text right'}, justifyFull: {tooltip: 'Justify text'}, justifyCenter: {tooltip: 'Center'}, indent: {tooltip: 'Increase indent'}, outdent: {tooltip: 'Decrease indent'}, clear: {tooltip: 'Clear formatting'}, insertImage: {
            dialogPrompt: 'Please enter an image URL to insert', tooltip: 'Insert image', hotkey: 'the - possibly language dependent hotkey ... for some future implementation'
        }, insertVideo: {
            tooltip: 'Insert video', dialogPrompt: 'Please enter a youtube URL to embed'
        }, insertLink: {
            tooltip: 'Insert / edit link', dialogPrompt: "Please enter a URL to insert"
        }, editLink: {
            reLinkButton: {tooltip: "Relink"}, unLinkButton: {tooltip: "Unlink"}, targetToggle: {buttontext: "Open in New Window"}
        }, wordcount: {tooltip: 'Display words Count'}, charcount: {tooltip: 'Display characters Count'}
}).factory('taToolFunctions', ['$window', 'taTranslations', function($window, taTranslations)
    {
        return {
                imgOnSelectAction: function(event, $element, editorScope)
                {
                    var finishEdit = function()
                        {
                            editorScope.updateTaBindtaTextElement();
                            editorScope.hidePopover()
                        };
                    event.preventDefault();
                    editorScope.displayElements.popover.css('width', '375px');
                    var container = editorScope.displayElements.popoverContainer;
                    container.empty();
                    var buttonGroup = angular.element('<div class="btn-group" style="padding-right: 6px;">');
                    var fullButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1">100% </button>');
                    fullButton.on('click', function(event)
                    {
                        event.preventDefault();
                        $element.css({
                            width: '100%', height: ''
                        });
                        finishEdit()
                    });
                    var halfButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1">50% </button>');
                    halfButton.on('click', function(event)
                    {
                        event.preventDefault();
                        $element.css({
                            width: '50%', height: ''
                        });
                        finishEdit()
                    });
                    var quartButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1">25% </button>');
                    quartButton.on('click', function(event)
                    {
                        event.preventDefault();
                        $element.css({
                            width: '25%', height: ''
                        });
                        finishEdit()
                    });
                    var resetButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1">Reset</button>');
                    resetButton.on('click', function(event)
                    {
                        event.preventDefault();
                        $element.css({
                            width: '', height: ''
                        });
                        finishEdit()
                    });
                    buttonGroup.append(fullButton);
                    buttonGroup.append(halfButton);
                    buttonGroup.append(quartButton);
                    buttonGroup.append(resetButton);
                    container.append(buttonGroup);
                    buttonGroup = angular.element('<div class="btn-group" style="padding-right: 6px;">');
                    var floatLeft = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1"><i class="fa fa-align-left"></i></button>');
                    floatLeft.on('click', function(event)
                    {
                        event.preventDefault();
                        $element.css('float', 'left');
                        $element.css('cssFloat', 'left');
                        $element.css('styleFloat', 'left');
                        finishEdit()
                    });
                    var floatRight = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1"><i class="fa fa-align-right"></i></button>');
                    floatRight.on('click', function(event)
                    {
                        event.preventDefault();
                        $element.css('float', 'right');
                        $element.css('cssFloat', 'right');
                        $element.css('styleFloat', 'right');
                        finishEdit()
                    });
                    var floatNone = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1"><i class="fa fa-align-justify"></i></button>');
                    floatNone.on('click', function(event)
                    {
                        event.preventDefault();
                        $element.css('float', '');
                        $element.css('cssFloat', '');
                        $element.css('styleFloat', '');
                        finishEdit()
                    });
                    buttonGroup.append(floatLeft);
                    buttonGroup.append(floatNone);
                    buttonGroup.append(floatRight);
                    container.append(buttonGroup);
                    buttonGroup = angular.element('<div class="btn-group">');
                    var remove = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" unselectable="on" tabindex="-1"><i class="fa fa-trash-o"></i></button>');
                    remove.on('click', function(event)
                    {
                        event.preventDefault();
                        $element.remove();
                        finishEdit()
                    });
                    buttonGroup.append(remove);
                    container.append(buttonGroup);
                    editorScope.showPopover($element);
                    editorScope.showResizeOverlay($element)
                }, aOnSelectAction: function(event, $element, editorScope)
                    {
                        event.preventDefault();
                        editorScope.displayElements.popover.css('width', '436px');
                        var container = editorScope.displayElements.popoverContainer;
                        container.empty();
                        container.css('line-height', '28px');
                        var link = angular.element('<a href="' + $element.attr('href') + '" target="_blank">' + $element.attr('href') + '</a>');
                        link.css({
                            display: 'inline-block', 'max-width': '200px', overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap', 'vertical-align': 'middle'
                        });
                        container.append(link);
                        var buttonGroup = angular.element('<div class="btn-group pull-right">');
                        var reLinkButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" tabindex="-1" unselectable="on" title="' + taTranslations.editLink.reLinkButton.tooltip + '"><i class="fa fa-edit icon-edit"></i></button>');
                        reLinkButton.on('click', function(event)
                        {
                            event.preventDefault();
                            var urlLink = $window.prompt(taTranslations.insertLink.dialogPrompt, $element.attr('href'));
                            if (urlLink && urlLink !== '' && urlLink !== 'http://')
                            {
                                $element.attr('href', urlLink);
                                editorScope.updateTaBindtaTextElement()
                            }
                            editorScope.hidePopover()
                        });
                        buttonGroup.append(reLinkButton);
                        var unLinkButton = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" tabindex="-1" unselectable="on" title="' + taTranslations.editLink.unLinkButton.tooltip + '"><i class="fa fa-unlink icon-unlink"></i></button>');
                        unLinkButton.on('click', function(event)
                        {
                            event.preventDefault();
                            $element.replaceWith($element.contents());
                            editorScope.updateTaBindtaTextElement();
                            editorScope.hidePopover()
                        });
                        buttonGroup.append(unLinkButton);
                        var targetToggle = angular.element('<button type="button" class="btn btn-default btn-sm btn-small" tabindex="-1" unselectable="on">' + taTranslations.editLink.targetToggle.buttontext + '</button>');
                        if ($element.attr('target') === '_blank')
                        {
                            targetToggle.addClass('active')
                        }
                        targetToggle.on('click', function(event)
                        {
                            event.preventDefault();
                            $element.attr('target', ($element.attr('target') === '_blank') ? '' : '_blank');
                            targetToggle.toggleClass('active');
                            editorScope.updateTaBindtaTextElement()
                        });
                        buttonGroup.append(targetToggle);
                        container.append(buttonGroup);
                        editorScope.showPopover($element)
                    }, extractYoutubeVideoId: function(url)
                    {
                        var re = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
                        var match = url.match(re);
                        return (match && match[1]) || null
                    }
            }
    }]).run(['taRegisterTool', '$window', 'taTranslations', 'taSelection', 'taToolFunctions', '$sanitize', 'taOptions', function(taRegisterTool, $window, taTranslations, taSelection, taToolFunctions, $sanitize, taOptions)
    {
        var gv = {};
        $sanitize('', gv);
        if ((taOptions.forceTextAngularSanitize === true) && (gv.version !== 'taSanitize'))
        {
            throw angular.$$minErr('textAngular')("textAngularSetup", "The textAngular-sanitize provider has been replaced by another -- have you included angular-sanitize by mistake?");
        }
        taRegisterTool("html", {
            iconclass: 'fa fa-code', tooltiptext: taTranslations.html.tooltip, action: function()
                {
                    this.$editor().switchView()
                }, activeState: function()
                {
                    return this.$editor().showHtml
                }
        });
        var _retActiveStateFunction = function(q)
            {
                return function()
                    {
                        return this.$editor().queryFormatBlockState(q)
                    }
            };
        var headerAction = function()
            {
                return this.$editor().wrapSelection("formatBlock", "<" + this.name.toUpperCase() + ">")
            };
        angular.forEach(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], function(h)
        {
            taRegisterTool(h.toLowerCase(), {
                buttontext: h.toUpperCase(), tooltiptext: taTranslations.heading.tooltip + h.charAt(1), action: headerAction, activeState: _retActiveStateFunction(h.toLowerCase())
            })
        });
        taRegisterTool('p', {
            buttontext: 'P', tooltiptext: taTranslations.p.tooltip, action: function()
                {
                    return this.$editor().wrapSelection("formatBlock", "<P>")
                }, activeState: function()
                {
                    return this.$editor().queryFormatBlockState('p')
                }
        });
        taRegisterTool('pre', {
            buttontext: 'pre', tooltiptext: taTranslations.pre.tooltip, action: function()
                {
                    return this.$editor().wrapSelection("formatBlock", "<PRE>")
                }, activeState: function()
                {
                    return this.$editor().queryFormatBlockState('pre')
                }
        });
        taRegisterTool('ul', {
            iconclass: 'fa fa-list-ul', tooltiptext: taTranslations.ul.tooltip, action: function()
                {
                    return this.$editor().wrapSelection("insertUnorderedList", null)
                }, activeState: function()
                {
                    return this.$editor().queryCommandState('insertUnorderedList')
                }
        });
        taRegisterTool('ol', {
            iconclass: 'fa fa-list-ol', tooltiptext: taTranslations.ol.tooltip, action: function()
                {
                    return this.$editor().wrapSelection("insertOrderedList", null)
                }, activeState: function()
                {
                    return this.$editor().queryCommandState('insertOrderedList')
                }
        });
        taRegisterTool('quote', {
            iconclass: 'fa fa-quote-right', tooltiptext: taTranslations.quote.tooltip, action: function()
                {
                    return this.$editor().wrapSelection("formatBlock", "<BLOCKQUOTE>")
                }, activeState: function()
                {
                    return this.$editor().queryFormatBlockState('blockquote')
                }
        });
        taRegisterTool('undo', {
            iconclass: 'fa fa-undo', tooltiptext: taTranslations.undo.tooltip, action: function()
                {
                    return this.$editor().wrapSelection("undo", null)
                }
        });
        taRegisterTool('redo', {
            iconclass: 'fa fa-repeat', tooltiptext: taTranslations.redo.tooltip, action: function()
                {
                    return this.$editor().wrapSelection("redo", null)
                }
        });
        taRegisterTool('bold', {
            iconclass: 'fa fa-bold', tooltiptext: taTranslations.bold.tooltip, action: function()
                {
                    return this.$editor().wrapSelection("bold", null)
                }, activeState: function()
                {
                    return this.$editor().queryCommandState('bold')
                }, commandKeyCode: 98
        });
        taRegisterTool('justifyLeft', {
            iconclass: 'fa fa-align-left', tooltiptext: taTranslations.justifyLeft.tooltip, action: function()
                {
                    return this.$editor().wrapSelection("justifyLeft", null)
                }, activeState: function(commonElement)
                {
                    if (commonElement && commonElement.nodeName === '#document')
                        return false;
                    var result = false;
                    if (commonElement)
                        result = commonElement.css('text-align') === 'left' || commonElement.attr('align') === 'left' || (commonElement.css('text-align') !== 'right' && commonElement.css('text-align') !== 'center' && commonElement.css('text-align') !== 'justify' && !this.$editor().queryCommandState('justifyRight') && !this.$editor().queryCommandState('justifyCenter')) && !this.$editor().queryCommandState('justifyFull');
                    result = result || this.$editor().queryCommandState('justifyLeft');
                    return result
                }
        });
        taRegisterTool('justifyRight', {
            iconclass: 'fa fa-align-right', tooltiptext: taTranslations.justifyRight.tooltip, action: function()
                {
                    return this.$editor().wrapSelection("justifyRight", null)
                }, activeState: function(commonElement)
                {
                    if (commonElement && commonElement.nodeName === '#document')
                        return false;
                    var result = false;
                    if (commonElement)
                        result = commonElement.css('text-align') === 'right';
                    result = result || this.$editor().queryCommandState('justifyRight');
                    return result
                }
        });
        taRegisterTool('justifyFull', {
            iconclass: 'fa fa-align-justify', tooltiptext: taTranslations.justifyFull.tooltip, action: function()
                {
                    return this.$editor().wrapSelection("justifyFull", null)
                }, activeState: function(commonElement)
                {
                    var result = false;
                    if (commonElement)
                        result = commonElement.css('text-align') === 'justify';
                    result = result || this.$editor().queryCommandState('justifyFull');
                    return result
                }
        });
        taRegisterTool('justifyCenter', {
            iconclass: 'fa fa-align-center', tooltiptext: taTranslations.justifyCenter.tooltip, action: function()
                {
                    return this.$editor().wrapSelection("justifyCenter", null)
                }, activeState: function(commonElement)
                {
                    if (commonElement && commonElement.nodeName === '#document')
                        return false;
                    var result = false;
                    if (commonElement)
                        result = commonElement.css('text-align') === 'center';
                    result = result || this.$editor().queryCommandState('justifyCenter');
                    return result
                }
        });
        taRegisterTool('indent', {
            iconclass: 'fa fa-indent', tooltiptext: taTranslations.indent.tooltip, action: function()
                {
                    return this.$editor().wrapSelection("indent", null)
                }, activeState: function()
                {
                    return this.$editor().queryFormatBlockState('blockquote')
                }, commandKeyCode: 'TabKey'
        });
        taRegisterTool('outdent', {
            iconclass: 'fa fa-outdent', tooltiptext: taTranslations.outdent.tooltip, action: function()
                {
                    return this.$editor().wrapSelection("outdent", null)
                }, activeState: function()
                {
                    return false
                }, commandKeyCode: 'ShiftTabKey'
        });
        taRegisterTool('italics', {
            iconclass: 'fa fa-italic', tooltiptext: taTranslations.italic.tooltip, action: function()
                {
                    return this.$editor().wrapSelection("italic", null)
                }, activeState: function()
                {
                    return this.$editor().queryCommandState('italic')
                }, commandKeyCode: 105
        });
        taRegisterTool('underline', {
            iconclass: 'fa fa-underline', tooltiptext: taTranslations.underline.tooltip, action: function()
                {
                    return this.$editor().wrapSelection("underline", null)
                }, activeState: function()
                {
                    return this.$editor().queryCommandState('underline')
                }, commandKeyCode: 117
        });
        taRegisterTool('strikeThrough', {
            iconclass: 'fa fa-strikethrough', tooltiptext: taTranslations.strikeThrough.tooltip, action: function()
                {
                    return this.$editor().wrapSelection("strikeThrough", null)
                }, activeState: function()
                {
                    return document.queryCommandState('strikeThrough')
                }
        });
        taRegisterTool('clear', {
            iconclass: 'fa fa-ban', tooltiptext: taTranslations.clear.tooltip, action: function(deferred, restoreSelection)
                {
                    var i;
                    this.$editor().wrapSelection("removeFormat", null);
                    var possibleNodes = angular.element(taSelection.getSelectionElement());
                    var removeListElements = function(list)
                        {
                            list = angular.element(list);
                            var prevElement = list;
                            angular.forEach(list.children(), function(liElem)
                            {
                                var newElem = angular.element('<p></p>');
                                newElem.html(angular.element(liElem).html());
                                prevElement.after(newElem);
                                prevElement = newElem
                            });
                            list.remove()
                        };
                    angular.forEach(possibleNodes.find("ul"), removeListElements);
                    angular.forEach(possibleNodes.find("ol"), removeListElements);
                    if (possibleNodes[0].tagName.toLowerCase() === 'li')
                    {
                        var _list = possibleNodes[0].parentNode.childNodes;
                        var _preLis = [],
                            _postLis = [],
                            _found = false;
                        for (i = 0; i < _list.length; i++)
                        {
                            if (_list[i] === possibleNodes[0])
                            {
                                _found = true
                            }
                            else if (!_found)
                                _preLis.push(_list[i]);
                            else
                                _postLis.push(_list[i])
                        }
                        var _parent = angular.element(possibleNodes[0].parentNode);
                        var newElem = angular.element('<p></p>');
                        newElem.html(angular.element(possibleNodes[0]).html());
                        if (_preLis.length === 0 || _postLis.length === 0)
                        {
                            if (_postLis.length === 0)
                                _parent.after(newElem);
                            else
                                _parent[0].parentNode.insertBefore(newElem[0], _parent[0]);
                            if (_preLis.length === 0 && _postLis.length === 0)
                                _parent.remove();
                            else
                                angular.element(possibleNodes[0]).remove()
                        }
                        else
                        {
                            var _firstList = angular.element('<' + _parent[0].tagName + '></' + _parent[0].tagName + '>');
                            var _secondList = angular.element('<' + _parent[0].tagName + '></' + _parent[0].tagName + '>');
                            for (i = 0; i < _preLis.length; i++)
                                _firstList.append(angular.element(_preLis[i]));
                            for (i = 0; i < _postLis.length; i++)
                                _secondList.append(angular.element(_postLis[i]));
                            _parent.after(_secondList);
                            _parent.after(newElem);
                            _parent.after(_firstList);
                            _parent.remove()
                        }
                        taSelection.setSelectionToElementEnd(newElem[0])
                    }
                    var $editor = this.$editor();
                    var recursiveRemoveClass = function(node)
                        {
                            node = angular.element(node);
                            if (node[0] !== $editor.displayElements.text[0])
                                node.removeAttr('class');
                            angular.forEach(node.children(), recursiveRemoveClass)
                        };
                    angular.forEach(possibleNodes, recursiveRemoveClass);
                    if (possibleNodes[0].tagName.toLowerCase() !== 'li' && possibleNodes[0].tagName.toLowerCase() !== 'ol' && possibleNodes[0].tagName.toLowerCase() !== 'ul')
                        this.$editor().wrapSelection("formatBlock", "default");
                    restoreSelection()
                }
        });
        taRegisterTool('insertImage', {
            iconclass: 'fa fa-picture-o', tooltiptext: taTranslations.insertImage.tooltip, action: function()
                {
                    var imageLink;
                    imageLink = $window.prompt(taTranslations.insertImage.dialogPrompt, 'http://');
                    if (imageLink && imageLink !== '' && imageLink !== 'http://')
                    {
                        return this.$editor().wrapSelection('insertImage', imageLink, true)
                    }
                }, onElementSelect: {
                    element: 'img', action: taToolFunctions.imgOnSelectAction
                }
        });
        taRegisterTool('insertVideo', {
            iconclass: 'fa fa-youtube-play', tooltiptext: taTranslations.insertVideo.tooltip, action: function()
                {
                    var urlPrompt;
                    urlPrompt = $window.prompt(taTranslations.insertVideo.dialogPrompt, 'https://');
                    if (urlPrompt && urlPrompt !== '' && urlPrompt !== 'https://')
                    {
                        videoId = taToolFunctions.extractYoutubeVideoId(urlPrompt);
                        if (videoId)
                        {
                            var urlLink = "https://www.youtube.com/embed/" + videoId;
                            var embed = '<img class="ta-insert-video" src="https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg" ta-insert-video="' + urlLink + '" contenteditable="false" allowfullscreen="true" frameborder="0" />';
                            return this.$editor().wrapSelection('insertHTML', embed, true)
                        }
                    }
                }, onElementSelect: {
                    element: 'img', onlyWithAttrs: ['ta-insert-video'], action: taToolFunctions.imgOnSelectAction
                }
        });
        taRegisterTool('insertLink', {
            tooltiptext: taTranslations.insertLink.tooltip, iconclass: 'fa fa-link', action: function()
                {
                    var urlLink;
                    urlLink = $window.prompt(taTranslations.insertLink.dialogPrompt, 'http://');
                    if (urlLink && urlLink !== '' && urlLink !== 'http://')
                    {
                        return this.$editor().wrapSelection('createLink', urlLink, true)
                    }
                }, activeState: function(commonElement)
                {
                    if (commonElement)
                        return commonElement[0].tagName === 'A';
                    return false
                }, onElementSelect: {
                    element: 'a', action: taToolFunctions.aOnSelectAction
                }
        });
        taRegisterTool('wordcount', {
            display: '<div id="toolbarWC" style="display:block; min-width:100px;">Words: <span ng-bind="wordcount"></span></div>', disabled: true, wordcount: 0, activeState: function()
                {
                    var textElement = this.$editor().displayElements.text;
                    var workingHTML = textElement[0].innerHTML || '';
                    var noOfWords = 0;
                    if (workingHTML.replace(/\s*<[^>]*?>\s*/g, '') !== '')
                    {
                        noOfWords = workingHTML.replace(/<\/?(b|i|em|strong|span|u|strikethrough|a|img|small|sub|sup|label)( [^>*?])?>/gi, '').replace(/(<[^>]*?>\s*<[^>]*?>)/ig, ' ').replace(/(<[^>]*?>)/ig, '').replace(/\s+/ig, ' ').match(/\S+/g).length
                    }
                    this.wordcount = noOfWords;
                    this.$editor().wordcount = noOfWords;
                    return false
                }
        });
        taRegisterTool('charcount', {
            display: '<div id="toolbarCC" style="display:block; min-width:120px;">Characters: <span ng-bind="charcount"></span></div>', disabled: true, charcount: 0, activeState: function()
                {
                    var textElement = this.$editor().displayElements.text;
                    var sourceText = textElement[0].innerText || textElement[0].textContent;
                    var noOfChars = sourceText.replace(/(\r\n|\n|\r)/gm, "").replace(/^\s+/g, ' ').replace(/\s+$/g, ' ').length;
                    this.charcount = noOfChars;
                    this.$editor().charcount = noOfChars;
                    return false
                }
        })
    }]);
/*
@license textAngular
Author : Austin Anderson
License : 2013 MIT
Version 1.4.5
See README.md or https://github.com/fraywing/textAngular/wiki for requirements and use.
*/
'undefined' != typeof module && 'undefined' != typeof exports && module.exports === exports && (module.exports = 'textAngular');
(function()
{
    var _browserDetect = {
            ie: (function()
            {
                var undef,
                    v = 3,
                    div = document.createElement('div'),
                    all = div.getElementsByTagName('i');
                while (div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->', all[0])
                    ;
                return v > 4 ? v : undef
            }()), webkit: /AppleWebKit\/([\d.]+)/i.test(navigator.userAgent)
        };
    var globalContentEditableBlur = false;
    if (_browserDetect.webkit)
    {
        document.addEventListener("mousedown", function(_event)
        {
            var e = _event || window.event;
            var curelement = e.target;
            if (globalContentEditableBlur && curelement !== null)
            {
                var isEditable = false;
                var tempEl = curelement;
                while (tempEl !== null && tempEl.tagName.toLowerCase() !== 'html' && !isEditable)
                {
                    isEditable = tempEl.contentEditable === 'true';
                    tempEl = tempEl.parentNode
                }
                if (!isEditable)
                {
                    document.getElementById('textAngular-editableFix-010203040506070809').setSelectionRange(0, 0);
                    curelement.focus();
                    if (curelement.select)
                    {
                        curelement.select()
                    }
                }
            }
            globalContentEditableBlur = false
        }, false);
        angular.element(document).ready(function()
        {
            angular.element(document.body).append(angular.element('<input id="textAngular-editableFix-010203040506070809" class="ta-hidden-input" aria-hidden="true" unselectable="on" tabIndex="-1">'))
        })
    }
    var BLOCKELEMENTS = /^(address|article|aside|audio|blockquote|canvas|dd|div|dl|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|header|hgroup|hr|noscript|ol|output|p|pre|section|table|tfoot|ul|video)$/i;
    var LISTELEMENTS = /^(ul|li|ol)$/i;
    var VALIDELEMENTS = /^(address|article|aside|audio|blockquote|canvas|dd|div|dl|fieldset|figcaption|figure|footer|form|h1|h2|h3|h4|h5|h6|header|hgroup|hr|noscript|ol|output|p|pre|section|table|tfoot|ul|video|li)$/i;
    if (!String.prototype.trim)
    {
        String.prototype.trim = function()
        {
            return this.replace(/^\s+|\s+$/g, '')
        }
    }
    function validElementString(string)
    {
        try
        {
            return angular.element(string).length !== 0
        }
        catch(any)
        {
            return false
        }
    }
    var sheet,
        addCSSRule,
        removeCSSRule,
        _addCSSRule,
        _removeCSSRule,
        _getRuleIndex;
    if (_browserDetect.ie > 8 || _browserDetect.ie === undefined)
    {
        var _sheets = document.styleSheets;
        for (var i = 0; i < _sheets.length; i++)
        {
            if (_sheets[i].media.length === 0 || _sheets[i].media.mediaText.match(/(all|screen)/ig))
            {
                if (_sheets[i].href)
                {
                    if (_sheets[i].href.match(/textangular\.(min\.|)css/ig))
                    {
                        sheet = _sheets[i];
                        break
                    }
                }
            }
        }
        if (!sheet)
        {
            sheet = (function()
            {
                var style = document.createElement("style");
                if (_browserDetect.webkit)
                    style.appendChild(document.createTextNode(""));
                document.getElementsByTagName('head')[0].appendChild(style);
                return style.sheet
            })()
        }
        addCSSRule = function(selector, rules)
        {
            return _addCSSRule(sheet, selector, rules)
        };
        _addCSSRule = function(_sheet, selector, rules)
        {
            var insertIndex;
            var insertedRule;
            if (_sheet.cssRules)
                insertIndex = Math.max(_sheet.cssRules.length - 1, 0);
            else if (_sheet.rules)
                insertIndex = Math.max(_sheet.rules.length - 1, 0);
            if (_sheet.insertRule)
            {
                _sheet.insertRule(selector + "{" + rules + "}", insertIndex)
            }
            else
            {
                _sheet.addRule(selector, rules, insertIndex)
            }
            if (sheet.rules)
                insertedRule = sheet.rules[insertIndex];
            else if (sheet.cssRules)
                insertedRule = sheet.cssRules[insertIndex];
            return insertedRule
        };
        _getRuleIndex = function(rule, rules)
        {
            var i,
                ruleIndex;
            for (i = 0; i < rules.length; i++)
            {
                if (rules[i].cssText === rule.cssText)
                {
                    ruleIndex = i;
                    break
                }
            }
            return ruleIndex
        };
        removeCSSRule = function(rule)
        {
            _removeCSSRule(sheet, rule)
        };
        _removeCSSRule = function(sheet, rule)
        {
            var rules = sheet.cssRules || sheet.rules;
            if (!rules || rules.length === 0)
                return;
            var ruleIndex = _getRuleIndex(rule, rules);
            if (sheet.removeRule)
            {
                sheet.removeRule(ruleIndex)
            }
            else
            {
                sheet.deleteRule(ruleIndex)
            }
        }
    }
    angular.module('textAngular.factories', []).factory('taBrowserTag', [function()
        {
            return function(tag)
                {
                    if (!tag)
                        return (_browserDetect.ie <= 8) ? 'P' : 'p';
                    else if (tag === '')
                        return (_browserDetect.ie === undefined) ? 'div' : (_browserDetect.ie <= 8) ? 'P' : 'p';
                    else
                        return (_browserDetect.ie <= 8) ? tag.toUpperCase() : tag
                }
        }]).factory('taApplyCustomRenderers', ['taCustomRenderers', 'taDOM', function(taCustomRenderers, taDOM)
        {
            return function(val)
                {
                    var element = angular.element('<div></div>');
                    element[0].innerHTML = val;
                    angular.forEach(taCustomRenderers, function(renderer)
                    {
                        var elements = [];
                        if (renderer.selector && renderer.selector !== '')
                            elements = element.find(renderer.selector);
                        else if (renderer.customAttribute && renderer.customAttribute !== '')
                            elements = taDOM.getByAttribute(element, renderer.customAttribute);
                        angular.forEach(elements, function(_element)
                        {
                            _element = angular.element(_element);
                            if (renderer.selector && renderer.selector !== '' && renderer.customAttribute && renderer.customAttribute !== '')
                            {
                                if (_element.attr(renderer.customAttribute) !== undefined)
                                    renderer.renderLogic(_element)
                            }
                            else
                                renderer.renderLogic(_element)
                        })
                    });
                    return element[0].innerHTML
                }
        }]).factory('taFixChrome', function()
    {
        var taFixChrome = function(html)
            {
                if (!html || !angular.isString(html) || html.length <= 0)
                    return html;
                var spanMatch = /<([^>\/]+?)style=("([^"]+)"|'([^']+)')([^>]*)>/ig;
                var match,
                    styleVal,
                    newTag,
                    finalHtml = '',
                    lastIndex = 0;
                while (match = spanMatch.exec(html))
                {
                    styleVal = match[3] || match[4];
                    if (styleVal && styleVal.match(/line-height: 1.[0-9]{3,12};|color: inherit; line-height: 1.1;/i))
                    {
                        styleVal = styleVal.replace(/( |)font-family: inherit;|( |)line-height: 1.[0-9]{3,12};|( |)color: inherit;/ig, '');
                        newTag = '<' + match[1].trim();
                        if (styleVal.trim().length > 0)
                            newTag += ' style=' + match[2].substring(0, 1) + styleVal + match[2].substring(0, 1);
                        newTag += match[5].trim() + ">";
                        finalHtml += html.substring(lastIndex, match.index) + newTag;
                        lastIndex = match.index + match[0].length
                    }
                }
                finalHtml += html.substring(lastIndex);
                if (lastIndex > 0)
                {
                    return finalHtml.replace(/<span\s?>(.*?)<\/span>(<br(\/|)>|)/ig, '$1')
                }
                else
                    return html
            };
        return taFixChrome
    }).factory('taSanitize', ['$sanitize', function taSanitizeFactory($sanitize)
        {
            var convert_infos = [{
                        property: 'font-weight', values: ['bold'], tag: 'b'
                    }, {
                        property: 'font-style', values: ['italic'], tag: 'i'
                    }];
            var styleMatch = [];
            for (var i = 0; i < convert_infos.length; i++)
            {
                var _partialStyle = '(' + convert_infos[i].property + ':\\s*(';
                for (var j = 0; j < convert_infos[i].values.length; j++)
                {
                    if (j > 0)
                        _partialStyle += '|';
                    _partialStyle += convert_infos[i].values[j]
                }
                _partialStyle += ');)';
                styleMatch.push(_partialStyle)
            }
            var styleRegexString = '(' + styleMatch.join('|') + ')';
            function wrapNested(html, wrapTag)
            {
                var depth = 0;
                var lastIndex = 0;
                var match;
                var tagRegex = /<[^>]*>/ig;
                while (match = tagRegex.exec(html))
                {
                    lastIndex = match.index;
                    if (match[0].substr(1, 1) === '/')
                    {
                        if (depth === 0)
                            break;
                        else
                            depth--
                    }
                    else
                        depth++
                }
                return wrapTag + html.substring(0, lastIndex) + angular.element(wrapTag)[0].outerHTML.substring(wrapTag.length) + html.substring(lastIndex)
            }
            function transformLegacyStyles(html)
            {
                if (!html || !angular.isString(html) || html.length <= 0)
                    return html;
                var i;
                var styleElementMatch = /<([^>\/]+?)style=("([^"]+)"|'([^']+)')([^>]*)>/ig;
                var match,
                    subMatch,
                    styleVal,
                    newTag,
                    lastNewTag = '',
                    newHtml,
                    finalHtml = '',
                    lastIndex = 0;
                while (match = styleElementMatch.exec(html))
                {
                    styleVal = match[3] || match[4];
                    var styleRegex = new RegExp(styleRegexString, 'i');
                    if (angular.isString(styleVal) && styleRegex.test(styleVal))
                    {
                        newTag = '';
                        var styleRegexExec = new RegExp(styleRegexString, 'ig');
                        while (subMatch = styleRegexExec.exec(styleVal))
                        {
                            for (i = 0; i < convert_infos.length; i++)
                            {
                                if (!!subMatch[(i * 2) + 2])
                                {
                                    newTag += '<' + convert_infos[i].tag + '>'
                                }
                            }
                        }
                        newHtml = transformLegacyStyles(html.substring(lastIndex, match.index));
                        if (lastNewTag.length > 0)
                        {
                            finalHtml += wrapNested(newHtml, lastNewTag)
                        }
                        else
                            finalHtml += newHtml;
                        styleVal = styleVal.replace(new RegExp(styleRegexString, 'ig'), '');
                        finalHtml += '<' + match[1].trim();
                        if (styleVal.length > 0)
                            finalHtml += ' style="' + styleVal + '"';
                        finalHtml += match[5] + '>';
                        lastIndex = match.index + match[0].length;
                        lastNewTag = newTag
                    }
                }
                if (lastNewTag.length > 0)
                {
                    finalHtml += wrapNested(html.substring(lastIndex), lastNewTag)
                }
                else
                    finalHtml += html.substring(lastIndex);
                return finalHtml
            }
            function transformLegacyAttributes(html)
            {
                if (!html || !angular.isString(html) || html.length <= 0)
                    return html;
                var attrElementMatch = /<([^>\/]+?)align=("([^"]+)"|'([^']+)')([^>]*)>/ig;
                var match,
                    finalHtml = '',
                    lastIndex = 0;
                while (match = attrElementMatch.exec(html))
                {
                    finalHtml += html.substring(lastIndex, match.index);
                    lastIndex = match.index + match[0].length;
                    var newTag = '<' + match[1] + match[5];
                    if (/style=("([^"]+)"|'([^']+)')/ig.test(newTag))
                    {
                        newTag = newTag.replace(/style=("([^"]+)"|'([^']+)')/i, 'style="$2$3 text-align:' + (match[3] || match[4]) + ';"')
                    }
                    else
                    {
                        newTag += ' style="text-align:' + (match[3] || match[4]) + ';"'
                    }
                    newTag += '>';
                    finalHtml += newTag
                }
                return finalHtml + html.substring(lastIndex)
            }
            return function taSanitize(unsafe, oldsafe, ignore)
                {
                    if (!ignore)
                    {
                        try
                        {
                            unsafe = transformLegacyStyles(unsafe)
                        }
                        catch(e) {}
                    }
                    unsafe = transformLegacyAttributes(unsafe);
                    var safe;
                    try
                    {
                        safe = $sanitize(unsafe);
                        if (ignore)
                            safe = unsafe
                    }
                    catch(e)
                    {
                        safe = oldsafe || ''
                    }
                    var _preTags = safe.match(/(<pre[^>]*>.*?<\/pre[^>]*>)/ig);
                    var processedSafe = safe.replace(/(&#(9|10);)*/ig, '');
                    var re = /<pre[^>]*>.*?<\/pre[^>]*>/ig;
                    var index = 0;
                    var lastIndex = 0;
                    var origTag;
                    safe = '';
                    while ((origTag = re.exec(processedSafe)) !== null && index < _preTags.length)
                    {
                        safe += processedSafe.substring(lastIndex, origTag.index) + _preTags[index];
                        lastIndex = origTag.index + origTag[0].length;
                        index++
                    }
                    return safe + processedSafe.substring(lastIndex)
                }
        }]).factory('taToolExecuteAction', ['$q', '$log', function($q, $log)
        {
            return function(editor)
                {
                    if (editor !== undefined)
                        this.$editor = function()
                        {
                            return editor
                        };
                    var deferred = $q.defer(),
                        promise = deferred.promise,
                        _editor = this.$editor();
                    var result;
                    try
                    {
                        result = this.action(deferred, _editor.startAction());
                        promise['finally'](function()
                        {
                            _editor.endAction.call(_editor)
                        })
                    }
                    catch(exc)
                    {
                        $log.error(exc)
                    }
                    if (result || result === undefined)
                    {
                        deferred.resolve()
                    }
                }
        }]);
    angular.module('textAngular.DOM', ['textAngular.factories']).factory('taExecCommand', ['taSelection', 'taBrowserTag', '$document', function(taSelection, taBrowserTag, $document)
        {
            var listToDefault = function(listElement, defaultWrap)
                {
                    var $target,
                        i;
                    var children = listElement.find('li');
                    for (i = children.length - 1; i >= 0; i--)
                    {
                        $target = angular.element('<' + defaultWrap + '>' + children[i].innerHTML + '</' + defaultWrap + '>');
                        listElement.after($target)
                    }
                    listElement.remove();
                    taSelection.setSelectionToElementEnd($target[0])
                };
            var selectLi = function(liElement)
                {
                    if (/(<br(|\/)>)$/i.test(liElement.innerHTML.trim()))
                        taSelection.setSelectionBeforeElement(angular.element(liElement).find("br")[0]);
                    else
                        taSelection.setSelectionToElementEnd(liElement)
                };
            var listToList = function(listElement, newListTag)
                {
                    var $target = angular.element('<' + newListTag + '>' + listElement[0].innerHTML + '</' + newListTag + '>');
                    listElement.after($target);
                    listElement.remove();
                    selectLi($target.find('li')[0])
                };
            var childElementsToList = function(elements, listElement, newListTag)
                {
                    var html = '';
                    for (var i = 0; i < elements.length; i++)
                    {
                        html += '<' + taBrowserTag('li') + '>' + elements[i].innerHTML + '</' + taBrowserTag('li') + '>'
                    }
                    var $target = angular.element('<' + newListTag + '>' + html + '</' + newListTag + '>');
                    listElement.after($target);
                    listElement.remove();
                    selectLi($target.find('li')[0])
                };
            return function(taDefaultWrap, topNode)
                {
                    taDefaultWrap = taBrowserTag(taDefaultWrap);
                    return function(command, showUI, options, defaultTagAttributes)
                        {
                            var i,
                                $target,
                                html,
                                _nodes,
                                next,
                                optionsTagName,
                                selectedElement;
                            var defaultWrapper = angular.element('<' + taDefaultWrap + '>');
                            try
                            {
                                selectedElement = taSelection.getSelectionElement()
                            }
                            catch(e) {}
                            var $selected = angular.element(selectedElement);
                            if (selectedElement !== undefined)
                            {
                                var tagName = selectedElement.tagName.toLowerCase();
                                if (command.toLowerCase() === 'insertorderedlist' || command.toLowerCase() === 'insertunorderedlist')
                                {
                                    var selfTag = taBrowserTag((command.toLowerCase() === 'insertorderedlist') ? 'ol' : 'ul');
                                    if (tagName === selfTag)
                                    {
                                        return listToDefault($selected, taDefaultWrap)
                                    }
                                    else if (tagName === 'li' && $selected.parent()[0].tagName.toLowerCase() === selfTag && $selected.parent().children().length === 1)
                                    {
                                        return listToDefault($selected.parent(), taDefaultWrap)
                                    }
                                    else if (tagName === 'li' && $selected.parent()[0].tagName.toLowerCase() !== selfTag && $selected.parent().children().length === 1)
                                    {
                                        return listToList($selected.parent(), selfTag)
                                    }
                                    else if (tagName.match(BLOCKELEMENTS) && !$selected.hasClass('ta-bind'))
                                    {
                                        if (tagName === 'ol' || tagName === 'ul')
                                        {
                                            return listToList($selected, selfTag)
                                        }
                                        else
                                        {
                                            var childBlockElements = false;
                                            angular.forEach($selected.children(), function(elem)
                                            {
                                                if (elem.tagName.match(BLOCKELEMENTS))
                                                {
                                                    childBlockElements = true
                                                }
                                            });
                                            if (childBlockElements)
                                            {
                                                return childElementsToList($selected.children(), $selected, selfTag)
                                            }
                                            else
                                            {
                                                return childElementsToList([angular.element('<div>' + selectedElement.innerHTML + '</div>')[0]], $selected, selfTag)
                                            }
                                        }
                                    }
                                    else if (tagName.match(BLOCKELEMENTS))
                                    {
                                        _nodes = taSelection.getOnlySelectedElements();
                                        if (_nodes.length === 0)
                                        {
                                            $target = angular.element('<' + selfTag + '><li>' + selectedElement.innerHTML + '</li></' + selfTag + '>');
                                            $selected.html('');
                                            $selected.append($target)
                                        }
                                        else if (_nodes.length === 1 && (_nodes[0].tagName.toLowerCase() === 'ol' || _nodes[0].tagName.toLowerCase() === 'ul'))
                                        {
                                            if (_nodes[0].tagName.toLowerCase() === selfTag)
                                            {
                                                return listToDefault(angular.element(_nodes[0]), taDefaultWrap)
                                            }
                                            else
                                            {
                                                return listToList(angular.element(_nodes[0]), selfTag)
                                            }
                                        }
                                        else
                                        {
                                            html = '';
                                            var $nodes = [];
                                            for (i = 0; i < _nodes.length; i++)
                                            {
                                                if (_nodes[i].nodeType !== 3)
                                                {
                                                    var $n = angular.element(_nodes[i]);
                                                    if (_nodes[i].tagName.toLowerCase() === 'li')
                                                        continue;
                                                    else if (_nodes[i].tagName.toLowerCase() === 'ol' || _nodes[i].tagName.toLowerCase() === 'ul')
                                                    {
                                                        html += $n[0].innerHTML
                                                    }
                                                    else if (_nodes[i].tagName.toLowerCase() === 'span' && (_nodes[i].childNodes[0].tagName.toLowerCase() === 'ol' || _nodes[i].childNodes[0].tagName.toLowerCase() === 'ul'))
                                                    {
                                                        html += $n[0].childNodes[0].innerHTML
                                                    }
                                                    else
                                                    {
                                                        html += '<' + taBrowserTag('li') + '>' + $n[0].innerHTML + '</' + taBrowserTag('li') + '>'
                                                    }
                                                    $nodes.unshift($n)
                                                }
                                            }
                                            $target = angular.element('<' + selfTag + '>' + html + '</' + selfTag + '>');
                                            $nodes.pop().replaceWith($target);
                                            angular.forEach($nodes, function($node)
                                            {
                                                $node.remove()
                                            })
                                        }
                                        taSelection.setSelectionToElementEnd($target[0]);
                                        return
                                    }
                                }
                                else if (command.toLowerCase() === 'formatblock')
                                {
                                    optionsTagName = options.toLowerCase().replace(/[<>]/ig, '');
                                    if (optionsTagName.trim() === 'default')
                                    {
                                        optionsTagName = taDefaultWrap;
                                        options = '<' + taDefaultWrap + '>'
                                    }
                                    if (tagName === 'li')
                                        $target = $selected.parent();
                                    else
                                        $target = $selected;
                                    while (!$target[0].tagName || !$target[0].tagName.match(BLOCKELEMENTS) && !$target.parent().attr('contenteditable'))
                                    {
                                        $target = $target.parent();
                                        tagName = ($target[0].tagName || '').toLowerCase()
                                    }
                                    if (tagName === optionsTagName)
                                    {
                                        _nodes = $target.children();
                                        var hasBlock = false;
                                        for (i = 0; i < _nodes.length; i++)
                                        {
                                            hasBlock = hasBlock || _nodes[i].tagName.match(BLOCKELEMENTS)
                                        }
                                        if (hasBlock)
                                        {
                                            $target.after(_nodes);
                                            next = $target.next();
                                            $target.remove();
                                            $target = next
                                        }
                                        else
                                        {
                                            defaultWrapper.append($target[0].childNodes);
                                            $target.after(defaultWrapper);
                                            $target.remove();
                                            $target = defaultWrapper
                                        }
                                    }
                                    else if ($target.parent()[0].tagName.toLowerCase() === optionsTagName && !$target.parent().hasClass('ta-bind'))
                                    {
                                        var blockElement = $target.parent();
                                        var contents = blockElement.contents();
                                        for (i = 0; i < contents.length; i++)
                                        {
                                            if (blockElement.parent().hasClass('ta-bind') && contents[i].nodeType === 3)
                                            {
                                                defaultWrapper = angular.element('<' + taDefaultWrap + '>');
                                                defaultWrapper[0].innerHTML = contents[i].outerHTML;
                                                contents[i] = defaultWrapper[0]
                                            }
                                            blockElement.parent()[0].insertBefore(contents[i], blockElement[0])
                                        }
                                        blockElement.remove()
                                    }
                                    else if (tagName.match(LISTELEMENTS))
                                    {
                                        $target.wrap(options)
                                    }
                                    else
                                    {
                                        _nodes = taSelection.getOnlySelectedElements();
                                        if (_nodes.length === 0)
                                            _nodes = [$target[0]];
                                        for (i = 0; i < _nodes.length; i++)
                                        {
                                            if (_nodes[i].nodeType === 3 || !_nodes[i].tagName.match(BLOCKELEMENTS))
                                            {
                                                while (_nodes[i].nodeType === 3 || !_nodes[i].tagName || !_nodes[i].tagName.match(BLOCKELEMENTS))
                                                {
                                                    _nodes[i] = _nodes[i].parentNode
                                                }
                                            }
                                        }
                                        if (angular.element(_nodes[0]).hasClass('ta-bind'))
                                        {
                                            $target = angular.element(options);
                                            $target[0].innerHTML = _nodes[0].innerHTML;
                                            _nodes[0].innerHTML = $target[0].outerHTML
                                        }
                                        else if (optionsTagName === 'blockquote')
                                        {
                                            html = '';
                                            for (i = 0; i < _nodes.length; i++)
                                            {
                                                html += _nodes[i].outerHTML
                                            }
                                            $target = angular.element(options);
                                            $target[0].innerHTML = html;
                                            _nodes[0].parentNode.insertBefore($target[0], _nodes[0]);
                                            for (i = _nodes.length - 1; i >= 0; i--)
                                            {
                                                if (_nodes[i].parentNode)
                                                    _nodes[i].parentNode.removeChild(_nodes[i])
                                            }
                                        }
                                        else
                                        {
                                            for (i = 0; i < _nodes.length; i++)
                                            {
                                                $target = angular.element(options);
                                                $target[0].innerHTML = _nodes[i].innerHTML;
                                                _nodes[i].parentNode.insertBefore($target[0], _nodes[i]);
                                                _nodes[i].parentNode.removeChild(_nodes[i])
                                            }
                                        }
                                    }
                                    taSelection.setSelectionToElementEnd($target[0]);
                                    return
                                }
                                else if (command.toLowerCase() === 'createlink')
                                {
                                    var tagBegin = '<a href="' + options + '" target="' + (defaultTagAttributes.a.target ? defaultTagAttributes.a.target : '') + '">',
                                        tagEnd = '</a>',
                                        _selection = taSelection.getSelection();
                                    if (_selection.collapsed)
                                    {
                                        taSelection.insertHtml(tagBegin + options + tagEnd, topNode)
                                    }
                                    else if (rangy.getSelection().getRangeAt(0).canSurroundContents())
                                    {
                                        var node = angular.element(tagBegin + tagEnd)[0];
                                        rangy.getSelection().getRangeAt(0).surroundContents(node)
                                    }
                                    return
                                }
                                else if (command.toLowerCase() === 'inserthtml')
                                {
                                    taSelection.insertHtml(options, topNode);
                                    return
                                }
                            }
                            try
                            {
                                $document[0].execCommand(command, showUI, options)
                            }
                            catch(e) {}
                        }
                }
        }]).service('taSelection', ['$window', '$document', 'taDOM', function($window, $document, taDOM)
        {
            var _document = $document[0];
            var rangy = $window.rangy;
            var brException = function(element, offset)
                {
                    if (element.tagName && element.tagName.match(/^br$/i) && offset === 0 && !element.previousSibling)
                    {
                        return {
                                element: element.parentNode, offset: 0
                            }
                    }
                    else
                    {
                        return {
                                element: element, offset: offset
                            }
                    }
                };
            var api = {
                    getSelection: function()
                    {
                        var range = rangy.getSelection().getRangeAt(0);
                        var container = range.commonAncestorContainer;
                        var selection = {
                                start: brException(range.startContainer, range.startOffset), end: brException(range.endContainer, range.endOffset), collapsed: range.collapsed
                            };
                        container = container.nodeType === 3 ? container.parentNode : container;
                        if (container.parentNode === selection.start.element || container.parentNode === selection.end.element)
                        {
                            selection.container = container.parentNode
                        }
                        else
                        {
                            selection.container = container
                        }
                        return selection
                    }, getOnlySelectedElements: function()
                        {
                            var range = rangy.getSelection().getRangeAt(0);
                            var container = range.commonAncestorContainer;
                            container = container.nodeType === 3 ? container.parentNode : container;
                            return range.getNodes([1], function(node)
                                {
                                    return node.parentNode === container
                                })
                        }, getSelectionElement: function()
                        {
                            return api.getSelection().container
                        }, setSelection: function(el, start, end)
                        {
                            var range = rangy.createRange();
                            range.setStart(el, start);
                            range.setEnd(el, end);
                            rangy.getSelection().setSingleRange(range)
                        }, setSelectionBeforeElement: function(el)
                        {
                            var range = rangy.createRange();
                            range.selectNode(el);
                            range.collapse(true);
                            rangy.getSelection().setSingleRange(range)
                        }, setSelectionAfterElement: function(el)
                        {
                            var range = rangy.createRange();
                            range.selectNode(el);
                            range.collapse(false);
                            rangy.getSelection().setSingleRange(range)
                        }, setSelectionToElementStart: function(el)
                        {
                            var range = rangy.createRange();
                            range.selectNodeContents(el);
                            range.collapse(true);
                            rangy.getSelection().setSingleRange(range)
                        }, setSelectionToElementEnd: function(el)
                        {
                            var range = rangy.createRange();
                            range.selectNodeContents(el);
                            range.collapse(false);
                            if (el.childNodes && el.childNodes[el.childNodes.length - 1] && el.childNodes[el.childNodes.length - 1].nodeName === 'br')
                            {
                                range.startOffset = range.endOffset = range.startOffset - 1
                            }
                            rangy.getSelection().setSingleRange(range)
                        }, insertHtml: function(html, topNode)
                        {
                            var parent,
                                secondParent,
                                _childI,
                                nodes,
                                i,
                                lastNode,
                                _tempFrag;
                            var element = angular.element("<div>" + html + "</div>");
                            var range = rangy.getSelection().getRangeAt(0);
                            var frag = _document.createDocumentFragment();
                            var children = element[0].childNodes;
                            var isInline = true;
                            if (children.length > 0)
                            {
                                nodes = [];
                                for (_childI = 0; _childI < children.length; _childI++)
                                {
                                    if (!((children[_childI].nodeName.toLowerCase() === 'p' && children[_childI].innerHTML.trim() === '') || (children[_childI].nodeType === 3 && children[_childI].nodeValue.trim() === '')))
                                    {
                                        isInline = isInline && !BLOCKELEMENTS.test(children[_childI].nodeName);
                                        nodes.push(children[_childI])
                                    }
                                }
                                for (var _n = 0; _n < nodes.length; _n++)
                                    lastNode = frag.appendChild(nodes[_n]);
                                if (!isInline && range.collapsed && /^(|<br(|\/)>)$/i.test(range.startContainer.innerHTML))
                                    range.selectNode(range.startContainer)
                            }
                            else
                            {
                                isInline = true;
                                lastNode = frag = _document.createTextNode(html)
                            }
                            if (isInline)
                            {
                                range.deleteContents()
                            }
                            else
                            {
                                if (range.collapsed && range.startContainer !== topNode)
                                {
                                    if (range.startContainer.innerHTML && range.startContainer.innerHTML.match(/^<[^>]*>$/i))
                                    {
                                        parent = range.startContainer;
                                        if (range.startOffset === 1)
                                        {
                                            range.setStartAfter(parent);
                                            range.setEndAfter(parent)
                                        }
                                        else
                                        {
                                            range.setStartBefore(parent);
                                            range.setEndBefore(parent)
                                        }
                                    }
                                    else
                                    {
                                        if (range.startContainer.nodeType === 3 && range.startContainer.parentNode !== topNode)
                                        {
                                            parent = range.startContainer.parentNode;
                                            secondParent = parent.cloneNode();
                                            taDOM.splitNodes(parent.childNodes, parent, secondParent, range.startContainer, range.startOffset);
                                            while (!VALIDELEMENTS.test(parent.nodeName))
                                            {
                                                angular.element(parent).after(secondParent);
                                                parent = parent.parentNode;
                                                var _lastSecondParent = secondParent;
                                                secondParent = parent.cloneNode();
                                                taDOM.splitNodes(parent.childNodes, parent, secondParent, _lastSecondParent)
                                            }
                                        }
                                        else
                                        {
                                            parent = range.startContainer;
                                            secondParent = parent.cloneNode();
                                            taDOM.splitNodes(parent.childNodes, parent, secondParent, undefined, undefined, range.startOffset)
                                        }
                                        angular.element(parent).after(secondParent);
                                        range.setStartAfter(parent);
                                        range.setEndAfter(parent);
                                        if (/^(|<br(|\/)>)$/i.test(parent.innerHTML.trim()))
                                        {
                                            range.setStartBefore(parent);
                                            range.setEndBefore(parent);
                                            angular.element(parent).remove()
                                        }
                                        if (/^(|<br(|\/)>)$/i.test(secondParent.innerHTML.trim()))
                                            angular.element(secondParent).remove();
                                        if (parent.nodeName.toLowerCase() === 'li')
                                        {
                                            _tempFrag = _document.createDocumentFragment();
                                            for (i = 0; i < frag.childNodes.length; i++)
                                            {
                                                element = angular.element('<li>');
                                                taDOM.transferChildNodes(frag.childNodes[i], element[0]);
                                                taDOM.transferNodeAttributes(frag.childNodes[i], element[0]);
                                                _tempFrag.appendChild(element[0])
                                            }
                                            frag = _tempFrag;
                                            if (lastNode)
                                            {
                                                lastNode = frag.childNodes[frag.childNodes.length - 1];
                                                lastNode = lastNode.childNodes[lastNode.childNodes.length - 1]
                                            }
                                        }
                                    }
                                }
                                else
                                {
                                    range.deleteContents()
                                }
                            }
                            range.insertNode(frag);
                            if (lastNode)
                            {
                                api.setSelectionToElementEnd(lastNode)
                            }
                        }
                };
            return api
        }]).service('taDOM', function()
    {
        var taDOM = {
                getByAttribute: function(element, attribute)
                {
                    var resultingElements = [];
                    var childNodes = element.children();
                    if (childNodes.length)
                    {
                        angular.forEach(childNodes, function(child)
                        {
                            resultingElements = resultingElements.concat(taDOM.getByAttribute(angular.element(child), attribute))
                        })
                    }
                    if (element.attr(attribute) !== undefined)
                        resultingElements.push(element);
                    return resultingElements
                }, transferChildNodes: function(source, target)
                    {
                        target.innerHTML = '';
                        while (source.childNodes.length > 0)
                            target.appendChild(source.childNodes[0]);
                        return target
                    }, splitNodes: function(nodes, target1, target2, splitNode, subSplitIndex, splitIndex)
                    {
                        if (!splitNode && isNaN(splitIndex))
                            throw new Error('taDOM.splitNodes requires a splitNode or splitIndex');
                        var startNodes = document.createDocumentFragment();
                        var endNodes = document.createDocumentFragment();
                        var index = 0;
                        while (nodes.length > 0 && (isNaN(splitIndex) || splitIndex !== index) && nodes[0] !== splitNode)
                        {
                            startNodes.appendChild(nodes[0]);
                            index++
                        }
                        if (!isNaN(subSplitIndex) && subSplitIndex >= 0 && nodes[0])
                        {
                            startNodes.appendChild(document.createTextNode(nodes[0].nodeValue.substring(0, subSplitIndex)));
                            nodes[0].nodeValue = nodes[0].nodeValue.substring(subSplitIndex)
                        }
                        while (nodes.length > 0)
                            endNodes.appendChild(nodes[0]);
                        taDOM.transferChildNodes(startNodes, target1);
                        taDOM.transferChildNodes(endNodes, target2)
                    }, transferNodeAttributes: function(source, target)
                    {
                        for (var i = 0; i < source.attributes.length; i++)
                            target.setAttribute(source.attributes[i].name, source.attributes[i].value);
                        return target
                    }
            };
        return taDOM
    });
    angular.module('textAngular.validators', []).directive('taMaxText', function()
    {
        return {
                restrict: 'A', require: 'ngModel', link: function(scope, elem, attrs, ctrl)
                    {
                        var max = parseInt(scope.$eval(attrs.taMaxText));
                        if (isNaN(max))
                        {
                            throw('Max text must be an integer');
                        }
                        attrs.$observe('taMaxText', function(value)
                        {
                            max = parseInt(value);
                            if (isNaN(max))
                            {
                                throw('Max text must be an integer');
                            }
                            if (ctrl.$dirty)
                            {
                                ctrl.$validate()
                            }
                        });
                        ctrl.$validators.taMaxText = function(viewValue)
                        {
                            var source = angular.element('<div/>');
                            source.html(viewValue);
                            return source.text().length <= max
                        }
                    }
            }
    }).directive('taMinText', function()
    {
        return {
                restrict: 'A', require: 'ngModel', link: function(scope, elem, attrs, ctrl)
                    {
                        var min = parseInt(scope.$eval(attrs.taMinText));
                        if (isNaN(min))
                        {
                            throw('Min text must be an integer');
                        }
                        attrs.$observe('taMinText', function(value)
                        {
                            min = parseInt(value);
                            if (isNaN(min))
                            {
                                throw('Min text must be an integer');
                            }
                            if (ctrl.$dirty)
                            {
                                ctrl.$validate()
                            }
                        });
                        ctrl.$validators.taMinText = function(viewValue)
                        {
                            var source = angular.element('<div/>');
                            source.html(viewValue);
                            return !source.text().length || source.text().length >= min
                        }
                    }
            }
    });
    angular.module('textAngular.taBind', ['textAngular.factories', 'textAngular.DOM']).service('_taBlankTest', [function()
        {
            var INLINETAGS_NONBLANK = /<(a|abbr|acronym|bdi|bdo|big|cite|code|del|dfn|img|ins|kbd|label|map|mark|q|ruby|rp|rt|s|samp|time|tt|var)[^>]*(>|$)/i;
            return function(_defaultTest)
                {
                    return function(_blankVal)
                        {
                            if (!_blankVal)
                                return true;
                            var _firstMatch = /(^[^<]|>)[^<]/i.exec(_blankVal);
                            var _firstTagIndex;
                            if (!_firstMatch)
                            {
                                _blankVal = _blankVal.toString().replace(/="[^"]*"/i, '').replace(/="[^"]*"/i, '').replace(/="[^"]*"/i, '').replace(/="[^"]*"/i, '');
                                _firstTagIndex = _blankVal.indexOf('>')
                            }
                            else
                            {
                                _firstTagIndex = _firstMatch.index
                            }
                            _blankVal = _blankVal.trim().substring(_firstTagIndex, _firstTagIndex + 100);
                            if (/^[^<>]+$/i.test(_blankVal))
                                return false;
                            if (_blankVal.length === 0 || _blankVal === _defaultTest || /^>(\s|&nbsp;)*<\/[^>]+>$/ig.test(_blankVal))
                                return true;
                            else if (/>\s*[^\s<]/i.test(_blankVal) || INLINETAGS_NONBLANK.test(_blankVal))
                                return false;
                            else
                                return true
                        }
                }
        }]).directive('taButton', [function()
        {
            return {link: function(scope, element, attrs)
                    {
                        element.attr('unselectable', 'on');
                        element.on('mousedown', function(e, eventData)
                        {
                            if (eventData)
                                angular.extend(e, eventData);
                            e.preventDefault();
                            return false
                        })
                    }}
        }]).directive('taBind', ['taSanitize', '$timeout', '$window', '$document', 'taFixChrome', 'taBrowserTag', 'taSelection', 'taSelectableElements', 'taApplyCustomRenderers', 'taOptions', '_taBlankTest', '$parse', 'taDOM', 'textAngularManager', function(taSanitize, $timeout, $window, $document, taFixChrome, taBrowserTag, taSelection, taSelectableElements, taApplyCustomRenderers, taOptions, _taBlankTest, $parse, taDOM, textAngularManager)
        {
            return {
                    priority: 2, require: ['ngModel', '?ngModelOptions'], link: function(scope, element, attrs, controller)
                        {
                            var ngModel = controller[0];
                            var ngModelOptions = controller[1] || {};
                            var _isContentEditable = element.attr('contenteditable') !== undefined && element.attr('contenteditable');
                            var _isInputFriendly = _isContentEditable || element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input';
                            var _isReadonly = false;
                            var _focussed = false;
                            var _skipRender = false;
                            var _disableSanitizer = attrs.taUnsafeSanitizer || taOptions.disableSanitizer;
                            var _lastKey;
                            var BLOCKED_KEYS = /^(9|19|20|27|33|34|35|36|37|38|39|40|45|112|113|114|115|116|117|118|119|120|121|122|123|144|145)$/i;
                            var UNDO_TRIGGER_KEYS = /^(8|13|32|46|59|61|107|109|173|186|187|188|189|190|191|192|219|220|221|222)$/i;
                            var _pasteHandler;
                            var _defaultVal,
                                _defaultTest;
                            var _CTRL_KEY = 0x0001;
                            var _META_KEY = 0x0002;
                            var _ALT_KEY = 0x0004;
                            var _SHIFT_KEY = 0x0008;
                            var _keyMappings = [{
                                        specialKey: 'UndoKey', forbiddenModifiers: _ALT_KEY + _SHIFT_KEY, mustHaveModifiers: [_META_KEY + _CTRL_KEY], keyCode: 90
                                    }, {
                                        specialKey: 'RedoKey', forbiddenModifiers: _ALT_KEY, mustHaveModifiers: [_META_KEY + _CTRL_KEY, _SHIFT_KEY], keyCode: 90
                                    }, {
                                        specialKey: 'RedoKey', forbiddenModifiers: _ALT_KEY + _SHIFT_KEY, mustHaveModifiers: [_META_KEY + _CTRL_KEY], keyCode: 89
                                    }, {
                                        specialKey: 'TabKey', forbiddenModifiers: _META_KEY + _SHIFT_KEY + _ALT_KEY + _CTRL_KEY, mustHaveModifiers: [], keyCode: 9
                                    }, {
                                        specialKey: 'ShiftTabKey', forbiddenModifiers: _META_KEY + _ALT_KEY + _CTRL_KEY, mustHaveModifiers: [_SHIFT_KEY], keyCode: 9
                                    }];
                            function _mapKeys(event)
                            {
                                var specialKey;
                                _keyMappings.forEach(function(map)
                                {
                                    if (map.keyCode === event.keyCode)
                                    {
                                        var netModifiers = (event.metaKey ? _META_KEY : 0) + (event.ctrlKey ? _CTRL_KEY : 0) + (event.shiftKey ? _SHIFT_KEY : 0) + (event.altKey ? _ALT_KEY : 0);
                                        if (map.forbiddenModifiers & netModifiers)
                                            return;
                                        if (map.mustHaveModifiers.every(function(modifier)
                                        {
                                            return netModifiers & modifier
                                        }))
                                        {
                                            specialKey = map.specialKey
                                        }
                                    }
                                });
                                return specialKey
                            }
                            if (attrs.taDefaultWrap === undefined)
                                attrs.taDefaultWrap = 'p';
                            if (attrs.taDefaultWrap === '')
                            {
                                _defaultVal = '';
                                _defaultTest = (_browserDetect.ie === undefined) ? '<div><br></div>' : (_browserDetect.ie >= 11) ? '<p><br></p>' : (_browserDetect.ie <= 8) ? '<P>&nbsp;</P>' : '<p>&nbsp;</p>'
                            }
                            else
                            {
                                _defaultVal = (_browserDetect.ie === undefined || _browserDetect.ie >= 11) ? '<' + attrs.taDefaultWrap + '><br></' + attrs.taDefaultWrap + '>' : (_browserDetect.ie <= 8) ? '<' + attrs.taDefaultWrap.toUpperCase() + '></' + attrs.taDefaultWrap.toUpperCase() + '>' : '<' + attrs.taDefaultWrap + '></' + attrs.taDefaultWrap + '>';
                                _defaultTest = (_browserDetect.ie === undefined || _browserDetect.ie >= 11) ? '<' + attrs.taDefaultWrap + '><br></' + attrs.taDefaultWrap + '>' : (_browserDetect.ie <= 8) ? '<' + attrs.taDefaultWrap.toUpperCase() + '>&nbsp;</' + attrs.taDefaultWrap.toUpperCase() + '>' : '<' + attrs.taDefaultWrap + '>&nbsp;</' + attrs.taDefaultWrap + '>'
                            }
                            if (!ngModelOptions.$options)
                                ngModelOptions.$options = {};
                            var _blankTest = _taBlankTest(_defaultTest);
                            var _ensureContentWrapped = function(value)
                                {
                                    if (_blankTest(value))
                                        return value;
                                    var domTest = angular.element("<div>" + value + "</div>");
                                    if (domTest.children().length === 0)
                                    {
                                        value = "<" + attrs.taDefaultWrap + ">" + value + "</" + attrs.taDefaultWrap + ">"
                                    }
                                    else
                                    {
                                        var _children = domTest[0].childNodes;
                                        var i;
                                        var _foundBlockElement = false;
                                        for (i = 0; i < _children.length; i++)
                                        {
                                            if (_foundBlockElement = _children[i].nodeName.toLowerCase().match(BLOCKELEMENTS))
                                                break
                                        }
                                        if (!_foundBlockElement)
                                        {
                                            value = "<" + attrs.taDefaultWrap + ">" + value + "</" + attrs.taDefaultWrap + ">"
                                        }
                                        else
                                        {
                                            value = "";
                                            for (i = 0; i < _children.length; i++)
                                            {
                                                if (!_children[i].nodeName.toLowerCase().match(BLOCKELEMENTS))
                                                {
                                                    var _subVal = (_children[i].outerHTML || _children[i].nodeValue);
                                                    if (_subVal.trim() !== '')
                                                        value += "<" + attrs.taDefaultWrap + ">" + _subVal + "</" + attrs.taDefaultWrap + ">";
                                                    else
                                                        value += _subVal
                                                }
                                                else
                                                {
                                                    value += _children[i].outerHTML
                                                }
                                            }
                                        }
                                    }
                                    return value
                                };
                            if (attrs.taPaste)
                                _pasteHandler = $parse(attrs.taPaste);
                            element.addClass('ta-bind');
                            var _undoKeyupTimeout;
                            scope['$undoManager' + (attrs.id || '')] = ngModel.$undoManager = {
                                _stack: [], _index: 0, _max: 1000, push: function(value)
                                    {
                                        if ((typeof value === "undefined" || value === null) || ((typeof this.current() !== "undefined" && this.current() !== null) && value === this.current()))
                                            return value;
                                        if (this._index < this._stack.length - 1)
                                        {
                                            this._stack = this._stack.slice(0, this._index + 1)
                                        }
                                        this._stack.push(value);
                                        if (_undoKeyupTimeout)
                                            $timeout.cancel(_undoKeyupTimeout);
                                        if (this._stack.length > this._max)
                                            this._stack.shift();
                                        this._index = this._stack.length - 1;
                                        return value
                                    }, undo: function()
                                    {
                                        return this.setToIndex(this._index - 1)
                                    }, redo: function()
                                    {
                                        return this.setToIndex(this._index + 1)
                                    }, setToIndex: function(index)
                                    {
                                        if (index < 0 || index > this._stack.length - 1)
                                        {
                                            return undefined
                                        }
                                        this._index = index;
                                        return this.current()
                                    }, current: function()
                                    {
                                        return this._stack[this._index]
                                    }
                            };
                            var _redoUndoTimeout;
                            var _undo = scope['$undoTaBind' + (attrs.id || '')] = function()
                                {
                                    if (!_isReadonly && _isContentEditable)
                                    {
                                        var content = ngModel.$undoManager.undo();
                                        if (typeof content !== "undefined" && content !== null)
                                        {
                                            _setInnerHTML(content);
                                            _setViewValue(content, false);
                                            if (_redoUndoTimeout)
                                                $timeout.cancel(_redoUndoTimeout);
                                            _redoUndoTimeout = $timeout(function()
                                            {
                                                element[0].focus();
                                                taSelection.setSelectionToElementEnd(element[0])
                                            }, 1)
                                        }
                                    }
                                };
                            var _redo = scope['$redoTaBind' + (attrs.id || '')] = function()
                                {
                                    if (!_isReadonly && _isContentEditable)
                                    {
                                        var content = ngModel.$undoManager.redo();
                                        if (typeof content !== "undefined" && content !== null)
                                        {
                                            _setInnerHTML(content);
                                            _setViewValue(content, false);
                                            if (_redoUndoTimeout)
                                                $timeout.cancel(_redoUndoTimeout);
                                            _redoUndoTimeout = $timeout(function()
                                            {
                                                element[0].focus();
                                                taSelection.setSelectionToElementEnd(element[0])
                                            }, 1)
                                        }
                                    }
                                };
                            var _compileHtml = function()
                                {
                                    if (_isContentEditable)
                                        return element[0].innerHTML;
                                    if (_isInputFriendly)
                                        return element.val();
                                    throw('textAngular Error: attempting to update non-editable taBind');
                                };
                            var _setViewValue = function(_val, triggerUndo, skipRender)
                                {
                                    _skipRender = skipRender || false;
                                    if (typeof triggerUndo === "undefined" || triggerUndo === null)
                                        triggerUndo = true && _isContentEditable;
                                    if (typeof _val === "undefined" || _val === null)
                                        _val = _compileHtml();
                                    if (_blankTest(_val))
                                    {
                                        if (ngModel.$viewValue !== '')
                                            ngModel.$setViewValue('');
                                        if (triggerUndo && ngModel.$undoManager.current() !== '')
                                            ngModel.$undoManager.push('')
                                    }
                                    else
                                    {
                                        _reApplyOnSelectorHandlers();
                                        if (ngModel.$viewValue !== _val)
                                        {
                                            ngModel.$setViewValue(_val);
                                            if (triggerUndo)
                                                ngModel.$undoManager.push(_val)
                                        }
                                    }
                                    ngModel.$render()
                                };
                            scope['updateTaBind' + (attrs.id || '')] = function()
                            {
                                if (!_isReadonly)
                                    _setViewValue(undefined, undefined, true)
                            };
                            var _sanitize = function(unsafe)
                                {
                                    return (ngModel.$oldViewValue = taSanitize(taFixChrome(unsafe), ngModel.$oldViewValue, _disableSanitizer))
                                };
                            if (element.attr('required'))
                                ngModel.$validators.required = function(modelValue, viewValue)
                                {
                                    return !_blankTest(modelValue || viewValue)
                                };
                            ngModel.$parsers.push(_sanitize);
                            ngModel.$parsers.unshift(_ensureContentWrapped);
                            ngModel.$formatters.push(_sanitize);
                            ngModel.$formatters.unshift(_ensureContentWrapped);
                            ngModel.$formatters.unshift(function(value)
                            {
                                return ngModel.$undoManager.push(value || '')
                            });
                            if (_isInputFriendly)
                            {
                                scope.events = {};
                                if (!_isContentEditable)
                                {
                                    element.on('change blur', scope.events.change = scope.events.blur = function()
                                    {
                                        if (!_isReadonly)
                                            ngModel.$setViewValue(_compileHtml())
                                    });
                                    element.on('keydown', scope.events.keydown = function(event, eventData)
                                    {
                                        if (eventData)
                                            angular.extend(event, eventData);
                                        if (event.keyCode === 9)
                                        {
                                            var start = this.selectionStart;
                                            var end = this.selectionEnd;
                                            var value = element.val();
                                            if (event.shiftKey)
                                            {
                                                var _linebreak = value.lastIndexOf('\n', start),
                                                    _tab = value.lastIndexOf('\t', start);
                                                if (_tab !== -1 && _tab >= _linebreak)
                                                {
                                                    element.val(value.substring(0, _tab) + value.substring(_tab + 1));
                                                    this.selectionStart = this.selectionEnd = start - 1
                                                }
                                            }
                                            else
                                            {
                                                element.val(value.substring(0, start) + "\t" + value.substring(end));
                                                this.selectionStart = this.selectionEnd = start + 1
                                            }
                                            event.preventDefault()
                                        }
                                    });
                                    var _repeat = function(string, n)
                                        {
                                            var result = '';
                                            for (var _n = 0; _n < n; _n++)
                                                result += string;
                                            return result
                                        };
                                    var recursiveListFormat = function(listNode, tablevel)
                                        {
                                            var _html = '',
                                                _children = listNode.childNodes;
                                            tablevel++;
                                            _html += _repeat('\t', tablevel - 1) + listNode.outerHTML.substring(0, listNode.outerHTML.indexOf('<li'));
                                            for (var _i = 0; _i < _children.length; _i++)
                                            {
                                                if (!_children[_i].outerHTML)
                                                    continue;
                                                if (_children[_i].nodeName.toLowerCase() === 'ul' || _children[_i].nodeName.toLowerCase() === 'ol')
                                                    _html += '\n' + recursiveListFormat(_children[_i], tablevel);
                                                else
                                                    _html += '\n' + _repeat('\t', tablevel) + _children[_i].outerHTML
                                            }
                                            _html += '\n' + _repeat('\t', tablevel - 1) + listNode.outerHTML.substring(listNode.outerHTML.lastIndexOf('<'));
                                            return _html
                                        };
                                    ngModel.$formatters.unshift(function(htmlValue)
                                    {
                                        var _children = angular.element('<div>' + htmlValue + '</div>')[0].childNodes;
                                        if (_children.length > 0)
                                        {
                                            htmlValue = '';
                                            for (var i = 0; i < _children.length; i++)
                                            {
                                                if (!_children[i].outerHTML)
                                                    continue;
                                                if (htmlValue.length > 0)
                                                    htmlValue += '\n';
                                                if (_children[i].nodeName.toLowerCase() === 'ul' || _children[i].nodeName.toLowerCase() === 'ol')
                                                    htmlValue += '' + recursiveListFormat(_children[i], 0);
                                                else
                                                    htmlValue += '' + _children[i].outerHTML
                                            }
                                        }
                                        return htmlValue
                                    })
                                }
                                else
                                {
                                    var _processingPaste = false;
                                    var processpaste = function(text)
                                        {
                                            if (text && text.trim().length)
                                            {
                                                if (text.match(/class=["']*Mso(Normal|List)/i))
                                                {
                                                    var textFragment = text.match(/<!--StartFragment-->([\s\S]*?)<!--EndFragment-->/i);
                                                    if (!textFragment)
                                                        textFragment = text;
                                                    else
                                                        textFragment = textFragment[1];
                                                    textFragment = textFragment.replace(/<o:p>[\s\S]*?<\/o:p>/ig, '').replace(/class=(["']|)MsoNormal(["']|)/ig, '');
                                                    var dom = angular.element("<div>" + textFragment + "</div>");
                                                    var targetDom = angular.element("<div></div>");
                                                    var _list = {
                                                            element: null, lastIndent: [], lastLi: null, isUl: false
                                                        };
                                                    _list.lastIndent.peek = function()
                                                    {
                                                        var n = this.length;
                                                        if (n > 0)
                                                            return this[n - 1]
                                                    };
                                                    var _resetList = function(isUl)
                                                        {
                                                            _list.isUl = isUl;
                                                            _list.element = angular.element(isUl ? "<ul>" : "<ol>");
                                                            _list.lastIndent = [];
                                                            _list.lastIndent.peek = function()
                                                            {
                                                                var n = this.length;
                                                                if (n > 0)
                                                                    return this[n - 1]
                                                            };
                                                            _list.lastLevelMatch = null
                                                        };
                                                    for (var i = 0; i <= dom[0].childNodes.length; i++)
                                                    {
                                                        if (!dom[0].childNodes[i] || dom[0].childNodes[i].nodeName === "#text" || dom[0].childNodes[i].tagName.toLowerCase() !== "p")
                                                            continue;
                                                        var el = angular.element(dom[0].childNodes[i]);
                                                        var _listMatch = (el.attr('class') || '').match(/MsoList(Bullet|Number|Paragraph)(CxSp(First|Middle|Last)|)/i);
                                                        if (_listMatch)
                                                        {
                                                            if (el[0].childNodes.length < 2 || el[0].childNodes[1].childNodes.length < 1)
                                                            {
                                                                continue
                                                            }
                                                            var isUl = _listMatch[1].toLowerCase() === "bullet" || (_listMatch[1].toLowerCase() !== "number" && !(/^[^0-9a-z<]*[0-9a-z]+[^0-9a-z<>]</i.test(el[0].childNodes[1].innerHTML) || /^[^0-9a-z<]*[0-9a-z]+[^0-9a-z<>]</i.test(el[0].childNodes[1].childNodes[0].innerHTML)));
                                                            var _indentMatch = (el.attr('style') || '').match(/margin-left:([\-\.0-9]*)/i);
                                                            var indent = parseFloat((_indentMatch) ? _indentMatch[1] : 0);
                                                            var _levelMatch = (el.attr('style') || '').match(/mso-list:l([0-9]+) level([0-9]+) lfo[0-9+]($|;)/i);
                                                            if (_levelMatch && _levelMatch[2])
                                                                indent = parseInt(_levelMatch[2]);
                                                            if ((_levelMatch && (!_list.lastLevelMatch || _levelMatch[1] !== _list.lastLevelMatch[1])) || !_listMatch[3] || _listMatch[3].toLowerCase() === "first" || (_list.lastIndent.peek() === null) || (_list.isUl !== isUl && _list.lastIndent.peek() === indent))
                                                            {
                                                                _resetList(isUl);
                                                                targetDom.append(_list.element)
                                                            }
                                                            else if (_list.lastIndent.peek() != null && _list.lastIndent.peek() < indent)
                                                            {
                                                                _list.element = angular.element(isUl ? "<ul>" : "<ol>");
                                                                _list.lastLi.append(_list.element)
                                                            }
                                                            else if (_list.lastIndent.peek() != null && _list.lastIndent.peek() > indent)
                                                            {
                                                                while (_list.lastIndent.peek() != null && _list.lastIndent.peek() > indent)
                                                                {
                                                                    if (_list.element.parent()[0].tagName.toLowerCase() === 'li')
                                                                    {
                                                                        _list.element = _list.element.parent();
                                                                        continue
                                                                    }
                                                                    else if (/[uo]l/i.test(_list.element.parent()[0].tagName.toLowerCase()))
                                                                    {
                                                                        _list.element = _list.element.parent()
                                                                    }
                                                                    else
                                                                    {
                                                                        break
                                                                    }
                                                                    _list.lastIndent.pop()
                                                                }
                                                                _list.isUl = _list.element[0].tagName.toLowerCase() === "ul";
                                                                if (isUl !== _list.isUl)
                                                                {
                                                                    _resetList(isUl);
                                                                    targetDom.append(_list.element)
                                                                }
                                                            }
                                                            _list.lastLevelMatch = _levelMatch;
                                                            if (indent !== _list.lastIndent.peek())
                                                                _list.lastIndent.push(indent);
                                                            _list.lastLi = angular.element("<li>");
                                                            _list.element.append(_list.lastLi);
                                                            _list.lastLi.html(el.html().replace(/<!(--|)\[if !supportLists\](--|)>[\s\S]*?<!(--|)\[endif\](--|)>/ig, ''));
                                                            el.remove()
                                                        }
                                                        else
                                                        {
                                                            _resetList(false);
                                                            targetDom.append(el)
                                                        }
                                                    }
                                                    var _unwrapElement = function(node)
                                                        {
                                                            node = angular.element(node);
                                                            for (var _n = node[0].childNodes.length - 1; _n >= 0; _n--)
                                                                node.after(node[0].childNodes[_n]);
                                                            node.remove()
                                                        };
                                                    angular.forEach(targetDom.find('span'), function(node)
                                                    {
                                                        node.removeAttribute('lang');
                                                        if (node.attributes.length <= 0)
                                                            _unwrapElement(node)
                                                    });
                                                    angular.forEach(targetDom.find('font'), _unwrapElement);
                                                    text = targetDom.html()
                                                }
                                                else
                                                {
                                                    text = text.replace(/<(|\/)meta[^>]*?>/ig, '');
                                                    if (text.match(/<[^>]*?(ta-bind)[^>]*?>/))
                                                    {
                                                        if (text.match(/<[^>]*?(text-angular)[^>]*?>/))
                                                        {
                                                            var _el = angular.element("<div>" + text + "</div>");
                                                            _el.find('textarea').remove();
                                                            var binds = taDOM.getByAttribute(_el, 'ta-bind');
                                                            for (var _b = 0; _b < binds.length; _b++)
                                                            {
                                                                var _target = binds[_b][0].parentNode.parentNode;
                                                                for (var _c = 0; _c < binds[_b][0].childNodes.length; _c++)
                                                                {
                                                                    _target.parentNode.insertBefore(binds[_b][0].childNodes[_c], _target)
                                                                }
                                                                _target.parentNode.removeChild(_target)
                                                            }
                                                            text = _el.html().replace('<br class="Apple-interchange-newline">', '')
                                                        }
                                                    }
                                                    else if (text.match(/^<span/))
                                                    {
                                                        text = text.replace(/<(|\/)span[^>]*?>/ig, '')
                                                    }
                                                    text = text.replace(/<br class="Apple-interchange-newline"[^>]*?>/ig, '').replace(/<span class="Apple-converted-space">( |&nbsp;)<\/span>/ig, '&nbsp;')
                                                }
                                                if (/<li(\s.*)?>/i.test(text) && /(<ul(\s.*)?>|<ol(\s.*)?>).*<li(\s.*)?>/i.test(text) === false)
                                                {
                                                    text = text.replace(/<li(\s.*)?>.*<\/li(\s.*)?>/i, '<ul>$&</ul>')
                                                }
                                                text = text.replace(/^[ |\u00A0]+/gm, function(match)
                                                {
                                                    var result = '';
                                                    for (var i = 0; i < match.length; i++)
                                                    {
                                                        result += '&nbsp;'
                                                    }
                                                    return result
                                                }).replace(/\n|\r\n|\r/g, '<br />').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
                                                if (_pasteHandler)
                                                    text = _pasteHandler(scope, {$html: text}) || text;
                                                text = taSanitize(text, '', _disableSanitizer);
                                                taSelection.insertHtml(text, element[0]);
                                                $timeout(function()
                                                {
                                                    ngModel.$setViewValue(_compileHtml());
                                                    _processingPaste = false;
                                                    element.removeClass('processing-paste')
                                                }, 0)
                                            }
                                            else
                                            {
                                                _processingPaste = false;
                                                element.removeClass('processing-paste')
                                            }
                                        };
                                    element.on('paste', scope.events.paste = function(e, eventData)
                                    {
                                        if (eventData)
                                            angular.extend(e, eventData);
                                        if (_isReadonly || _processingPaste)
                                        {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            return false
                                        }
                                        _processingPaste = true;
                                        element.addClass('processing-paste');
                                        var pastedContent;
                                        var clipboardData = (e.originalEvent || e).clipboardData;
                                        if (clipboardData && clipboardData.getData && clipboardData.types.length > 0)
                                        {
                                            var _types = "";
                                            for (var _t = 0; _t < clipboardData.types.length; _t++)
                                            {
                                                _types += " " + clipboardData.types[_t]
                                            }
                                            if (/text\/html/i.test(_types))
                                            {
                                                pastedContent = clipboardData.getData('text/html')
                                            }
                                            else if (/text\/plain/i.test(_types))
                                            {
                                                pastedContent = clipboardData.getData('text/plain')
                                            }
                                            processpaste(pastedContent);
                                            e.stopPropagation();
                                            e.preventDefault();
                                            return false
                                        }
                                        else
                                        {
                                            var _savedSelection = $window.rangy.saveSelection(),
                                                _tempDiv = angular.element('<div class="ta-hidden-input" contenteditable="true"></div>');
                                            $document.find('body').append(_tempDiv);
                                            _tempDiv[0].focus();
                                            $timeout(function()
                                            {
                                                $window.rangy.restoreSelection(_savedSelection);
                                                processpaste(_tempDiv[0].innerHTML);
                                                element[0].focus();
                                                _tempDiv.remove()
                                            }, 0)
                                        }
                                    });
                                    element.on('cut', scope.events.cut = function(e)
                                    {
                                        if (!_isReadonly)
                                            $timeout(function()
                                            {
                                                ngModel.$setViewValue(_compileHtml())
                                            }, 0);
                                        else
                                            e.preventDefault()
                                    });
                                    element.on('keydown', scope.events.keydown = function(event, eventData)
                                    {
                                        if (eventData)
                                            angular.extend(event, eventData);
                                        event.specialKey = _mapKeys(event);
                                        var userSpecialKey;
                                        taOptions.keyMappings.forEach(function(mapping)
                                        {
                                            if (event.specialKey === mapping.commandKeyCode)
                                            {
                                                event.specialKey = undefined
                                            }
                                            if (mapping.testForKey(event))
                                            {
                                                userSpecialKey = mapping.commandKeyCode
                                            }
                                            if ((mapping.commandKeyCode === 'UndoKey') || (mapping.commandKeyCode === 'RedoKey'))
                                            {
                                                if (!mapping.enablePropagation)
                                                {
                                                    event.preventDefault()
                                                }
                                            }
                                        });
                                        if (typeof userSpecialKey !== 'undefined')
                                        {
                                            event.specialKey = userSpecialKey
                                        }
                                        if ((typeof event.specialKey !== 'undefined') && (event.specialKey !== 'UndoKey' || event.specialKey !== 'RedoKey'))
                                        {
                                            event.preventDefault();
                                            textAngularManager.sendKeyCommand(scope, event)
                                        }
                                        if (!_isReadonly)
                                        {
                                            if (event.specialKey === 'UndoKey')
                                            {
                                                _undo();
                                                event.preventDefault()
                                            }
                                            if (event.specialKey === 'RedoKey')
                                            {
                                                _redo();
                                                event.preventDefault()
                                            }
                                            if (event.keyCode === 13 && !event.shiftKey)
                                            {
                                                var $selection;
                                                var selection = taSelection.getSelectionElement();
                                                if (!selection.tagName.match(VALIDELEMENTS))
                                                    return;
                                                var _new = angular.element(_defaultVal);
                                                if (/^<br(|\/)>$/i.test(selection.innerHTML.trim()) && selection.parentNode.tagName.toLowerCase() === 'blockquote' && !selection.nextSibling)
                                                {
                                                    $selection = angular.element(selection);
                                                    var _parent = $selection.parent();
                                                    _parent.after(_new);
                                                    $selection.remove();
                                                    if (_parent.children().length === 0)
                                                        _parent.remove();
                                                    taSelection.setSelectionToElementStart(_new[0]);
                                                    event.preventDefault()
                                                }
                                                else if (/^<[^>]+><br(|\/)><\/[^>]+>$/i.test(selection.innerHTML.trim()) && selection.tagName.toLowerCase() === 'blockquote')
                                                {
                                                    $selection = angular.element(selection);
                                                    $selection.after(_new);
                                                    $selection.remove();
                                                    taSelection.setSelectionToElementStart(_new[0]);
                                                    event.preventDefault()
                                                }
                                            }
                                        }
                                    });
                                    var _keyupTimeout;
                                    element.on('keyup', scope.events.keyup = function(event, eventData)
                                    {
                                        if (eventData)
                                            angular.extend(event, eventData);
                                        if (event.keyCode === 9)
                                        {
                                            var _selection = taSelection.getSelection();
                                            if (_selection.start.element === element[0] && element.children().length)
                                                taSelection.setSelectionToElementStart(element.children()[0]);
                                            return
                                        }
                                        if (_undoKeyupTimeout)
                                            $timeout.cancel(_undoKeyupTimeout);
                                        if (!_isReadonly && !BLOCKED_KEYS.test(event.keyCode))
                                        {
                                            if (_defaultVal !== '' && event.keyCode === 13)
                                            {
                                                if (!event.shiftKey)
                                                {
                                                    var selection = taSelection.getSelectionElement();
                                                    while (!selection.tagName.match(VALIDELEMENTS) && selection !== element[0])
                                                    {
                                                        selection = selection.parentNode
                                                    }
                                                    if (selection.tagName.toLowerCase() !== attrs.taDefaultWrap && selection.tagName.toLowerCase() !== 'li' && (selection.innerHTML.trim() === '' || selection.innerHTML.trim() === '<br>'))
                                                    {
                                                        var _new = angular.element(_defaultVal);
                                                        angular.element(selection).replaceWith(_new);
                                                        taSelection.setSelectionToElementStart(_new[0])
                                                    }
                                                }
                                            }
                                            var val = _compileHtml();
                                            if (_defaultVal !== '' && val.trim() === '')
                                            {
                                                _setInnerHTML(_defaultVal);
                                                taSelection.setSelectionToElementStart(element.children()[0])
                                            }
                                            else if (val.substring(0, 1) !== '<' && attrs.taDefaultWrap !== '')
                                            {
                                                var _savedSelection = $window.rangy.saveSelection();
                                                val = _compileHtml();
                                                val = "<" + attrs.taDefaultWrap + ">" + val + "</" + attrs.taDefaultWrap + ">";
                                                _setInnerHTML(val);
                                                $window.rangy.restoreSelection(_savedSelection)
                                            }
                                            var triggerUndo = _lastKey !== event.keyCode && UNDO_TRIGGER_KEYS.test(event.keyCode);
                                            if (_keyupTimeout)
                                                $timeout.cancel(_keyupTimeout);
                                            _keyupTimeout = $timeout(function()
                                            {
                                                _setViewValue(val, triggerUndo, true)
                                            }, ngModelOptions.$options.debounce || 400);
                                            if (!triggerUndo)
                                                _undoKeyupTimeout = $timeout(function()
                                                {
                                                    ngModel.$undoManager.push(val)
                                                }, 250);
                                            _lastKey = event.keyCode
                                        }
                                    });
                                    element.on('blur', scope.events.blur = function()
                                    {
                                        _focussed = false;
                                        if (!_isReadonly)
                                        {
                                            _setViewValue(undefined, undefined, true)
                                        }
                                        else
                                        {
                                            _skipRender = true;
                                            ngModel.$render()
                                        }
                                    });
                                    if (attrs.placeholder && (_browserDetect.ie > 8 || _browserDetect.ie === undefined))
                                    {
                                        var rule;
                                        if (attrs.id)
                                            rule = addCSSRule('#' + attrs.id + '.placeholder-text:before', 'content: "' + attrs.placeholder + '"');
                                        else
                                            throw('textAngular Error: An unique ID is required for placeholders to work');
                                        scope.$on('$destroy', function()
                                        {
                                            removeCSSRule(rule)
                                        })
                                    }
                                    element.on('focus', scope.events.focus = function()
                                    {
                                        _focussed = true;
                                        element.removeClass('placeholder-text');
                                        _reApplyOnSelectorHandlers()
                                    });
                                    element.on('mouseup', scope.events.mouseup = function()
                                    {
                                        var _selection = taSelection.getSelection();
                                        if (_selection.start.element === element[0] && element.children().length)
                                            taSelection.setSelectionToElementStart(element.children()[0])
                                    });
                                    element.on('mousedown', scope.events.mousedown = function(event, eventData)
                                    {
                                        if (eventData)
                                            angular.extend(event, eventData);
                                        event.stopPropagation()
                                    })
                                }
                            }
                            var selectorClickHandler = function(event)
                                {
                                    scope.$emit('ta-element-select', this);
                                    event.preventDefault();
                                    return false
                                };
                            var fileDropHandler = function(event, eventData)
                                {
                                    if (eventData)
                                        angular.extend(event, eventData);
                                    if (!dropFired && !_isReadonly)
                                    {
                                        dropFired = true;
                                        var dataTransfer;
                                        if (event.originalEvent)
                                            dataTransfer = event.originalEvent.dataTransfer;
                                        else
                                            dataTransfer = event.dataTransfer;
                                        scope.$emit('ta-drop-event', this, event, dataTransfer);
                                        $timeout(function()
                                        {
                                            dropFired = false;
                                            _setViewValue(undefined, undefined, true)
                                        }, 100)
                                    }
                                };
                            var _reApplyOnSelectorHandlers = scope['reApplyOnSelectorHandlers' + (attrs.id || '')] = function()
                                {
                                    if (!_isReadonly)
                                        angular.forEach(taSelectableElements, function(selector)
                                        {
                                            element.find(selector).off('click', selectorClickHandler).on('click', selectorClickHandler)
                                        })
                                };
                            var _setInnerHTML = function(newval)
                                {
                                    element[0].innerHTML = newval
                                };
                            var _renderTimeout;
                            var _renderInProgress = false;
                            ngModel.$render = function()
                            {
                                if (_renderInProgress)
                                    return;
                                else
                                    _renderInProgress = true;
                                var val = ngModel.$viewValue || '';
                                if (!_skipRender)
                                {
                                    if (_isContentEditable && _focussed)
                                    {
                                        element.removeClass('placeholder-text');
                                        if (_renderTimeout)
                                            $timeout.cancel(_renderTimeout);
                                        _renderTimeout = $timeout(function()
                                        {
                                            if (!_focussed)
                                            {
                                                element[0].focus();
                                                taSelection.setSelectionToElementEnd(element.children()[element.children().length - 1])
                                            }
                                            _renderTimeout = undefined
                                        }, 1)
                                    }
                                    if (_isContentEditable)
                                    {
                                        if (attrs.placeholder)
                                        {
                                            if (val === '')
                                            {
                                                _setInnerHTML(_defaultVal)
                                            }
                                            else
                                            {
                                                _setInnerHTML(val)
                                            }
                                        }
                                        else
                                        {
                                            _setInnerHTML((val === '') ? _defaultVal : val)
                                        }
                                        if (!_isReadonly)
                                        {
                                            _reApplyOnSelectorHandlers();
                                            element.on('drop', fileDropHandler)
                                        }
                                        else
                                        {
                                            element.off('drop', fileDropHandler)
                                        }
                                    }
                                    else if (element[0].tagName.toLowerCase() !== 'textarea' && element[0].tagName.toLowerCase() !== 'input')
                                    {
                                        _setInnerHTML(taApplyCustomRenderers(val))
                                    }
                                    else
                                    {
                                        element.val(val)
                                    }
                                }
                                if (_isContentEditable && attrs.placeholder)
                                {
                                    if (val === '')
                                    {
                                        if (_focussed)
                                            element.removeClass('placeholder-text');
                                        else
                                            element.addClass('placeholder-text')
                                    }
                                    else
                                    {
                                        element.removeClass('placeholder-text')
                                    }
                                }
                                _renderInProgress = _skipRender = false
                            };
                            if (attrs.taReadonly)
                            {
                                _isReadonly = scope.$eval(attrs.taReadonly);
                                if (_isReadonly)
                                {
                                    element.addClass('ta-readonly');
                                    if (element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input')
                                    {
                                        element.attr('disabled', 'disabled')
                                    }
                                    if (element.attr('contenteditable') !== undefined && element.attr('contenteditable'))
                                    {
                                        element.removeAttr('contenteditable')
                                    }
                                }
                                else
                                {
                                    element.removeClass('ta-readonly');
                                    if (element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input')
                                    {
                                        element.removeAttr('disabled')
                                    }
                                    else if (_isContentEditable)
                                    {
                                        element.attr('contenteditable', 'true')
                                    }
                                }
                                scope.$watch(attrs.taReadonly, function(newVal, oldVal)
                                {
                                    if (oldVal === newVal)
                                        return;
                                    if (newVal)
                                    {
                                        element.addClass('ta-readonly');
                                        if (element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input')
                                        {
                                            element.attr('disabled', 'disabled')
                                        }
                                        if (element.attr('contenteditable') !== undefined && element.attr('contenteditable'))
                                        {
                                            element.removeAttr('contenteditable')
                                        }
                                        angular.forEach(taSelectableElements, function(selector)
                                        {
                                            element.find(selector).on('click', selectorClickHandler)
                                        });
                                        element.off('drop', fileDropHandler)
                                    }
                                    else
                                    {
                                        element.removeClass('ta-readonly');
                                        if (element[0].tagName.toLowerCase() === 'textarea' || element[0].tagName.toLowerCase() === 'input')
                                        {
                                            element.removeAttr('disabled')
                                        }
                                        else if (_isContentEditable)
                                        {
                                            element.attr('contenteditable', 'true')
                                        }
                                        angular.forEach(taSelectableElements, function(selector)
                                        {
                                            element.find(selector).off('click', selectorClickHandler)
                                        });
                                        element.on('drop', fileDropHandler)
                                    }
                                    _isReadonly = newVal
                                })
                            }
                            if (_isContentEditable && !_isReadonly)
                            {
                                angular.forEach(taSelectableElements, function(selector)
                                {
                                    element.find(selector).on('click', selectorClickHandler)
                                });
                                element.on('drop', fileDropHandler);
                                element.on('blur', function()
                                {
                                    if (_browserDetect.webkit)
                                    {
                                        globalContentEditableBlur = true
                                    }
                                })
                            }
                        }
                }
        }]);
    var dropFired = false;
    var textAngular = angular.module("textAngular", ['ngSanitize', 'textAngularSetup', 'textAngular.factories', 'textAngular.DOM', 'textAngular.validators', 'textAngular.taBind']);
    var taTools = {};
    function registerTextAngularTool(name, toolDefinition)
    {
        if (!name || name === '' || taTools.hasOwnProperty(name))
            throw('textAngular Error: A unique name is required for a Tool Definition');
        if ((toolDefinition.display && (toolDefinition.display === '' || !validElementString(toolDefinition.display))) || (!toolDefinition.display && !toolDefinition.buttontext && !toolDefinition.iconclass))
            throw('textAngular Error: Tool Definition for "' + name + '" does not have a valid display/iconclass/buttontext value');
        taTools[name] = toolDefinition
    }
    textAngular.constant('taRegisterTool', registerTextAngularTool);
    textAngular.value('taTools', taTools);
    textAngular.config([function()
        {
            angular.forEach(taTools, function(value, key)
            {
                delete taTools[key]
            })
        }]);
    textAngular.run([function()
        {
            if (typeof define === 'function' && define.amd)
            {
                define(function(require)
                {
                    window.rangy = require('rangy');
                    window.rangy.saveSelection = require('rangy/lib/rangy-selectionsaverestore')
                })
            }
            else if (typeof require === 'function' && typeof module !== 'undefined' && typeof exports === 'object')
            {
                window.rangy = require('rangy');
                window.rangy.saveSelection = require('rangy/lib/rangy-selectionsaverestore')
            }
            else
            {
                if (!window.rangy)
                {
                    throw("rangy-core.js and rangy-selectionsaverestore.js are required for textAngular to work correctly, rangy-core is not yet loaded.");
                }
                else
                {
                    window.rangy.init();
                    if (!window.rangy.saveSelection)
                    {
                        throw("rangy-selectionsaverestore.js is required for textAngular to work correctly.");
                    }
                }
            }
        }]);
    textAngular.directive("textAngular", ['$compile', '$timeout', 'taOptions', 'taSelection', 'taExecCommand', 'textAngularManager', '$window', '$document', '$animate', '$log', '$q', '$parse', function($compile, $timeout, taOptions, taSelection, taExecCommand, textAngularManager, $window, $document, $animate, $log, $q, $parse)
        {
            return {
                    require: '?ngModel', scope: {}, restrict: "EA", priority: 2, link: function(scope, element, attrs, ngModel)
                        {
                            var _keydown,
                                _keyup,
                                _keypress,
                                _mouseup,
                                _focusin,
                                _focusout,
                                _originalContents,
                                _toolbars,
                                _serial = (attrs.serial) ? attrs.serial : Math.floor(Math.random() * 10000000000000000),
                                _taExecCommand,
                                _resizeMouseDown,
                                _updateSelectedStylesTimeout;
                            scope._name = (attrs.name) ? attrs.name : 'textAngularEditor' + _serial;
                            var oneEvent = function(_element, event, action)
                                {
                                    $timeout(function()
                                    {
                                        var _func = function()
                                            {
                                                _element.off(event, _func);
                                                action.apply(this, arguments)
                                            };
                                        _element.on(event, _func)
                                    }, 100)
                                };
                            _taExecCommand = taExecCommand(attrs.taDefaultWrap);
                            angular.extend(scope, angular.copy(taOptions), {
                                wrapSelection: function(command, opt, isSelectableElementTool)
                                {
                                    if (command.toLowerCase() === "undo")
                                    {
                                        scope['$undoTaBindtaTextElement' + _serial]()
                                    }
                                    else if (command.toLowerCase() === "redo")
                                    {
                                        scope['$redoTaBindtaTextElement' + _serial]()
                                    }
                                    else
                                    {
                                        _taExecCommand(command, false, opt, scope.defaultTagAttributes);
                                        if (isSelectableElementTool)
                                        {
                                            scope['reApplyOnSelectorHandlerstaTextElement' + _serial]()
                                        }
                                        scope.displayElements.text[0].focus()
                                    }
                                }, showHtml: scope.$eval(attrs.taShowHtml) || false
                            });
                            if (attrs.taFocussedClass)
                                scope.classes.focussed = attrs.taFocussedClass;
                            if (attrs.taTextEditorClass)
                                scope.classes.textEditor = attrs.taTextEditorClass;
                            if (attrs.taHtmlEditorClass)
                                scope.classes.htmlEditor = attrs.taHtmlEditorClass;
                            if (attrs.taDefaultTagAttributes)
                            {
                                try
                                {
                                    angular.extend(scope.defaultTagAttributes, angular.fromJson(attrs.taDefaultTagAttributes))
                                }
                                catch(error)
                                {
                                    $log.error(error)
                                }
                            }
                            if (attrs.taTextEditorSetup)
                                scope.setup.textEditorSetup = scope.$parent.$eval(attrs.taTextEditorSetup);
                            if (attrs.taHtmlEditorSetup)
                                scope.setup.htmlEditorSetup = scope.$parent.$eval(attrs.taHtmlEditorSetup);
                            if (attrs.taFileDrop)
                                scope.fileDropHandler = scope.$parent.$eval(attrs.taFileDrop);
                            else
                                scope.fileDropHandler = scope.defaultFileDropHandler;
                            _originalContents = element[0].innerHTML;
                            element[0].innerHTML = '';
                            scope.displayElements = {
                                forminput: angular.element("<input type='hidden' tabindex='-1' style='display: none;'>"), html: angular.element("<textarea></textarea>"), text: angular.element("<div></div>"), scrollWindow: angular.element("<div class='ta-scroll-window'></div>"), popover: angular.element('<div class="popover fade bottom" style="max-width: none; width: 305px;"></div>'), popoverArrow: angular.element('<div class="arrow"></div>'), popoverContainer: angular.element('<div class="popover-content"></div>'), resize: {
                                        overlay: angular.element('<div class="ta-resizer-handle-overlay"></div>'), background: angular.element('<div class="ta-resizer-handle-background"></div>'), anchors: [angular.element('<div class="ta-resizer-handle-corner ta-resizer-handle-corner-tl"></div>'), angular.element('<div class="ta-resizer-handle-corner ta-resizer-handle-corner-tr"></div>'), angular.element('<div class="ta-resizer-handle-corner ta-resizer-handle-corner-bl"></div>'), angular.element('<div class="ta-resizer-handle-corner ta-resizer-handle-corner-br"></div>')], info: angular.element('<div class="ta-resizer-handle-info"></div>')
                                    }
                            };
                            scope.displayElements.popover.append(scope.displayElements.popoverArrow);
                            scope.displayElements.popover.append(scope.displayElements.popoverContainer);
                            scope.displayElements.scrollWindow.append(scope.displayElements.popover);
                            scope.displayElements.popover.on('mousedown', function(e, eventData)
                            {
                                if (eventData)
                                    angular.extend(e, eventData);
                                e.preventDefault();
                                return false
                            });
                            scope.showPopover = function(_el)
                            {
                                scope.displayElements.popover.css('display', 'block');
                                scope.reflowPopover(_el);
                                $animate.addClass(scope.displayElements.popover, 'in');
                                oneEvent($document.find('body'), 'click keyup', function()
                                {
                                    scope.hidePopover()
                                })
                            };
                            scope.reflowPopover = function(_el)
                            {
                                if (scope.displayElements.text[0].offsetHeight - 51 > _el[0].offsetTop)
                                {
                                    scope.displayElements.popover.css('top', _el[0].offsetTop + _el[0].offsetHeight + scope.displayElements.scrollWindow[0].scrollTop + 'px');
                                    scope.displayElements.popover.removeClass('top').addClass('bottom')
                                }
                                else
                                {
                                    scope.displayElements.popover.css('top', _el[0].offsetTop - 54 + scope.displayElements.scrollWindow[0].scrollTop + 'px');
                                    scope.displayElements.popover.removeClass('bottom').addClass('top')
                                }
                                var _maxLeft = scope.displayElements.text[0].offsetWidth - scope.displayElements.popover[0].offsetWidth;
                                var _targetLeft = _el[0].offsetLeft + (_el[0].offsetWidth / 2.0) - (scope.displayElements.popover[0].offsetWidth / 2.0);
                                scope.displayElements.popover.css('left', Math.max(0, Math.min(_maxLeft, _targetLeft)) + 'px');
                                scope.displayElements.popoverArrow.css('margin-left', (Math.min(_targetLeft, (Math.max(0, _targetLeft - _maxLeft))) - 11) + 'px')
                            };
                            scope.hidePopover = function()
                            {
                                scope.displayElements.popover.css('display', '');
                                scope.displayElements.popoverContainer.attr('style', '');
                                scope.displayElements.popoverContainer.attr('class', 'popover-content');
                                scope.displayElements.popover.removeClass('in')
                            };
                            scope.displayElements.resize.overlay.append(scope.displayElements.resize.background);
                            angular.forEach(scope.displayElements.resize.anchors, function(anchor)
                            {
                                scope.displayElements.resize.overlay.append(anchor)
                            });
                            scope.displayElements.resize.overlay.append(scope.displayElements.resize.info);
                            scope.displayElements.scrollWindow.append(scope.displayElements.resize.overlay);
                            scope.reflowResizeOverlay = function(_el)
                            {
                                _el = angular.element(_el)[0];
                                scope.displayElements.resize.overlay.css({
                                    display: 'block', left: _el.offsetLeft - 5 + 'px', top: _el.offsetTop - 5 + 'px', width: _el.offsetWidth + 10 + 'px', height: _el.offsetHeight + 10 + 'px'
                                });
                                scope.displayElements.resize.info.text(_el.offsetWidth + ' x ' + _el.offsetHeight)
                            };
                            scope.showResizeOverlay = function(_el)
                            {
                                var _body = $document.find('body');
                                _resizeMouseDown = function(event)
                                {
                                    var startPosition = {
                                            width: parseInt(_el.attr('width')), height: parseInt(_el.attr('height')), x: event.clientX, y: event.clientY
                                        };
                                    if (startPosition.width === undefined || isNaN(startPosition.width))
                                        startPosition.width = _el[0].offsetWidth;
                                    if (startPosition.height === undefined || isNaN(startPosition.height))
                                        startPosition.height = _el[0].offsetHeight;
                                    scope.hidePopover();
                                    var ratio = startPosition.height / startPosition.width;
                                    var mousemove = function(event)
                                        {
                                            var pos = {
                                                    x: Math.max(0, startPosition.width + (event.clientX - startPosition.x)), y: Math.max(0, startPosition.height + (event.clientY - startPosition.y))
                                                };
                                            var bForceAspectRatio = (attrs.taResizeForceAspectRatio !== undefined);
                                            var bFlipKeyBinding = attrs.taResizeMaintainAspectRatio;
                                            var bKeepRatio = bForceAspectRatio || (bFlipKeyBinding && !event.shiftKey);
                                            if (bKeepRatio)
                                            {
                                                var newRatio = pos.y / pos.x;
                                                pos.x = ratio > newRatio ? pos.x : pos.y / ratio;
                                                pos.y = ratio > newRatio ? pos.x * ratio : pos.y
                                            }
                                            var el = angular.element(_el);
                                            function roundedMaxVal(val)
                                            {
                                                return Math.round(Math.max(0, val))
                                            }
                                            el.css('height', roundedMaxVal(pos.y) + 'px');
                                            el.css('width', roundedMaxVal(pos.x) + 'px');
                                            scope.reflowResizeOverlay(_el)
                                        };
                                    _body.on('mousemove', mousemove);
                                    oneEvent(_body, 'mouseup', function(event)
                                    {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        _body.off('mousemove', mousemove);
                                        scope.showPopover(_el)
                                    });
                                    event.stopPropagation();
                                    event.preventDefault()
                                };
                                scope.displayElements.resize.anchors[3].off('mousedown');
                                scope.displayElements.resize.anchors[3].on('mousedown', _resizeMouseDown);
                                scope.reflowResizeOverlay(_el);
                                oneEvent(_body, 'click', function()
                                {
                                    scope.hideResizeOverlay()
                                })
                            };
                            scope.hideResizeOverlay = function()
                            {
                                scope.displayElements.resize.anchors[3].off('mousedown', _resizeMouseDown);
                                scope.displayElements.resize.overlay.css('display', '')
                            };
                            scope.setup.htmlEditorSetup(scope.displayElements.html);
                            scope.setup.textEditorSetup(scope.displayElements.text);
                            scope.displayElements.html.attr({
                                id: 'taHtmlElement' + _serial, 'ng-show': 'showHtml', 'ta-bind': 'ta-bind', 'ng-model': 'html', 'ng-model-options': element.attr('ng-model-options')
                            });
                            scope.displayElements.text.attr({
                                id: 'taTextElement' + _serial, contentEditable: 'true', 'ta-bind': 'ta-bind', 'ng-model': 'html', 'ng-model-options': element.attr('ng-model-options')
                            });
                            scope.displayElements.scrollWindow.attr({'ng-hide': 'showHtml'});
                            if (attrs.taDefaultWrap)
                                scope.displayElements.text.attr('ta-default-wrap', attrs.taDefaultWrap);
                            if (attrs.taUnsafeSanitizer)
                            {
                                scope.displayElements.text.attr('ta-unsafe-sanitizer', attrs.taUnsafeSanitizer);
                                scope.displayElements.html.attr('ta-unsafe-sanitizer', attrs.taUnsafeSanitizer)
                            }
                            scope.displayElements.scrollWindow.append(scope.displayElements.text);
                            element.append(scope.displayElements.scrollWindow);
                            element.append(scope.displayElements.html);
                            scope.displayElements.forminput.attr('name', scope._name);
                            element.append(scope.displayElements.forminput);
                            if (attrs.tabindex)
                            {
                                element.removeAttr('tabindex');
                                scope.displayElements.text.attr('tabindex', attrs.tabindex);
                                scope.displayElements.html.attr('tabindex', attrs.tabindex)
                            }
                            if (attrs.placeholder)
                            {
                                scope.displayElements.text.attr('placeholder', attrs.placeholder);
                                scope.displayElements.html.attr('placeholder', attrs.placeholder)
                            }
                            if (attrs.taDisabled)
                            {
                                scope.displayElements.text.attr('ta-readonly', 'disabled');
                                scope.displayElements.html.attr('ta-readonly', 'disabled');
                                scope.disabled = scope.$parent.$eval(attrs.taDisabled);
                                scope.$parent.$watch(attrs.taDisabled, function(newVal)
                                {
                                    scope.disabled = newVal;
                                    if (scope.disabled)
                                    {
                                        element.addClass(scope.classes.disabled)
                                    }
                                    else
                                    {
                                        element.removeClass(scope.classes.disabled)
                                    }
                                })
                            }
                            if (attrs.taPaste)
                            {
                                scope._pasteHandler = function(_html)
                                {
                                    return $parse(attrs.taPaste)(scope.$parent, {$html: _html})
                                };
                                scope.displayElements.text.attr('ta-paste', '_pasteHandler($html)')
                            }
                            $compile(scope.displayElements.scrollWindow)(scope);
                            $compile(scope.displayElements.html)(scope);
                            scope.updateTaBindtaTextElement = scope['updateTaBindtaTextElement' + _serial];
                            scope.updateTaBindtaHtmlElement = scope['updateTaBindtaHtmlElement' + _serial];
                            element.addClass("ta-root");
                            scope.displayElements.scrollWindow.addClass("ta-text ta-editor " + scope.classes.textEditor);
                            scope.displayElements.html.addClass("ta-html ta-editor " + scope.classes.htmlEditor);
                            scope._actionRunning = false;
                            var _savedSelection = false;
                            scope.startAction = function()
                            {
                                scope._actionRunning = true;
                                _savedSelection = $window.rangy.saveSelection();
                                return function()
                                    {
                                        if (_savedSelection)
                                            $window.rangy.restoreSelection(_savedSelection)
                                    }
                            };
                            scope.endAction = function()
                            {
                                scope._actionRunning = false;
                                if (_savedSelection)
                                {
                                    if (scope.showHtml)
                                    {
                                        scope.displayElements.html[0].focus()
                                    }
                                    else
                                    {
                                        scope.displayElements.text[0].focus()
                                    }
                                    $window.rangy.removeMarkers(_savedSelection)
                                }
                                _savedSelection = false;
                                scope.updateSelectedStyles();
                                if (!scope.showHtml)
                                    scope['updateTaBindtaTextElement' + _serial]()
                            };
                            _focusin = function()
                            {
                                scope.focussed = true;
                                element.addClass(scope.classes.focussed);
                                _toolbars.focus();
                                element.triggerHandler('focus')
                            };
                            scope.displayElements.html.on('focus', _focusin);
                            scope.displayElements.text.on('focus', _focusin);
                            _focusout = function(e)
                            {
                                if (!scope._actionRunning && $document[0].activeElement !== scope.displayElements.html[0] && $document[0].activeElement !== scope.displayElements.text[0])
                                {
                                    element.removeClass(scope.classes.focussed);
                                    _toolbars.unfocus();
                                    $timeout(function()
                                    {
                                        scope._bUpdateSelectedStyles = false;
                                        element.triggerHandler('blur');
                                        scope.focussed = false
                                    }, 0)
                                }
                                e.preventDefault();
                                return false
                            };
                            scope.displayElements.html.on('blur', _focusout);
                            scope.displayElements.text.on('blur', _focusout);
                            scope.displayElements.text.on('paste', function(event)
                            {
                                element.triggerHandler('paste', event)
                            });
                            scope.queryFormatBlockState = function(command)
                            {
                                return !scope.showHtml && command.toLowerCase() === $document[0].queryCommandValue('formatBlock').toLowerCase()
                            };
                            scope.queryCommandState = function(command)
                            {
                                return (!scope.showHtml) ? $document[0].queryCommandState(command) : ''
                            };
                            scope.switchView = function()
                            {
                                scope.showHtml = !scope.showHtml;
                                $animate.enabled(false, scope.displayElements.html);
                                $animate.enabled(false, scope.displayElements.text);
                                if (scope.showHtml)
                                {
                                    $timeout(function()
                                    {
                                        $animate.enabled(true, scope.displayElements.html);
                                        $animate.enabled(true, scope.displayElements.text);
                                        return scope.displayElements.html[0].focus()
                                    }, 100)
                                }
                                else
                                {
                                    $timeout(function()
                                    {
                                        $animate.enabled(true, scope.displayElements.html);
                                        $animate.enabled(true, scope.displayElements.text);
                                        return scope.displayElements.text[0].focus()
                                    }, 100)
                                }
                            };
                            if (attrs.ngModel)
                            {
                                var _firstRun = true;
                                ngModel.$render = function()
                                {
                                    if (_firstRun)
                                    {
                                        _firstRun = false;
                                        var _initialValue = scope.$parent.$eval(attrs.ngModel);
                                        if ((_initialValue === undefined || _initialValue === null) && (_originalContents && _originalContents !== ''))
                                        {
                                            ngModel.$setViewValue(_originalContents)
                                        }
                                    }
                                    scope.displayElements.forminput.val(ngModel.$viewValue);
                                    scope.html = ngModel.$viewValue || ''
                                };
                                if (element.attr('required'))
                                    ngModel.$validators.required = function(modelValue, viewValue)
                                    {
                                        var value = modelValue || viewValue;
                                        return !(!value || value.trim() === '')
                                    }
                            }
                            else
                            {
                                scope.displayElements.forminput.val(_originalContents);
                                scope.html = _originalContents
                            }
                            scope.$watch('html', function(newValue, oldValue)
                            {
                                if (newValue !== oldValue)
                                {
                                    if (attrs.ngModel && ngModel.$viewValue !== newValue)
                                        ngModel.$setViewValue(newValue);
                                    scope.displayElements.forminput.val(newValue)
                                }
                            });
                            if (attrs.taTargetToolbars)
                                _toolbars = textAngularManager.registerEditor(scope._name, scope, attrs.taTargetToolbars.split(','));
                            else
                            {
                                var _toolbar = angular.element('<div text-angular-toolbar name="textAngularToolbar' + _serial + '">');
                                if (attrs.taToolbar)
                                    _toolbar.attr('ta-toolbar', attrs.taToolbar);
                                if (attrs.taToolbarClass)
                                    _toolbar.attr('ta-toolbar-class', attrs.taToolbarClass);
                                if (attrs.taToolbarGroupClass)
                                    _toolbar.attr('ta-toolbar-group-class', attrs.taToolbarGroupClass);
                                if (attrs.taToolbarButtonClass)
                                    _toolbar.attr('ta-toolbar-button-class', attrs.taToolbarButtonClass);
                                if (attrs.taToolbarActiveButtonClass)
                                    _toolbar.attr('ta-toolbar-active-button-class', attrs.taToolbarActiveButtonClass);
                                if (attrs.taFocussedClass)
                                    _toolbar.attr('ta-focussed-class', attrs.taFocussedClass);
                                element.prepend(_toolbar);
                                $compile(_toolbar)(scope.$parent);
                                _toolbars = textAngularManager.registerEditor(scope._name, scope, ['textAngularToolbar' + _serial])
                            }
                            scope.$on('$destroy', function()
                            {
                                textAngularManager.unregisterEditor(scope._name);
                                angular.element(window).off('blur')
                            });
                            scope.$on('ta-element-select', function(event, element)
                            {
                                if (_toolbars.triggerElementSelect(event, element))
                                {
                                    scope['reApplyOnSelectorHandlerstaTextElement' + _serial]()
                                }
                            });
                            scope.$on('ta-drop-event', function(event, element, dropEvent, dataTransfer)
                            {
                                scope.displayElements.text[0].focus();
                                if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0)
                                {
                                    angular.forEach(dataTransfer.files, function(file)
                                    {
                                        try
                                        {
                                            $q.when(scope.fileDropHandler(file, scope.wrapSelection) || (scope.fileDropHandler !== scope.defaultFileDropHandler && $q.when(scope.defaultFileDropHandler(file, scope.wrapSelection)))).then(function()
                                            {
                                                scope['updateTaBindtaTextElement' + _serial]()
                                            })
                                        }
                                        catch(error)
                                        {
                                            $log.error(error)
                                        }
                                    });
                                    dropEvent.preventDefault();
                                    dropEvent.stopPropagation()
                                }
                                else
                                {
                                    $timeout(function()
                                    {
                                        scope['updateTaBindtaTextElement' + _serial]()
                                    }, 0)
                                }
                            });
                            scope._bUpdateSelectedStyles = false;
                            angular.element(window).on('blur', function()
                            {
                                scope._bUpdateSelectedStyles = false;
                                scope.focussed = false
                            });
                            scope.updateSelectedStyles = function()
                            {
                                var _selection;
                                if (_updateSelectedStylesTimeout)
                                    $timeout.cancel(_updateSelectedStylesTimeout);
                                if ((_selection = taSelection.getSelectionElement()) !== undefined && _selection.parentNode !== scope.displayElements.text[0])
                                {
                                    _toolbars.updateSelectedStyles(angular.element(_selection))
                                }
                                else
                                    _toolbars.updateSelectedStyles();
                                if (scope._bUpdateSelectedStyles)
                                    _updateSelectedStylesTimeout = $timeout(scope.updateSelectedStyles, 200)
                            };
                            _keydown = function()
                            {
                                if (!scope.focussed)
                                {
                                    scope._bUpdateSelectedStyles = false;
                                    return
                                }
                                if (!scope._bUpdateSelectedStyles)
                                {
                                    scope._bUpdateSelectedStyles = true;
                                    scope.$apply(function()
                                    {
                                        scope.updateSelectedStyles()
                                    })
                                }
                            };
                            scope.displayElements.html.on('keydown', _keydown);
                            scope.displayElements.text.on('keydown', _keydown);
                            _keyup = function()
                            {
                                scope._bUpdateSelectedStyles = false
                            };
                            scope.displayElements.html.on('keyup', _keyup);
                            scope.displayElements.text.on('keyup', _keyup);
                            _keypress = function(event, eventData)
                            {
                                if (eventData)
                                    angular.extend(event, eventData);
                                scope.$apply(function()
                                {
                                    if (_toolbars.sendKeyCommand(event))
                                    {
                                        if (!scope._bUpdateSelectedStyles)
                                        {
                                            scope.updateSelectedStyles()
                                        }
                                        event.preventDefault();
                                        return false
                                    }
                                })
                            };
                            scope.displayElements.html.on('keypress', _keypress);
                            scope.displayElements.text.on('keypress', _keypress);
                            _mouseup = function()
                            {
                                scope._bUpdateSelectedStyles = false;
                                scope.$apply(function()
                                {
                                    scope.updateSelectedStyles()
                                })
                            };
                            scope.displayElements.html.on('mouseup', _mouseup);
                            scope.displayElements.text.on('mouseup', _mouseup)
                        }
                }
        }]);
    textAngular.service('textAngularManager', ['taToolExecuteAction', 'taTools', 'taRegisterTool', function(taToolExecuteAction, taTools, taRegisterTool)
        {
            var toolbars = {},
                editors = {};
            return {
                    registerEditor: function(name, scope, targetToolbars)
                    {
                        if (!name || name === '')
                            throw('textAngular Error: An editor requires a name');
                        if (!scope)
                            throw('textAngular Error: An editor requires a scope');
                        if (editors[name])
                            throw('textAngular Error: An Editor with name "' + name + '" already exists');
                        var _toolbars = [];
                        angular.forEach(targetToolbars, function(_name)
                        {
                            if (toolbars[_name])
                                _toolbars.push(toolbars[_name])
                        });
                        editors[name] = {
                            scope: scope, toolbars: targetToolbars, _registerToolbar: function(toolbarScope)
                                {
                                    if (this.toolbars.indexOf(toolbarScope.name) >= 0)
                                        _toolbars.push(toolbarScope)
                                }, editorFunctions: {
                                    disable: function()
                                    {
                                        angular.forEach(_toolbars, function(toolbarScope)
                                        {
                                            toolbarScope.disabled = true
                                        })
                                    }, enable: function()
                                        {
                                            angular.forEach(_toolbars, function(toolbarScope)
                                            {
                                                toolbarScope.disabled = false
                                            })
                                        }, focus: function()
                                        {
                                            angular.forEach(_toolbars, function(toolbarScope)
                                            {
                                                toolbarScope._parent = scope;
                                                toolbarScope.disabled = false;
                                                toolbarScope.focussed = true;
                                                scope.focussed = true
                                            })
                                        }, unfocus: function()
                                        {
                                            angular.forEach(_toolbars, function(toolbarScope)
                                            {
                                                toolbarScope.disabled = true;
                                                toolbarScope.focussed = false
                                            });
                                            scope.focussed = false
                                        }, updateSelectedStyles: function(selectedElement)
                                        {
                                            angular.forEach(_toolbars, function(toolbarScope)
                                            {
                                                angular.forEach(toolbarScope.tools, function(toolScope)
                                                {
                                                    if (toolScope.activeState)
                                                    {
                                                        toolbarScope._parent = scope;
                                                        toolScope.active = toolScope.activeState(selectedElement)
                                                    }
                                                })
                                            })
                                        }, sendKeyCommand: function(event)
                                        {
                                            var result = false;
                                            if (event.ctrlKey || event.metaKey || event.specialKey)
                                                angular.forEach(taTools, function(tool, name)
                                                {
                                                    if (tool.commandKeyCode && (tool.commandKeyCode === event.which || tool.commandKeyCode === event.specialKey))
                                                    {
                                                        for (var _t = 0; _t < _toolbars.length; _t++)
                                                        {
                                                            if (_toolbars[_t].tools[name] !== undefined)
                                                            {
                                                                taToolExecuteAction.call(_toolbars[_t].tools[name], scope);
                                                                result = true;
                                                                break
                                                            }
                                                        }
                                                    }
                                                });
                                            return result
                                        }, triggerElementSelect: function(event, element)
                                        {
                                            var elementHasAttrs = function(_element, attrs)
                                                {
                                                    var result = true;
                                                    for (var i = 0; i < attrs.length; i++)
                                                        result = result && _element.attr(attrs[i]);
                                                    return result
                                                };
                                            var workerTools = [];
                                            var unfilteredTools = {};
                                            var result = false;
                                            element = angular.element(element);
                                            var onlyWithAttrsFilter = false;
                                            angular.forEach(taTools, function(tool, name)
                                            {
                                                if (tool.onElementSelect && tool.onElementSelect.element && tool.onElementSelect.element.toLowerCase() === element[0].tagName.toLowerCase() && (!tool.onElementSelect.filter || tool.onElementSelect.filter(element)))
                                                {
                                                    onlyWithAttrsFilter = onlyWithAttrsFilter || (angular.isArray(tool.onElementSelect.onlyWithAttrs) && elementHasAttrs(element, tool.onElementSelect.onlyWithAttrs));
                                                    if (!tool.onElementSelect.onlyWithAttrs || elementHasAttrs(element, tool.onElementSelect.onlyWithAttrs))
                                                        unfilteredTools[name] = tool
                                                }
                                            });
                                            if (onlyWithAttrsFilter)
                                            {
                                                angular.forEach(unfilteredTools, function(tool, name)
                                                {
                                                    if (tool.onElementSelect.onlyWithAttrs && elementHasAttrs(element, tool.onElementSelect.onlyWithAttrs))
                                                        workerTools.push({
                                                            name: name, tool: tool
                                                        })
                                                });
                                                workerTools.sort(function(a, b)
                                                {
                                                    return b.tool.onElementSelect.onlyWithAttrs.length - a.tool.onElementSelect.onlyWithAttrs.length
                                                })
                                            }
                                            else
                                            {
                                                angular.forEach(unfilteredTools, function(tool, name)
                                                {
                                                    workerTools.push({
                                                        name: name, tool: tool
                                                    })
                                                })
                                            }
                                            if (workerTools.length > 0)
                                            {
                                                for (var _i = 0; _i < workerTools.length; _i++)
                                                {
                                                    var tool = workerTools[_i].tool;
                                                    var name = workerTools[_i].name;
                                                    for (var _t = 0; _t < _toolbars.length; _t++)
                                                    {
                                                        if (_toolbars[_t].tools[name] !== undefined)
                                                        {
                                                            tool.onElementSelect.action.call(_toolbars[_t].tools[name], event, element, scope);
                                                            result = true;
                                                            break
                                                        }
                                                    }
                                                    if (result)
                                                        break
                                                }
                                            }
                                            return result
                                        }
                                }
                        };
                        return editors[name].editorFunctions
                    }, retrieveEditor: function(name)
                        {
                            return editors[name]
                        }, unregisterEditor: function(name)
                        {
                            delete editors[name]
                        }, registerToolbar: function(scope)
                        {
                            if (!scope)
                                throw('textAngular Error: A toolbar requires a scope');
                            if (!scope.name || scope.name === '')
                                throw('textAngular Error: A toolbar requires a name');
                            if (toolbars[scope.name])
                                throw('textAngular Error: A toolbar with name "' + scope.name + '" already exists');
                            toolbars[scope.name] = scope;
                            angular.forEach(editors, function(_editor)
                            {
                                _editor._registerToolbar(scope)
                            })
                        }, retrieveToolbar: function(name)
                        {
                            return toolbars[name]
                        }, retrieveToolbarsViaEditor: function(name)
                        {
                            var result = [],
                                _this = this;
                            angular.forEach(this.retrieveEditor(name).toolbars, function(name)
                            {
                                result.push(_this.retrieveToolbar(name))
                            });
                            return result
                        }, unregisterToolbar: function(name)
                        {
                            delete toolbars[name]
                        }, updateToolsDisplay: function(newTaTools)
                        {
                            var _this = this;
                            angular.forEach(newTaTools, function(_newTool, key)
                            {
                                _this.updateToolDisplay(key, _newTool)
                            })
                        }, resetToolsDisplay: function()
                        {
                            var _this = this;
                            angular.forEach(taTools, function(_newTool, key)
                            {
                                _this.resetToolDisplay(key)
                            })
                        }, updateToolDisplay: function(toolKey, _newTool)
                        {
                            var _this = this;
                            angular.forEach(toolbars, function(toolbarScope, toolbarKey)
                            {
                                _this.updateToolbarToolDisplay(toolbarKey, toolKey, _newTool)
                            })
                        }, resetToolDisplay: function(toolKey)
                        {
                            var _this = this;
                            angular.forEach(toolbars, function(toolbarScope, toolbarKey)
                            {
                                _this.resetToolbarToolDisplay(toolbarKey, toolKey)
                            })
                        }, updateToolbarToolDisplay: function(toolbarKey, toolKey, _newTool)
                        {
                            if (toolbars[toolbarKey])
                                toolbars[toolbarKey].updateToolDisplay(toolKey, _newTool);
                            else
                                throw('textAngular Error: No Toolbar with name "' + toolbarKey + '" exists');
                        }, resetToolbarToolDisplay: function(toolbarKey, toolKey)
                        {
                            if (toolbars[toolbarKey])
                                toolbars[toolbarKey].updateToolDisplay(toolKey, taTools[toolKey], true);
                            else
                                throw('textAngular Error: No Toolbar with name "' + toolbarKey + '" exists');
                        }, removeTool: function(toolKey)
                        {
                            delete taTools[toolKey];
                            angular.forEach(toolbars, function(toolbarScope)
                            {
                                delete toolbarScope.tools[toolKey];
                                for (var i = 0; i < toolbarScope.toolbar.length; i++)
                                {
                                    var toolbarIndex;
                                    for (var j = 0; j < toolbarScope.toolbar[i].length; j++)
                                    {
                                        if (toolbarScope.toolbar[i][j] === toolKey)
                                        {
                                            toolbarIndex = {
                                                group: i, index: j
                                            };
                                            break
                                        }
                                        if (toolbarIndex !== undefined)
                                            break
                                    }
                                    if (toolbarIndex !== undefined)
                                    {
                                        toolbarScope.toolbar[toolbarIndex.group].slice(toolbarIndex.index, 1);
                                        toolbarScope._$element.children().eq(toolbarIndex.group).children().eq(toolbarIndex.index).remove()
                                    }
                                }
                            })
                        }, addTool: function(toolKey, toolDefinition, group, index)
                        {
                            taRegisterTool(toolKey, toolDefinition);
                            angular.forEach(toolbars, function(toolbarScope)
                            {
                                toolbarScope.addTool(toolKey, toolDefinition, group, index)
                            })
                        }, addToolToToolbar: function(toolKey, toolDefinition, toolbarKey, group, index)
                        {
                            taRegisterTool(toolKey, toolDefinition);
                            toolbars[toolbarKey].addTool(toolKey, toolDefinition, group, index)
                        }, refreshEditor: function(name)
                        {
                            if (editors[name])
                            {
                                editors[name].scope.updateTaBindtaTextElement();
                                if (!editors[name].scope.$$phase)
                                    editors[name].scope.$digest()
                            }
                            else
                                throw('textAngular Error: No Editor with name "' + name + '" exists');
                        }, sendKeyCommand: function(scope, event)
                        {
                            angular.forEach(editors, function(_editor)
                            {
                                if (_editor.editorFunctions.sendKeyCommand(event))
                                {
                                    if (!scope._bUpdateSelectedStyles)
                                    {
                                        scope.updateSelectedStyles()
                                    }
                                    event.preventDefault();
                                    return false
                                }
                            })
                        }
                }
        }]);
    textAngular.directive('textAngularToolbar', ['$compile', 'textAngularManager', 'taOptions', 'taTools', 'taToolExecuteAction', '$window', function($compile, textAngularManager, taOptions, taTools, taToolExecuteAction, $window)
        {
            return {
                    scope: {name: '@'}, restrict: "EA", link: function(scope, element, attrs)
                        {
                            if (!scope.name || scope.name === '')
                                throw('textAngular Error: A toolbar requires a name');
                            angular.extend(scope, angular.copy(taOptions));
                            if (attrs.taToolbar)
                                scope.toolbar = scope.$parent.$eval(attrs.taToolbar);
                            if (attrs.taToolbarClass)
                                scope.classes.toolbar = attrs.taToolbarClass;
                            if (attrs.taToolbarGroupClass)
                                scope.classes.toolbarGroup = attrs.taToolbarGroupClass;
                            if (attrs.taToolbarButtonClass)
                                scope.classes.toolbarButton = attrs.taToolbarButtonClass;
                            if (attrs.taToolbarActiveButtonClass)
                                scope.classes.toolbarButtonActive = attrs.taToolbarActiveButtonClass;
                            if (attrs.taFocussedClass)
                                scope.classes.focussed = attrs.taFocussedClass;
                            scope.disabled = true;
                            scope.focussed = false;
                            scope._$element = element;
                            element[0].innerHTML = '';
                            element.addClass("ta-toolbar " + scope.classes.toolbar);
                            scope.$watch('focussed', function()
                            {
                                if (scope.focussed)
                                    element.addClass(scope.classes.focussed);
                                else
                                    element.removeClass(scope.classes.focussed)
                            });
                            var setupToolElement = function(toolDefinition, toolScope)
                                {
                                    var toolElement;
                                    if (toolDefinition && toolDefinition.display)
                                    {
                                        toolElement = angular.element(toolDefinition.display)
                                    }
                                    else
                                        toolElement = angular.element("<button type='button'>");
                                    if (toolDefinition && toolDefinition["class"])
                                        toolElement.addClass(toolDefinition["class"]);
                                    else
                                        toolElement.addClass(scope.classes.toolbarButton);
                                    toolElement.attr('name', toolScope.name);
                                    toolElement.attr('ta-button', 'ta-button');
                                    toolElement.attr('ng-disabled', 'isDisabled()');
                                    toolElement.attr('tabindex', '-1');
                                    toolElement.attr('ng-click', 'executeAction()');
                                    toolElement.attr('ng-class', 'displayActiveToolClass(active)');
                                    if (toolDefinition && toolDefinition.tooltiptext)
                                    {
                                        toolElement.attr('title', toolDefinition.tooltiptext)
                                    }
                                    if (toolDefinition && !toolDefinition.display && !toolScope._display)
                                    {
                                        toolElement[0].innerHTML = '';
                                        if (toolDefinition.buttontext)
                                            toolElement[0].innerHTML = toolDefinition.buttontext;
                                        if (toolDefinition.iconclass)
                                        {
                                            var icon = angular.element('<i>'),
                                                content = toolElement[0].innerHTML;
                                            icon.addClass(toolDefinition.iconclass);
                                            toolElement[0].innerHTML = '';
                                            toolElement.append(icon);
                                            if (content && content !== '')
                                                toolElement.append('&nbsp;' + content)
                                        }
                                    }
                                    toolScope._lastToolDefinition = angular.copy(toolDefinition);
                                    return $compile(toolElement)(toolScope)
                                };
                            scope.tools = {};
                            scope._parent = {
                                disabled: true, showHtml: false, queryFormatBlockState: function()
                                    {
                                        return false
                                    }, queryCommandState: function()
                                    {
                                        return false
                                    }
                            };
                            var defaultChildScope = {
                                    $window: $window, $editor: function()
                                        {
                                            return scope._parent
                                        }, isDisabled: function()
                                        {
                                            return ((typeof this.$eval('disabled') !== 'function' && this.$eval('disabled')) || this.$eval('disabled()') || (this.name !== 'html' && this.$editor().showHtml) || this.$parent.disabled || this.$editor().disabled)
                                        }, displayActiveToolClass: function(active)
                                        {
                                            return (active) ? scope.classes.toolbarButtonActive : ''
                                        }, executeAction: taToolExecuteAction
                                };
                            angular.forEach(scope.toolbar, function(group)
                            {
                                var groupElement = angular.element("<div>");
                                groupElement.addClass(scope.classes.toolbarGroup);
                                angular.forEach(group, function(tool)
                                {
                                    scope.tools[tool] = angular.extend(scope.$new(true), taTools[tool], defaultChildScope, {name: tool});
                                    scope.tools[tool].$element = setupToolElement(taTools[tool], scope.tools[tool]);
                                    groupElement.append(scope.tools[tool].$element)
                                });
                                element.append(groupElement)
                            });
                            scope.updateToolDisplay = function(key, _newTool, forceNew)
                            {
                                var toolInstance = scope.tools[key];
                                if (toolInstance)
                                {
                                    if (toolInstance._lastToolDefinition && !forceNew)
                                        _newTool = angular.extend({}, toolInstance._lastToolDefinition, _newTool);
                                    if (_newTool.buttontext === null && _newTool.iconclass === null && _newTool.display === null)
                                        throw('textAngular Error: Tool Definition for updating "' + key + '" does not have a valid display/iconclass/buttontext value');
                                    if (_newTool.buttontext === null)
                                    {
                                        delete _newTool.buttontext
                                    }
                                    if (_newTool.iconclass === null)
                                    {
                                        delete _newTool.iconclass
                                    }
                                    if (_newTool.display === null)
                                    {
                                        delete _newTool.display
                                    }
                                    var toolElement = setupToolElement(_newTool, toolInstance);
                                    toolInstance.$element.replaceWith(toolElement);
                                    toolInstance.$element = toolElement
                                }
                            };
                            scope.addTool = function(key, _newTool, groupIndex, index)
                            {
                                scope.tools[key] = angular.extend(scope.$new(true), taTools[key], defaultChildScope, {name: key});
                                scope.tools[key].$element = setupToolElement(taTools[key], scope.tools[key]);
                                var group;
                                if (groupIndex === undefined)
                                    groupIndex = scope.toolbar.length - 1;
                                group = angular.element(element.children()[groupIndex]);
                                if (index === undefined)
                                {
                                    group.append(scope.tools[key].$element);
                                    scope.toolbar[groupIndex][scope.toolbar[groupIndex].length - 1] = key
                                }
                                else
                                {
                                    group.children().eq(index).after(scope.tools[key].$element);
                                    scope.toolbar[groupIndex][index] = key
                                }
                            };
                            textAngularManager.registerToolbar(scope);
                            scope.$on('$destroy', function()
                            {
                                textAngularManager.unregisterToolbar(scope.name)
                            })
                        }
                }
        }])
})();
angular.module('plex', []);
angular.module('plex').factory('Plex', ["$rootScope", "PlexResolver", "$window", "$modal", "$q", "$timeout", "Global", "SSO", function($rootScope, PlexResolver, $window, $modal, $q, $timeout, Global, SSO)
    {
        var self = {
                viewStack: [], currentViewIndex: null, title: null, subtitle: null, currentSkin: null, error: {
                        show: false, title: undefined
                    }, warning: {
                        show: false, title: undefined
                    }, info: {
                        show: false, title: undefined
                    }, loading: {
                        smallCount: 0, bigCount: 0, showSmall: false, showBig: false, update: function(value, useBig)
                            {
                                if (useBig)
                                {
                                    if (value)
                                        this.bigCount++;
                                    else if (this.bigCount > 0)
                                        this.bigCount--;
                                    this.showBig = this.bigCount > 0
                                }
                                else
                                {
                                    if (value)
                                        this.smallCount++;
                                    else if (this.smallCount > 0)
                                        this.smallCount--;
                                    this.showSmall = this.smallCount > 0
                                }
                            }
                    }, actions: [], menuActions: null, userActions: [{
                            text: "<i class=\"fa fa-lock\"></i><span>Bloquear sesión</span>", click: function()
                                {
                                    self.sessionLock(true)
                                }
                        }, {
                            text: "<i class=\"fa fa-sign-out\"></i><span>Cerrar sesión</span>", click: function()
                                {
                                    window.location = "/dotnet/SSO/Logout.aspx"
                                }
                        }, {
                            text: "<i class=\"fa fa-user\"></i><span>Cambiar usuario</span>", click: function()
                                {
                                    window.location = "/dotnet/SSO/Logout.aspx?relogin=1&url=" + encodeURIComponent(window.location)
                                }
                        }, {divider: true}, {
                            text: "<i class=\"fa fa-gear\"></i><span>Opciones de usuario</span>", click: function()
                                {
                                    window.location = "/dotnet/SSO/Options.aspx?url=" + encodeURIComponent(window.location)
                                }
                        }, {divider: true}, {
                            text: "<i class=\"fa fa-circle plex-skin-icon-cosmo\"></i><span>Cosmo</span>", click: function()
                                {
                                    self.currentSkin = "/lib/1.1/lib.cosmo.css"
                                }
                        }, {
                            text: "<i class=\"fa fa-circle plex-skin-icon-flatly\"></i><span>Flatly</span>", click: function()
                                {
                                    self.currentSkin = "/lib/1.1/lib.flatly.css"
                                }
                        }, {
                            text: "<i class=\"fa fa-circle plex-skin-icon-amelia\"></i><span>Amelia</span>", click: function()
                                {
                                    self.currentSkin = "/lib/1.1/lib.amelia.css"
                                }
                        }, {
                            text: "<i class=\"fa fa-circle plex-skin-icon-slate\"></i><span>Slate</span>", click: function()
                                {
                                    self.currentSkin = "/lib/1.1/lib.slate.css"
                                }
                        }, {
                            text: "<i class=\"fa fa-circle plex-skin-icon-superhero\"></i><span>Superhero</span>", click: function()
                                {
                                    self.currentSkin = "/lib/1.1/lib.superhero.css"
                                }
                        }], sessionLockModal: null, sessionLock: function(doLock)
                    {
                        if (!self.sessionLockModal)
                        {
                            self.sessionLockModal = "dummy";
                            var showFn = function()
                                {
                                    self.sessionLockModal = $modal({
                                        contentTemplate: '/Lib/1.1/html/ssoLock.html', show: true, keyboard: false, backdrop: 'static', placement: 'center'
                                    })
                                };
                            if (doLock)
                                SSO.lock().then(function()
                                {
                                    showFn()
                                });
                            else
                                showFn()
                        }
                    }, submitForm: function()
                    {
                        var form = self.currentView().form;
                        if (!form.isSubmitting)
                        {
                            $rootScope.$broadcast('$plex-before-submit', form.controller);
                            if (form.controller.$valid)
                            {
                                form.isSubmitting = true;
                                self.warning.show = false;
                                var result = form.submitHandler();
                                if (angular.isDefined(result))
                                {
                                    if (angular.isDefined(result.finally))
                                        result.then(function()
                                        {
                                            form.controller.$setPristine(true)
                                        }).finally(function()
                                        {
                                            form.isSubmitting = false
                                        });
                                    else
                                    {
                                        if (result)
                                        {
                                            form.isSubmitting = false;
                                            form.controller.$setPristine(true)
                                        }
                                    }
                                }
                                else
                                {
                                    form.isSubmitting = false;
                                    form.controller.$setPristine(true)
                                }
                            }
                            else
                            {
                                self.showWarning('Por favor verifique los datos ingresados')
                            }
                            $rootScope.$broadcast('$plex-after-submit', form.controller)
                        }
                    }, cancelForm: function()
                    {
                        var handler = self.currentView().form.cancelHandler;
                        if (handler)
                            handler()
                    }, isFormValid: function(showErrors)
                    {
                        var form = self.currentView().form;
                        if (form)
                        {
                            if (form.controller.$valid)
                                return true;
                            else
                            {
                                if (showErrors)
                                {
                                    angular.forEach(form.controller.$error, function(property)
                                    {
                                        angular.forEach(property, function(controller)
                                        {
                                            controller.$setViewValue(controller.$viewValue)
                                        })
                                    })
                                }
                                return false
                            }
                        }
                        else
                            return true
                    }, showError: function(message)
                    {
                        if (!message)
                            message = "No se pudo comunicar con la base de datos. Por favor intente la operación nuevamente...";
                        self.error.title = message;
                        self.error.show = true
                    }, showWarning: function(message)
                    {
                        self.warning.title = message;
                        self.warning.show = true
                    }, showInfo: function(message)
                    {
                        self.info.title = message;
                        self.info.show = true
                    }, addView: function(view)
                    {
                        angular.extend(view, {
                            ui: {
                                title: null, subtitle: null, actions: null
                            }, form: null
                        });
                        self.viewStack.push(view);
                        self.currentView(view);
                        return view
                    }, currentView: function(view)
                    {
                        if (view)
                        {
                            self.currentViewIndex = self.viewStack.indexOf(view);
                            return view
                        }
                        else
                        {
                            return angular.isNumber(self.currentViewIndex) ? self.viewStack[self.currentViewIndex] : null
                        }
                    }, openView: function(path)
                    {
                        console.log(path);
                        var deferred = $q.defer();
                        Global.waitInit().then(function()
                        {
                            $timeout(function()
                            {
                                $rootScope.$broadcast('$plex-openView', {
                                    route: PlexResolver.resolve(path.indexOf('/') != 0 ? '/' + path : path), deferred: deferred
                                })
                            })
                        });
                        return deferred.promise
                    }, closeView: function(returnValue)
                    {
                        $timeout(function()
                        {
                            if (self.currentViewIndex > 0)
                            {
                                var view = self.currentView();
                                $window.history.back();
                                view.deferred.resolve(returnValue)
                            }
                        }, 50)
                    }, openDialog: function(url)
                    {
                        $window.open(url)
                    }, initUI: function()
                    {
                        var currentView = self.currentView();
                        self.title = currentView.ui.title;
                        self.subtitle = currentView.ui.subtitle;
                        self.actions = [];
                        angular.forEach(currentView.ui.actions, function(a)
                        {
                            if ((!angular.isDefined(a.visible)) || a.visible)
                                self.actions.push(a)
                        })
                    }, initView: function(settings)
                    {
                        var currentView = self.currentView();
                        if (settings.actions)
                        {
                            for (var i = 0; i < settings.actions.length; i++)
                            {
                                var action = settings.actions[i];
                                action.action = function()
                                {
                                    if (this.handler)
                                        this.handler();
                                    else if (this.url)
                                        self.openView(this.url)
                                }
                            }
                        }
                        angular.extend(currentView.ui, settings);
                        self.initUI()
                    }, initApplication: function(applicationId)
                    {
                        SSO.menu(applicationId).then(function(data)
                        {
                            self.menuActions = [];
                            if (data.length)
                            {
                                self.menuActions = data[0].items.map(function(i)
                                {
                                    return {
                                            text: i.text, click: function(){}
                                        }
                                })
                            }
                            self.menuActions = self.menuActions.concat([{
                                    text: "<i class=\"fa fa-home\"></i><span>Volver a la Intranet</span>", click: function()
                                        {
                                            window.location = "/"
                                        }
                                }, {divider: true}, {
                                    text: "<i class=\"fa fa-user\"></i><span>¿Problemas de identificación del paciente o datos desactualizados?</span>", click: function()
                                        {
                                            self.openView('/feedback/paciente')
                                        }
                                }, {
                                    text: "<i class=\"fa fa-flag\"></i><span>¿Diagnóstico/problema no encontrado o con nombre confuso?</span>", click: function()
                                        {
                                            self.openView('/feedback/diagnostico')
                                        }
                                }, {
                                    text: "<i class=\"fa fa-comments\"></i><span>Reportar una sugerencia o problema de la aplicación</span>", click: function()
                                        {
                                            $q.when(self.currentView().route, function(route)
                                            {
                                                self.openView('/feedback/app/' + encodeURIComponent(route.originalPath) + ' ' + JSON.stringify(route.params) + '/' + encodeURIComponent(route.controller))
                                            })
                                        }
                                }])
                        })
                    }, linkForm: function(controller, submitHandler, cancelHandler)
                    {
                        if (!controller)
                            throw"Utilice la directiva plex-form para vincular un formulario a la vista.";
                        if (!submitHandler)
                            throw"El formulario debe tener asociado un submit handler. Puede definir un método submit() en el scope del controlador.";
                        if (!cancelHandler)
                            throw"El formulario debe tener asociado un cancel handler. Puede definir un método cancel() en el scope del controlador.";
                        self.currentView().form = {
                            controller: controller, submitHandler: submitHandler, cancelHandler: cancelHandler
                        }
                    }, unlinkForm: function(controller)
                    {
                        this.viewStack.forEach(function(view)
                        {
                            if (view.form && (view.form.controller == controller))
                            {
                                view.form = null
                            }
                        })
                    }
            };
        $rootScope.$on("sso-unlock", function()
        {
            self.sessionLockModal.hide();
            self.sessionLockModal = null
        });
        return self
    }]);
(function()
{
    angular.module('plex').provider('PlexResolver', function()
    {
        this.routes = {};
        this.when = function(path, route)
        {
            var pathRegExp = function(path, opts)
                {
                    var insensitive = opts.caseInsensitiveMatch,
                        ret = {
                            originalPath: path, regexp: path
                        },
                        keys = ret.keys = [];
                    path = path.replace(/([().])/g, '\\$1').replace(/(\/)?:(\w+)([\?\*])?/g, function(_, slash, key, option)
                    {
                        var optional = option === '?' ? option : null;
                        var star = option === '*' ? option : null;
                        keys.push({
                            name: key, optional: !!optional
                        });
                        slash = slash || '';
                        return '' + (optional ? '' : slash) + '(?:' + (optional ? slash : '') + (star && '(.+?)' || '([^/]+)') + (optional || '') + ')' + (optional || '')
                    }).replace(/([\/$\*])/g, '\\$1');
                    ret.regexp = new RegExp('^' + path + '$', insensitive ? 'i' : '');
                    return ret
                };
            this.routes[path] = angular.extend({reloadOnSearch: true}, route, path && pathRegExp(path, route));
            if (path)
            {
                var redirectPath = (path[path.length - 1] == '/') ? path.substr(0, path.length - 1) : path + '/';
                this.routes[redirectPath] = angular.extend({redirectTo: path}, pathRegExp(redirectPath, route))
            }
            return this
        };
        this.otherwise = function(params)
        {
            this.when(null, params);
            return this
        };
        this.$get = ['$injector', '$sce', '$templateCache', '$http', '$q', function($injector, $sce, $templateCache, $http, $q)
            {
                var routes = this.routes;
                var switchRouteMatcher = function(on, route)
                    {
                        var self = this;
                        var keys = route.keys,
                            params = {};
                        if (!route.regexp)
                            return null;
                        var m = route.regexp.exec(on);
                        if (!m)
                            return null;
                        for (var i = 1, len = m.length; i < len; ++i)
                        {
                            var key = keys[i - 1];
                            var val = 'string' == typeof m[i] ? decodeURIComponent(m[i]) : m[i];
                            if (key && val)
                            {
                                if (!isNaN(val))
                                    params[key.name] = Number(val);
                                else
                                    params[key.name] = val
                            }
                        }
                        return params
                    };
                var updateRoute = function(next)
                    {
                        var locals = angular.extend({}, next.resolve),
                            template,
                            templateUrl;
                        angular.forEach(locals, function(value, key)
                        {
                            locals[key] = angular.isString(value) ? $injector.get(value) : $injector.invoke(value)
                        });
                        if (angular.isDefined(template = next.template))
                        {
                            if (angular.isFunction(template))
                            {
                                template = template(next.params)
                            }
                        }
                        else if (angular.isDefined(templateUrl = next.templateUrl))
                        {
                            if (angular.isFunction(templateUrl))
                            {
                                templateUrl = templateUrl(next.params)
                            }
                            templateUrl = $sce.getTrustedResourceUrl(templateUrl);
                            if (angular.isDefined(templateUrl))
                            {
                                next.loadedTemplateUrl = templateUrl;
                                template = $http.get(templateUrl, {cache: $templateCache}).then(function(response)
                                {
                                    return response.data
                                })
                            }
                        }
                        if (angular.isDefined(template))
                        {
                            locals['$template'] = template
                        }
                        locals.plexParams = {};
                        return $q.all(locals).then(function(locals)
                            {
                                if (next)
                                {
                                    next.locals = locals;
                                    angular.copy(next.params, locals.plexParams)
                                }
                                locals.plexParams = angular.extend({
                                    $controller: next.$$route && next.$$route.controller, $path: next.$$route && next.$$route.originalPath, $templateUrl: next.$$route && next.$$route.templateUrl
                                }, locals.plexParams);
                                return next
                            })
                    };
                var interpolate = function(string, params)
                    {
                        var result = [];
                        angular.forEach((string || '').split(':'), function(segment, i)
                        {
                            if (i === 0)
                            {
                                result.push(segment)
                            }
                            else
                            {
                                var segmentMatch = segment.match(/(\w+)(.*)/);
                                var key = segmentMatch[1];
                                result.push(params[key]);
                                result.push(segmentMatch[2] || '');
                                delete params[key]
                            }
                        });
                        return result.join('')
                    };
                return {resolve: function(route)
                        {
                            var temp = route.split('?');
                            var path = temp[0];
                            var search = (temp.length > 1) ? parseKeyValue(temp[1]) : null;
                            var params,
                                match;
                            angular.forEach(routes, function(r, p)
                            {
                                if (!match && (params = switchRouteMatcher(path, r)))
                                {
                                    match = inherit(r, {
                                        params: angular.extend({}, search, params), pathParams: params
                                    });
                                    match.$$route = r
                                }
                            });
                            if (!match)
                            {
                                var otherwise = routes[null];
                                match = routes[null] && inherit(routes[otherwise.redirectTo], {
                                    params: {}, pathParams: {}
                                })
                            }
                            return updateRoute(match)
                        }}
            }]
    });
    function inherit(parent, extra)
    {
        return angular.extend(new(angular.extend(function(){}, {prototype: parent})), extra)
    }
    function tryDecodeURIComponent(value)
    {
        try
        {
            return decodeURIComponent(value)
        }
        catch(e) {}
    }
    function parseKeyValue(keyValue)
    {
        var obj = {},
            key_value,
            key;
        angular.forEach((keyValue || "").split('&'), function(keyValue)
        {
            if (keyValue)
            {
                key_value = keyValue.split('=');
                key = tryDecodeURIComponent(key_value[0]);
                if (angular.isDefined(key))
                {
                    var val = angular.isDefined(key_value[1]) ? tryDecodeURIComponent(key_value[1]) : true;
                    if (!obj[key])
                    {
                        obj[key] = val
                    }
                    else if (isArray(obj[key]))
                    {
                        obj[key].push(val)
                    }
                    else
                    {
                        obj[key] = [obj[key], val]
                    }
                }
            }
        });
        return obj
    }
})();
angular.module('plex').directive("form", function()
{
    return {
            restrict: "E", link: function(scope, element, attrs)
                {
                    element.attr("novalidate", "novalidate");
                    element.attr("autocomplete", "off")
                }
        }
});
angular.module('plex').directive('plexActions', ['$dropdown', '$tooltip', function($dropdown, $tooltip)
    {
        return {
                restrict: 'A', scope: true, link: function(scope, element, attrs)
                    {
                        var dropDown;
                        var tooltip;
                        var icon = angular.element('<i>').appendTo(element).addClass('fa fa-tasks actions').on('click', function(e)
                            {
                                e.preventDefault();
                                e.stopPropagation()
                            });
                        scope.$watch(attrs.plexActions, function(actions)
                        {
                            if (dropDown)
                                dropDown.destroy();
                            if (tooltip)
                                tooltip.destroy();
                            icon.hide();
                            if (actions)
                            {
                                var content = [];
                                actions.forEach(function(i)
                                {
                                    if (!angular.isDefined(i.visible) || i.visible)
                                        content.push({
                                            text: (i.icon ? "<i class='" + i.icon + "'></i>" : "") + "<span>" + i.title + "</span>", divider: i.divider, click: function()
                                                {
                                                    i.handler(scope.$parent)
                                                }
                                        })
                                });
                                if (content.length > 0)
                                {
                                    icon.show();
                                    scope.content = content;
                                    var options = {
                                            scope: scope, placement: attrs.placement || 'auto'
                                        };
                                    dropDown = $dropdown(icon, options)
                                }
                            }
                        });
                        scope.$on('$destroy', function()
                        {
                            if (dropDown)
                                dropDown.destroy();
                            if (tooltip)
                                tooltip.destroy()
                        })
                    }
            }
    }]);
angular.module('plex').directive('plexEnter', function()
{
    return function(scope, element, attrs)
        {
            element.bind("keydown keypress", function(event)
            {
                if (event.which === 13)
                {
                    scope.$apply(function()
                    {
                        scope.$eval(attrs.plexEnter, {event: event})
                    });
                    event.preventDefault()
                }
            })
        }
});
angular.module('plex').directive('plexFocus', function()
{
    return {
            restrict: 'A', link: function(scope, element, attr)
                {
                    scope.$watch(attr.plexFocus, function(current)
                    {
                        if (current)
                        {
                            window.setTimeout(function()
                            {
                                element[0].focus()
                            }, 200)
                        }
                    })
                }
        }
});
angular.module('plex').directive('plexInclude', function()
{
    return {
            scope: true, template: '<div ng-include="plexInclude"></div>', link: function(scope, element, attrs)
                {
                    scope.plexInclude = scope.$eval(attrs.plexInclude);
                    scope.$watch(attrs.plexInclude, function(current)
                    {
                        scope.plexInclude = current
                    });
                    scope.include = {};
                    angular.forEach(attrs, function(value, attr)
                    {
                        if (attr.indexOf('plexInclude') == 0 && attr != 'plexInclude')
                        {
                            var item = attr.substr(11, 1).toLowerCase() + attr.substr(12);
                            scope.$watch(value, function(current)
                            {
                                scope.include[item] = current
                            })
                        }
                    })
                }
        }
});
angular.module('plex').directive('plexSkin', ['Global', '$q', 'SSO', '$http', function(Global, $q, SSO, $http)
    {
        return {
                restrict: 'A', link: function(scope, element, attr)
                    {
                        var path = "/lib/1.1/";
                        var defaultSkin = path + "lib.cosmo.css";
                        var deferred = $q.defer();
                        Global.init(deferred.promise);
                        var loadCss = function(value)
                            {
                                var url = path + value.replace(path, "").replace("/lib/1.0/", "");
                                var body = angular.element("BODY");
                                body.fadeOut(function()
                                {
                                    $http.get(url).success(function()
                                    {
                                        angular.element("<LINK>").appendTo(element.parent()).attr("rel", "stylesheet").attr("href", url).on("load", function()
                                        {
                                            deferred.resolve();
                                            element.attr("href", url);
                                            angular.element(this).remove();
                                            body.removeClass("plex-cloak");
                                            body.fadeIn()
                                        })
                                    }).error(function()
                                    {
                                        loadCss(defaultSkin)
                                    })
                                })
                            };
                        SSO.init().finally(function()
                        {
                            var skin = (SSO.session && SSO.session.settings.plexSkin) || defaultSkin;
                            loadCss(skin);
                            scope.$watch(attr.plexSkin, function(current, old)
                            {
                                if (current && current != old)
                                {
                                    if (SSO.session)
                                    {
                                        SSO.settings.post("plexSkin", current.replace(path, ""))
                                    }
                                    loadCss(current)
                                }
                            })
                        })
                    }
            }
    }]);
angular.module('plex').directive("plexFilter", ["$filter", function($filter)
    {
        return {
                require: 'ngModel', link: function(scope, element, attrs, ngModelController)
                    {
                        if (attrs.plexFilter && attrs.plexFilter != "")
                        {
                            var index = attrs.plexFilter.indexOf(":");
                            var filterName = index < 0 ? attrs.plexFilter : attrs.plexFilter.substr(0, index).trim();
                            var filterParam = index < 0 ? undefined : eval(attrs.plexFilter.substr(index + 1).trim());
                            var filter = $filter(filterName);
                            ngModelController.$formatters.push(function(data)
                            {
                                return filter(data, filterParam)
                            })
                        }
                    }
            }
    }]);
angular.module('plex').directive('plexMax', function()
{
    return {
            restrict: 'A', require: 'ngModel', priority: 599, link: function(scope, elem, attr, ctrl)
                {
                    var isEmpty = function(value)
                        {
                            return angular.isUndefined(value) || value === '' || value === null || value !== value
                        };
                    var validator = function(value)
                        {
                            var val = scope.$eval(attr.plexMax);
                            if (isEmpty(value) || isEmpty(val) || value <= val)
                            {
                                ctrl.$setValidity('max', true);
                                return value
                            }
                            else
                            {
                                ctrl.$setValidity('max', false);
                                return undefined
                            }
                        };
                    scope.$watch(attr.plexMax, function(current, old)
                    {
                        if (current != old)
                        {
                            if (validator(ctrl.$viewValue))
                                ctrl.$setViewValue(ctrl.$viewValue);
                            else
                                ctrl.$setViewValue(undefined)
                        }
                    });
                    ctrl.$parsers.push(validator);
                    ctrl.$formatters.push(validator)
                }
        }
});
angular.module('plex').directive('plexMin', function()
{
    return {
            restrict: 'A', require: 'ngModel', priority: 599, link: function(scope, elem, attr, ctrl)
                {
                    var isEmpty = function(value)
                        {
                            return angular.isUndefined(value) || value === '' || value === null || value !== value
                        };
                    var validator = function(value)
                        {
                            var val = scope.$eval(attr.plexMin);
                            if (isEmpty(value) || isEmpty(val) || value >= val)
                            {
                                ctrl.$setValidity('min', true);
                                return value
                            }
                            else
                            {
                                ctrl.$setValidity('min', false);
                                return undefined
                            }
                        };
                    scope.$watch(attr.plexMin, function(current, old)
                    {
                        if (current != old)
                            if (validator(ctrl.$viewValue))
                            {
                                ctrl.$setViewValue(ctrl.$viewValue)
                            }
                    });
                    ctrl.$parsers.push(validator);
                    ctrl.$formatters.push(validator)
                }
        }
});
angular.module('plex').directive("plex", ['$injector', function($injector)
    {
        return {
                restrict: 'EAC', require: ['?ngModel', '^?form'], priority: 598, compile: function(element, attrs)
                    {
                        var type = attrs.plex;
                        if (type)
                        {
                            if (type != "int" && type != "float" && type != "date" && type != "time" && type != "bool" && type != "html")
                                type = "select"
                        }
                        else
                        {
                            if (element.is("INPUT[type=date]"))
                                type = "date";
                            else if (element.is("INPUT[type=time]"))
                                type = "time";
                            else if (element.is("SELECT") || element.is("INPUT[type=select]"))
                                type = "select";
                            else if (element.is("INPUT[type=number]"))
                                type = "int";
                            else if (element.is("INPUT[type=hidden]"))
                                type = "hidden"
                        }
                        var dinamicLink = null;
                        switch (type)
                        {
                            case"date":
                                element.attr("bs-datepicker", "");
                                attrs.autoclose = true;
                                attrs.dateFormat = attrs.dateFormat || "mediumDate";
                                dinamicLink = $injector.get("bsDatepickerDirective")[0].compile(element, attrs);
                                break;
                            case"time":
                                element.attr("bs-timepicker", "");
                                attrs.autoclose = true;
                                dinamicLink = $injector.get("bsTimepickerDirective")[0].compile(element, attrs);
                                break;
                            case"select":
                                attrs.plexSelect = attrs.plex;
                                dinamicLink = $injector.get("plexSelectDirective")[0].compile(element, attrs);
                                break;
                            case"html":
                                attrs.plexSelect = attrs.plex;
                                dinamicLink = $injector.get("textAngularDirective")[0].compile(element, attrs);
                                break
                        }
                        return {post: function(scope, element, attrs, controllers)
                                {
                                    var modelController = controllers[0];
                                    var formController = controllers[1];
                                    var newParent = angular.element("<div class='form-group'>");
                                    if (attrs.label)
                                    {
                                        var texto = attrs.label == "\\" ? "&nbsp;" : attrs.label;
                                        var label = angular.element("<label>").html(texto);
                                        if (attrs.ngRequired)
                                        {
                                            scope.$watch(attrs.ngRequired, function(current)
                                            {
                                                if (current === false)
                                                    label.html(texto + "<span class='optional text-muted'>(opcional)</span>");
                                                else
                                                    label.html(texto)
                                            })
                                        }
                                        newParent.append(label)
                                    }
                                    element.before(newParent);
                                    element.detach();
                                    newParent.append(element);
                                    newParent.append("<span class='help-block'>Requerido</span>");
                                    newParent.append("<span class='help-block'>Valor no válido</span>");
                                    if (attrs.hint)
                                        newParent.append(angular.element("<span class='help-block'>").text(attrs.hint));
                                    if (attrs.ngShow)
                                        scope.$watch(attrs.ngShow, function(value)
                                        {
                                            if (value)
                                                newParent.show();
                                            else
                                                newParent.hide()
                                        });
                                    if (attrs.ngHide)
                                        scope.$watch(attrs.ngHide, function(value)
                                        {
                                            if (value)
                                                newParent.show();
                                            else
                                                newParent.hide()
                                        });
                                    var validator = function(element, modelController)
                                        {
                                            var required = typeof(modelController) != 'undefined' && !modelController.$pristine && modelController.$error.required;
                                            var invalid = typeof(modelController) != 'undefined' && !modelController.$pristine && ((modelController.$error.pattern || modelController.$error.number || modelController.$error.max || modelController.$error.min || modelController.$error.date || modelController.$error.time || modelController.$error.maxlength || modelController.$error.minlength) || false);
                                            var controlGroup = element.parents(".form-group").eq(0);
                                            controlGroup.toggleClass("has-error", required || invalid);
                                            var spans = controlGroup.find(".help-block");
                                            spans.eq(0).css("display", required ? "block" : "none");
                                            spans.eq(1).css("display", invalid ? "block" : "none")
                                        };
                                    if (modelController)
                                    {
                                        modelController.$parsers.push(function(value)
                                        {
                                            validator(element, modelController);
                                            return value
                                        });
                                        scope.$watch(function()
                                        {
                                            return modelController.$error
                                        }, function()
                                        {
                                            validator(element, modelController)
                                        }, true)
                                    }
                                    else
                                    {
                                        validator(element)
                                    }
                                    scope.$on("$plex-before-submit", function(event, submitController)
                                    {
                                        modelController.$setDirty();
                                        validator(element, modelController)
                                    });
                                    switch (type)
                                    {
                                        case"date":
                                            var inputGroup = angular.element("<div class='input-group'>");
                                            element.before(inputGroup);
                                            element.detach();
                                            if (attrs.selectOnly)
                                            {
                                                element.attr('readonly', 'readonly');
                                                element.css({cursor: "pointer"});
                                                element.on('click', function()
                                                {
                                                    $(this).next().find(".btn").click()
                                                })
                                            }
                                            inputGroup.append(element);
                                            element.addClass('form-control');
                                            element.after($("<span class='input-group-btn'><a class='btn btn-default' tabindex='-1'><i class='fa fa-calendar'></i></a></span>").on('click', function()
                                            {
                                                element.removeAttr('readonly');
                                                element.focus();
                                                element.attr('readonly', 'readonly')
                                            }));
                                            if (attrs.ngReadonly)
                                                scope.$watch(attrs.ngReadonly, function(value)
                                                {
                                                    if (value)
                                                        element.attr("disabled", "disabled");
                                                    else
                                                        element.removeAttr("disabled")
                                                });
                                            break;
                                        case"time":
                                            var inputGroup = angular.element("<div class='input-group'>");
                                            element.before(inputGroup);
                                            element.detach();
                                            inputGroup.append(element);
                                            element.addClass('form-control');
                                            element.after($("<span class='input-group-btn'><a class='btn btn-default' tabindex='-1'><i class='fa fa-clock-o'></i></a></span>").on('click', function()
                                            {
                                                element.focus()
                                            }));
                                            if (attrs.ngReadonly)
                                                scope.$watch(attrs.ngReadonly, function(value)
                                                {
                                                    if (value)
                                                        element.attr("disabled", "disabled");
                                                    else
                                                        element.removeAttr("disabled")
                                                });
                                            break;
                                        case"int":
                                        case"float":
                                            if (attrs.prefix || attrs.suffix)
                                            {
                                                var inputGroup = angular.element("<div class='input-group'>");
                                                element.before(inputGroup);
                                                element.detach();
                                                if (attrs.prefix)
                                                    inputGroup.append('<span class="input-group-addon">' + attrs.prefix + '</span>');
                                                inputGroup.append(element);
                                                if (attrs.suffix)
                                                    inputGroup.append('<span class="input-group-addon">' + attrs.suffix + '</span>')
                                            }
                                            element.addClass('form-control');
                                            var numberParsers = function(value)
                                                {
                                                    if (value)
                                                    {
                                                        value = ("" + value).replace(",", ".");
                                                        var regEx;
                                                        if (type == "float")
                                                            regEx = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/;
                                                        else
                                                            regEx = /^\s*(\-|\+)?(\d+)\s*$/;
                                                        if (regEx.test(value))
                                                        {
                                                            modelController.$setValidity('number', true);
                                                            return parseFloat(value, 10)
                                                        }
                                                        else
                                                        {
                                                            modelController.$setValidity('number', false);
                                                            return null
                                                        }
                                                    }
                                                    else
                                                    {
                                                        return value
                                                    }
                                                };
                                            if (modelController)
                                                modelController.$parsers.unshift(numberParsers);
                                            break;
                                        case"select":
                                        case"hidden":
                                            element.addClass("form-control select2");
                                            break;
                                        case"bool":
                                            var id = "plex" + Math.floor((1 + Math.random()) * 0x10000);
                                            element.attr("id", id);
                                            element.attr("type", "checkbox");
                                            element.attr("class", "onoffswitch-checkbox");
                                            var group = angular.element("<div class='onoffswitch'>");
                                            element.before(group);
                                            element.detach();
                                            group.append(element);
                                            var label = angular.element('<label class="onoffswitch-label">').appendTo(group);
                                            label.attr("for", id);
                                            var span = angular.element('<span class="onoffswitch-inner">').appendTo(label);
                                            span.attr("data-true", attrs.true || "Si");
                                            span.attr("data-false", attrs.false || "No");
                                            angular.element('<span class="onoffswitch-switch">').appendTo(label);
                                            break;
                                        case"html":
                                            break;
                                        default:
                                            if (attrs.prefix || attrs.suffix)
                                            {
                                                var inputGroup = angular.element("<div class='input-group'>");
                                                element.before(inputGroup);
                                                element.detach();
                                                if (attrs.prefix)
                                                    inputGroup.append('<span class="input-group-addon">' + attrs.prefix + '</span>');
                                                inputGroup.append(element);
                                                if (attrs.suffix)
                                                    inputGroup.append('<span class="input-group-addon">' + attrs.suffix + '</span>')
                                            }
                                            element.addClass('form-control')
                                    }
                                    if (dinamicLink)
                                        dinamicLink(scope, element, attrs, modelController);
                                    scope.$on("$plex-before-submit", function(event, submitController)
                                    {
                                        if (modelController && formController == submitController)
                                            modelController.$setViewValue(modelController.$viewValue)
                                    });
                                    element.on("$destroy", function()
                                    {
                                        if (!element.data("$plex-destroy"))
                                        {
                                            element.data("$plex-destroy", true);
                                            newParent.remove();
                                            element.data("$plex-destroy", null)
                                        }
                                    })
                                }}
                    }
            }
    }]);
angular.module('plex').directive("plexForm", ["Plex", function(Plex)
    {
        return {
                restrict: "A", require: 'form', link: function(scope, element, attrs, formController)
                    {
                        var submitHandler,
                            cancelHandler;
                        if (attrs.plexForm)
                        {
                            var split = attrs.plexForm.split(',');
                            submitHandler = scope.$eval(split[0]) || scope.$eval('submit');
                            if (split.length > 1)
                                cancelHandler = scope.$eval(split[1]) || scope.$eval('cancel');
                            else
                                cancelHandler = scope.$eval('cancel')
                        }
                        Plex.linkForm(formController, submitHandler, cancelHandler);
                        scope.$on("$destroy", function()
                        {
                            Plex.unlinkForm(formController)
                        })
                    }
            }
    }]);
angular.module('plex').directive("plexSubmit", ["$parse", function($parse)
    {
        return {
                restrict: "A", require: '^form', link: function(scope, element, attrs, formController)
                    {
                        var fn = $parse(attrs.plexSubmit);
                        element.on('click', function(event)
                        {
                            scope.$apply(function()
                            {
                                scope.$broadcast('$plex-before-submit', formController);
                                if (formController.$valid)
                                    fn(scope, {$event: event})
                            })
                        })
                    }
            }
    }]);
angular.module('plex').directive("plexCancel", ["$parse", function($parse)
    {
        return {
                restrict: "A", require: '^form', link: function(scope, element, attrs, formController)
                    {
                        var fn = $parse(attrs.plexCancel);
                        element.on('click', function(event)
                        {
                            if (formController.$pristine || confirm('¿Está seguro que desea cancelar?'))
                            {
                                scope.$apply(function()
                                {
                                    fn(scope, {$event: event})
                                })
                            }
                        })
                    }
            }
    }]);
angular.module('plex').directive("plexView", ['$rootScope', '$anchorScroll', '$compile', '$controller', '$q', '$window', '$document', 'Plex', 'PlexResolver', '$animate', '$timeout', function($rootScope, $anchorScroll, $compile, $controller, $q, $window, $document, Plex, PlexResolver, $animate, $timeout)
    {
        return {
                restrict: 'EA', terminal: true, transclude: 'element', compile: function(element, attr, linker)
                    {
                        return function(scope, $element, attr)
                            {
                                function toggleViews(old, current)
                                {
                                    if (old)
                                        old.element.hide();
                                    current.element.show();
                                    Plex.currentView(current);
                                    Plex.initUI();
                                    $window.scrollTo(current.scrollLeft || 0, current.scrollTop || 0)
                                }
                                scope.$on('$plex-openView', function(event, view)
                                {
                                    view.route.then(function(route)
                                    {
                                        var currentIndex = Number($window.history.state) || 0;
                                        while (Plex.viewStack.length > currentIndex + 1)
                                        {
                                            var temp = Plex.viewStack.pop();
                                            temp.scope.$destroy();
                                            temp.element.remove()
                                        }
                                        Plex.addView(view);
                                        var locals = route.locals;
                                        var template = locals.$template;
                                        view.scope = scope.$new();
                                        linker(view.scope, function(clone)
                                        {
                                            var oldView = Plex.viewStack.length > 1 ? Plex.viewStack[Plex.viewStack.length - 2] : null;
                                            if (oldView && oldView.element)
                                            {
                                                oldView.scrollTop = $document[0].documentElement.scrollTop;
                                                oldView.scrollLeft = $document[0].documentElement.scrollLeft
                                            }
                                            if (Plex.viewStack.length > 1)
                                            {
                                                $window.history.pushState(Plex.viewStack.length - 1, null, null)
                                            }
                                            clone.html(template);
                                            $element.after(clone);
                                            view.element = clone;
                                            toggleViews(oldView, view);
                                            var link = $compile(clone.contents());
                                            if (route.controller)
                                            {
                                                locals.$scope = view.scope;
                                                var controller = $controller(route.controller, locals);
                                                clone.data('$ngControllerController', controller);
                                                clone.contents().data('$ngControllerController', controller)
                                            }
                                            link(view.scope);
                                            Plex.initUI()
                                        })
                                    })
                                });
                                scope.$on('$plex-closeView', function(event, gotoView)
                                {
                                    var oldView = Plex.currentView();
                                    var view = Plex.viewStack[gotoView];
                                    toggleViews(oldView, view)
                                });
                                angular.element($window).on('popstate', function()
                                {
                                    var gotoView = $window.history.state;
                                    $timeout(function()
                                    {
                                        scope.$emit('$plex-closeView', gotoView)
                                    })
                                });
                                $window.history.replaceState(0, null, null);
                                var path = location.pathname.substr(($document.find('base').attr('href') || '/').length - 1);
                                Plex.openView(path)
                            }
                    }
            }
    }]);
angular.module('plex').directive("plexWorking", function($injector)
{
    return function(scope, element, attrs)
        {
            if (element[0].className.indexOf('fa-'))
            {
                var originalClass = element.attr('class');
                var workingClass = originalClass;
                var classes = workingClass.split(/\s+/);
                ;
                for (var i = 0; i < classes.length; i++)
                {
                    if (classes[i].indexOf('fa-') == 0)
                    {
                        workingClass = workingClass.replace(classes[i], 'fa-spinner fa-spin');
                        break
                    }
                }
                scope.$watch(attrs.plexWorking, function(current)
                {
                    element.attr('class', (current) ? workingClass : originalClass)
                })
            }
        }
});
angular.module('plex').directive('plexSelect', ['$timeout', '$parse', '$q', 'Global', function($timeout, $parse, $q, Global)
    {
        return {
                require: 'ngModel', compile: function(element, attrs)
                    {
                        var watch,
                            repeatOption,
                            repeatAttr,
                            isSelect = false,
                            isMultiple = (attrs.multiple !== undefined),
                            timeout = attrs.timeout || 300;
                        var inputExpression = attrs.plexSelect;
                        var match = inputExpression.match(/^\s*(.*?)(?:\s+as\s+(.*?))?\s+for\s+(?:([\$\w][\$\w\d]*))\s+in\s+(.*)$/);
                        if (!match)
                        {
                            throw new Error("Expected specification in form of '_modelValue_ (as _label_)? for _item_ in _collection_' but got '" + inputExpression + "'.");
                        }
                        var itemName = match[3];
                        var source = $parse(match[4]);
                        var viewMapper = $parse(match[2] || match[1]);
                        var modelMapper = $parse(match[1]);
                        var timer;
                        return function(scope, element, attrs, controller)
                            {
                                var allowClear = scope.$eval(attrs.allowClear);
                                $timeout(function()
                                {
                                    element.select2({
                                        minimumInputLength: attrs.min || null, allowClear: allowClear, placeholder: allowClear ? " " : null, multiple: isMultiple, query: function(query)
                                            {
                                                if (timer)
                                                {
                                                    $timeout.cancel(timer);
                                                    timer = null
                                                }
                                                timer = $timeout(function()
                                                {
                                                    var locals = {$value: query.term};
                                                    $q.when(source(scope, locals)).then(function(matches)
                                                    {
                                                        if (matches && query.term && inputExpression.indexOf("$value") < 0)
                                                        {
                                                            matches = matches.filter(function(i)
                                                            {
                                                                var locals = {};
                                                                locals[itemName] = i;
                                                                return Global.matchText(query.term, viewMapper(scope, locals))
                                                            })
                                                        }
                                                        query.callback({results: matches});
                                                        timer = null
                                                    })
                                                }, ((query && query.term) ? timeout : 0))
                                            }, initSelection: function(element, callback)
                                            {
                                                element.select2('data', controller.$modelValue);
                                                callback(controller.$modelValue)
                                            }, formatResult: function(result, container, query, escapeMarkup)
                                            {
                                                if (result)
                                                {
                                                    var locals = {};
                                                    locals[itemName] = result;
                                                    var label = viewMapper(scope, locals);
                                                    if (query && query.term)
                                                    {
                                                        var markup = [];
                                                        Select2.util.markMatch(label, query.term, markup, escapeMarkup);
                                                        return markup.join('')
                                                    }
                                                    else
                                                        return label
                                                }
                                                else
                                                    return null
                                            }, formatSelection: function(item)
                                            {
                                                return this.formatResult(item)
                                            }
                                    });
                                    element.select2('data', controller.$modelValue);
                                    element.on("select2-close", function()
                                    {
                                        $timeout(function()
                                        {
                                            element.select2("focus")
                                        })
                                    })
                                });
                                scope.$watch(attrs.ngModel, function(current, old)
                                {
                                    element.select2('data', controller.$modelValue)
                                }, true);
                                element.off('change');
                                element.on('change', function()
                                {
                                    var current = element.select2('data');
                                    scope.$apply(function()
                                    {
                                        controller.$setViewValue(current)
                                    })
                                });
                                controller.$parsers.push(function(value)
                                {
                                    element.prev().toggleClass('ng-invalid', !controller.$valid).toggleClass('ng-valid', controller.$valid).toggleClass('ng-invalid-required', !controller.$valid).toggleClass('ng-valid-required', controller.$valid).toggleClass('ng-dirty', controller.$dirty).toggleClass('ng-pristine', controller.$pristine);
                                    return value
                                });
                                attrs.$observe('disabled', function(value)
                                {
                                    element.select2('enable', !value)
                                });
                                attrs.$observe('readonly', function(value)
                                {
                                    element.select2('readonly', !!value)
                                });
                                element.on("$destroy", function()
                                {
                                    element.select2("destroy")
                                })
                            }
                    }
            }
    }]);
angular.module('plex').directive('title', ['$tooltip', function($tooltip)
    {
        return {
                restrict: 'A', link: function(scope, element, attrs)
                    {
                        if (attrs.title)
                        {
                            var options = {
                                    title: attrs.title, placement: attrs.titlePlacement || "top", html: true, container: "body", animation: "am-fade-and-slide-top"
                                };
                            element.removeAttr("title");
                            var tooltip = $tooltip(element, options);
                            scope.$on('$destroy', function()
                            {
                                tooltip.destroy()
                            })
                        }
                    }
            }
    }]);
angular.module('plex').filter('fromNow', function()
{
    return function(date, ignorePrefix)
        {
            if (date)
                return moment(date).fromNow(ignorePrefix);
            else
                return ""
        }
});
angular.module('plex').directive("plexMap", ["Plex", function(Plex)
    {
        return {
                restrict: "A", link: function(scope, element, attrs)
                    {
                        var map;
                        var center;
                        var marker;
                        var updateCenter = function(pos)
                            {
                                if (map)
                                {
                                    map.setCenter(pos ? new google.maps.LatLng(pos.latitud || pos.lat, pos.longitud || pos.lng) : new google.maps.LatLng(-38.9524444, -68.06413889999999))
                                }
                                ;
                            };
                        var updateMarker = function(pos)
                            {
                                if (map)
                                {
                                    if (marker)
                                        marker.setMap(null);
                                    if (pos)
                                        marker = new google.maps.Marker({
                                            position: new google.maps.LatLng(pos.latitud || pos.lat, pos.longitud || pos.lng), map: map
                                        })
                                }
                            };
                        require(['async!//maps.googleapis.com/maps/api/js?sensor=false'], function()
                        {
                            center = scope.$eval(attrs.center);
                            map = new google.maps.Map(element[0], {
                                center: center ? new google.maps.LatLng(center.latitud || center.lat, center.longitud || center.lng) : new google.maps.LatLng(-38.9524444, -68.06413889999999), zoom: 15, mapTypeId: google.maps.MapTypeId.ROADMAP
                            });
                            updateMarker(scope.$eval(attrs.marker))
                        });
                        scope.$watch(attrs.center, function(pos)
                        {
                            updateCenter(pos)
                        });
                        scope.$watch(attrs.marker, function(pos)
                        {
                            updateMarker(pos)
                        })
                    }
            }
    }]);
angular.module('plex').directive('plexChart', ['angularLoad', function(angularLoad)
    {
        return {
                restrict: 'EAC', replace: true, template: '<div></div>', scope: {
                        config: '=', updateWhen: '='
                    }, link: function(scope, element, attrs)
                    {
                        angularLoad.loadScript('/lib/1.1/salud.plex/lib/highcharts/highcharts.js').then(function()
                        {
                            var chart;
                            var seriesId = 0;
                            var ensureIds = function(series)
                                {
                                    series.forEach(function(s)
                                    {
                                        if (!angular.isDefined(s.id))
                                        {
                                            s.id = "series-" + seriesId++
                                        }
                                    })
                                };
                            var updateZoom = function(axis, modelAxis)
                                {
                                    var extremes = axis.getExtremes();
                                    if (modelAxis.currentMin !== extremes.dataMin || modelAxis.currentMax !== extremes.dataMax)
                                    {
                                        axis.setExtremes(modelAxis.currentMin, modelAxis.currentMax, false)
                                    }
                                };
                            var processExtremes = function(chart, axis)
                                {
                                    if (axis.currentMin || axis.currentMax)
                                    {
                                        chart.xAxis[0].setExtremes(axis.currentMin, axis.currentMax, true)
                                    }
                                };
                            var processSeries = function(chart, series)
                                {
                                    var ids = [];
                                    if (series)
                                    {
                                        ensureIds(series);
                                        series.forEach(function(s)
                                        {
                                            ids.push(s.id);
                                            var chartSeries = chart.get(s.id);
                                            if (chartSeries)
                                            {
                                                chartSeries.update(angular.copy(s), false)
                                            }
                                            else
                                            {
                                                chart.addSeries(angular.copy(s), false)
                                            }
                                        })
                                    }
                                    for (var i = chart.series.length - 1; i >= 0; i--)
                                    {
                                        var s = chart.series[i];
                                        if (ids.indexOf(s.options.id) < 0)
                                        {
                                            s.remove(false)
                                        }
                                    }
                                    ;
                                };
                            Highcharts.setOptions({global: {useUTC: false}});
                            var initialiseChart = function(scope, element, config)
                                {
                                    var extendDeep = function extendDeep(dst)
                                        {
                                            angular.forEach(arguments, function(obj)
                                            {
                                                if (obj !== dst)
                                                {
                                                    angular.forEach(obj, function(value, key)
                                                    {
                                                        if (dst[key] && dst[key].constructor && dst[key].constructor === Object)
                                                        {
                                                            extendDeep(dst[key], value)
                                                        }
                                                        else
                                                        {
                                                            dst[key] = value
                                                        }
                                                    })
                                                }
                                            });
                                            return dst
                                        };
                                    var config = extendDeep({
                                            chart: {
                                                events: {}, renderTo: element[0]
                                            }, title: {text: ''}, subtitle: {}, series: [], credits: {enabled: false}, plotOptions: {}, navigator: {enabled: false}
                                        }, config);
                                    var chart = new Highcharts.Chart(config);
                                    if (config.xAxis)
                                    {
                                        processExtremes(chart, config.xAxis)
                                    }
                                    processSeries(chart, config.series);
                                    chart.redraw();
                                    return chart
                                };
                            scope.$watch("updateWhen", function(current, old)
                            {
                                if (current == old && chart)
                                    return;
                                if (chart)
                                    chart.destroy();
                                chart = initialiseChart(scope, element, scope.config)
                            })
                        })
                    }
            }
    }]);
angular.module('plex').directive('plexMinlength', function()
{
    return {
            restrict: 'A', require: 'ngModel', link: function(scope, elem, attr, ctrl)
                {
                    var isEmpty = function(value)
                        {
                            return angular.isUndefined(value) || value === '' || value === null || value !== value
                        };
                    var validator = function(value)
                        {
                            var val = scope.$eval(attr.plexMinlength);
                            if (isEmpty(value) || isEmpty(val) || value.length >= val)
                            {
                                ctrl.$setValidity('minlength', true);
                                return value
                            }
                            else
                            {
                                ctrl.$setValidity('minlength', false);
                                return undefined
                            }
                        };
                    scope.$watch(attr.plexMinlength, function(current, old)
                    {
                        if (current != old)
                            validator(ctrl.$viewValue)
                    });
                    ctrl.$parsers.push(validator);
                    ctrl.$formatters.push(validator)
                }
        }
});
angular.module('plex').directive('plexMaxlength', function()
{
    return {
            restrict: 'A', require: 'ngModel', link: function(scope, elem, attr, ctrl)
                {
                    var isEmpty = function(value)
                        {
                            return angular.isUndefined(value) || value === '' || value === null || value !== value
                        };
                    var validator = function(value)
                        {
                            var val = scope.$eval(attr.plexMaxlength);
                            if (isEmpty(value) || isEmpty(val) || value.length <= val)
                            {
                                ctrl.$setValidity('maxlength', true);
                                return value
                            }
                            else
                            {
                                ctrl.$setValidity('maxlength', false);
                                return undefined
                            }
                        };
                    scope.$watch(attr.plexMaxlength, function(current, old)
                    {
                        if (current != old)
                            validator(ctrl.$viewValue)
                    });
                    ctrl.$parsers.push(validator);
                    ctrl.$formatters.push(validator)
                }
        }
})
