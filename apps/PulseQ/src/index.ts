import express from 'express'
import dotenv from 'dotenv'
import jobRoutes from './routes/job.routes'
import metricsRoutes from './routes/metrics.routes'
import type { Request,Response } from 'express';

//sideeffect import....
import './workers/job.worker';

dotenv.config();
const app=express();

const PORT=process.env.PORT || 3000;
app.use(express.json()) 

app.use('/job',jobRoutes);
app.use('/metrics',metricsRoutes);

app.get('/health',(req:Request,res:Response)=>{
    res.json({
        "Health_Staus":'ok'
    })
})

app.listen(PORT,()=>{
    console.log("The server is serving now....");
})