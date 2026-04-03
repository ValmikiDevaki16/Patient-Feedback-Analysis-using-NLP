import express from "express";
import { findStaffById, readFeedbackList } from "../utils/csvStore.js";

const router = express.Router();

// Get feedback for a specific staff member
router.get("/my-feedback/:staffId", async (req, res) => {
  try {
    const { staffId } = req.params;

    // Verify staff exists (from CSV)
    const staff = await findStaffById(staffId);
    if (!staff) {
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    }

    // Get all feedback for this staff from CSV
    const feedbacksRaw = await readFeedbackList();
    const feedback = feedbacksRaw
      .filter((f) => f.staffId === staffId)
      .map((f) => ({
        ...f,
        polarityScore: parseFloat(f.polarityScore) || 0,
        doctorRating: parseFloat(f.doctorRating) || 0,
        keywords: f.keywords ? f.keywords.split("|") : [],
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate stats
    const stats = {
      totalFeedback: feedback.length,
      positive: feedback.filter((f) => f.sentiment === "Positive").length,
      neutral: feedback.filter((f) => f.sentiment === "Neutral").length,
      negative: feedback.filter((f) => f.sentiment === "Negative").length,
      averageRating:
        feedback.length > 0
          ? (
              feedback.reduce((sum, f) => sum + (f.doctorRating || 0), 0) /
              feedback.length
            ).toFixed(2)
          : 0,
      averagePolarityScore:
        feedback.length > 0
          ? (
              feedback.reduce((sum, f) => sum + (f.polarityScore || 0), 0) /
              feedback.length
            ).toFixed(2)
          : 0,
    };

    res.json({ success: true, feedback, stats });
  } catch (error) {
    console.error("Error fetching staff feedback:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching feedback" });
  }
});

// Get feedback summary for staff dashboard
router.get("/dashboard/:staffId", async (req, res) => {
  try {
    const { staffId } = req.params;

    const staff = await findStaffById(staffId);
    if (!staff) {
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    }

    const feedbacksRaw = await readFeedbackList();
    const feedback = feedbacksRaw
      .filter((f) => f.staffId === staffId)
      .map((f) => ({
        ...f,
        keywords: f.keywords ? f.keywords.split("|") : [],
      }));

    // Category breakdown
    const categoryBreakdown = {};
    feedback.forEach((f) => {
      const cat = f.category || "General";
      categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1;
    });

    // Sentiment breakdown
    const sentimentBreakdown = {
      Positive: feedback.filter((f) => f.sentiment === "Positive").length,
      Neutral: feedback.filter((f) => f.sentiment === "Neutral").length,
      Negative: feedback.filter((f) => f.sentiment === "Negative").length,
    };

    // Top keywords
    const keywordMap = {};
    feedback.forEach((f) => {
      if (f.keywords && Array.isArray(f.keywords)) {
        f.keywords.forEach((kw) => {
          keywordMap[kw] = (keywordMap[kw] || 0) + 1;
        });
      }
    });
    const topKeywords = Object.entries(keywordMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));

    // Monthly trend
    const monthlyTrend = {};
    feedback.forEach((f) => {
      const date = new Date(f.createdAt);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      monthlyTrend[monthKey] = (monthlyTrend[monthKey] || 0) + 1;
    });

    const stats = {
      totalFeedback: feedback.length,
      positive: sentimentBreakdown.Positive,
      neutral: sentimentBreakdown.Neutral,
      negative: sentimentBreakdown.Negative,
      averageRating:
        feedback.length > 0
          ? (
              feedback.reduce((sum, f) => sum + (f.doctorRating || 0), 0) /
              feedback.length
            ).toFixed(2)
          : 0,
    };

    res.json({
      success: true,
      staff,
      stats,
      categoryBreakdown,
      sentimentBreakdown,
      topKeywords,
      monthlyTrend,
      recentFeedback: feedback.slice(0, 5),
    });
  } catch (error) {
    console.error("Error fetching staff dashboard:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching dashboard data" });
  }
});

export default router;
