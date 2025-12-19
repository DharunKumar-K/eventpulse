// Seed script to add realistic upcoming events in India (Jan-March 2026)
// Run this file with: node seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');

// Realistic upcoming events for early 2026 (Current Date: Dec 2025)
const sampleEvents = [
    {
        title: 'Sunburn Goa 2025 - The Afterparty',
        date: new Date('2026-01-02'),
        price: 4500,
        totalSeats: 5000,
        description: 'Keep the festive spirit alive with the ultimate post-new year electronic dance music festival on the beaches of Vagator.',
        location: 'Vagator, Goa',
        category: 'concert'
    },
    {
        title: 'Kala Ghoda Arts Festival 2026',
        date: new Date('2026-01-20'),
        price: 0,
        totalSeats: 10000,
        description: 'Mumbai\'s favorite multicultural festival of arts, crafts, cinema, theatre, dance, and music. Entry is free for all!',
        location: 'Kala Ghoda, Fort, Mumbai',
        category: 'festival'
    },
    {
        title: 'Jaipur Literature Festival 2026',
        date: new Date('2026-01-28'),
        price: 500,
        totalSeats: 2000,
        description: 'The "greatest literary show on Earth" returns to the Pink City. Join Nobel laureates, Booker prize winners, and debut novelists.',
        location: 'Hotel Diggi Palace, Jaipur',
        category: 'festival'
    },
    {
        title: 'India Art Fair 2026',
        date: new Date('2026-02-05'),
        price: 1200,
        totalSeats: 3000,
        description: 'The leading platform to discover modern and contemporary art from South Asia. A celebration of cultural history and future.',
        location: 'NSIC Exhibition Grounds, New Delhi',
        category: 'other'
    },
    {
        title: 'Mahindra Blues Festival',
        date: new Date('2026-02-14'),
        price: 3500,
        totalSeats: 1500,
        description: 'Asia\'s largest Blues music festival returns to Mumbai. Legendary blues artists from across the globe perform live.',
        location: 'Mehboob Studios, Mumbai',
        category: 'concert'
    },
    {
        title: 'TechSparks 2026',
        date: new Date('2026-02-20'),
        price: 2500,
        totalSeats: 800,
        description: 'India\'s most influential startup tech conference. Connect with investors, founders, and innovators building the future.',
        location: 'Taj Yeshwantpur, Bangalore',
        category: 'conference'
    },
    {
        title: 'Comic Con India - Delhi Edition',
        date: new Date('2026-02-28'),
        price: 899,
        totalSeats: 5000,
        description: 'The biggest pop culture event of the year! Comics, cosplay, gaming, movies, and merchandise galore.',
        location: 'NSIC Grounds, Okhla, New Delhi',
        category: 'festival'
    },
    {
        title: 'IND vs ENG - 1st T20 International',
        date: new Date('2026-03-05'),
        price: 1500,
        totalSeats: 35000,
        description: 'Watch the Men in Blue take on England in this high-octane T20 match under the lights.',
        location: 'Wankhede Stadium, Mumbai',
        category: 'sports'
    },
    {
        title: 'International Yoga Festival',
        date: new Date('2026-03-08'),
        price: 15000,
        totalSeats: 500,
        description: 'Celebrate the ancient science of Yoga in the yoga capital of the world. A week of wellness, meditation, and spirituality.',
        location: 'Parmarth Niketan, Rishikesh',
        category: 'workshop'
    },
    {
        title: 'Holi Moo! Festival 2026',
        date: new Date('2026-03-25'),
        price: 2000,
        totalSeats: 2500,
        description: 'The maddest, "moo-est" Holi party in Delhi. Music, colors, food, and madness with 4 stages and 40+ artists.',
        location: 'Jhulal Lal, New Delhi',
        category: 'festival'
    }
];

async function seedDatabase() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eventpulse';
        console.log('🔌 Connecting to MongoDB at:', uri);

        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB');

        // Find an organizer user (or create one)
        let organizer = await User.findOne({ role: 'organizer' });

        if (!organizer) {
            console.log('📝 Creating sample organizer user...');
            organizer = await User.create({
                name: 'Event Organizer',
                email: 'organizer@eventpulse.com',
                password: 'organizer123',
                role: 'organizer'
            });
            console.log('✅ Organizer user created');
        }

        // Clear existing events to avoid duplicates (optional)
        await Event.deleteMany({});
        console.log('🗑️  Cleared existing events');

        // Add organizer ID to each event
        const eventsWithOrganizer = sampleEvents.map(event => ({
            ...event,
            organizer: organizer._id,
            availableSeats: event.totalSeats
        }));

        // Insert sample events
        const createdEvents = await Event.insertMany(eventsWithOrganizer);
        console.log(`✅ Successfully added ${createdEvents.length} events to the database!`);

        // Display created events
        console.log('\n📋 Created Events:');
        createdEvents.forEach((event, index) => {
            console.log(`${index + 1}. ${event.title} - ${event.location} (${event.date.toLocaleDateString()})`);
        });

        console.log('\n🎉 Database seeding completed successfully!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log('👋 Database connection closed');
        process.exit(0);
    }
}

// Run the seed function
seedDatabase();
