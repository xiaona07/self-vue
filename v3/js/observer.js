function Observer(data) {
    this.data = data;
    this.walk(data);
}

Observer.prototype = {
    walk: function (data) {
        var self = this;
        let handler = {
            get (target, prop, args) {
                if (typeof target[prop] === "function") {
                    return target[prop].bind(target)
                }
                return target[prop]
            }
        }
        let proxy = new Proxy(data, handler)
        Object.keys(proxy).forEach(function (key) {

            self.defineReactive(proxy, key, proxy[key]);


        });
    },
    defineReactive: function (data, key, val) {
        let dep = new Dep();
        let childObj = observe(val);
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get: function getter() {
                if (Dep.target) {
                    dep.addSub(Dep.target);
                }
                return val;
            },
            set: function setter(newVal) {
                if (newVal === val) {
                    return;
                }
                val = newVal;
                dep.notify(key);
            }
        });
    }
};

function observe(value, vm) {
    if (!value || typeof value !== 'object') {
        return;
    }
    return new Observer(value);
};

function Dep() {
    // this.subs = [];
    this.subs = new Map()
}
Dep.prototype = {
    addSub: function (sub) {
        // this.subs.push(sub);
        let val = this.subs.get(sub.exp)
        if (val) {
            val.push(sub)
        } else {
            val = [sub]
        }
        this.subs.set(sub.exp, val);
    },
    notify: function (key) {
        let val = this.subs.get(key)
        if (val) {
            val.forEach(function (sub) {
                sub.update();
            });
        }
    }
};
Dep.target = null;
