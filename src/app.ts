import express from 'express';
import healthRouter from './routes/health';
import path from 'path';
import deviceRouter from './routes/device';

const app = express();

app.use(express.json());
app.use('/health', healthRouter);
app.use('/device', deviceRouter);

// Serve all static assets from dist/ under /ui
app.use('/ui', express.static(path.join(__dirname, "../frontend/dist")));

// Fallback: catch /ui/* and serve index.html for client-side routing
app.use('/ui', (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", 'index.html'));
});

export default app;
