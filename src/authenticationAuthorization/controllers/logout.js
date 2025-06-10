import { Request, Response } from "express";

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
            success: true,
            message: "Logout successfully.",
        });
    } catch (err) {
        next(err);
    }
}

export default logout;
