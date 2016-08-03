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
            it('direct', function() {
                a(null, Validate({val:{length:5}}, {val:"abcde"}));
                common.empty.forEach(function(value) {
                    a({val:{length:'error'}}, Validate({val:{length:20}}, {val:value}));

                    if(value != 0 && !isNaN(value)) {
                        a(null, Validate({val:{length:value}}, {val:'abcde'}));
                    }
                });
            });

            it('equal', function() {
                a(null, Validate({val:{length:{is:5}}}, {val:"abcde"}));
                common.empty.forEach(function(value) {
                    a({val:{length:'error'}}, Validate({val:{length:{is:20}}}, {val:value}));

                    if(value != 0 && !isNaN(value)) {
                        a(null, Validate({val:{length:{is:value}}}, {val:'abcde'}));
                    }
                });
            });

            it('min', function() {
                a(null, Validate({val:{length:{min:2}}}, {val:"abcde"}));
                a(null, Validate({val:{length:{min:5}}}, {val:"abcde"}));
                common.empty.forEach(function(value) {
                    a({val:{length:'error'}}, Validate({val:{length:{min:20}}}, {val:value}));

                    if(value != 0 && !isNaN(value)) {
                        a(null, Validate({val:{length:{min:value}}}, {val:'abcde'}));
                    }
                });
            });

            it('max', function() {
                a(null, Validate({val:{length:{max:7}}}, {val:"abcde"}));
                a(null, Validate({val:{length:{max:5}}}, {val:"abcde"}));
                common.empty.forEach(function(value) {
                    a({val:{length:'error'}}, Validate({val:{length:{max:-1}}}, {val:value}));

                    if(value != 0 && !isNaN(value)) {
                        a(null, Validate({val:{length:{max:value}}}, {val:'abcde'}));
                    }
                });
            });

            it('min and max', function() {
                a(null, Validate({val:{length:{max:5, min:5}}}, {val:"abcde"}));
                a({val:{length:'error'}}, Validate({val:{length:{min:20, max:50}}}, {val:"abcde"}));
                common.empty.forEach(function(value) {
                    a({val:{length:'error'}}, Validate({val:{length:{min:20, max:50}}}, {val:value}));

                    if(value != 0 && !isNaN(value)) {
                        a(null, Validate({val:{length:{min:value, max:-1}}}, {val:'abcde'}));
                        a(null, Validate({val:{length:{min:20, max:value}}}, {val:'abcde'}));
                    }
                });
            });

            it('combine', function() {
                a(null, Validate({val:{length:{min:7,max:10,is:5}}}, {val:'abcde'}));
            });
        });
    });
});