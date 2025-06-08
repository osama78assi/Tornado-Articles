const { Request, Response } = require("express");

/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function logout(req, res, next) {
    try {
        // To logout we just need to remove the token
        res.clearCookie("token", {
            httpOnly: true,
            secure: true,
        });

        return res.status(200).json({
            status: "success",
            message: "Logout successfully.",
        });
    } catch (err) {
        next(err);
    }
}

module.exports = logout;
