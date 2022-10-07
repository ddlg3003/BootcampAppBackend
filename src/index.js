import express from 'express';
import dotenv from 'dotenv';
import bootcampsRoutes from './routes/bootcamps.js';
import morgan from 'morgan';
import connectDB from '../config/db.js';

// Create a config/config.env file in root when clone
dotenv.config({ path: './config/config.env' });

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Logging middleware
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Routes
app.use('/api/v1/bootcamps', bootcampsRoutes);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

// Unhandled rejections Handler
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server
    server.close(() => process.exit(1));
});