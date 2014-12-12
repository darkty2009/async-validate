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
            var result = func.func.call(AValidate, data[func.field], func.param);
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
            'return new Promise(function(resolve, reject) {',
            '    setTimeout(function() {',
            '        var result = {{condition}};',
            '        if(result) {',
            '            resolve();',
            '        }else {',
            '            reject("error");',
            '        }',
            '    }, 1);',
            '});'
        ].join("\n");

        funcs.forEach(function(func) {
            var promise = null;
            if(func.func && func.func.__promise__) {
                promise = func.func.call(AValidate, data[func.field], config[func.field][func.cond]);
            }else {
                promise = new Function(
                    'value',
                    'param',
                    PROMISE_TEMPLATE.replace(
                        "{{condition}}",
                        "("+(func.cond in AValidate.rules ? "AValidate.rules." + func.cond : func.func.toString())+")(value, param)"
                    )
                ).call(AValidate, data[func.field], config[func.field][func.cond]);
            }
            promise.__source__ = func;
            promises.push(promise);
        });

        return Promise.all(promises);
    };

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
                    case 'number':;
                    case 'string':{
                        condition = 'value == ' + value;
                    };break;
                    case 'regexp':{
                        condition = value.toString() + '.test(value)';
                    };break;
                };
                return AValidate._is(value, 'function') ? value : new Function("value", "param", 'return ' + condition);
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
                    condition = 'value == ' + value;
                };break;
                case 'regexp':{
                    condition = value.toString() + '.test(value)';
                };break;
            };
            if(AValidate._is(value, 'function')) {
                return value.__promise__ = true, value;
            }else {
                return new Function("value", "param", 'return ' + condition);
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
        required:function(value, param) {
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
        length:function(value, param) {
            if(typeof param == 'undefined') {
                return true;
            }
            var is = param.is;
            var min = param.min;
            var max = param.max;

            if(!AValidate._is(param, 'object')) {
                is = param.toString();
            }

            var data = value.toString();
            if(is) {
                return data.length == is;
            }else {
                return data.length >= min && data.length <= max;
            }
        },
        number:function(value, param) {
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
        include:function(value, param) {
            if(!AValidate._is(param, 'array'))
                return false;

            if(param.indexOf(value) >= 0) {
                return true;
            }
            return false;
        },
        exclude:function(value, param) {
            if(!AValidate._is(param, 'array'))
                return false;

            if(param.indexOf(value) < 0) {
                return true;
            }
            return false;
        },
        email:function(value, param) {
            if(typeof param == 'undefined' || !param) {
                return true;
            }
            if(!AValidate._is(value, "string"))
                return false;

            var pattern = /^[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9\u007F-\uffff!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i;
            return pattern.test(value);
        }
    };

    return window.AValidate = AValidate;
});