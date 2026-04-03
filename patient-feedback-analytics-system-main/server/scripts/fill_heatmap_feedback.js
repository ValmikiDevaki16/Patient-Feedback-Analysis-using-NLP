#!/usr/bin/env node
/**
 * Script: fill_heatmap_feedback.js
 * Purpose: generate synthetic feedback documents to ensure every
 * department x category cell has at least one entry so the heatmap is filled.
 *
 * Usage: from repository root
 *   node server/scripts/fill_heatmap_feedback.js
 *
 * The script is idempotent: it will not insert if a dept/category already has feedback.
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import Feedback from "../models/Feedback.js";

dotenv.config({ path: path.resolve(process.cwd(), "server", ".env") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in environment (server/.env)");
  process.exit(1);
}

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

const categories = [
  "Wait Time",
  "Staff Behavior",
  "Cleanliness",
  "Food Quality",
  "Medical Care",
  "Facilities",
  "Cost",
  "General",
];

// Severity generation helpers
const randFloat = (min, max) => Math.random() * (max - min) + min;
const chooseSentimentFromSeverity = (sev) => {
  if (sev >= 6) return "Negative";
  if (sev >= 4) return "Neutral";
  return "Positive";
};

async function main() {
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to MongoDB");

  // For each dept x category, check if any feedback exists
  const inserts = [];
  for (const dept of departments) {
    for (const cat of categories) {
      const exists = await Feedback.findOne({
        department: dept,
        category: cat,
      }).lean();
      if (exists) continue;

      // create a small batch (2) of synthetic feedbacks to populate heatmap
      for (let i = 0; i < 2; i++) {
        const severity =
          Math.round((randFloat(1.0, 7.0) + Number.EPSILON) * 10) / 10; // 1.0 - 7.0
        const polarity = (8 - severity) / 10; // coarse inverse relation
        const sentiment = chooseSentimentFromSeverity(severity);
        const createdAt = new Date();

        const doc = {
          feedbackId: `SYN-${dept.substring(0, 3)}-${cat.substring(
            0,
            3
          )}-${Date.now()}-${i}`,
          patientId: `SYN-P-${Math.floor(Math.random() * 10000)}`,
          staffId: null,
          staffName: null,
          department: dept,
          category: cat,
          text: `Synthetic entry for ${dept} / ${cat}`,
          doctorRating: 0,
          severityScore: severity,
          sentiment: sentiment,
          polarityScore: Number(polarity.toFixed(3)),
          createdAt,
          updatedAt: createdAt,
        };

        inserts.push(doc);
      }
    }
  }

  if (!inserts.length) {
    console.log(
      "All department x category cells already have feedback. Nothing to insert."
    );
    await mongoose.disconnect();
    return;
  }

  // Bulk insert
  try {
    const res = await Feedback.insertMany(inserts, { ordered: false });
    console.log(
      `Inserted ${res.length} synthetic feedback documents to fill heatmap.`
    );
  } catch (err) {
    console.error("Error inserting synthetic docs:", err.message || err);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exit(1);
});
