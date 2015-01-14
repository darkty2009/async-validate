var A = AValidate;
var errors = [false, 0, "", NaN, null, undefined];

QUnit.test("Sync shortcut", function(assert) {
    assert.deepEqual(A.sync({val:true}, {val:true}), null, 'shortcut boolean');
    assert.deepEqual(A.sync({val:false}, {val:false}), null, 'shortcut boolean');
    errors.forEach(function(value) {
        assert.deepEqual(A.sync({val:value}, {val:true}), {val:['error']}, 'shortcut boolean error width ' + value);
    });

    assert.deepEqual(A.sync({val:1}, {val:1}), null, 'shortcut number');
    assert.deepEqual(A.sync({val:-1}, {val:-1}), null, 'shortcut number');
    errors.forEach(function(value) {
        assert.deepEqual(A.sync({val:value}, {val:1}), {val:['error']}, 'shortcut number error width ' + value);
    });

    assert.deepEqual(A.sync({val:"a"}, {val:"a"}), null, 'shortcut string');
    assert.deepEqual(A.sync({val:"some text"}, {val:"some text"}), null, 'shortcut string');
    errors.forEach(function(value) {
        assert.deepEqual(A.sync({val:value}, {val:"a"}), {val:['error']}, 'shortcut string error width ' + value);
    });

    assert.deepEqual(A.sync({val:"abc"}, {val:/abc/}), null, 'shortcut regexp');
    assert.deepEqual(A.sync({val:9999}, {val:/\w{4}/}), null, 'shortcut regexp');
    errors.forEach(function(value) {
        assert.deepEqual(A.sync({val:value}, {val:/abc/}), {val:['error']}, 'shortcut regexp error width ' + value);
    });
});

QUnit.test("Sync default rules", function(assert) {
    assert.deepEqual(A.sync({val:"1"}, {val:{required:true}}), null, 'use rule: required');
    assert.deepEqual(A.sync({val:"1"}, {val:{required:false}}), null, 'not use rule: required');
    errors.forEach(function(value) {
        assert.deepEqual(A.sync({val:value}, {val:{required:true}}), {val:["required"]}, 'use rule: required error with ' + value);
    });

    assert.deepEqual(A.sync({val:"abcde"}, {val:{length:5}}), null, 'use rule: length');
    errors.forEach(function(value) {
        assert.deepEqual(A.sync({val:value}, {val:{length:20}}), {val:['length']}, 'use rule: length with ' + value);
        if(value != 0 && !isNaN(value)) {
            assert.deepEqual(A.sync({val:"abcde"}, {val:{length:value}}), null, 'use rule: length param with ' + value);
        }
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

    assert.deepEqual(A.sync({val:5000}, {val:{number:5000}}), null, 'use rule: number');
    errors.forEach(function(value) {
        assert.deepEqual(A.sync({val:value}, {val:{number:5000}}), {val:['number']}, 'use rule: number with ' + value);
        if(value != 0 && !isNaN(value)) {
            assert.deepEqual(A.sync({val:5000}, {val:{number:value}}), null, 'use rule: number param with ' + value);
        }
    });

    assert.deepEqual(A.sync({val:5000}, {val:{number:{'<=':10000}}}), null, 'use rule: number lessEqual');
    assert.deepEqual(A.sync({val:5000}, {val:{number:{'>=':1000}}}), null, 'use rule: number moreEqual');
    assert.deepEqual(A.sync({val:5000}, {val:{number:{'<=':10000, '>=':1000}}}), null, 'use rule: number lessEqual and moreEqual');
    assert.deepEqual(A.sync({val:5000}, {val:{number:{'<=':1000, '>=':5000, 'or':true}}}), null, 'use rule: number lessEqual and moreEqual ,or');

    assert.deepEqual(A.sync({val:"X"}, {val:{include:["X", "S", "M", "L"]}}), null, 'use rule: include');
    assert.deepEqual(A.sync({val:"E"}, {val:{include:["X", "S", "M", "L"]}}), {val:['include']}, 'use rule: include');
    assert.deepEqual(A.sync({val:"X"}, {val:{include:"XSML"}}), null, 'use rule: include string');
    errors.forEach(function(value) {
        assert.deepEqual(A.sync({val:value}, {val:{include:["X", "S", "M", "L"]}}), {val:['include']}, 'use rule: include with ' + value);
        if(!AValidate._is(value, 'string'))
            assert.deepEqual(A.sync({val:"X"}, {val:{include:value}}), null, 'use rule: include param with ' + value);
    });

    assert.deepEqual(A.sync({val:"E"}, {val:{exclude:["X", "S", "M", "L"]}}), null, 'use rule: exclude');
    assert.deepEqual(A.sync({val:"X"}, {val:{exclude:["X", "S", "M", "L"]}}), {val:['exclude']}, 'use rule: exclude');
    assert.deepEqual(A.sync({val:"E"}, {val:{exclude:"XSML"}}), null, 'use rule: exclude string');
    errors.forEach(function(value) {
        assert.deepEqual(A.sync({val:value}, {val:{exclude:["X", "S", "M", "L"]}}), null, 'use rule: exclude with ' + value);
        if(!AValidate._is(value, 'string'))
            assert.deepEqual(A.sync({val:"X"}, {val:{exclude:value}}), null, 'use rule: exclude param with ' + value);
    });

    assert.deepEqual(A.sync({val:"d@g.com"}, {val:{email:true}}), null, 'use rule: email');
    assert.deepEqual(A.sync({val:"d@g.com"}, {val:{email:false}}), null, 'use rule: email');
    errors.forEach(function(value) {
        assert.deepEqual(A.sync({val:value}, {val:{email:true}}), {val:['email']}, 'use rule: email with ' + value);
    });
    var email = ["d@.com", "@@g.com", "@g.com", ".@g.com", "!@g.com", "()@g.com", "dgcom", "d@.g.com", "d@g..com"];
    email.forEach(function(value) {
        assert.deepEqual(A.sync({val:value}, {val:{email:true}}), {val:['email']}, 'use rule: email with ' + value);
    });
});