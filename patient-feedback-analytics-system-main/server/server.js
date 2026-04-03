import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import feedbackRoutes from "./routes/feedback.js";
import adminRoutes from "./routes/admin.js";
import staffRoutes from "./routes/staff.js";
import staffFeedbackRoutes from "./routes/staffFeedback.js";
import { ensureStorage } from "./utils/csvStore.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Initialize CSV storage directories
await ensureStorage().catch((err) =>
  console.error("❌ Error initializing storage:", err)
);
console.log("✅ CSV storage initialized");

app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/staff-feedback", staffFeedbackRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running with CSV storage" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} (CSV storage enabled)`);
});
