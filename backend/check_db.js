// Check DB script
require('dotenv').config();
const mongoose = require('mongoose');
const Event = require('./models/Event');

async function checkEvents() {
    try {
        console.log('Connecting to MongoDB...');
        // Hardcoding local URI as fallback if env fails, just for diagnosis
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/eventpulse';
        await mongoose.connect(uri);
        console.log('Connected!');

        const count = await Event.countDocuments();
        console.log(`Total events in DB: ${count}`);

        if (count > 0) {
            const events = await Event.find().limit(3);
            console.log('First 3 events:', JSON.stringify(events, null, 2));
        } else {
            console.log('Database is empty! Seeding failed.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
    }
}

checkEvents();
