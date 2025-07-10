function deleteOneLvl(queryObject, fields = []) {
    delete queryObject.dataValues[fields.at(0)].dataValues[fields.at(1)];
}

function sanitize(queryObject, fields = []) {
    for (let i = 0; i < fields.length; i++) {
        // Check if it's array then that's mean it's nested by one level
        if (Array.isArray(fields[i])) {
            deleteOneLvl(queryObject, fields[i]);
        } else {
            delete queryObject.dataValues[fields[i]];
        }
    }
}

export default sanitize;
