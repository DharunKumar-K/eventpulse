const fs = require('fs');
const path = require('path');

// 1. Rename beckend -> backend
if (fs.existsSync('beckend')) {
    try {
        fs.renameSync('beckend', 'backend');
        console.log('Renamed beckend to backend');
    } catch (e) {
        console.error('Failed to rename beckend:', e);
    }
}

// 2. Move public to frontend/public
if (fs.existsSync('public') && !fs.existsSync('frontend/public')) {
    try {
        fs.renameSync('public', 'frontend/public');
        console.log('Moved public to frontend/public');
    } catch (e) {
        console.error('Failed to move public:', e);
    }
}

// 3. Delete redundant root files if they exist in frontend
const filesToDelete = [
    'index.html',
    'vite.config.js',
    'tailwind.config.js',
    'postcss.config.js',
    'package.json',
    'package-lock.json'
];

filesToDelete.forEach(file => {
    if (fs.existsSync(file) && fs.existsSync(path.join('frontend', file))) {
        try {
            fs.unlinkSync(file);
            console.log(`Deleted root ${file}`);
        } catch (e) {
            console.error(`Failed to delete ${file}:`, e);
        }
    }
});
