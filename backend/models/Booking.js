import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    seats: {
        type: Number,
        required: [true, 'Number of seats is required'],
        min: [1, 'Must book at least 1 seat']
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled'],
        default: 'confirmed'
    },
    bookingDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create compound index to prevent duplicate bookings
bookingSchema.index({ user: 1, event: 1 });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
