import {getMetric} from '../services/metrics.service'
import { type Request, type Response } from "express";
import express, { Router } from "express";


const router: Router = express.Router();

router.get('/',async(req:Request,res:Response)=>{
    const matrics=await getMetric();
    return res.json(matrics);
})


export default router;