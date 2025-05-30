const { Request, Response } = require("express");

/*
 id            | uuid                     |           | not null |
 title         | character varying(255)   |           | not null |
 content       | text                     |           | not null |
 private       | boolean                  |           | not null | false
 userId        | uuid                     |           | not null |
 coverImg      | character varying(150)   |           |          |
 createdAt     | timestamp with time zone |           | not null |
 updatedAt     | timestamp with time zone |           | not null |
 language      | "enum_Articles_language" |           | not null | 'english'::"enum_Articles_language"
 titleTsVector | tsvector                 |           | not null |
*/
class ErrorEnums {
    
}

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function publishArticle(req, res, next) {
    try {
        // const {title = null}
    } catch(err) {
        next(err);
    }
}

module.exports = publishArticle;