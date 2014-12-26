(function(root, factory) {
    if(typeof define === 'function' && define.amd) {
        define(factory);
    }
    else if(typeof exports === 'object') {
        module.exports = factory();
    }
    else {
        root.returnExports = factory();
    }
})(this, function() {
    "use strict";

    var AValidate = function(data, config, extra) {
        return AValidate.sync(data, config, extra);
    };

    AValidate.sync = function(data, config, extra) {
        var errors = null;
        var funcs = AValidate._build(data, config, false);

        for(var i=0;i<funcs.length;i++) {
            var func = funcs[i];
            var result = func.func.call(AValidate, {
                value:data[func.field],
                param:func.param,
                data:data
            });
            var field = func.field;
            var cond = func.cond;
            if(!result) {
                if(!errors) {
                    errors = {};
                }
                if(!errors[field]) {
                    errors[field] = [];
                }
                errors[field].push(cond);
            }
        }

        return errors;
    };

    AValidate.async = function(data, config, extra) {
        var promises = [];
        var funcs = AValidate._build(data, config, true);

        var PROMISE_TEMPLATE = [
            'var value=opt.value,param=opt.param;',
            'setTimeout(function() {',
            '    var result = {{condition}};',
            '    if(result) {',
            '        resolve();',
            '    }else {',
            '        reject();',
            '    }',
            '}, 1);'
        ].join("\n");

        funcs.forEach(function(func) {
            var defer = Promise.defer();

            defer._resolve = function(value) {
                defer.resolve();
            };
            defer._reject = function(value) {
                value = value || "error";
                defer.reject([func.field, func.cond, value]);
            };

            if(func.func && AValidate._is(func.func, 'function') && func.func.__promise__) {
                func.func.call(AValidate, {
                    value:data[func.field],
                    param:config[func.field][func.cond],
                    data:data
                }, defer._resolve, defer._reject);
            }else {
                new Function(
                    'opt',
                    'resolve',
                    'reject',
                    PROMISE_TEMPLATE.replace(
                        "{{condition}}",
                        "("+(func.cond in AValidate.rules ? "AValidate.rules." + func.cond : func.func.toString())+")(value, param)"
                    )
                ).call(AValidate, {
                    value:data[func.field],
                    param:config[func.field][func.cond],
                    data:data
                }, defer._resolve, defer._reject);
            }

            promises.push(defer.promise);
        });

        var buildPromises = Promise.whatever(promises, function(values) {
            var data = {};
            values.forEach(function(item) {
                var field = item[0];
                var cond = item[1];
                var value = item[2];
                if(!data[field]) {
                    data[field] = {};
                }
                data[field][cond] = value;
            });
            return data;
        });
        return buildPromises;
    };

    if(!("whatever" in window.Promise)) {
        Promise.whatever = function(values, format) {
            var defer = Promise.defer();
            var len = values.length;
            var success = [];
            var error = [];

            !format && (format = function(value) {
                return value;
            });

            function done() {
                if(error.length) {
                    defer.reject(format(error));
                }else {
                    defer.resolve(success);
                }
            }

            function resolve(value, i) {
                success.push(value);
                len--;

                if(len == 0) {
                    done();
                }
            }

            function reject(message) {
                error.push(message);
                len--;

                if(len == 0) {
                    done();
                }
            }

            values.forEach(function(item, i) {
                if(!(item instanceof Promise)) {
                    resolve(item, i);
                    return;
                }

                item.then(function(value) {
                    resolve(value, i);
                }, function(message) {
                    reject(message);
                });
            });

            return defer.promise;
        };
    }

    AValidate._type = function(data) {
        var result = (typeof data).toLowerCase();
        if(result == 'function') {
            if(typeof result.then == 'function') {
                return 'promise';
            }
        }
        if(result == 'object') {
            if(data instanceof RegExp) {
                return 'regexp';
            }
            if(data instanceof Array) {
                return 'array';
            }
        }
        return result;
    };

    AValidate._is = function(data, type) {
        return AValidate._type(data) === type.toLowerCase();
    };

    AValidate._empty = function(data) {
        return (AValidate._is(data, 'number') && isNaN(data)) || (data === null) || (data == undefined);
    };

    AValidate._toFunction = function(key, cond) {
        var type = AValidate._type(key);
        if(type == 'promise') {
            throw new TypeError('use API:AValidate.async to support Promise');
        }

        var func = null;
        if(cond in AValidate.rules) {
            return AValidate.rules[cond];
        }else {
            var build = function(type, value) {
                var condition = '';
                switch(type) {
                    case 'boolean':;
                    case 'number':{
                        condition = 'opt.value == ' + value;
                    };break;
                    case 'string':{
                        condition = 'opt.value == "' + value + '"';
                    };break;
                    case 'regexp':{
                        condition = value.toString() + '.test(opt.value)';
                    };break;
                };
                return AValidate._is(value, 'function') ? value : new Function("opt", 'return ' + condition);
            };

            func = build(type, key);
        }
        return func;
    };

    AValidate._toPromise = function(key, cond) {
        var build = function(type, value) {
            var condition = '';
            switch(type) {
                case 'boolean':;
                case 'number':;
                case 'string':{
                    condition = 'opt.value == ' + value;
                };break;
                case 'regexp':{
                    condition = value.toString() + '.test(opt.value)';
                };break;
            };
            if(AValidate._is(value, 'function')) {
                value.__promise__ = true;
                return value;
            }else {
                var builder = new Function("opt", 'return ' + condition);
                builder.__promise__ = false;
                return builder;
            }
        };

        var type = AValidate._type(key);

        var func = null;
        if(cond in AValidate.rules) {
            func = AValidate.rules[cond];
        }else {
            func = build(type, key);
        }

        return func;
    };

    AValidate._build = function(data, config, isAsync) {
        var funcs = [];
        for(var field in data) {
            if(AValidate._is(config[field], 'object')) {
                for(var cond in config[field]) {
                    funcs.push({
                        func:isAsync ? AValidate._toPromise(config[field][cond], cond) : AValidate._toFunction(config[field][cond], cond),
                        param:config[field][cond],
                        field:field,
                        cond:cond
                    });
                }
            }else {
                funcs.push({
                    func:isAsync ? AValidate._toPromise(config[field]) : AValidate._toFunction(config[field]),
                    field:field,
                    cond:'error'
                });
            }
        }

        return funcs;
    }

    AValidate.add = function(key, data, force) {
        if(key in AValidate.rules) {
            if(!force) {
                throw new Error("can't override the rules:" + key);
            }
        }

        if(AValidate._is(data, 'function')) {
            AValidate.rules[key.toString()] = data;
        }else {
            throw new Error("rules must be a function.");
        }
    };

    AValidate.rules = {
        required:function(opt) {
            var value = opt.value,param = opt.param;
            if(param) {
                if(AValidate._is(value, 'array')) {
                    if(value.length) {
                        return false;
                    }
                }
                if(AValidate._is(value, 'string')) {
                    if(value.trim() == '') {
                        return false;
                    }
                }
                if(AValidate._is(value, 'object')) {
                    for(var key in value) {
                        return true;
                    }
                }
                return !!value;
            }
            return true;
        },
        length:function(opt) {
            if(AValidate._empty(opt)) {
                return true;
            }
            var value = opt.value,param = opt.param;
            var is = param ? param.is : undefined;
            var min = param ? param.min : undefined;
            var max = param ? param.max : undefined;

            if(!AValidate._is(param, 'object') && !AValidate._empty(param)) {
                is = param.toString();
            }

            var data = value + "";
            if(!AValidate._empty(is)) {
                return data.length == is;
            }else {
                if(AValidate._is(min, 'number') && AValidate._is(max, 'number')) {
                    return data.length >= min && data.length <= max;
                }
                else if(AValidate._is(min, 'number') && AValidate._is(max, 'undefined')) {
                    return data.length >= min;
                }
                else if(AValidate._is(min, 'undefined') && AValidate._is(max, 'number')) {
                    return data.length <= max;
                }
                else {
                    return true;
                }
            }
        },
        number:function(opt) {
            if(AValidate._empty(opt)) {
                return true;
            }

            var value = opt.value,param = opt.param;
            if(!AValidate._is(value * 1, 'number'))
                return false;

            var operator = {
                '>':function(num1, num2) {
                    return num1 > num2;
                },
                '>=':function(num1, num2) {
                    return num1 >= num2;
                },
                '==':function(num1, num2) {
                    return num1 == num2;
                },
                '<':function(num1, num2) {
                    return num1 < num2;
                },
                '<=':function(num1, num2) {
                    return num1 <= num2;
                }
            };

            param = param || {};
            var or = param.or || false;
            var errors = [];
            var count = 0;
            for(var key in param) {
                if(key in operator) {
                    count++;
                    var result = operator[key].call(null, value, param[key]);
                    if(!result) {
                        errors.push(true);
                    }
                }
            }
            if(or) {
                return errors.length < count;
            }else {
                return !errors.length;
            }

        },
        include:function(opt) {
            var value = opt.value,param = opt.param;
            if(!AValidate._is(param, 'array'))
                return false;

            if(param.indexOf(value) >= 0) {
                return true;
            }
            return false;
        },
        exclude:function(opt) {
            var value = opt.value,param = opt.param;
            if(!AValidate._is(param, 'array'))
                return false;

            if(param.indexOf(value) < 0) {
                return true;
            }
            return false;
        },
        email:function(opt) {
            var value = opt.value,param = opt.param;
            if(typeof param == 'undefined' || !param) {
                return true;
            }
            if(!AValidate._is(value, "string"))
                return false;

            var pattern = /^[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
            return pattern.test(value);
        },
        char:function(opt) {
            opt = opt || {};
            // number, english, symbol, chinese
            var rules = {
                "number":"0-9",
                "symbol":"`~!@#￥%……&*()_-=+[]|;:,.",
                "english":"a-zA-Z",
                "chinese":"\u0391-\uFFE5"
            };

            var check_char = "";
            for(var key in opt) {
                if(opt[key] && key in rules) {
                    check_char += rules[key];
                }
            }
            if(check_char) {
                var check_reg = new RegExp("^["+check_char+"]+$", "g");
                return !!check_reg.test(opt.value);
            }else {
                return true;
            }
        }
    };

    return window.AValidate = AValidate;
});