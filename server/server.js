// server.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware, requireAuth } from '@clerk/express';

// Routes
import aiRouter from './routes/aiRoutes.js';
import usersRouter from './routes/userRoutes.js';

// Config
import connectCloudinary from './config/cloudinary.js';

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize Cloudinary
await connectCloudinary();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

// Health Check Route
app.get('/', (req, res) => {
    res.send('🚀 AI Content Platform API is running...');
});

// Protected Routes
app.use(requireAuth());
app.use('/api/ai', aiRouter);
app.use('/api/user', usersRouter);

// Global Error Handler (Optional)
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Server listening on http://localhost:${PORT}`);
});
