
/**
 * Take a string contains speciall chars for regular expression. And escape them to be matched in another regular expression
 * @param {string} str 
 * @returns {string} same string but with with escaped chars
 */
export default function escapeRegexSpecial(str) {
    // this speciall \\$& means add \ before $& which is a placeholder to the matched string using replace
    // "cat and dog".replace(\(cat|dog)\, "($&)") -> "(cat) and (dog)"
    return str.replace(/(\.|\*|\+|\?|\^|\$|\{|\}|\(|\)|\\|\[|\]|\/)/g, (matched) => {
        return "\\" + matched;
    });
}
