let list    = {list: [1, 2, 3]}
let handler = {
    get (target, prop, args) {
        if (typeof target[prop] === "function") {
            return target[prop].bind(target)
        }
        return target[prop]
    }
}
let proxy = new Proxy(list, handler)
console.log(proxy.list.push(4));
console.log(list)
// let list    = [1, 2, 3]
// let handler = {
//     get (target, prop, args) {
//         if (typeof target[prop] === "function") {
//             return target[prop].bind(target)
//         }
//         return target[prop]
//     }
// }
// let proxy = new Proxy(list, handler)
// console.log(proxy.push(4));
// console.log(list)
