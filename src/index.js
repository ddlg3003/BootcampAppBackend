import __ from './utils/env.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import fileupload from 'express-fileupload';

import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import helmet from 'helmet';
import xss from 'xss-clean';
import cors from 'cors';

import bootcampsRoutes from './routes/bootcamps.js';
import coursesRoutes from './routes/courses.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import reviewsRoutes from './routes/reviews.js';

import morgan from 'morgan';
import connectDB from '../config/db.js';
import errorHandler from './middleware/error.js';

// Connect to database
connectDB();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Logging middleware
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// File upload
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Rating limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 200,
});

app.use(limiter);

// Http params pollution
app.use(hpp());

// Allow cross-side resources sharing
app.use(cors());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/v1/bootcamps', bootcampsRoutes);
app.use('/api/v1/courses', coursesRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reviews', reviewsRoutes);

// Middleware to handle errors
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

// Unhandled rejections Handler
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server
    server.close(() => process.exit(1));
});

