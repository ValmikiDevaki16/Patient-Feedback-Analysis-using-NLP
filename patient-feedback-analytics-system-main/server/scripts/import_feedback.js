import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Feedback from "../models/Feedback.js";

const BASE = path.resolve(process.cwd(), "server");
const USERS_CSV = path.join(BASE, "storage", "users.csv");
const FEEDBACK_CSV = path.join(BASE, "storage", "feedback.csv");
const ENV = path.join(BASE, ".env");

function readEnv(uriKey = "MONGODB_URI") {
  if (!fs.existsSync(ENV)) return null;
  const txt = fs.readFileSync(ENV, "utf8");
  for (const line of txt.split(/\r?\n/)) {
    const idx = line.indexOf(uriKey + "=");
    if (idx !== -1)
      return line.substring(idx + uriKey.length + 1).trim() || null;
  }
  return null;
}

function parseCSVLine(line) {
  const cols = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      cols.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  cols.push(cur);
  return cols;
}

async function main() {
  const MONGODB_URI = readEnv();
  if (!MONGODB_URI) {
    console.error("MONGODB_URI not found in .env");
    process.exit(1);
  }
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected");

  // load users to map staffId->name
  const staffName = {};
  if (fs.existsSync(USERS_CSV)) {
    const txt = fs.readFileSync(USERS_CSV, "utf8");
    const lines = txt.split(/\r?\n/).filter(Boolean);
    const hdr = lines
      .shift()
      .split(",")
      .map((h) => h.trim());
    for (const l of lines) {
      const cols = parseCSVLine(l);
      const row = {};
      hdr.forEach((h, i) => {
        row[h] = cols[i] || "";
      });
      if (row.staffId) staffName[row.staffId.toUpperCase()] = row.name || "";
    }
  }

  // read feedback csv
  if (!fs.existsSync(FEEDBACK_CSV)) {
    console.error("feedback.csv not found at", FEEDBACK_CSV);
    process.exit(1);
  }
  const ftxt = fs.readFileSync(FEEDBACK_CSV, "utf8");
  const lines = ftxt.split(/\r?\n/).filter(Boolean);
  const hdr = parseCSVLine(lines.shift()).map((h) => h.trim());

  const idx = (name) => hdr.indexOf(name);
  const iDoctor = idx("doctorId") >= 0 ? idx("doctorId") : idx("staffId");
  const iText = idx("text");
  const iRating = idx("rating");
  const iSentiment = idx("sentiment");
  const iScore =
    idx("sentimentScore") >= 0 ? idx("sentimentScore") : idx("polarity");
  const iCreated = idx("createdAt");
  const iPatient = idx("patientId");
  const iSpec = idx("specialization");

  let inserted = 0;
  for (const l of lines) {
    const cols = parseCSVLine(l);
    const doctorId = iDoctor >= 0 && cols[iDoctor] ? cols[iDoctor].trim() : "";
    const staffId = doctorId ? doctorId.trim() : null;
    const text = iText >= 0 && cols[iText] ? cols[iText].trim() : "";
    const rating = iRating >= 0 && cols[iRating] ? parseInt(cols[iRating]) : 0;
    const sentimentRaw =
      iSentiment >= 0 && cols[iSentiment]
        ? cols[iSentiment].trim().toLowerCase()
        : "";
    const score = iScore >= 0 && cols[iScore] ? parseFloat(cols[iScore]) : 0;
    const createdStr =
      iCreated >= 0 && cols[iCreated] ? cols[iCreated].trim() : "";
    const patientId =
      iPatient >= 0 && cols[iPatient] ? cols[iPatient].trim() : "Anon";
    const spec = iSpec >= 0 && cols[iSpec] ? cols[iSpec].trim() : "General";

    let created = new Date();
    if (createdStr) {
      created = new Date(createdStr);
      if (isNaN(created.getTime())) created = new Date();
    }

    // check duplicate
    const existing = await Feedback.findOne({
      createdAt: created,
      staffId: staffId,
      text: text,
    }).exec();
    if (existing) continue;

    let sentiment = "Neutral";
    if (sentimentRaw.startsWith("pos")) sentiment = "Positive";
    else if (sentimentRaw.startsWith("neg")) sentiment = "Negative";

    const severity = rating ? Math.max(1, Math.min(10, (6 - rating) * 2)) : 5;

    const doc = new Feedback({
      text: text,
      department: "OPD",
      sentiment: sentiment,
      polarityScore: score,
      sentimentScore: score,
      emotion: "neutral",
      category: "General",
      severityScore: severity,
      keywords: [],
      patientName: patientId,
      patientId: patientId,
      staffId: staffId,
      staffName: staffId ? staffName[staffId.toUpperCase()] || null : null,
      doctorRating: rating,
      createdAt: created,
    });

    await doc.save();
    inserted++;
  }

  console.log("Inserted", inserted, "feedback documents");
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
