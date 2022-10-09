import __ from './utils/env.js';
import mongoose from 'mongoose';
import Bootcamp from './models/Bootcamp.js';
import Course from './models/Course.js';
import fs from 'fs';

// Connect to DB
await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Read JSON files
const bootcamps = JSON.parse(fs.readFileSync(`G:/Back-end/NodeJs/BootcampApi/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`G:/Back-end/NodeJs/BootcampApi/_data/courses.json`, 'utf-8'));

// Import to DB
const importData = async () => {
    try {
        await Bootcamp.create(bootcamps);
        await Course.create(courses);

        console.log('Data imported!');
    }
    catch(error) {
        console.error(error);
    }
}

// Delete data
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();

        console.log('Data destroyed!');
    }
    catch(error) {
        console.error(error);
    }
}

// process.argv return an array that contains the command line arguments
// node seeder.js -i --> ['/node', '/seeder.js', '-i]
if(process.argv[2] === '-i') {
    importData();
} else if(process.argv[2] === '-d') {
    deleteData();
}