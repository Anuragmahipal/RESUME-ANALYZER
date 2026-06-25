const mongoose = require("mongoose");

// Technical Questions Schema
const technicalQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Technical question is required"],
    },
    intention: {
      type: String,
      required: [true, "Intention is required"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
  },
  { _id: false }
);

// Behavioral Questions Schema
const behavioralQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Behavioral question is required"],
    },
    intention: {
      type: String,
      required: [true, "Intention is required"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
  },
  { _id: false }
);

// Skill Gap Schema
const skillGapSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: [true, "Skill is required"],
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: [true, "Severity is required"],
    },
  },
  { _id: false }
);
const quizSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: [
      {
        type: String,
        required: true,
      },
    ],
    correctAnswer: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);
// Preparation Plan Schema
const preparationPlanSchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: [true, "Day is required"],
    },
    focus: {
      type: String,
      required: [true, "Focus is required"],
    },
    tasks: [
      {
        type: String,
        required: [true, "Task is required"],
      },
    ],
  },
  { _id: false }
);

// Main Interview Report Schema
const interviewReportSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      default: "Generated Interview Report",
    },

    jobDescription: {
      type: String,
      required: [true, "Job description is required"],
    },

    resume: {
      type: String,
      default: "",
    },

    selfDescription: {
      type: String,
      default: "",
    },

    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    technicalQuestions: [technicalQuestionSchema],

    behavioralQuestions: [behavioralQuestionSchema],
    quiz: [quizSchema],
    skillGaps: [skillGapSchema],
  
    preparationPlan: [preparationPlanSchema],

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const interviewReportModel = mongoose.model(
  "InterviewReport",
  interviewReportSchema
);

module.exports = interviewReportModel; 