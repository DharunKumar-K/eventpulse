const fs = require('fs');
const path = require('path');

const moves = [
    { src: 'src', dest: 'frontend/src' },
    { src: 'public', dest: 'frontend/public' },
    { src: 'index.html', dest: 'frontend/index.html' },
    { src: 'vite.config.js', dest: 'frontend/vite.config.js' },
    { src: 'tailwind.config.js', dest: 'frontend/tailwind.config.js' },
    { src: 'postcss.config.js', dest: 'frontend/postcss.config.js' },
    { src: 'package.json', dest: 'frontend/package.json' },
    { src: 'package-lock.json', dest: 'frontend/package-lock.json' },
    // node_modules often has lock issues or is large, we try to move it but it might fail.
    // It's better to move it than reinstall for speed, if possible.
    { src: 'node_modules', dest: 'frontend/node_modules' },
    { src: 'dist', dest: 'frontend/dist' }
];

// Ensure frontend exists
if (!fs.existsSync('frontend')) {
    try {
        fs.mkdirSync('frontend');
        console.log('Created frontend directory');
    } catch (e) {
        console.error('Failed to create frontend dir:', e);
    }
}

moves.forEach(m => {
    if (fs.existsSync(m.src)) {
        try {
            fs.renameSync(m.src, m.dest);
            console.log(`Moved ${m.src} to ${m.dest}`);
        } catch (e) {
            // If rename fails (e.g. across partitions), try copy and unlink, but for now just log
            console.error(`Failed to move ${m.src}: ${e.message}`);
        }
    } else {
        console.log(`Skipping ${m.src}, not found`);
    }
});

if (fs.existsSync('server')) {
    try {
        fs.renameSync('server', 'backend');
        console.log('Renamed server to backend');
    } catch (e) {
        console.error(`Failed to rename server: ${e.message}`);
    }
}
