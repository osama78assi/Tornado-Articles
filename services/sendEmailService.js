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
