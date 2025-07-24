// Note if the application got bigger and bigger you can define
// another config file per table comments and artilces for example
// that will not make the app faster because that algorithm can generate
// up to 4096 ID at the same millisecond but if the application got high traffic
// we could reuse the same IDs for article and comment for example

import FlakeId from "flake-idgen";

// To transfer BIGINT to sequelize safely. And because FlakeId return a buffer
function intFormat(buffer) {
    // The buffer is 8 values each one is byte so we need to concat bytes.
    // like (firstValue << (8*7) || secondValue << (8*6) | ...)
    // Other solution is use the builtin hex string and add the prefix 0x to make
    // BigInt know what is this number
    return BigInt("0x" + buffer.toString("hex"));
}

// Setting custom epoch

const customEpoch = new Date("2020-01-01T00:00:00Z").getTime();

// The reason of using many generator is. I want the same id to be usable between three different tables
// (that will happen in high-traffic)

// Pass the custom epoch
const flakeIdGenArticle = new FlakeId({ epoch: customEpoch });

const flakeIdGenUser = new FlakeId({ epoch: customEpoch });

const flakeIdGenComment = new FlakeId({ epoch: customEpoch });

const flakeIdGenCategory = new FlakeId({ epoch: customEpoch });

const flakeIdGenPlatform = new FlakeId({epoch: customEpoch})

/**
 * Generate new id for articls
 * @returns {number}
 */
function generateSnowFlakeIdArticle() {
    return intFormat(flakeIdGenArticle.next());
}

/**
 * Generate new id for users
 * @returns {number}
 */
function generateSnowFlakeIdUser() {
    return intFormat(flakeIdGenUser.next());
}

/**
 * Generate new id for comments
 * @returns {number}
 */
function generateSnowFlakeIdComment() {
    return intFormat(flakeIdGenComment.next());
}

/**
 * Generate new id for categories and topics
 * @returns {number}
 */
function generateSnowFlakeIdCategory() {
    return intFormat(flakeIdGenCategory.next());
}

/**
 * Generate new id for any platform specific model such as FAQ or user activity...
 * @returns {number}
 */
function generateSnowFlakeIdPlatform() {
    return intFormat(flakeIdGenPlatform.next());
}

export {
    generateSnowFlakeIdArticle,
    generateSnowFlakeIdCategory,
    generateSnowFlakeIdComment,
    generateSnowFlakeIdUser,
    generateSnowFlakeIdPlatform
};
