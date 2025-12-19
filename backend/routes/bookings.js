import express from 'express';
import Booking from '../models/Booking.js';
import Event from '../models/Event.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
router.get('/', authenticate, async (req, res) => {
    try {
        const bookings = await Booking.find({
            user: req.user._id,
            status: 'confirmed'
        })
            .populate('event')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings'
        });
    }
});

// @route   POST /api/bookings
// @desc    Create a booking
// @access  Private
router.post('/', authenticate, async (req, res) => {
    try {
        const { eventId, seats } = req.body;

        if (!eventId || !seats) {
            return res.status(400).json({
                success: false,
                message: 'Please provide event ID and number of seats'
            });
        }

        // Find event
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if event is cancelled
        if (event.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Cannot book cancelled event'
            });
        }

        // Check seat availability
        if (event.availableSeats < seats) {
            return res.status(400).json({
                success: false,
                message: `Only ${event.availableSeats} seats available`
            });
        }

        // Calculate total price
        const totalPrice = event.price * seats;

        // Create booking
        const booking = await Booking.create({
            user: req.user._id,
            event: eventId,
            seats,
            totalPrice
        });

        // Update event available seats
        event.availableSeats -= seats;
        await event.save();

        // Populate booking
        const populatedBooking = await Booking.findById(booking._id)
            .populate('event')
            .populate('user', 'name email');

        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: populatedBooking
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating booking'
        });
    }
});

// @route   DELETE /api/bookings/:id
// @desc    Cancel a booking
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }

        // Check if user owns the booking
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to cancel this booking'
            });
        }

        // Check if already cancelled
        if (booking.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Booking already cancelled'
            });
        }

        // Update booking status
        booking.status = 'cancelled';
        await booking.save();

        // Return seats to event
        const event = await Event.findById(booking.event);
        if (event) {
            event.availableSeats += booking.seats;
            await event.save();
        }

        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error cancelling booking'
        });
    }
});

export default router;
