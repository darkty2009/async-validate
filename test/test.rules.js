var Validate = require('../validate.async.js');
var common = require('./common.js');

var a = require('assert').deepEqual;
var d = describe;

var error = common.error;

d('#rules', function() {
    d('#sync', function() {
        d('#required', function() {
            d('#set true', function() {
                it('number', function() {
                    a(null, Validate({val:{required:true}}, {val:1}));
                    a(null, Validate({val:{required:true}}, {val:0}));
                    a(null, Validate({val:{required:true}}, {val:-1}));
                    a(null, Validate({val:{required:true}}, {val:0.99}));
                    a(null, Validate({val:{required:true}}, {val:3.98}));
                });
                it('string', function() {
                    a(null, Validate({val:{required:true}}, {val:'a'}));
                    a(null, Validate({val:{required:true}}, {val:'null'}));
                    a(null, Validate({val:{required:true}}, {val:'0'}));
                    a(error('required'), Validate({val:{required:true}}, {val:''}));
                });
                it('object', function() {
                    a(null, Validate({val:{required:true}}, {val:{a:1}}));
                    a(null, Validate({val:{required:true}}, {val:{a:1,b:2}}));
                    a(null, Validate({val:{required:true}}, {val:{c:null}}));
                    a(null, Validate({val:{required:true}}, {val:Validate}));
                    a(error('required'), Validate({val:{required:true}}, {val:{}}));
                });
                it('array', function() {
                    a(null, Validate({val:{required:true}}, {val:[1]}));
                    a(error('required'), Validate({val:{required:true}}, {val:[null]}));
                    a(null, Validate({val:{required:true}}, {val:[null,1]}));
                    a(null, Validate({val:{required:true}}, {val:Array.prototype.concat([], [1,2,3])}));
                    a(error('required'), Validate({val:{required:true}}, {val:[]}));
                });

                it('empty', function() {
                    common.empty.forEach(function(value) {
                        if(value !== false && value !== 0)
                            a(error('required'), Validate({val:{required:true}}, {val:value}));
                    });
                })
            });

            d('#set false', function() {
                it('number', function() {
                    a(null, Validate({val:{required:false}}, {val:1}));
                });
                it('string', function() {
                    a(null, Validate({val:{required:false}}, {val:'a'}));
                });
                it('object', function() {
                    a(null, Validate({val:{required:false}}, {val:{a:1}}));
                });
                it('array', function() {
                    a(null, Validate({val:{required:false}}, {val:[1]}));
                });
            });
        });

        d('#length', function() {
            assert.deepEqual(A.sync({val:"abcde"}, {val:{length:5}}), null, 'use rule: length');
            errors.forEach(function(value) {
                assert.deepEqual(A.sync({val:value}, {val:{length:20}}), {val:['length']}, 'use rule: length with ' + value);
                if(value != 0 && !isNaN(value)) {
                    assert.deepEqual(A.sync({val:"abcde"}, {val:{length:value}}), null, 'use rule: length param with ' + value);
                }
            });
            it('direct', function() {
                a(null, Validate({val:{length:5}}, {val:"abcde"}));
                common.empty.forEach(function(value) {
                    a({val:{length:'error'}}, )
                });
            });

            assert.deepEqual(A.sync({val:"abcde"}, {val:{length:{is:5}}}), null, 'use rule: length is');
            errors.forEach(function(value) {
                assert.deepEqual(A.sync({val:value}, {val:{length:{is:20}}}), {val:['length']}, 'use rule: length is with ' + value);
                if(value != 0 && !isNaN(value)) {
                    assert.deepEqual(A.sync({val:"abcde"}, {val:{length:{is:value}}}), null, 'use rule: length is param with ' + value);
                }
            });
            assert.deepEqual(A.sync({val:"abcde"}, {val:{length:{min:2}}}), null, 'use rule: length min');
            assert.deepEqual(A.sync({val:"abcde"}, {val:{length:{min:5}}}), null, 'use rule: length min');
            errors.forEach(function(value) {
                assert.deepEqual(A.sync({val:value}, {val:{length:{min:20}}}), {val:['length']}, 'use rule: length min with ' + value);
                if(value != 0 && !isNaN(value)) {
                    assert.deepEqual(A.sync({val:"abcde"}, {val:{length:{min:value}}}), null, 'use rule: length min param with ' + value);
                }
            });

            assert.deepEqual(A.sync({val:"abcde"}, {val:{length:{max:7}}}), null, 'use rule: length max');
            assert.deepEqual(A.sync({val:"abcde"}, {val:{length:{max:5}}}), null, 'use rule: length max');
            errors.forEach(function(value) {
                assert.deepEqual(A.sync({val:value}, {val:{length:{max:-1}}}), {val:['length']}, 'use rule: length max with ' + value);
                if(value != 0 && !isNaN(value)) {
                    assert.deepEqual(A.sync({val:"abcde"}, {val:{length:{max:value}}}), null, 'use rule: length max param with ' + value);
                }
            });

            assert.deepEqual(A.sync({val:"abcde"}, {val:{length:{min:5, max:5}}}), null, 'use rule: length min and max');
            errors.forEach(function(value) {
                assert.deepEqual(A.sync({val:value}, {val:{length:{min:20, max:50}}}), {val:['length']}, 'use rule: length min and max with ' + value);
                if(value != 0 && !isNaN(value)) {
                    assert.deepEqual(A.sync({val:"abcde"}, {val:{length:{min:value, max:-1}}}), null, 'use rule: length min and max param with ' + value);
                    assert.deepEqual(A.sync({val:"abcde"}, {val:{length:{min:20, max:value}}}), null, 'use rule: length min and max param with ' + value);
                }
            });
            assert.deepEqual(A.sync({val:"abcde"}, {val:{length:{is:5, min:7, max:10}}}), null, 'use rule: length is override min and max');
        });
    });
});