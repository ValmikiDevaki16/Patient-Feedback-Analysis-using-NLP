import express from "express";
import {
  findStaffById,
  addFeedback,
  readFeedbackList,
  deleteAllFeedbacks,
  addPatient,
} from "../utils/csvStore.js";
import axios from "axios";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      text,
      patientName,
      patientId,
      department,
      staffId,
      staffName,
      doctorRating,
    } = req.body;

    // Add/ensure patient in CSV
    if (patientId && patientName) {
      await addPatient({ patientId, name: patientName, department });
    }

    const nlpResponse = await axios.post(
      `${process.env.NLP_SERVICE_URL}/analyze_sentiment`,
      {
        text,
        department,
      }
    );

    const { sentiment, polarity, emotion, category, severity_score, keywords } =
      nlpResponse.data;

    // If staffId provided but staffName missing, try to resolve name from CSV
    let resolvedStaffName = staffName || null;
    if (staffId && !resolvedStaffName) {
      try {
        const s = await findStaffById(staffId);
        if (s) resolvedStaffName = s.name || null;
      } catch (e) {
        // ignore and proceed
      }
    }

    const feedback = await addFeedback({
      text,
      department: department || "General",
      sentiment,
      polarityScore: polarity,
      sentimentScore: polarity,
      emotion: emotion || "neutral",
      category: category || "General",
      severityScore: severity_score || 5,
      keywords: keywords || [],
      patientName,
      patientId,
      staffId: staffId || null,
      staffName: resolvedStaffName,
      doctorRating: doctorRating || 0,
    });

    res.json({
      success: true,
      message: "Feedback submitted successfully",
      sentiment,
      feedbackId: feedback.id,
      department,
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res
      .status(500)
      .json({ success: false, message: "Error submitting feedback" });
  }
});

router.get("/all", async (req, res) => {
  try {
    const feedbacks = await readFeedbackList();
    // Convert CSV strings to proper types
    const normalized = feedbacks.map((f) => ({
      ...f,
      polarityScore: parseFloat(f.polarityScore) || 0,
      sentimentScore: parseFloat(f.sentimentScore) || 0,
      severityScore: parseFloat(f.severityScore) || 5,
      doctorRating: parseFloat(f.doctorRating) || 0,
      keywords: f.keywords ? f.keywords.split("|") : [],
    }));
    res.json({ success: true, feedbacks: normalized });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching feedback" });
  }
});

router.delete("/all", async (req, res) => {
  try {
    await deleteAllFeedbacks();
    res.json({
      success: true,
      message: "All feedbacks deleted",
    });
  } catch (error) {
    console.error("Error deleting feedbacks:", error);
    res
      .status(500)
      .json({ success: false, message: "Error deleting feedbacks" });
  }
});

export default router;
