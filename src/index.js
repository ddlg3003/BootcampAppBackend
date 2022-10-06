import express from 'express';
import dotenv from 'dotenv';
import bootcampsRoutes from './routes/bootcamps.js';
import morgan from 'morgan';

// Create a config/config.env file in root when clone
dotenv.config({ path: './config/config.env' });

const app = express();

// Logging middleware
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Routes
app.use('/api/v1/bootcamps', bootcampsRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));