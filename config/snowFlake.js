// Note if the application got bigger and bigger you can define
// another config file per table comments and artilces for example
// that will not make the app faster because that algorithm can generate
// up to 4096 ID at the same millisecond but if the application got high traffic
// we could reuse the same IDs for article and comment for example

const FlakeId = require("flake-idgen");

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

// Pss the custom epoch
const flakeIdGen = new FlakeId({ epoch: customEpoch });

// prepare the function for generate
function generateSnowFlakeId() {
    return intFormat(flakeIdGen.next());
}

module.exports = generateSnowFlakeId;
