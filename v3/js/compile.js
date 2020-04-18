function Compile(el, vm) {
    this.vm = vm;
    this.el = document.querySelector(el);
    this.fragment = null;
    this.init();
}
Compile.prototype = {
    init: function () {
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el);
            this.compileElement(this.fragment);
            this.el.appendChild(this.fragment);
        } else {
            console.log('Dom元素不存在');
        }
    },
    nodeToFragment: function (el) {
        var fragment = document.createDocumentFragment();
        var child = el.firstChild;
        while (child) {
            // 将Dom元素移入fragment中
            fragment.appendChild(child);
            child = el.firstChild
        }
        return fragment;
    },
    compileElement: function (el) {
        var childNodes = el.childNodes;
        var self = this;
        [].slice.call(childNodes).forEach(function (node, index) {
            var reg = /\{\{(.*)\}\}/;
            var text = node.textContent;

            if (self.isElementNode(node)) {
                self.compile(node, index);
            } else if (self.isTextNode(node) && reg.test(text)) {
                self.compileText(node, reg.exec(text)[1]);
            }
            if (node.childNodes && node.childNodes.length) {
                self.compileElement(node);
            }
        });
    },
    compile: function (node, index) {
        var nodeAttrs = node.attributes;
        var self = this;
        Array.prototype.forEach.call(nodeAttrs, function (attr) {
            var attrName = attr.name;
            if (self.isDirective(attrName)) {
                var exp = attr.value;
                var dir = attrName.substring(2);
                if (self.isEventDirective(dir)) {  // 事件指令
                    self.compileEvent(node, self.vm, exp, dir);
                } else if (self.isModelDirective(dir)) {  // v-model 指令
                    self.compileModel(node, self.vm, exp, dir);
                } else if (self.isIfDirective(dir, index)) {
                    self.compileIf(node, self.vm, exp, dir, index);
                } else if (self.isForDirective(dir)) {
                    self.compileFor(node, self.vm, exp, dir, attrName);
                } else if (self.isShowDirective(dir)) {
                    self.compileShow(node, self.vm, exp, dir);
                } else if (self.isBindDirective(dir)) {
                    self.compileBind(node, self.vm, exp, dir);
                }
                node.removeAttribute(attrName);
            }
        });
    },
    compileText: function (node, exp) {
        var self = this;
        var initText = this.vm[exp];
        this.updateText(node, initText);
        new Watcher(this.vm, exp, function (value) {
            self.updateText(node, value);
        });
    },
    compileEvent: function (node, vm, exp, dir) {
        var eventType = dir.split(':')[1];
        var cb = vm.methods && vm.methods[exp];

        if (eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false);
        }
    },
    compileModel: function (node, vm, exp, dir) {
        var self = this;
        var val = this.vm[exp];
        this.modelUpdater(node, val);
        new Watcher(this.vm, exp, function (value) {
            self.modelUpdater(node, value);
        });

        node.addEventListener('input', function (e) {
            var newValue = e.target.value;
            if (val === newValue) {
                return;
            }
            self.vm[exp] = newValue;
            val = newValue;
        });
    },
    compileIf: function (node, vm, exp, dir, index) {
        var self = this;
        var val = this.vm[exp];
        if (!val) {
            node.parentNode.removeChild(node);
        }
        new Watcher(this.vm, exp, function (value) {
            self.ifUpdater(node, value);
        });
    },
    compileFor: function (node, vm, exp, dir, attrName) {
        let self = this;
        let item = exp.split(' of ')[0]
        let listName = exp.split(' of ')[1]
        let list = this.vm[listName];
        let fragmentAll = document.createDocumentFragment();
        node.removeAttribute(attrName);
        vm.forClone = node.cloneNode(true)
        for (itm of list) {
            let clone = node.cloneNode(true)
            self.changeTextNode(clone, item, itm)
            fragmentAll.appendChild(clone)
            new Watcher(vm, listName, function (value) {
                self.forUpdater(vm, item, clone, value);
            });
        }
        this.compileElement(fragmentAll);
        node.parentNode.insertBefore(fragmentAll, node)
        // node.parentNode.removeChild(node)
        node.style.display = "none"
        vm.forNum = 0
        new Watcher(vm, listName, function (value) {
            self.forUpdater2(vm, item, node, value);
        });
},
    compileShow: function (node, vm, exp, dir) {
        var self = this;
        var val = this.vm[exp];
        node.style.display = val ? "block" : "none"
        new Watcher(vm, exp, function (value) {
            self.showUpdater(node, value);
        });
    },
    compileBind: function (node, vm, exp, dir) {
        let self = this;
        let val = this.vm[exp];
        let attrName = dir.split(':')[1];
        // node[attrName] = val
        node.setAttribute(attrName, val);
        new Watcher(vm, exp, function (value) {
            self.bindUpdater(node, value, attrName);
        });
    },
    updateText: function (node, value) {
        node.textContent = typeof value == 'undefined' ? '' : value;
    },
    modelUpdater: function (node, value, oldValue) {
        node.value = typeof value == 'undefined' ? '' : value;
    },
    ifUpdater: function (node, value, oldValue) {
        if (!value) {
            node.parentNode.removeChild(node);
        } else {
        }
    },
    forUpdater: function (vm, item, node, value) {
        // let self = this
        // if (vm.forNum < 1) {
        //     let fragmentAll2 = document.createDocumentFragment()
        //     for (itm of value) {
        //         let clone2 = vm.forClone.cloneNode(true)
        //         self.changeTextNode(clone2, item, itm)
        //         fragmentAll2.appendChild(clone2)
        //     }
        //     this.compileElement(fragmentAll2);
        //     node.parentNode.insertBefore(fragmentAll2, node)
        //     vm.forNum = 1
        // }
        node.remove()
        console.log(999)
    },
    forUpdater2: function (vm, item, node, value) {
        let self = this
        // if (vm.forNum < 1) {
            let fragmentAll2 = document.createDocumentFragment()
            for (itm of value) {
                let clone2 = vm.forClone.cloneNode(true)
                self.changeTextNode(clone2, item, itm)
                fragmentAll2.appendChild(clone2)
            }
            this.compileElement(fragmentAll2);
            node.parentNode.insertBefore(fragmentAll2, node)
        //     vm.forNum = 1
        // }
        // node.remove()
    },
    showUpdater: function (node, value, oldValue) {
        node.style.display = value ? "block" : "none"
    },
    bindUpdater: function (node, value, attrName) {
        // node[attrName] = value
        node.setAttribute(attrName, value);
    },
    isDirective: function (attr) {
        return attr.indexOf('v-') == 0;
    },
    isEventDirective: function (dir) {
        return dir.indexOf('on:') === 0;
    },
    isModelDirective: function (dir) {
        return dir.indexOf('model') === 0;
    },
    isIfDirective: function (dir) {
        return dir.indexOf('if') === 0;
    },
    isBindDirective: function (dir) {
        return dir.indexOf('bind:') === 0;
    },
    isForDirective: function (dir) {
        return dir.indexOf('for') === 0;
    },
    isShowDirective: function (dir) {
        return dir.indexOf('show') === 0;
    },
    isBindDirective: function (dir) {
        return dir.indexOf('bind') === 0;
    },
    isElementNode: function (node) {
        return node.nodeType == 1;
    },
    isTextNode: function (node) {
        return node.nodeType == 3;
    },
    changeTextNode: function (node, item, itm) {
        let self = this
        //1、利用递归去改变迭代的item
        // if (this.isElementNode(node)) {
        //     let childNodes = node.childNodes;
        //     [].slice.call(childNodes).forEach(function (node) {
        //         let reg = new RegExp("{{\.\*" + item + "\.\*}}", "gim");
        //         let text = node.textContent;
        //         if (self.isElementNode(node)) {
        //             self.changeTextNode(node);
        //         } else if (self.isTextNode(node) && reg.test(text)) {
        //             let initText = itm;
        //             self.updateText(node, initText);
        //         }
        //     });
        // }

        //2、直接将元素下面的更改
        let text = node.innerHTML
        let reg = new RegExp("{{\.\*" + item + "\.\*}}", "gim")
        itm = typeof itm == 'undefined' || !itm ? '' : itm;
        text = text.replace(reg, itm)
        node.innerHTML = text
    }
}
