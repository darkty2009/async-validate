module.exports = {
    empty:[false, 0, "", NaN, null, undefined],
    error:function(type) {
        var object = {val:{}};
        object.val[type] = 'error';
        return object;
    }
};