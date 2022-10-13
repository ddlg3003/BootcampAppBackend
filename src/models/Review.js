import crypto from 'crypto';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const Review = new mongoose.Schema({
    title: {
        type: String,
        require: [true, 'Please add a title for review'],
        maxlength: 100,
    },
    text: {
        type: String, 
        require: [true, 'Please add some text'],
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        require: [true, 'Please add rating from 1 to 10'],
    }, 
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true,
    }
});

// Limit rating for each bootcamp only once per user
Review.index({ bootcamp: 1, user: 1 }, { unique: true });

// Calculate avg rating
Review.statics.getAverageRating = async function (bootcampId) {
    console.log('Calculate avg rating...');

    // Find a course with same bootcamp id and calculate average rating with aggregate
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        }, 
        {
            // Response data
            $group: {
                _id: '$bootcamp',
                averageRating: { $avg: '$rating' },
            }   
        }
    ]);

    // save the average rating to bootcamp
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: obj[0].averageRating,
        });
    }
    catch(error) {
        console.error(error);
    }
}

Review.post('save', function() {
    this.constructor.getAverageRating(this.bootcamp);
});

Review.post('remove', function() {
    this.constructor.getAverageRating(this.bootcamp);
});

export default mongoose.model('Review', Review);