##Async-Avalidate 是什么
Async-Avalidte是一个支持同步与异步模式的验证框架，
它可以十分方便的把验证条件转换为同一步模式进行处理，
并返回给开发者一个经过组织的结果

##构建状态
[build-image]: https://travis-ci.org/darkty2009/async-validate.svg
[build-url]: https://travis-ci.org/darkty2009/async-validate
[license-image]: http://img.shields.io/badge/license-MIT-blue.svg
[license-url]: https://github.com/darkty2009/async-validate/blob/master/LICENSE
[![Build Status](build-image)](build-url) [![MIT License][license-image]][license-url]

##快速起步
```javascript
AValidate({val:"abcdefg1"}, {
    val:/^\w+$/
});
// console: {val:"error"}
AValidate({val:"abcdefg1"}, {
    val:{
        required:true,
        custom:/^\w+$/
    }
});
// console: {val:{custom:"error"}}
AValidate({val:"abcdefg"}, {
    val:/^\w+$/
});
// console: null
```
当验证成功时，方法会返回null。
当验证失败时，方法会返回具体的错误信息。

##异步模式
```javascript
AValidate.async({val:12001}, {
    val:function(opt, resolve, reject) {
        $.ajax({
            url:"validate-user-id-exist",
            data:{id:opt.value},
            success:function() {
                resolve();
            },
            error:function() {
                reject("is-not-exist");
            }
        })
    }
}).then(function(message) {
    // console: message is null or undefined
}, function(message) {
    // console: {val:"is-not-exist"}
});
```
##默认的验证规则
### required
参数：可选 true | false
### length
参数: 可选 [number] | [object]
```javascript
{
    is:[number],
    max:[number],
    min:[number]
}
```
若参数为数字，则默认将其赋值给 [object].is
### number
参数: 可选 [number] | [object]
```javascript
{
    '>':[number],
    '>=':[number],
    '==':[number],
    '<=':[number],
    '<':[number],
    'or':false | true
}
```
若参数为数字，则默认将其赋值给 [object]['==']。
参数中的 or 默认为 false，
例如设置了 {'>=':1, '<':10} 转换后的条件为 val >=1 && val < 10
设置了 {'>=1':1, '<':10, or:true} 转换后的条件为 val >=1 || val < 10
### include
参数: [array]
该规则的作用是验证给定的值是否在数组中
### exclude
参数: [array]
该规则的作用是验证给定的仠不在数组中
### email
参数: true | false
验证当前值是否为email格式
### char
参数: [object]
```javascript
{
    'number':true | false,
    'symbol':true | false,
    'chinese':true | false,
    'english':true | false
}
```
验证当前值是否满足字符类型要求
参数包含四个属性(默认值均为false):

* number    数字
* symbol    特殊符号    注:`~!@#￥%……&*()_-=+[]|;:,.
* chinese   中文
* english   英文


## 自定义同步验证
```javascript
AValidate.add('same_password', function(opt) {
    if(opt.value != opt.data.password) {
        return false;
    }
    return true;
});
```
参数: opt 包含三个属性

* value     当前字段的输入值
* data      当前所有的输入值
* param     当前验证条件的参数

## 自定义异步验证
```javascript
AValidate.add('user_exist', function(opt, resolve, reject) {
    $.ajax({
        url:"user_exist_check",
        data:{
            user:opt.value
        },
        success:function() {
            resolve();
        },
        error:function() {
            reject();
        }
    });
});
```
参数: opt 包含三个属性

* value     当前字段的输入值
* data      当前所有的输入值
* param     当前验证条件的参数

参数: resolve 验证成功时调用
参数: reject  验证失败时调用

## BUG反馈
先谢谢所有提供反馈的开发者
EMAIL: darkty2009#gmail.com
或者 [issues](https://github.com/darkty2009/async-validate/issues)
