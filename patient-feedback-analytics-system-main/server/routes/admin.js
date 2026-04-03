import express from "express";
import axios from "axios";
import {
  readStaffList,
  addStaff,
  readFeedbackList,
} from "../utils/csvStore.js";

const router = express.Router();

router.get("/overview", async (req, res) => {
  try {
    const feedbacksRaw = await readFeedbackList();
    // Normalize CSV data types
    const feedbacks = feedbacksRaw.map((f) => ({
      ...f,
      polarityScore: parseFloat(f.polarityScore) || 0,
      sentimentScore: parseFloat(f.sentimentScore) || 0,
      severityScore: parseFloat(f.severityScore) || 5,
      doctorRating: parseFloat(f.doctorRating) || 0,
      keywords: f.keywords ? f.keywords.split("|") : [],
    }));

    const totalFeedback = feedbacks.length;
    const sentimentCounts = {
      Positive: feedbacks.filter((f) => f.sentiment === "Positive").length,
      Neutral: feedbacks.filter((f) => f.sentiment === "Neutral").length,
      Negative: feedbacks.filter((f) => f.sentiment === "Negative").length,
    };

    // Emotion distribution (using Python NLP "emotion" field)
    const emotionCounts = {
      positive: 0,
      relief: 0,
      frustration: 0,
      anger: 0,
      confusion: 0,
      neutral: 0,
    };

    feedbacks.forEach((f) => {
      const text = (f.text || "").toLowerCase();
      const sentiment = (f.sentiment || "").toLowerCase();
      const severity = Number(f.severityScore || 5);

      // strong keyword–based tags override generic rules
      if (text.includes("relief") || text.includes("relieved") || text.includes("better now")) {
        emotionCounts.relief++;
        return;
      }

      if (
        text.includes("confused") ||
        text.includes("confusing") ||
        text.includes("not clear") ||
        text.includes("no one explained") ||
        text.includes("no explanation")
      ) {
        emotionCounts.confusion++;
        return;
      }

      if (
        text.includes("angry") ||
        text.includes("furious") ||
        text.includes("furious") ||
        text.includes("hate") ||
        severity >= 9
      ) {
        // really bad + very high severity → anger
        emotionCounts.anger++;
        return;
      }

      if (
        text.includes("frustrated") ||
        text.includes("frustrating") ||
        text.includes("waiting hours") ||
        text.includes("waited hours") ||
        text.includes("slow service") ||
        text.includes("delay") ||
        (sentiment === "negative" && severity >= 7)
      ) {
        // negative but not full rage → frustration
        emotionCounts.frustration++;
        return;
      }

      // fallbacks based on sentiment
      if (sentiment === "positive") {
        emotionCounts.positive++;
      } else if (sentiment === "negative") {
        // generic negative without strong keywords → frustration bucket
        emotionCounts.frustration++;
      } else {
        // neutral with no strong indicators → confusion bucket
        emotionCounts.confusion++;
      }
    });


    // Department-wise sentiment distribution
    const departmentStats = {};
    const departments = [
      "Emergency",
      "OPD",
      "IPD",
      "Surgery",
      "Pharmacy",
      "Laboratory",
      "Radiology",
      "General",
    ];

    departments.forEach((dept) => {
      const deptFeedbacks = feedbacks.filter((f) => f.department === dept);
      if (deptFeedbacks.length > 0) {
        const avgSentiment =
          deptFeedbacks.reduce(
            (sum, f) => sum + (f.sentimentScore || f.polarityScore || 0),
            0
          ) / deptFeedbacks.length;
        const avgSeverity =
          deptFeedbacks.reduce((sum, f) => sum + (f.severityScore || 5), 0) /
          deptFeedbacks.length;
        departmentStats[dept] = {
          totalFeedback: deptFeedbacks.length,
          sentimentScore: Math.round(avgSentiment * 100) / 100,
          severityScore: Math.round(avgSeverity * 100) / 100,
          sentimentBreakdown: {
            positive: deptFeedbacks.filter((f) => f.sentiment === "Positive")
              .length,
            neutral: deptFeedbacks.filter((f) => f.sentiment === "Neutral")
              .length,
            negative: deptFeedbacks.filter((f) => f.sentiment === "Negative")
              .length,
          },
        };
      }
    });

    // Category-wise distribution
    const categoryStats = {};
    feedbacks.forEach((f) => {
      const category = f.category || "General";
      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, totalSeverity: 0 };
      }
      categoryStats[category].count++;
      categoryStats[category].totalSeverity += f.severityScore || 5;
    });

    const categoryDistribution = Object.keys(categoryStats).map((cat) => ({
      category: cat,
      count: categoryStats[cat].count,
      avgSeverity:
        Math.round(
          (categoryStats[cat].totalSeverity / categoryStats[cat].count) * 100
        ) / 100,
    }));

    // Heatmap data: department x category severity
    const heatmapData = [];
    departments.forEach((dept) => {
      const deptFeedbacks = feedbacks.filter((f) => f.department === dept);
      [
        "Wait Time",
        "Staff Behavior",
        "Cleanliness",
        "Food Quality",
        "Medical Care",
        "Facilities",
        "Cost",
        "General",
      ].forEach((cat) => {
        const catFeedbacks = deptFeedbacks.filter((f) => f.category === cat);
        if (catFeedbacks.length > 0) {
          const avgSeverity =
            catFeedbacks.reduce((sum, f) => sum + (f.severityScore || 5), 0) /
            catFeedbacks.length;
          heatmapData.push({
            department: dept,
            category: cat,
            severity: Math.round(avgSeverity * 100) / 100,
            count: catFeedbacks.length,
          });
        }
      });
    });

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const dailyData = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      dailyData[dateStr] = { Positive: 0, Neutral: 0, Negative: 0 };
    }

    feedbacks.forEach((feedback) => {
      if (!feedback.createdAt) return; // no date → skip

      const created = new Date(feedback.createdAt);
      if (isNaN(created.getTime())) {
        // invalid date → skip
        return;
      }

      const dateStr = created.toISOString().split("T")[0];

      if (!dailyData[dateStr]) {
        // if it's older than 7 days we just ignore it
        return;
      }

      const sentiment = (feedback.sentiment || "").toLowerCase();
      if (sentiment === "positive") {
        dailyData[dateStr].Positive++;
      } else if (sentiment === "negative") {
        dailyData[dateStr].Negative++;
      } else {
        dailyData[dateStr].Neutral++;
      }
    });


    const trendData = Object.keys(dailyData).map((date) => ({
      date,
      ...dailyData[date],
    }));

    res.json({
      success: true,
      stats: {
        totalFeedback,
        sentimentCounts,
        emotionCounts,
        departmentStats,
        categoryDistribution,
        heatmapData,
        trendData,
      },
    });
  } catch (error) {
    console.error("Error fetching overview:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching overview" });
  }
});

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const feedbacksRaw = await readFeedbackList();
    const feedbacks = feedbacksRaw
      .map((f) => ({
        ...f,
        polarityScore: parseFloat(f.polarityScore) || 0,
        sentimentScore: parseFloat(f.sentimentScore) || 0,
        severityScore: parseFloat(f.severityScore) || 5,
        doctorRating: parseFloat(f.doctorRating) || 0,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 100);

    const negativeFeedbacks = feedbacks
      .filter((f) => f.sentiment === "Negative")
      .map((f) => f.text);

    if (
      message.toLowerCase().includes("improve") ||
      message.toLowerCase().includes("suggestion") ||
      message.toLowerCase().includes("what should")
    ) {
      const nlpResponse = await axios.post(
        `${process.env.NLP_SERVICE_URL}/generate_suggestions`,
        {
          feedbacks: negativeFeedbacks,
        }
      );

      return res.json({
        success: true,
        response: nlpResponse.data.suggestions,
      });
    }

    if (
      message.toLowerCase().includes("week") ||
      message.toLowerCase().includes("feedback") ||
      message.toLowerCase().includes("how is")
    ) {
      const last7Days = feedbacks.filter((f) => {
        const diff = Date.now() - new Date(f.createdAt).getTime();
        return diff <= 7 * 24 * 60 * 60 * 1000;
      });

      const posCount = last7Days.filter(
        (f) => f.sentiment === "Positive"
      ).length;
      const negCount = last7Days.filter(
        (f) => f.sentiment === "Negative"
      ).length;
      const neuCount = last7Days.filter(
        (f) => f.sentiment === "Neutral"
      ).length;

      const avgPolarity =
        last7Days.length > 0
          ? last7Days.reduce((sum, f) => sum + f.polarityScore, 0) /
            last7Days.length
          : 0;

      const response =
        `This week we received ${last7Days.length} feedback entries:\n` +
        `• ${posCount} positive (${
          last7Days.length > 0
            ? Math.round((posCount / last7Days.length) * 100)
            : 0
        }%)\n` +
        `• ${neuCount} neutral (${
          last7Days.length > 0
            ? Math.round((neuCount / last7Days.length) * 100)
            : 0
        }%)\n` +
        `• ${negCount} negative (${
          last7Days.length > 0
            ? Math.round((negCount / last7Days.length) * 100)
            : 0
        }%)\n\n` +
        `Average sentiment score: ${avgPolarity.toFixed(2)}\n` +
        (avgPolarity > 0.2
          ? `Overall sentiment is positive! 🎉`
          : avgPolarity < -0.2
          ? `Attention needed - sentiment is negative.`
          : `Sentiment is neutral.`);

      return res.json({ success: true, response });
    }

    res.json({
      success: true,
      response:
        'I can help you analyze feedback trends and provide improvement suggestions. Try asking "How is feedback this week?" or "What should we improve?"',
    });
  } catch (error) {
    console.error("Error in admin chat:", error);
    res
      .status(500)
      .json({ success: false, message: "Error processing request" });
  }
});

// Get top 3 performing doctors/staff
router.get("/top-doctors", async (req, res) => {
  try {
    const feedbacksRaw = await readFeedbackList();
    const feedbacks = feedbacksRaw
      .filter((f) => f.staffId)
      .map((f) => ({
        ...f,
        polarityScore: parseFloat(f.polarityScore) || 0,
        doctorRating: parseFloat(f.doctorRating) || 0,
      }));

    // Calculate stats for each staff member
    const staffStats = {};
    feedbacks.forEach((feedback) => {
      const staffId = feedback.staffId;
      if (!staffStats[staffId]) {
        staffStats[staffId] = {
          staffId,
          staffName: feedback.staffName || "Unknown",
          totalFeedback: 0,
          positive: 0,
          neutral: 0,
          negative: 0,
          totalRating: 0,
          averageRating: 0,
          sentimentScore: 0,
        };
      }

      staffStats[staffId].totalFeedback++;
      if (feedback.sentiment === "Positive") staffStats[staffId].positive++;
      if (feedback.sentiment === "Neutral") staffStats[staffId].neutral++;
      if (feedback.sentiment === "Negative") staffStats[staffId].negative++;
      if (feedback.doctorRating && feedback.doctorRating > 0) {
        staffStats[staffId].totalRating += feedback.doctorRating;
      }
      staffStats[staffId].sentimentScore += feedback.polarityScore || 0;
    });

    // Calculate average rating and sort
    const topDoctors = Object.values(staffStats)
      .map((stats) => ({
        ...stats,
        averageRating:
          stats.totalFeedback > 0
            ? (stats.totalRating / stats.totalFeedback).toFixed(2)
            : 0,
        sentimentScore: (stats.sentimentScore / stats.totalFeedback).toFixed(2),
        satisfactionRate:
          stats.totalFeedback > 0
            ? ((stats.positive / stats.totalFeedback) * 100).toFixed(1)
            : 0,
      }))
      .sort((a, b) => {
        const scoreA = parseFloat(a.averageRating) || 0;
        const scoreB = parseFloat(b.averageRating) || 0;
        return scoreB - scoreA;
      })
      .slice(0, 3);

    res.json({ success: true, topDoctors });
  } catch (error) {
    console.error("Error fetching top doctors:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching top doctors" });
  }
});

// Get all staff stats (for admin to see all scores)
router.get("/all-staff-stats", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ staffId: { $ne: null } });

    // Calculate stats for each staff member
    const staffStats = {};
    feedbacks.forEach((feedback) => {
      const staffId = feedback.staffId;
      if (!staffStats[staffId]) {
        staffStats[staffId] = {
          staffId,
          staffName: feedback.staffName || "Unknown",
          totalFeedback: 0,
          positive: 0,
          neutral: 0,
          negative: 0,
          totalRating: 0,
          averageRating: 0,
          sentimentScore: 0,
        };
      }

      staffStats[staffId].totalFeedback++;
      if (feedback.sentiment === "Positive") staffStats[staffId].positive++;
      if (feedback.sentiment === "Neutral") staffStats[staffId].neutral++;
      if (feedback.sentiment === "Negative") staffStats[staffId].negative++;
      if (feedback.doctorRating && feedback.doctorRating > 0) {
        staffStats[staffId].totalRating += feedback.doctorRating;
      }
      staffStats[staffId].sentimentScore += feedback.polarityScore || 0;
    });

    // Calculate average rating
    const allStaffStats = Object.values(staffStats)
      .map((stats) => ({
        ...stats,
        averageRating:
          stats.totalFeedback > 0
            ? (stats.totalRating / stats.totalFeedback).toFixed(2)
            : 0,
        sentimentScore: (stats.sentimentScore / stats.totalFeedback).toFixed(2),
        satisfactionRate:
          stats.totalFeedback > 0
            ? ((stats.positive / stats.totalFeedback) * 100).toFixed(1)
            : 0,
      }))
      .sort((a, b) => {
        const scoreA = parseFloat(a.averageRating) || 0;
        const scoreB = parseFloat(b.averageRating) || 0;
        return scoreB - scoreA;
      });

    res.json({ success: true, staffStats: allStaffStats });
  } catch (error) {
    console.error("Error fetching all staff stats:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching staff stats" });
  }
});

// GET summary of current analytics + suggestions
router.get("/summary", async (req, res) => {
  try {
    const feedbacksRaw = await readFeedbackList();
    const feedbacks = feedbacksRaw.map((f) => ({
      ...f,
      polarityScore: parseFloat(f.polarityScore) || 0,
      sentimentScore: parseFloat(f.sentimentScore) || 0,
      severityScore: parseFloat(f.severityScore) || 5,
      doctorRating: parseFloat(f.doctorRating) || 0,
    }));

    const total = feedbacks.length;
    const positive = feedbacks.filter((f) => f.sentiment === "Positive").length;
    const neutral = feedbacks.filter((f) => f.sentiment === "Neutral").length;
    const negative = feedbacks.filter((f) => f.sentiment === "Negative").length;

    // department severity averages
    const departments = [
      "Emergency",
      "OPD",
      "IPD",
      "Surgery",
      "Pharmacy",
      "Laboratory",
      "Radiology",
      "General",
    ];
    const deptSev = {};
    departments.forEach((d) => {
      const df = feedbacks.filter((f) => f.department === d);
      if (df.length) {
        deptSev[d] =
          df.reduce((s, x) => s + (x.severityScore || 5), 0) / df.length;
      }
    });

    const worstDept = Object.keys(deptSev).length
      ? Object.entries(deptSev).sort((a, b) => b[1] - a[1])[0][0]
      : null;

    // category counts
    const catCounts = {};
    feedbacks.forEach((f) => {
      const c = f.category || "General";
      catCounts[c] = (catCounts[c] || 0) + 1;
    });
    const topCategory = Object.keys(catCounts).length
      ? Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null;

    // heatmap highlights (highest severity cells)
    const heatmapCells = [];
    [
      "Wait Time",
      "Staff Behavior",
      "Cleanliness",
      "Food Quality",
      "Medical Care",
      "Facilities",
      "Cost",
      "General",
    ].forEach((cat) => {
      departments.forEach((dept) => {
        const list = feedbacks.filter(
          (f) => f.department === dept && (f.category || "General") === cat
        );
        if (list.length) {
          const avg =
            list.reduce((s, x) => s + (x.severityScore || 5), 0) / list.length;
          heatmapCells.push({
            department: dept,
            category: cat,
            avgSeverity: Math.round(avg * 100) / 100,
            count: list.length,
          });
        }
      });
    });
    heatmapCells.sort((a, b) => b.avgSeverity - a.avgSeverity);
    const topHeat = heatmapCells.slice(0, 3);

    // Build human summary
    let summary = `Total feedback: ${total}. Positive: ${positive}, Neutral: ${neutral}, Negative: ${negative}.`;
    if (worstDept)
      summary += ` Department with highest average severity: ${worstDept}.`;
    if (topCategory) summary += ` Most common category: ${topCategory}.`;
    if (topHeat.length) {
      summary +=
        " Top concerning areas (department - category - severity): " +
        topHeat
          .map((h) => `${h.department} - ${h.category} (${h.avgSeverity})`)
          .join("; ") +
        ".";
    }

    // Collect negative feedback texts for the NLP suggestions endpoint
    const negativeFeedbacks = feedbacks
      .filter((f) => f.sentiment === "Negative")
      .map((f) => f.text)
      .slice(0, 200);

    let suggestions = null;
    try {
      const nlpResp = await axios.post(
        `${process.env.NLP_SERVICE_URL}/generate_suggestions`,
        { feedbacks: negativeFeedbacks }
      );
      suggestions = nlpResp.data.suggestions || null;
    } catch (e) {
      console.warn("NLP suggestions call failed:", e.message || e);
    }

    res.json({
      success: true,
      summary,
      suggestions,
      stats: {
        total,
        positive,
        neutral,
        negative,
        worstDept,
        topCategory,
        topHeat,
      },
    });
  } catch (err) {
    console.error("Error generating summary:", err);
    res
      .status(500)
      .json({ success: false, message: "Error generating summary" });
  }
});

// GET list of doctors from CSV
router.get("/doctors", async (req, res) => {
  try {
    const list = await readStaffList();
    const doctors = list.filter(
      (s) => (s.role || "").toLowerCase() === "doctor"
    );
    res.json({ success: true, doctors });
  } catch (err) {
    console.error("Error fetching doctors from CSV:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST add a new doctor into CSV
router.post("/doctors", async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.staffId || !payload.name) {
      return res
        .status(400)
        .json({ success: false, message: "Missing staffId or name" });
    }
    // default role to Doctor
    const created = await addStaff({ ...payload, role: "Doctor" });
    res.json({ success: true, doctor: created });
  } catch (err) {
    console.error("Error adding doctor to CSV:", err);
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
});

export default router;
