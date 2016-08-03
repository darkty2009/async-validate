var Validate = require('../validate.async.js');

var a = require('assert').deepEqual;
var d = describe;

d('Global', function() {
    d('#method', function() {
        it('sync', function() {
            a('function', typeof Validate.sync);
        });
        it('async', function() {
            a('function', typeof Validate.async);
        });
        it('add', function() {
            a('function', typeof Validate.add);
        });
    });

    d('#properties', function() {
        it('rules', function() {
            a('object', typeof Validate.rules);
        });

        d('#rules', function() {
            var keys = ['required', 'length', 'number', 'include', 'exclude', 'email', 'char'];
            keys.forEach(function(key) {
                it(key + ' existed', function() {
                    a('function', typeof Validate.rules[key]);
                });
            });
        });
    });
});