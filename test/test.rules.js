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
                    a(null, Validate({val:1}, {val:{required:true}}));
                    a(null, Validate({val:0}, {val:{required:true}}));
                    a(null, Validate({val:-1}, {val:{required:true}}));
                    a(null, Validate({val:0.99}, {val:{required:true}}));
                    a(null, Validate({val:3.98}, {val:{required:true}}));
                });
                it('string', function() {
                    a(null, Validate({val:'a'}, {val:{required:true}}));
                    a(null, Validate({val:'null'}, {val:{required:true}}));
                    a(null, Validate({val:'0'}, {val:{required:true}}));
                    a(error('required'), Validate({val:''}, {val:{required:true}}));
                });
                it('object', function() {
                    a(null, Validate({val:{a:1}}, {val:{required:true}}));
                    a(null, Validate({val:{a:1,b:2}}, {val:{required:true}}));
                    a(null, Validate({val:{c:null}}, {val:{required:true}}));
                    a(null, Validate({val:Validate}, {val:{required:true}}));
                    a(error('required'), Validate({val:{}}, {val:{required:true}}));
                });
                it('array', function() {
                    a(null, Validate({val:[1]}, {val:{required:true}}));
                    a(error('required'), Validate({val:[null]}, {val:{required:true}}));
                    a(null, Validate({val:[null,1]}, {val:{required:true}}));
                    a(null, Validate({val:Array.prototype.concat([], [1,2,3])}, {val:{required:true}}));
                    a(error('required'), Validate({val:[]}, {val:{required:true}}));
                });

                it('empty', function() {
                    common.empty.forEach(function(value) {
                        if(value !== false && value !== 0)
                            a(error('required'), Validate({val:value}, {val:{required:true}}));
                    });
                })
            });

            d('#set false', function() {
                it('number', function() {
                    a(null, Validate({val:1}, {val:{required:false}}));
                });
                it('string', function() {
                    a(null, Validate({val:'a'}, {val:{required:false}}));
                });
                it('object', function() {
                    a(null, Validate({val:{a:1}}, {val:{required:false}}));
                });
                it('array', function() {
                    a(null, Validate({val:[1]}, {val:{required:false}}));
                });
            });
        });
    });
});