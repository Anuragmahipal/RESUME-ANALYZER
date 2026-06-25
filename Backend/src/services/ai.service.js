const axios = require("axios");
const { z } = require("zod");
const puppeteer = require("puppeteer");

// =========================
// ZOD SCHEMA
// =========================
const interviewReportSchema = z.object({
  title: z.string().default("Interview Report"),
  matchScore: z.coerce.number().min(0).max(100).default(70),

  technicalQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ).default([]),

  behavioralQuestions: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string(),
    })
  ).default([]),

  quiz: z.array(
  z.object({
    question: z.string(),
    options: z.array(z.string()),
    correctAnswer: z.string(),
  })).default([]),

  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    })
  ).default([]),

  preparationPlan: z.array(
    z.object({
      day: z.coerce.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    })
  ).default([]),
});

// =========================
// MAIN FUNCTION
// =========================
async function generateInterviewReport({
  resume = "",
  selfDescription = "",
  jobDescription = "",
}) {
  const prompt = `
You are a senior technical recruiter.

Return ONLY valid JSON.

IMPORTANT RULES:
- Generate EXACTLY 5 technicalQuestions
- Generate EXACTLY 5 behavioralQuestions
- NO missing fields allowed
- correctAnswer must match one option exactly
- Generate EXACTLY 5 quiz questions.
Each question must:
- have 4 options
- have 1 correctAnswer
- NOT include explanation
- NOT include answers for user display

This is a test system, not a learning system.
matchScore MUST be calculated by you (0-100) based on:
- skills match
- experience match
- project match
- tools match

Return format:

{
  "title": "string",
  "matchScore": number,

  "technicalQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],

  "behavioralQuestions": [
    {
      "question": "string",
      "intention": "string",
      "answer": "string"
    }
  ],

  "quiz": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A"
    }
  ],

  "skillGaps": [
    {
      "skill": "string",
      "severity": "low"
    }
  ],

  "preparationPlan": [
    {
      "day": 1,
      "focus": "string",
      "tasks": ["string"]
    }
  ]
}

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

  const response = await axios.post("http://localhost:11434/api/generate", {
    model: "qwen2.5:3b",
    prompt,
    stream: false,
    options: {
      temperature: 0.3,
    },
  });

  const content = response.data.response;

  // =========================
  // SAFE JSON PARSER
  // =========================
  function safeJSONParse(text) {
    try {
      return JSON.parse(text);
    } catch (e) {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON found in response");
      return JSON.parse(match[0]);
    }
  }

  const parsed = safeJSONParse(content);

  // =========================
  // NORMALIZE QUESTIONS
  // =========================
  parsed.technicalQuestions = Array.isArray(parsed.technicalQuestions)
    ? parsed.technicalQuestions.map(q => ({
        question: q.question || "",
        intention: q.intention || "Not provided",
        answer: q.answer || "Not provided",
      }))
    : [];

  parsed.behavioralQuestions = Array.isArray(parsed.behavioralQuestions)
    ? parsed.behavioralQuestions.map(q => ({
        question: q.question || "",
        intention: q.intention || "Not provided",
        answer: q.answer || "Not provided",
      }))
    : [];

  // =========================
  // QUIZ VALIDATION (NO OVER FALLBACK)
  // =========================
  parsed.quiz = (parsed.quiz || []).map(q => ({
  question: q.question || "",
  options: Array.isArray(q.options)
    ? q.options
    : ["A", "B", "C", "D"],
  correctAnswer: q.correctAnswer || "A",
}));

  // ONLY fallback if completely empty
  if (parsed.quiz.length === 0) {
    parsed.quiz = generateFallbackQuiz();
  }

  // =========================
  // SAFE DEFAULTS
  // =========================
  parsed.skillGaps = Array.isArray(parsed.skillGaps) ? parsed.skillGaps : [];
  parsed.preparationPlan = Array.isArray(parsed.preparationPlan) ? parsed.preparationPlan : [];

  parsed.title = parsed.title || "Interview Report";

  parsed.matchScore = Number(parsed.matchScore);
  if (isNaN(parsed.matchScore)) parsed.matchScore = 70;

  return interviewReportSchema.parse(parsed);
}

// =========================
// FALLBACK QUIZ
// =========================
function generateFallbackQuiz() {
  return [
    {
      question: "What is JavaScript?",
      options: ["Language", "Database", "OS", "Compiler"],
      correctAnswer: "Language",
    },
    {
      question: "What is Node.js?",
      options: ["Runtime", "Library", "OS", "Browser"],
      correctAnswer: "Runtime",
    },
    {
      question: "What is HTTP?",
      options: ["Protocol", "Database", "Server", "Language"],
      correctAnswer: "Protocol",
    },
    {
      question: "What is React?",
      options: ["Library", "Database", "OS", "Compiler"],
      correctAnswer: "Library",
    },
    {
      question: "What is API?",
      options: ["Interface", "OS", "Compiler", "Server"],
      correctAnswer: "Interface",
    },
  ];
}

// =========================
// PDF GENERATION
// =========================
async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(htmlContent, {
      waitUntil: "networkidle0",
    });

    return await page.pdf({
      format: "A4",
      printBackground: true,
    });
  } finally {
    await browser.close();
  }
}

// =========================
// RESUME PDF
// =========================
async function generateResumePdf({
  resume = "",
  selfDescription = "",
  jobDescription = "",
}) {
  const prompt = `
Generate a clean ATS-friendly HTML resume.

Return ONLY valid HTML.
Use inline CSS.
No explanation.

Sections:
1. Summary
2. Skills
3. Experience
4. Projects
5. Education

Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}
`;

  const response = await axios.post("http://localhost:11434/api/generate", {
    model: "qwen2.5:3b",
    prompt,
    stream: false,
  });

  return await generatePdfFromHtml(response.data.response);
}

module.exports = {
  generateInterviewReport,
  generateResumePdf,
};