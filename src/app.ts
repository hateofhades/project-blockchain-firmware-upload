import express from 'express';
import healthRouter from './routes/health';
import deviceRouter from './routes/device';

const app = express();

app.use(express.json());
app.use('/health', healthRouter);
app.use('/device', deviceRouter);

export default app;
