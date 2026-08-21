# How to Run — Resume Analyzer

This project has three moving parts you need running at the same time:
1. **MongoDB** (database)
2. **Ollama** running a local LLM (powers the AI report/quiz/PDF generation)
3. **Backend** (Express API, port `3000`)
4. **Frontend** (Vite/React dev server, port `5173`)

---

## 1. Prerequisites

- **Node.js** v18+ (tested on v22)
- **MongoDB** running locally, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **[Ollama](https://ollama.com)** installed locally — the backend does **not** call OpenAI or Gemini (even though `openai` and `@google/genai` are listed as dependencies, they're currently unused). All AI generation calls `http://localhost:11434` directly, so Ollama must be running with the right model pulled, or every "Generate Report" / "Generate Resume PDF" action will fail.

Pull the model Ollama needs, once:
```bash
ollama pull qwen2.5:3b
```

Make sure Ollama is running (it usually runs as a background service after install; otherwise):
```bash
ollama serve
```

---

## 2. Backend setup

```bash
cd Backend
npm install
```

Create your env file from the template and fill in the values:
```bash
cp .env.example .env
```

`Backend/.env` needs:
| Variable | Description |
|---|---|
| `MONGO_URI` | Your MongoDB connection string, e.g. `mongodb://127.0.0.1:27017/resume-analyzer` |
| `JWT_SECRET` | Any long random string, used to sign auth tokens |

Start the backend (auto-restarts on file changes):
```bash
npm run dev
```

You should see `Server is running.` in the console. The API is now live at `http://localhost:3000`.

> Note: the first Puppeteer install downloads a bundled Chromium (~200MB) for PDF generation — this happens automatically during `npm install` and needs internet access.

---

## 3. Frontend setup

Open a **second terminal**:

```bash
cd Frontend
npm install
npm run dev
```

Vite will start the dev server, normally at `http://localhost:5173`. Open that URL in your browser.

The frontend is hardcoded to talk to the backend at `http://localhost:3000` — if you change the backend port, update the `baseURL`/`BASE_URL` values in:
- `Frontend/src/features/auth/services/auth.api.js`
- `Frontend/src/features/interview/services/interview.api.js`

---

## 4. Using the app

1. Register a new account (or log in).
2. Go to the resume upload flow, upload a **PDF or DOCX resume** (max 5MB), fill in your self-description and target job description.
3. Submit — this calls your local Ollama model to generate the interview report, quiz, skill gaps, and prep plan. Response time depends on your machine's specs, since `qwen2.5:3b` runs locally.
4. From the report page you can also generate a downloadable PDF resume (uses Puppeteer to render HTML → PDF).

---

## Quick troubleshooting

| Symptom | Likely cause |
|---|---|
| Backend crashes / can't connect to DB on startup | `MONGO_URI` missing or MongoDB isn't running |
| "Generate Report" hangs or errors out | Ollama isn't running, or `qwen2.5:3b` hasn't been pulled |
| Login/Register shows a specific error message | Working as intended — read the message (e.g. wrong password, email already registered) |
| Upload fails with "File is too large" or "Unsupported file type" | Resume must be PDF or DOCX, under 5MB |
| Frontend can't reach the backend (network errors) | Confirm backend is running on port 3000 and `MONGO_URI`/`JWT_SECRET` are set correctly |
