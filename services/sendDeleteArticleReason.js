import nodemailer from "nodemailer";
import sendEmailService from "./sendEmailService.js";

/**
 * @typedef Details
 * @property {string} reason Simply the reason for deleting the article
 * @property {string} title The article title
 * @property {Date} createdAt The article publish date
 *
 */

/**
 * Send for a use an email containing the reason for deleting his/her article
 * @param {import('./sendEmailService.js').UserData} param0
 * @param {import('./sendEmailService.js').Auth} auth
 * @param {Details} details some necessary details in order to make the email readable
 * @returns {Promise} The info of the email result (after sending it)
 */
async function sendDeleteArticleReason({ userName, userEmail }, auth, details) {
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth,
        });

        const html = `
            <h1>Hello there ${userName}</h1>
            <p>We are really sorry to say that but your article with title <strong>"${details.title}"</strong>. Which published at <strong>${details.createdAt} (server timestamp)</strong> has been deleted it violates our policies</p>
            <p style='font-size: 1.1rem; font-weight: bold; padding: 0.5rem; border-radius: 0.5rem; box-sizing: border-box; margin: 1rem 0rem; background-color: #333; color: #fafafa'>${details.reason}</p>
            <p>Keep in mind if you keept violating our policies you will be banned from publishing new articles for a long period of time</p>
            <p>And thanks</p>
        `;

        let shortedTitle = details.title;

        if (shortedTitle.length > 50) {
            shortedTitle = shortedTitle.substring(0, 49) + "...";
        }

        // Set the email options
        const mailOptions = {
            from: `Tornado Articles Policy Service" <${auth.user}>`,
            to: userEmail,
            subject: `Delete Article (${shortedTitle})`,
            html,
        };

        // Send the mail
        const info = sendEmailService(transporter, mailOptions);
        return info;
    } catch (err) {
        throw err;
    }
}

export default sendDeleteArticleReason;
