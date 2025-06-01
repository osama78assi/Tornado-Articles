function sanitize(queryObject, fields=[]) {
    for(let i = 0; i < fields.length; i++)
        delete queryObject.dataValues[fields[i]];
}

module.exports = sanitize