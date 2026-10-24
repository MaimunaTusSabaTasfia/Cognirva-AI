let currentTopic = "";

function switchTab(tabName) {
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    if(event) event.currentTarget.classList.add('active');

    document.querySelectorAll('.view').forEach(view => view.classList.remove('active-view'));
    document.getElementById(`${tabName}-view`).classList.add('active-view');

    if (tabName === 'chat') {
        document.getElementById('display-topic').innerText = currentTopic ? `Current Topic: ${currentTopic}` : "Current Topic: None";
    }
}

function changeTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cognivra-theme', theme);
}
const savedTheme = localStorage.getItem('cognivra-theme') || 'light';
if(document.getElementById('themeSelect')) {
    document.getElementById('themeSelect').value = savedTheme;
}
changeTheme(savedTheme);

async function explainTopic() {
    const topic = document.getElementById('topicInput').value.trim();
    const language = document.getElementById('languageSelect').value;
    
    if (!topic) { alert("Please enter a topic first!"); return; }
    currentTopic = topic;

    const btn = document.querySelector('.btn-black');
    const loading = document.getElementById('home-loading');
    const output = document.getElementById('home-output');
    const textEl = document.getElementById('output-text');

    btn.disabled = true;
    loading.classList.remove('hidden');
    output.classList.add('hidden');
    textEl.innerText = "Loading..."; // Clear old text

    try {
        const res = await fetch('/api/learn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, language })
        });
        
        // SAFE JSON PARSING
        const textData = await res.text(); 
        if(!textData) throw new Error("Server returned empty response. Is Ollama running?");
        
        const data = JSON.parse(textData);
        if (data.error) throw new Error(data.error);
        
        textEl.innerText = data.result;
        output.classList.remove('hidden');
    } catch (err) {
        textEl.innerText = "❌ Error: " + err.message;
        output.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        loading.classList.add('hidden');
    }
}

async function makeSimpler() {
    if (!currentTopic) return;
    const textEl = document.getElementById('output-text');
    const btn = document.getElementById('simplerBtn');
    
    btn.disabled = true;
    btn.innerText = "Simplifying...";
    textEl.innerText = "Simplifying for you...";

    try {
        const res = await fetch('/api/learn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: `Explain ${currentTopic} like I am 5 years old. Be extremely simple.`, language: 'English' })
        });
        
        const textData = await res.text();
        if(!textData) throw new Error("Server returned empty response.");
        const data = JSON.parse(textData);
        
        if (data.error) throw new Error(data.error);
        textEl.innerText = data.result;
    } catch (err) {
        textEl.innerText = "❌ Error: " + err.message;
    } finally {
        btn.disabled = false;
        btn.innerText = "✨ Make it simpler";
    }
}

async function checkUnderstanding() {
    const studentText = document.getElementById('studentInput').value.trim();
    const language = document.getElementById('languageSelect').value;
    
    if (!currentTopic) { alert("Enter a topic on the Dashboard tab first!"); return; }
    if (!studentText) { alert("Please write your explanation."); return; }

    const btn = document.querySelector('.full-width');
    const loading = document.getElementById('chat-loading');
    const output = document.getElementById('chat-output');

    btn.disabled = true;
    loading.classList.remove('hidden');
    output.classList.add('hidden');

    try {
        const res = await fetch('/api/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: currentTopic, studentText, language })
        });
        
        const textData = await res.text();
        if(!textData) throw new Error("Server returned empty response.");
        const data = JSON.parse(textData);

        if (data.error) throw new Error(data.error);
        
        output.innerText = data.result;
        output.classList.remove('hidden');
    } catch (err) {
        output.innerText = "❌ Error: " + err.message;
        output.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        loading.classList.add('hidden');
    }
}