import { type Request, type Response } from "express";
import express, { Router } from "express";
import { checkRateLimit } from '../services/ratelimit.service'
import { getCache, setCache } from "../services/cache.service";
import { jobQueue } from "../config/queue";
import redis from "../config/redis";

const router: Router = express.Router();

router.post('/', async (req: Request, res: Response) => {
    const ip = req.ip ?? 'unknown';
    const payload = req.body;

    const limit = await checkRateLimit(ip);

    if (!limit.allowed) {
        res.set('Retry-After', String(limit.retryAfter));
        return res.status(429).json({
            error: 'Too many requests',
            retryAfter: limit.retryAfter
        });
    }

    // check chache...
    const cached = await getCache(payload);
    if (cached) {
        return res.json({ source: 'cache', result: cached });
    }

    // step3:  if the cached is not found , send the payload to the heavy task and ask it to complete it in async mode...
    const job = await jobQueue.add('process', payload, {
        priority: payload.priority === 'high' ? 1 : 10,
    });


    await redis.set(
        `result:${job.id}`,
        JSON.stringify({ status: 'pending' }),
        'EX',
        300
    );


    // recipt for the sender , so that they know there job id and can poll for the status... 
    return res.status(202).json({
        source: 'queued',
        jobId: job.id,
        pollAt: `/job/${job.id}`,
    });

});

// GET /job/:id — client polls this until status is "completed"
router.get('/:id', async (req: Request, res: Response) => {
    const raw = await redis.get(`result:${req.params.id}`);
    if (!raw) {
        return res.status(404).json({
            error: 'Job not found or expired',
        });
    }
    return res.json(JSON.parse(raw));
});


export default router;