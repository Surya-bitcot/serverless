import express from 'express';
import userRoutes from './routes/user.route.js';
import serverless from 'serverless-http';

const app = express();
app.use(express.json());

// User routes
app.use('/api/users', userRoutes);

// Health check endpoint for AWS Lambda monitoring
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.get('/', (req, res) => {
    res.send('Supabase CRUD API is running');
});

export default app;
export const handler = serverless(app);
