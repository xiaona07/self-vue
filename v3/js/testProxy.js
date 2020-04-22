// let list = new Array(1,2,3)
let list = [1, 2, 3]
let handler = {
    // apply: function(target, thisArg, argumentsList) {
    //     return argumentsList[0].push(argumentsList[1]);
    // }
    get (target, prop, args) {
        console.log(target)
        console.log(prop)
        console.log(args)
        if (typeof target[prop] === "function") {
            return target[prop].bind(target)
        }
        // if (typeof target[prop] === "function") return target[prop].bind(target)
        return target[prop]
    }
}
let proxy = new Proxy(list, handler)
console.log(proxy.push(4));
console.log(list)
