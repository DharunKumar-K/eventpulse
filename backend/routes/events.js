import express from 'express';
import Event from '../models/Event.js';
import User from '../models/User.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events
// Seed route
router.get('/seed', async (req, res) => {
    try {
        // Check if we have any user, if not create one
        let organizer = await User.findOne({ role: 'organizer' });
        if (!organizer) {
            organizer = await User.create({
                name: 'Event Organizer',
                email: 'organizer@eventpulse.com',
                password: 'organizer123',
                role: 'organizer'
            });
        }

        // Events data
        const sampleEvents = [
            {
                title: 'Sunburn Goa 2025 - The Afterparty',
                date: new Date('2026-01-02'),
                price: 4500,
                totalSeats: 5000,
                availableSeats: 5000,
                description: 'Keep the festive spirit alive with the ultimate post-new year electronic dance music festival on the beaches of Vagator.',
                location: 'Vagator, Goa',
                category: 'concert',
                status: 'upcoming'
            },
            {
                title: 'Kala Ghoda Arts Festival 2026',
                date: new Date('2026-01-20'),
                price: 0,
                totalSeats: 10000,
                availableSeats: 10000,
                description: 'Mumbai\'s favorite multicultural festival of arts, crafts, cinema, theatre, dance, and music. Entry is free for all!',
                location: 'Kala Ghoda, Fort, Mumbai',
                category: 'festival',
                status: 'upcoming'
            },
            {
                title: 'Jaipur Literature Festival 2026',
                date: new Date('2026-01-28'),
                price: 500,
                totalSeats: 2000,
                availableSeats: 2000,
                description: 'The "greatest literary show on Earth" returns to the Pink City. Join Nobel laureates, Booker prize winners, and debut novelists.',
                location: 'Hotel Diggi Palace, Jaipur',
                category: 'festival',
                status: 'upcoming'
            },
            {
                title: 'India Art Fair 2026',
                date: new Date('2026-02-05'),
                price: 1200,
                totalSeats: 3000,
                availableSeats: 3000,
                description: 'The leading platform to discover modern and contemporary art from South Asia. A celebration of cultural history and future.',
                location: 'NSIC Exhibition Grounds, New Delhi',
                category: 'other',
                status: 'upcoming'
            },
            {
                title: 'Mahindra Blues Festival',
                date: new Date('2026-02-14'),
                price: 3500,
                totalSeats: 1500,
                availableSeats: 1500,
                description: 'Asia\'s largest Blues music festival returns to Mumbai. Legendary blues artists from across the globe perform live.',
                location: 'Mehboob Studios, Mumbai',
                category: 'concert',
                status: 'upcoming'
            },
            {
                title: 'TechSparks 2026',
                date: new Date('2026-02-20'),
                price: 2500,
                totalSeats: 800,
                availableSeats: 800,
                description: 'India\'s most influential startup tech conference. Connect with investors, founders, and innovators building the future.',
                location: 'Taj Yeshwantpur, Bangalore',
                category: 'conference',
                status: 'upcoming'
            },
            {
                title: 'Comic Con India - Delhi Edition',
                date: new Date('2026-02-28'),
                price: 899,
                totalSeats: 5000,
                availableSeats: 5000,
                description: 'The biggest pop culture event of the year! Comics, cosplay, gaming, movies, and merchandise galore.',
                location: 'NSIC Grounds, Okhla, New Delhi',
                category: 'festival',
                status: 'upcoming'
            },
            {
                title: 'IND vs ENG - 1st T20 International',
                date: new Date('2026-03-05'),
                price: 1500,
                totalSeats: 35000,
                availableSeats: 35000,
                description: 'Watch the Men in Blue take on England in this high-octane T20 match under the lights.',
                location: 'Wankhede Stadium, Mumbai',
                category: 'sports',
                status: 'upcoming'
            },
            {
                title: 'International Yoga Festival',
                date: new Date('2026-03-08'),
                price: 15000,
                totalSeats: 500,
                availableSeats: 500,
                description: 'Celebrate the ancient science of Yoga in the yoga capital of the world. A week of wellness, meditation, and spirituality.',
                location: 'Parmarth Niketan, Rishikesh',
                category: 'workshop',
                status: 'upcoming'
            },
            {
                title: 'Holi Moo! Festival 2026',
                date: new Date('2026-03-25'),
                price: 2000,
                totalSeats: 2500,
                availableSeats: 2500,
                description: 'The maddest, "moo-est" Holi party in Delhi. Music, colors, food, and madness with 4 stages and 40+ artists.',
                location: 'Jhulal Lal, New Delhi',
                category: 'festival',
                status: 'upcoming'
            }
        ];

        await Event.deleteMany({}); // Clear existing

        // Add organizer ID
        const eventsWithOrganizer = sampleEvents.map(e => ({
            ...e,
            organizer: organizer._id
        }));

        await Event.insertMany(eventsWithOrganizer);

        res.json({ success: true, message: 'Database seeded successfully', count: eventsWithOrganizer.length });
    } catch (err) {
        console.error('Seed error:', err);
        res.status(500).json({ success: false, error: err.message, stack: err.stack });
    }
});

// @route   GET /api/events
// @desc    Get all events
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
    try {
        const events = await Event.find({ status: { $ne: 'cancelled' } })
            .populate('organizer', 'name email')
            .sort({ date: 1 });

        res.json({
            success: true,
            count: events.length,
            events
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching events'
        });
    }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'name email');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching event'
        });
    }
});

// @route   POST /api/events
// @desc    Create event
// @access  Private (Organizer/Admin)
router.post('/', authenticate, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const { title, date, price, totalSeats, description, location, category } = req.body;

        if (!title || !date || !price || !totalSeats) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, date, price, and total seats'
            });
        }

        const event = await Event.create({
            title,
            date,
            price,
            totalSeats,
            availableSeats: totalSeats,
            organizer: req.user._id,
            description: description || '',
            location: location || '',
            category: category || 'other'
        });

        const populatedEvent = await Event.findById(event._id)
            .populate('organizer', 'name email');

        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            event: populatedEvent
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error creating event'
        });
    }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Organizer/Admin - own events only)
router.put('/:id', authenticate, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user is the organizer or admin
        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this event'
            });
        }

        const { title, date, price, description, location, category, status } = req.body;

        if (title) event.title = title;
        if (date) event.date = date;
        if (price) event.price = price;
        if (description !== undefined) event.description = description;
        if (location !== undefined) event.location = location;
        if (category) event.category = category;
        if (status) event.status = status;

        await event.save();

        const updatedEvent = await Event.findById(event._id)
            .populate('organizer', 'name email');

        res.json({
            success: true,
            message: 'Event updated successfully',
            event: updatedEvent
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating event'
        });
    }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Organizer/Admin - own events only)
router.delete('/:id', authenticate, authorize('organizer', 'admin'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user is the organizer or admin
        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this event'
            });
        }

        await Event.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting event'
        });
    }
});

export default router;
