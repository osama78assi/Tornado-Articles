import nodemailer from "nodemailer";
import sendEmailService from "./sendEmailService.js";

/**
 * Send for a use an email containing the reason for deleting his/her account
 * @param {import('./sendEmailService.js').UserData} param0
 * @param {import('./sendEmailService.js').Auth} auth
 * @param {string} reason simply the reason for deleting the account
 * @returns {Promise} The info of the email result (after sending it)
 */
async function sendReasonDeleteUser({ userName, userEmail }, auth, reason) {
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth,
        });

        const html = `
            <h1>Hello there ${userName}</h1>
            <p>We are really sorry to say that but your account has been deleted as you banned many times before but you keep violating our policies, But that isn't the main reason as we said you banned many times but the main reason is</p>
            <p style='font-size: 1.1rem; font-weight: bold; padding: 0.5rem; border-radius: 0.5rem; box-sizing: border-box; margin: 1rem 0rem; background-color: #333; color: #fafafa'>${reason}</p>
            <p>Don't take it to the heart. we hope you will respect the policies more next time we meet</p>
            <p>And just thanks</p>
        `;

        // Set the email options
        const mailOptions = {
            from: `Tornado Articles Policy Service" <${auth.user}>`,
            to: userEmail,
            subject: "Delete Account", // good subject to be honest XD
            html,
        };

        // Send the mail
        const info = sendEmailService(transporter, mailOptions);
        return info;
    } catch (err) {
        throw err;
    }
}

export default sendReasonDeleteUser;
