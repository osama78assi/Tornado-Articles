import nodemailer from "nodemailer";
import sendEmailService from "./sendEmailService.js";

/**
 * Send for a use an email containing the email verification code
 * @param {import('./sendEmailService.js').UserData} param0
 * @param {import('./sendEmailService.js').Auth} auth
 * @param {string[]} code the email verification code
 * * @returns {Promise} The info of the email result (after sending it)
 */
async function sendVerifyEmailCode({ userName, userEmail }, auth, code) {
    try {
        // Create a transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth,
        });

        // For reusability
        const childStyle =
            "box-sizing: border-box;display: block;background-color: #333;color: #ddd;border-radius: 0.3rem;padding: 0.3rem 0.2rem;font-size: 1.7rem;display: flex;align-items: center;justify-content: center;";

        const html = `
            <h1>Hello there ${userName}</h1>
            <p>If you didn't asked to verify email from our platform so don't worry no one will be able to publish from this account till confirming</p>
            <p>However, If you asked for verification code here it is</p>
            <div style="box-sizing: border-box;width: 95%;padding: 0.3rem;margin: 0px auto;">
                <table style="margin: 0px auto; width: fit-content; border-collapse: separate; border-spacing: 5px;">
                    <tr>
                ${
                    // I wish JSX is here :(
                    code
                        .map(
                            (char) =>
                                `<td><span style="${childStyle}">${char}</span></td>`
                        )
                        .join("\n")
                }
                    </tr>
                </table>
            </div>
            <hr />
            <strong style="color:#f20">KEEP IN MIND:</strong>
            <ul>
                <li>The previous code will be expired in ${Math.floor(
                    +process.env.EMAIL_TOKEN_LIFE_TIME / 1000 / 60
                )} minutes</li>
                <li>Don't share the code with anyone</li>
            </ul>
            <hr />
            <p>Best regards</p>
        `;

        // Set the email options
        const mailOptions = {
            from: `Tornado Articles Authentication Service" <${auth.user}>`,
            to: userEmail,
            subject: "Verify Tornado Email",
            html,
        };

        // Send the mail
        const info = sendEmailService(transporter, mailOptions);
        return info;
    } catch (err) {
        throw err;
    }
}

export default sendVerifyEmailCode;
