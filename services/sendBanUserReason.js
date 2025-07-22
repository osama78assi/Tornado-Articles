import nodemailer from "nodemailer";
import sendEmailService from "./sendEmailService.js";

/**
 * Send for a use an email containing the reason for deleting his/her account
 * @param {import('./sendEmailService.js').UserData} param0
 * @param {import('./sendEmailService.js').Auth} auth
 * @param {string} reason Simply the reason for banning the account
 * @param {string} duration The duration of panning the account
 * @param {string} warningDuration The warning duration to delete the account permanently after the ban
 * @returns {Promise} The info of the email result (after sending it)
 */
async function sendBanUserReason(
    { userName, userEmail },
    auth,
    reason,
    duration,
    warningDuration
) {
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth,
        });

        const html = `
            <h1>Hello there ${userName}</h1>
            <p style='font-size: 1.1rem;'>We are sorry to say that but your account was banned from publishing any new articles for ${duration}</p>
            <p style='font-size: 1.1rem; font-weight: bold; padding: 0.5rem; border-radius: 0.5rem; box-sizing: border-box; margin: 1rem 0rem; background-color: #333; color: #fafafa'>${reason}</p>
            <p style='font-size: 1.1rem;'>Don't take it to the heart. we hope you will respect the policies more next time</p>
            <p style='font-size: 1.1rem; font-weight: bold; padding: 0.5rem; border-radius: 0.5rem; box-sizing: border-box; margin: 1rem 0rem; background-color:#bf1515; color: #fafafa'>Note that the account has a higher chance to be deleted after ${warningDuration} (starts when the last ban be washed away) if you got another ban (it will not be ban but delete account)</p>
        `;

        // Set the email options
        const mailOptions = {
            from: `Tornado Articles Ban Policy Service" <${auth.user}>`,
            to: userEmail,
            subject: "Ban Account", // Kind right ? XD
            html,
        };

        // Send the mail
        const info = sendEmailService(transporter, mailOptions);
        return info;
    } catch (err) {
        throw err;
    }
}

export default sendBanUserReason;
