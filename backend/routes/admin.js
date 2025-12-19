import express from 'express';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Booking from '../models/Booking.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// @route   GET /api/admin/stats
// @desc    Get system statistics
// @access  Private (Admin)
router.get('/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalEvents = await Event.countDocuments();
        const totalBookings = await Booking.countDocuments({ status: 'confirmed' });

        // Calculate total revenue
        const bookings = await Booking.find({ status: 'confirmed' });
        const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

        // Get user role distribution
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        // Get event category distribution
        const eventsByCategory = await Event.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalEvents,
                totalBookings,
                totalRevenue,
                usersByRole,
                eventsByCategory
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
});

// @route   GET /api/admin/events
// @desc    Get all events with details
// @access  Private (Admin)
router.get('/events', async (req, res) => {
    try {
        const events = await Event.find()
            .populate('organizer', 'name email')
            .sort({ createdAt: -1 });

        // Get booking count for each event
        const eventsWithStats = await Promise.all(
            events.map(async (event) => {
                const bookings = await Booking.find({
                    event: event._id,
                    status: 'confirmed'
                });
                const totalBookings = bookings.length;
                const totalSeatsBooked = bookings.reduce((sum, b) => sum + b.seats, 0);
                const revenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

                return {
                    ...event.toObject(),
                    totalBookings,
                    totalSeatsBooked,
                    revenue
                };
            })
        );

        res.json({
            success: true,
            count: eventsWithStats.length,
            events: eventsWithStats
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching events'
        });
    }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings
// @access  Private (Admin)
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email')
            .populate('event', 'title date')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: bookings.length,
            bookings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching bookings'
        });
    }
});

export default router;
