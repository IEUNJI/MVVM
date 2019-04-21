class Compiler {
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;
        if (this.el) {
            let fragment = this.node2fragment(this.el);
            this.compile(fragment);
            this.el.appendChild(fragment);
            fragment = null;
        }
    }

    isElementNode(node) {
        return node.nodeType === 1;
    }

    isDirective(attrName) {
        return attrName.startsWith('v-');
    }

    compileElement(node) {
        let attributes = node.attributes;
        [...attributes].forEach(attr => {
            let {name, value: expr} = attr;
            if (this.isDirective(name)) {
                let [, directive, event] = name.split(/[-:]/);
                CompileUtil[directive](node, this.vm, expr, event);
            }
        });
    }

    compileText(node) {
        let content = node.textContent;
        if (/\{\{(.+?)\}\}/.test(content)) {
            CompileUtil['text'](node, this.vm, content);
        }
    }

    compile(fragment) {
        let childNodes = fragment.childNodes;
        childNodes.forEach(child => {
            if (this.isElementNode(child)) {
                this.compileElement(child);
                this.compile(child);
            } else {
                this.compileText(child);
            }
        });
    }

    node2fragment(node) {
        let fragment = document.createDocumentFragment();
        let firstChild;
        while (firstChild = node.firstChild) {
            fragment.appendChild(firstChild);
        }
        return fragment;
    }
}

CompileUtil = {
    getVal(vm, expr) {
        return expr.split('.').reduce((data, expr) => data[expr], vm.$data);
    },
    getTextVal(vm, expr) {
        return expr.replace(/\{\{(.+?)\}\}/g, (...args) => this.getVal(vm, args[1]));
    },
    setVal(vm, expr, value) {
        expr.split('.').reduce((data, expr, index, ary) => {
            if (index === ary.length - 1) {
                data[expr] = value;
            }
            return data[expr];
        }, vm.$data);
    },
    model(node, vm, expr) {
        let fn = this.updater['modelUpdater'];
        new Watcher(vm, expr, newVal => {
            fn(node, newVal);
        });
        node.addEventListener('input', (e) => {
            let value = e.target.value;
            this.setVal(vm, expr, value);
        });
        fn(node, this.getVal(vm, expr));
    },
    text(node, vm, expr) {
        let fn = this.updater['textUpdater'];
        expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
            new Watcher(vm, args[1], () => {
                fn(node, this.getTextVal(vm, expr));
            });
        });
        fn(node, this.getTextVal(vm, expr));
    },
    html(node, vm, expr) {
        let fn = this.updater['htmlUpdater'];
        new Watcher(vm, expr, newVal => {
            fn(node, newVal);
        });
        fn(node, this.getVal(vm, expr));
    },
    on(node, vm, expr, event) {
        node.addEventListener(event, (e) => {
            vm[expr].call(vm, e);
        });
    },
    updater: {
        modelUpdater(node, value) {
            node.value = value;
        },
        textUpdater(node, value) {
            node.textContent = value;
        },
        htmlUpdater(node, value) {
            node.innerHTML = value;
        }
    }
};