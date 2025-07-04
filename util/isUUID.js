import { uuidv4 } from "zod/v4";

export default function isUUID(uuid) {
    try {
        uuidv4().parse(uuid);

        return true;
    } catch (err) {
        return false;
    }
}
