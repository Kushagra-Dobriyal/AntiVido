import redis from "../config/redis";
import crypto from 'crypto'


const TTL = 3600

function makeKey(payload: unknown): string {
    const hash = crypto
        .createHash('sha256')
        .update(JSON.stringify(payload))
        .digest('hex')
    return (`cache:${hash}`)
}
// req came fomr the user (Now check if data is in cache or not)
export async function getCache(payload: unknown): Promise<unknown | null> {
    const key = makeKey(payload);
    const value = await redis.get(key);

    if (value) {
        await redis.incr('metrics:cache_hits')// this is purely for analysis perspective
        return JSON.parse(value);
    }

    await redis.incr('metrics:cache_misses');// this is purely for analysis perspective
    return null;
}

// the users uery wasnt cached earlier , so after the work , we are cahcing the  result for this partiualr request the cache so that if simillar req come then we can full fill form here itself...
export async function setCache(payload: unknown, result: unknown): Promise<void> {
    const key = makeKey(payload);
    await redis.set(key, JSON.stringify(result), 'EX', TTL);
    // EX (Expiration) flag using our TTL variable (3600 seconds). This guarantees the cache will automatically clear out old data after an hour, preventing stale data from living forever.
}