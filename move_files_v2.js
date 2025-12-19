const fs = require('fs');

fs.writeFileSync('debug_start.txt', 'Script started');

const moves = [
    { src: 'src', dest: 'frontend/src' },
    { src: 'public', dest: 'frontend/public' },
    { src: 'index.html', dest: 'frontend/index.html' },
    { src: 'vite.config.js', dest: 'frontend/vite.config.js' },
    { src: 'tailwind.config.js', dest: 'frontend/tailwind.config.js' },
    { src: 'postcss.config.js', dest: 'frontend/postcss.config.js' },
    { src: 'package.json', dest: 'frontend/package.json' },
    { src: 'package-lock.json', dest: 'frontend/package-lock.json' },
    { src: 'node_modules', dest: 'frontend/node_modules' }
];

let log = '';

if (!fs.existsSync('frontend')) {
    try {
        fs.mkdirSync('frontend');
        log += 'Created frontend\n';
    } catch (e) {
        log += `Failed to create frontend: ${e.message}\n`;
    }
}

moves.forEach(m => {
    if (fs.existsSync(m.src)) {
        try {
            fs.renameSync(m.src, m.dest);
            log += `Moved ${m.src} to ${m.dest}\n`;
        } catch (e) {
            log += `Failed to move ${m.src}: ${e.message}\n`;
        }
    } else {
        log += `Skipping ${m.src}, not found\n`;
    }
});

if (fs.existsSync('server')) {
    try {
        fs.renameSync('server', 'backend');
        log += 'Renamed server to backend\n';
    } catch (e) {
        log += `Failed to rename server: ${e.message}\n`;
    }
}

fs.writeFileSync('debug_log.txt', log);
process.exit(0);
