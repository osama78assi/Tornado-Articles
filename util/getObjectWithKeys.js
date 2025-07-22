/**
 * Take many items. Return object where the items is keys and values is 1
 * @param {any[]} tokens
 */
export default function getObjectWithKeys(tokens) {
    const obj = {};
    for (let token of tokens) {
        obj[token] = 1;
    }
    return obj;
}
