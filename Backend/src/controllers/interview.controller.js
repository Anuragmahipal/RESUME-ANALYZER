const pdfParse = require("pdf-parse").default || require("pdf-parse");
const {
  generateInterviewReport,
  generateResumePdf,
} = require("../services/ai.service");

const interviewReportModel = require("../models/interviewReport.model");


// =========================
// CREATE INTERVIEW REPORT
// =========================
async function generateInterViewReportController(req, res) {
  try {
    console.log("Interview API HIT");

    if (!req.file) {
      return res.status(400).json({
        message: "Resume file is required",
      });
    }

    const pdfData = await pdfParse(req.file.buffer);

    const { selfDescription, jobDescription } = req.body;

    if (!selfDescription || !jobDescription) {
      return res.status(400).json({
        message: "selfDescription and jobDescription are required",
      });
    }

    const aiResult = await generateInterviewReport({
      resume: pdfData.text,
      selfDescription,
      jobDescription,
    });

    const savedReport = await interviewReportModel.create({
      user: req.user.id,
      resume: pdfData.text,
      selfDescription,
      jobDescription,
      ...aiResult,
    });

    res.status(201).json({
      message: "Interview report generated successfully",
      interviewReport: savedReport,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message,
    });
  }
}


// =========================
// GET BY ID
// =========================
async function getInterviewReportByIdController(req, res) {
  try {
    const { interviewId } = req.params;

    const report = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id,
    });

    if (!report) {
      return res.status(404).json({
        message: "Interview report not found",
      });
    }

    res.json({
      message: "Success",
      interviewReport: report,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
}


// =========================
// GET ALL REPORTS
// =========================
async function getAllInterviewReportsController(req, res) {
  try {
    const reports = await interviewReportModel
      .find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select(
        "-resume -selfDescription -jobDescription -__v"
      );

    res.json({
      message: "Success",
      interviewReports: reports,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
}


// =========================
// GENERATE RESUME PDF
// =========================
async function generateResumePdfController(req, res) {
  try {
    const { interviewReportId } = req.params;

    const report = await interviewReportModel.findById(interviewReportId);

    if (!report) {
      return res.status(404).json({
        message: "Interview report not found",
      });
    }

    const pdfBuffer = await generateResumePdf({
      resume: report.resume,
      selfDescription: report.selfDescription,
      jobDescription: report.jobDescription,
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`,
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error("PDF Controller Error: ", err.message);
    res.status(500).json({
      message: err.message,
    });
  }
}


// =========================
// EXPORTS
// =========================
module.exports = {
  generateInterViewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};