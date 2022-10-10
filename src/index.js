import __ from './utils/env.js';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fileupload from 'express-fileupload';
import bootcampsRoutes from './routes/bootcamps.js';
import coursesRoutes from './routes/courses.js';
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

// Logging middleware
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// File upload
app.use(fileupload());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/v1/bootcamps', bootcampsRoutes);
app.use('/api/v1/courses', coursesRoutes);

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

