import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Event date is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    totalSeats: {
        type: Number,
        required: [true, 'Total seats is required'],
        min: [1, 'Must have at least 1 seat']
    },
    availableSeats: {
        type: Number,
        required: true
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        enum: ['conference', 'workshop', 'concert', 'sports', 'festival', 'other'],
        default: 'other'
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    }
}, {
    timestamps: true
});

// Set availableSeats to totalSeats if not provided
eventSchema.pre('save', function (next) {
    if (this.isNew && this.availableSeats === undefined) {
        this.availableSeats = this.totalSeats;
    }
    next();
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
