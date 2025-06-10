function removeDuplicated(arr, visited = new Map()) {
    return arr.filter((item) => {
        if (visited.get(item)) return false;
        else {
            visited.set(item, 1);
            return item;
        }
    });
}

export default removeDuplicated;
