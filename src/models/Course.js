import mongoose from 'mongoose';

const Course = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a course title'],
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    weeks: {
        type: String,
        required: [true, 'Please add a number of weeks'],
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition cost'],
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minimum skill'],
        enum: ['beginner', 'intermediate', 'advanced'],
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true,
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
      } 
});

// Static method of model to get avg cost of course tuition
Course.statics.getAverageCost = async function (bootcampId) {
    console.log('Calculate avg cost...');

    // Find a course with same bootcamp id and calculate average cost with aggregate
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        }, 
        {
            // Response data
            $group: {
                _id: '$bootcamp',
                averageCost: { $avg: '$tuition' }
            }   
        }
    ]);

    // save the average cost to bootcamp
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].averageCost / 10) * 10
        });
    }
    catch(error) {
        console.error(error);
    }
}

// Call calculate average cost after save
Course.post('save', function () {
    this.constructor.getAverageCost(this.bootcamp);
});

// Call calculate average cost when remove
Course.post('remove', function () {
    this.constructor.getAverageCost(this.bootcamp);
});

export default mongoose.model('Course', Course);