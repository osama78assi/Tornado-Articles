/**
 * The necessary data for sending email with information
 * 
 * @typedef UserData
 * @property {string} userName The user's name to add in the email
 * @property {string} userEmail The user's email to send for
 */

/**
 * The necessary data for auth in Transporter option
 * 
 * @typedef Auth
 * @property {string} user the username User e-mail address
 * @property {string} pass then the password
 */

/**
 * 
 * @param {import('nodemailer').Transporter} transporter 
 * @param {import('nodemailer').SendMailOptions} mailOptions 
 * @returns {Promise} sending mail action
 */
async function sendMail(transporter, mailOptions) {
    return new Promise((res, rej) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                rej(err);
            }
            if (info) {
                res(info);
            }
        });
    });
}

export default sendMail;
