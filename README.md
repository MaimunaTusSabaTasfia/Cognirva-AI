# Cognivra AI 🧠✨

**Understand beyond memorization.**

Cognivra AI helps university students understand difficult topics instead of memorizing answers. It explains a topic in simple language, asks the student to explain it back in their own words, and checks for misconceptions with a follow-up question.

*Cogni* = cognition (learning and understanding). *Vra* = a coined ending to make the name unique.

## Project Goal

This is a small hackathon MVP built to work in under an hour with a local open-source model.

## Features

- Learn a topic with a beginner-friendly explanation, example, and exam-ready definition
- Switch between English and Bangla
- Check understanding with AI feedback tied to the student's actual answer
- Works locally with no paid API keys
- 3 relaxing aesthetic themes (Pastel, Night, Study) with a cute AI mascot named Vra
- Fully responsive (works on laptop and mobile)

## Tech Stack

- Node.js + Express
- Plain HTML/CSS/JavaScript frontend (no frameworks)
- Local model via Ollama
- Open-source model: **gemma4:e2b**

## Model Disclosure

This app uses the local Ollama model `gemma4:e2b` running at `http://localhost:11434`.

It does **not** use any closed-model API such as OpenAI, Claude, or Gemini. All inference happens locally on your machine.

## Setup

1. Install Node.js 18+ if needed.
2. Start Ollama and verify the model is installed:
   ```bash
   ollama list