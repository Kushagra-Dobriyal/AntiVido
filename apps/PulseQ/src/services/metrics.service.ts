import redis from "../config/redis";
import { jobQueue } from "../config/queue";

export async function getMetric() {

    const [waiting, active, completed, failed] = await Promise.all([
        jobQueue.getWaitingCount(),
        jobQueue.getActiveCount(),
        jobQueue.getCompletedCount(),
        jobQueue.getFailedCount(),
    ])

    const [hits, misses] = await Promise.all([
        redis.get('metrics:cache_hits'),
        redis.get('metrics:cache_misses'),
    ]);

    const cacheHits = parseInt(hits || '0');
    const cacheMisses = parseInt(misses || '0');
    const totalCache = cacheHits + cacheMisses;

    const rejected = await redis.get('metrics:rate_limited');


    return {
        queue: {
            waiting, active, completed, failed
        },
        cache: {
            hits: cacheHits,
            misses: cacheMisses,
            hitRate: totalCache === 0 ? 0 : Math.round((cacheHits / totalCache) * 100),

        },
        rateLimit: {
            rejected: parseInt(rejected || '0'),
        }
    }

}