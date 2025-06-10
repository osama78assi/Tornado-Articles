import nodemailer from "nodemailer";
import sendEmailService from "./sendEmailService";

async function sendResetPassURL({ userName, userEmail }, auth, resetToken) {
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth,
        });

        const html = `
            <h1>Hello there ${userName}</h1>
            <p>If you didn't asked to change password then be carefull to share this URL and you can ignore this mail</p>
            <p>However if you the one who wanna change the password check the link</p>
            <a target="_blank" href="http://${process.env.HOST_NAME}:${process.env.PORT}/api/auth/reset-password/${resetToken}">Set The New Password</a>
            <p>Or use this link</p>
            <hr />
                http://${process.env.HOST_NAME}:${process.env.PORT}/api/v1/auth/reset-password/${resetToken}
            <hr />
            <strong style="color:#f20">MAKE SURE:</strong>
            <ul>
                <li>The previous URL will be expired in 30 min</li>
                <li>Don't share the URL with anyone</li>
            </ul>
            <hr />
            <p>Best regards</p>
        `;

        // Set the email options
        const mailOptions = {
            from: `"Article Authentication" <${auth.user}>`,
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
