const path = require("path");
const fs = require("fs");

// When someone is trying to request for refresh token. I will block him by the way
// But logging that to a file can be really usefull

/**
 *
 * @param {string} userId
 * @param {string} ip
 * @param {string} requestedAt
 */
function tokenReqsLogger(userId, ip, requestedAt, isFirstTime = false) {
    fs.appendFile(
        path.join(__dirname, "../logs/access_token_requests.log"),
        `${
            isFirstTime ? "(Noraml)" : "(Threat !)"
        } IP ${ip} got access token request with not exists JTI. For User with id ${userId} at ${requestedAt}. ${
            !isFirstTime ? "(Blocked)" : ""
        }\n`
    );
}

module.exports = tokenReqsLogger;
