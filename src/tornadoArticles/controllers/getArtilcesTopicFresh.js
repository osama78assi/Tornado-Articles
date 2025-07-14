/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function getArtilcesTopicFresh(req, res, next) {
    try {
        // This route meant to suggest articles based on tags.
        // Tags are saved in cookies to make the suggest based on device
    } catch (err) {
        next(err);
    }
}

export default getArtilcesTopicFresh;
