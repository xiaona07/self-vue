const patchArray = (function () {
    const methodsToPatch = [
        'push',
        'pop',
        'shift',
        'unshift',
        'splice',
        'reverse',
        'sort'
    ];

//设置对象属性的工具方法
    function def(obj, key, val) {
        Object.defineProperty(obj, key, {
            value: val,
            enumerable: true,
            writable: true,
            configurable: true
        });
    }

    const arrayProto = Array.prototype //缓存Array的原型
    const arrayMethods = Object.create(arrayProto); //继承Array的原型
    methodsToPatch.forEach(function (method, index) {
        def(arrayMethods, method, function (...args) {
            //首先调用Array原型的方法
            const old = this.concat([]);
            const res = arrayProto[method].apply(this, args);
            let inserted = null,
                deleted = null;
            let _callback_ = this._callback_;
            //记录插入的值
            switch (method) {
                case 'push':
                case 'unshift':
                    inserted = args;
                    break;
                case 'splice':
                    //这是新增的
                    inserted = args.slice(2);
                    let start = args[0],
                        end = start + args[1];
                    deleted = old.slice(start, end);
                    break;
                case 'pop':
                case 'shift':
                    deleted = res;
            }
            if (_callback_) {
                _callback_(inserted, deleted, this.slice());
            }
            return res;
        });
    });
    return function (target, callback) {
        def(target, '_callback_', callback); //定义回调
        //看看浏览器支不支持__proto__这个属性，通过改变__proto__的值，可以设置对象的原型
        if ('__proto__' in {}) {
            //将数组的原型指向arrayMethods，这样当数组调用上述的7个方法时，其实是调用arrayMethods中的方法而不是调用Array.prototype中的方法
            target.__proto__ = arrayMethods;
        } else {
            //如果浏览器不支持__proto__，则设置数组对应的属性，这样当数组调用上述的7个方法时，其实是调用数组对应属性指向的方法
            for (let i = 0, l = methodsToPatch.length; i < l; i++) {
                let key = methodsToPatch[i];
                def(target, key, arrayMethods[key]);
            }
        }
    }
})();
//测试
// let arr = [1, 2, 3];
// patchArray(arr, function (add, del, res) {
//     if (add)
//         console.log('这是新增的内容:', add);
//     if (del)
//         console.log('这是删除的内容:', del);
//     if (res)
//         console.log('这是最终的内容:', res);
// });
// arr.splice(1, 2, 'aa', 'bb', 'cc')
// console.log(arr)


