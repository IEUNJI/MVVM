class Watcher {
    constructor(vm, expr, cb) {
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        this.oldVal = this.get();
    }

    get() {
        Dep.target = this;
        let value = CompileUtil.getVal(this.vm, this.expr);
        Dep.target = null;
        return value;
    }

    update() {
        let newVal = CompileUtil.getVal(this.vm, this.expr);
        let oldVal = this.oldVal;
        if (newVal !== oldVal) {
            this.cb(newVal);
        }
    }
}