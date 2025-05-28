function removeDuplicated(arr, visited = {}) {
    return arr.filter((item) => {
        if (visited[item]) return false;
        else {
            visited[item] = 1;
            return item;
        }
    });
}

module.exports = removeDuplicated;
