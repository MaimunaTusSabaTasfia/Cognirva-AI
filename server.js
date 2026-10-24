const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CONFIGURATION
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma4:e2b';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const DEFAULT_PORT = Number(process.env.PORT || 3000);

async function callOllama(prompt) {
    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            prompt,
            stream: false,
            options: {
                temperature: 0.7,
                top_p: 0.9,
                num_predict: 180
            }
        })
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Ollama request failed (${response.status}): ${text}`);
    }

    const data = await response.json();
    const answer = data?.response?.trim() || '';
    if (!answer) {
        throw new Error('Ollama returned an empty message.');
    }

    return answer;
}

// 1. LEARN ENDPOINT
app.post('/api/learn', async (req, res) => {
    const { topic, language } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const prompt = `You are Vra, a helpful tutor. Explain "${topic}" in ${language}. Keep it short: 1 beginner explanation, 1 example.`;

    try {
        console.log(`\n[Backend] Sending request to Ollama for: ${topic}...`);
        const answer = await callOllama(prompt);
        console.log('[Backend] Success! Sending to frontend.');
        res.json({ result: answer });

    } catch (error) {
        console.error("\n❌ --- OLLAMA CRASHED --- ❌");
        console.error(error);
        console.error("------------------------\n");
        // Send a real error message to the frontend instead of crashing
        res.status(500).json({ error: "Ollama failed to respond. Check terminal." });
    }
});

// 2. CHECK ENDPOINT
app.post('/api/check', async (req, res) => {
    const { topic, studentText, language } = req.body;
    if (!topic || !studentText) return res.status(400).json({ error: "Missing data" });

    const prompt = `Topic: "${topic}". Student said: "${studentText}". Check their understanding in ${language}.`;

    try {
        const answer = await callOllama(prompt);
        res.json({ result: answer });
    } catch (error) {
        console.error("\n❌ --- OLLAMA CRASHED (CHECK) --- ❌");
        console.error(error);
        res.status(500).json({ error: "Ollama failed to respond." });
    }
});

function startServer(port) {
    const server = app.listen(port, () => {
        console.log(`\n✅ Server running at http://localhost:${port}\nUsing model: ${OLLAMA_MODEL}\n`);
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.warn(`Port ${port} is busy. Trying ${port + 1}...`);
            startServer(port + 1);
            return;
        }

        console.error('Server error:', error);
        process.exit(1);
    });
}

startServer(DEFAULT_PORT);