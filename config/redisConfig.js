import Redis from "ioredis";

// Connect to the database in memory. the one that hosted in the provided host and port
const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
});

redis.on("connect", () => {
    console.log("Connected to Redis");
});

redis.on("error", (err) => {
    console.log(err);
});

export default redis;