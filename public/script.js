const themeSelect = document.getElementById('themeSelect');
const fileInput = document.getElementById('fileInput');
const assistantOutput = document.getElementById('assistantOutput');

function applyTheme(themeMode) {
  const selectedTheme = themeMode === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : themeMode;

  document.body.setAttribute('data-theme', selectedTheme);
  if (themeSelect) {
    themeSelect.value = themeMode;
  }
  localStorage.setItem('cognirva-theme', themeMode);
}

const savedTheme = localStorage.getItem('cognirva-theme') || 'system';
applyTheme(savedTheme);

if (window.matchMedia) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  if (typeof mediaQuery.addEventListener === 'function') {
    mediaQuery.addEventListener('change', () => {
      if ((localStorage.getItem('cognirva-theme') || 'system') === 'system') {
        applyTheme('system');
      }
    });
  }
}

if (themeSelect) {
  themeSelect.addEventListener('change', (event) => {
    applyTheme(event.target.value);
  });
}

function setAssistantMessage(message) {
  assistantOutput.textContent = message;
  assistantOutput.classList.remove('hidden');
}

async function askStudyBackend(type, content) {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, content })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data.answer || 'The AI did not return a useful answer.';
}

document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((nav) => nav.classList.remove('active'));
    item.classList.add('active');
    setAssistantMessage(`${item.textContent.trim()} is ready. Choose an upload or paste action to begin.`);
  });
});

document.getElementById('uploadAction').addEventListener('click', () => {
  fileInput.click();
});

document.getElementById('pasteAction').addEventListener('click', async () => {
  const pastedText = window.prompt('Paste a lesson, article, or notes here to turn them into study material.', '');

  if (!pastedText || !pastedText.trim()) {
    return;
  }

  setAssistantMessage('Reading your pasted material and turning it into notes, flashcards, and quiz ideas...');

  try {
    const answer = await askStudyBackend('paste', pastedText);
    setAssistantMessage(answer);
  } catch (error) {
    setAssistantMessage(error.message || 'Something went wrong while processing your pasted material.');
  }
});

fileInput.addEventListener('change', async (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) {
    return;
  }

  setAssistantMessage(`Processing ${file.name}...`);

  try {
    const text = await file.text();
    const answer = await askStudyBackend('upload', `${file.name}\n\n${text}`);
    setAssistantMessage(answer);
  } catch (error) {
    setAssistantMessage(`I could not read ${file.name}. Please try a different file or paste the text manually.`);
  }

  fileInput.value = '';
});
