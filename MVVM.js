class MVVM {
    constructor(options) {
        this.$el = options.el;
        this.$data = options.data;
        let computed = options.computed;
        let methods = options.methods;

        if (this.$el) {
            new Observer(this.$data);
            this.proxyComputed(computed);
            this.proxyMethods(methods);
            this.proxyData(this.$data);
            new Compiler(this.$el, this);
        }
    }

    proxyData(data) {
        Object.keys(data).forEach(key => {
            Object.defineProperty(this, key, {
                enumerable: true,
                get() {
                    return data[key];
                },
                set(newVal) {
                    data[key] = newVal;
                }
            });
        });
    }

    proxyComputed(computed) {
        Object.keys(computed).forEach(key => {
            Object.defineProperty(this.$data, key, {
                enumerable: true,
                get: () => {
                    return computed[key].call(this);
                }
            });
        });
    }

    proxyMethods(methods) {
        Object.keys(methods).forEach(key => {
            Object.defineProperty(this.$data, key, {
                enumerable: true,
                get() {
                    return methods[key];
                }
            });
        });
    }
}