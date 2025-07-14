import { randomUUID } from "crypto";
import { unlink } from "fs/promises";
import jwt from "jsonwebtoken";
import redis from "../../../config/redisConfig.js";
import sanitize from "../../../util/sanitize.js";
import AuthUserService from "../services/AuthUserService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function signup(req, res, next) {
    let jti = null; // To remove it from the redis if there is some error
    let userId = null; // To drop the record if something happened
    let isAdded = false; // To know if the device is added to loggedin devices

    try {
        // Get the file name if exists (added by custom config and file uploading handler)
        let profilePicName = req?.files?.profilePic?.newName;

        // Build a URL
        if (profilePicName) {
            const protocol = req.protocol;
            const host = req.get("host");
            profilePicName = `${protocol}://${host}/uploads/profilePics/${profilePicName}`;
        }

        let { fullName, email, password, birthDate, gender } = req?.body;

        const user = await AuthUserService.createUser(
            fullName,
            email,
            password,
            birthDate,
            gender,
            profilePicName,
            "user" // The role always user
        );

        // Save the id
        userId = user.dataValues.id;

        // Sign in directly
        jti = randomUUID(); // Json Token ID
        const refreshToken = jwt.sign(
            {
                id: user.id,
                jti,
            },
            process.env.REFRESH_SECRET_STRING,
            {
                expiresIn: +process.env.REFRESH_TOKEN_LIFE_TIME, // (30 day)
            }
        );

        // Set the refresh token in the cookies
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: +process.env.REFRESH_TOKEN_LIFE_TIME * 1000, // (ms)
            // secure: true,
        });

        // Let's add the index to the key to make deleteing easier and make it unique
        let deviceIndex = 0;
        if (await redis.exists(`loggedin:${userId}`)) {
            // Change it to the length if exists
            deviceIndex = await redis.llen(`loggedin:${userId}`);
        }

        // Cache the refresh token to auto-reuse-detction
        await redis.set(
            `refresh:${jti}`,
            `deviceType=${req.device.type}-${deviceIndex}`,
            "EX",
            +process.env.REFRESH_TOKEN_LIFE_TIME
        ); // pass TTL is the time to live for the token

        // Add the device
        await redis.rpush(`loggedin:${user.dataValues.id}`, jti);
        isAdded = true;

        // Generate the access token
        const accessToken = jwt.sign(
            { id: user.dataValues.id },
            process.env.ACCESS_SECRET_STRING,
            {
                expiresIn: +process.env.ACCESS_TOKEN_LIFE_TIME, // 15min
            }
        );

        // Save it in httpOnly cookie
        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            maxAge: +process.env.ACCESS_TOKEN_LIFE_TIME * 1000,
            // secure: true,
        });

        // Delete some info
        sanitize(user, ["email"]);

        // TODO: Send a notifitcation asking for verify the email

        // Send the access token via data
        res.status(200).json({
            success: true,
            data: user,
            message: "Please verify your email to be able to interact with Tornado Articles website"
        });
    } catch (err) {
        // When facing the error the photo now in the dist. Delete it
        if (req?.files?.profilePic?.diskPath) {
            await unlink(req?.files?.profilePic?.diskPath);
        }

        // Clear the token from the session when there is any error
        if (await redis.exists(`refresh:${jti}`)) {
            await redis.del(`refresh:${jti}`);
        }

        // Dorp the record if created
        if (userId !== null) {
            await AuthUserService.deleteUser(userId);
        }

        // Remove the item if added
        if (isAdded && userId !== null) {
            await redis.rpop(`loggedin:${userId}`);
        }

        // If the access / refresh token is set on the cookies then delete it
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: true,
        });

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: true,
        });

        next(err);
    }
}

export default signup;
