import nodemailer from "nodemailer";
import sendEmailService from "./sendEmailService.js";

/**
 * Send for a use an email containing the reason for deleting his/her account
 * @param {import('./sendEmailService.js').UserData} param0
 * @param {import('./sendEmailService.js').Auth} auth
 * @param {string} resetToken the reset token that will be added to the URL where the user want to reset his/her password
 * * @returns {Promise} The info of the email result (after sending it)
 */
async function sendResetPassURL({ userName, userEmail }, auth, resetToken) {
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth,
        });

        const html = `
            <h1>Hello there ${userName}</h1>
            <p>If you didn't asked to change password then be carefull to share this URL and you can ignore this email</p>
            <p>However if you are the one who wanna change the password check the link</p>
            <a target="_blank" href="http://${process.env.HOST_NAME}:${
            process.env.PORT
        }/api/auth/reset-password/${resetToken}">Set The New Password</a>
            <p>Or use this link</p>
            <hr />
                http://${process.env.HOST_NAME}:${
            process.env.PORT
        }/api/v1/auth/reset-password/${resetToken}
            <hr />
            <strong style="color:#f20">KEEP IN MIND:</strong>
            <ul>
                <li>The previous URL will be expired in ${Math.floor(
                    +process.env.PASSWORD_TOKEN_LIFE_TIME / 1000 / 60
                )} min</li>
                <li>Don't share the URL with anyone</li>
            </ul>
            <hr />
            <p>Best regards</p>
        `;

        // Set the email options
        const mailOptions = {
            from: `Tornado Articles Authentication Service" <${auth.user}>`,
            to: userEmail,
            subject: "Reset Password URL",
            html,
        };

        // Send the mail
        const info = sendEmailService(transporter, mailOptions);
        return info;
    } catch (err) {
        throw err;
    }
}

export default sendResetPassURL;
