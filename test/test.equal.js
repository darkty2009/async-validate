var Validate = require('../validate.async.js');

var a = require('assert').deepEqual;
var d = describe;

d('#sync direct equal', function() {
    d('#boolean', function() {
        it('equal true', function() {
            a(null, Validate({val:true}, {val:true}));
        });
        it('equal false', function() {
            a(null, Validate({val:false}, {val:false}));
        });
    });

    d('#number', function() {
        it('equal 0', function() {
            a(null, Validate({val:0}, {val:0}));
        });
        it('equal 1', function() {
            a(null, Validate({val:1}, {val:1}));
        });
    });

    d('#string', function() {
        it('equal english', function() {
            a(null, Validate({val:"abcdefg"}, {val:'abcdefg'}));
        });
        it('equal chinese', function() {
            a(null, Validate({val:"中文"}, {val:"中文"}));
        });
    });

    d('#array', function() {
        it('equal normal array', function() {
            a(null, Validate({val:[1,2,{a:1}]}, {val:[1,2,{a:1}]}));
        });
        it('equal someone empty', function() {
            // JSON.stringify convert "NaN, undefined" etc to "null"
            a(null, Validate({val:[1,2,null, null]}, {val:[1,2,null, null]}));
        });
    });
});