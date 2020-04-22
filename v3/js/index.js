function SelfVue (options) {
    let self = this;
    this.data = options.data;
    this.methods = options.methods;
    this.watch = options.watch;
    Object.keys(this.data).forEach(function(key) {
        self.proxyKeys(key);
    });
    Object.keys(options.computed).forEach((key) => {
        self.proxyComputed(key,options.computed[key])
    })
    observe(this.data);
    Object.keys(options.watch).forEach((key) => {
        self.$watch(key,options.watch[key])
    })
    new Compile(options.el, this);
    options.mounted.call(this); // 所有事情处理好后执行mounted函数
}

SelfVue.prototype = {
    $watch: function(key, cb) {
        new Watcher(this, key, cb);
    },
    proxyKeys: function (key) {
        var self = this;
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get: function getter () {
                return self.data[key];
            },
            set: function setter (newVal) {
                self.data[key] = newVal;
            }
        });
    },
    proxyComputed: function (key,fun) {
        var self = this;
        Object.defineProperty(this, key, {
            get: fun,
            set: function () {
            }
        });
    }
}
