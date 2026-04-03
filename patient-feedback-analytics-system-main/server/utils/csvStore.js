import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

// Resolve storage directory relative to this module file so behavior is
// consistent regardless of the process working directory used to start
// the server (was previously using `path.resolve('./server/storage')`).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORAGE_DIR = path.resolve(__dirname, "..", "storage");
const USERS_CSV = path.join(STORAGE_DIR, "users.csv");
const FEEDBACKS_CSV = path.join(STORAGE_DIR, "feedbacks.csv");
const PATIENTS_CSV = path.join(STORAGE_DIR, "patients.csv");

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const obj = {};
    headers.forEach((h, i) => (obj[h] = (cols[i] || "").trim()));
    return obj;
  });
}

function toCsv(rows) {
  if (!rows || rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  rows.forEach((r) => {
    lines.push(headers.map((h) => r[h] || "").join(","));
  });
  return lines.join("\n");
}

export async function ensureStorage() {
  try {
    await fs.mkdir(STORAGE_DIR, { recursive: true });
    try {
      await fs.access(USERS_CSV);
    } catch (e) {
      // create empty with header
      const header = [
        "staffId",
        "name",
        "role",
        "department",
        "specialization",
        "email",
        "phone",
        "avatar",
        "password",
        "createdAt",
        "updatedAt",
      ].join(",");
      await fs.writeFile(USERS_CSV, header + "\n", "utf8");
    }
    // Ensure feedbacks.csv exists
    try {
      await fs.access(FEEDBACKS_CSV);
    } catch (e) {
      const feedbackHeader = [
        "id",
        "text",
        "patientName",
        "patientId",
        "department",
        "staffId",
        "staffName",
        "sentiment",
        "polarityScore",
        "sentimentScore",
        "emotion",
        "category",
        "severityScore",
        "keywords",
        "doctorRating",
        "createdAt",
        "updatedAt",
      ].join(",");
      await fs.writeFile(FEEDBACKS_CSV, feedbackHeader + "\n", "utf8");
    }
    // Ensure patients.csv exists
    try {
      await fs.access(PATIENTS_CSV);
    } catch (e) {
      const patientHeader = [
        "patientId",
        "name",
        "department",
        "email",
        "phone",
        "createdAt",
        "updatedAt",
      ].join(",");
      await fs.writeFile(PATIENTS_CSV, patientHeader + "\n", "utf8");
    }
  } catch (err) {
    throw err;
  }
}

export async function readStaffList() {
  await ensureStorage();
  const text = await fs.readFile(USERS_CSV, "utf8");
  return parseCsv(text);
}

export async function writeStaffList(list) {
  await ensureStorage();
  const csv = toCsv(list);
  await fs.writeFile(USERS_CSV, csv + "\n", "utf8");
}

export async function findStaffById(staffId) {
  const list = await readStaffList();
  if (!staffId) return null;
  const target = staffId.toString().trim().toLowerCase();
  return (
    list.find(
      (s) => (s.staffId || "").toString().trim().toLowerCase() === target
    ) || null
  );
}

export async function addStaff(staffObj) {
  const list = await readStaffList();
  if (list.find((s) => s.staffId === staffObj.staffId)) {
    throw new Error("Staff with this ID already exists");
  }
  const timestamp = new Date().toISOString();
  // hash password when adding
  const pw = staffObj.password || "";
  const hashed = pw && pw.length > 0 ? bcrypt.hashSync(pw, 8) : "";
  const item = {
    staffId: staffObj.staffId,
    name: staffObj.name || "",
    role: staffObj.role || "Doctor",
    department: staffObj.department || "General",
    specialization: staffObj.specialization || "General",
    email: staffObj.email || "",
    phone: staffObj.phone || "",
    avatar: staffObj.avatar || "",
    password: hashed,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  list.push(item);
  await writeStaffList(list);
  return item;
}

export async function updatePassword(staffId, newPassword) {
  const list = await readStaffList();
  const idx = list.findIndex((s) => s.staffId === staffId);
  if (idx === -1) throw new Error("Staff not found");
  // hash new password before storing
  list[idx].password = newPassword ? bcrypt.hashSync(newPassword, 8) : "";
  list[idx].updatedAt = new Date().toISOString();
  await writeStaffList(list);
  return list[idx];
}

export async function verifyPassword(staffId, password) {
  const staff = await findStaffById(staffId);
  if (!staff) return false;
  // stored password may be plaintext or hashed
  const stored = staff.password || "";
  if (stored.startsWith("$2a$") || stored.startsWith("$2b$")) {
    return bcrypt.compareSync(password, stored);
  }
  return stored === password;
}

// ========== FEEDBACK CSV FUNCTIONS ==========

export async function readFeedbackList() {
  await ensureStorage();
  const text = await fs.readFile(FEEDBACKS_CSV, "utf8");
  return parseCsv(text);
}

export async function writeFeedbackList(list) {
  await ensureStorage();
  const csv = toCsv(list);
  await fs.writeFile(FEEDBACKS_CSV, csv + "\n", "utf8");
}

export async function addFeedback(feedbackObj) {
  const list = await readFeedbackList();
  const timestamp = new Date().toISOString();
  const id = `FB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const item = {
    id,
    text: feedbackObj.text || "",
    patientName: feedbackObj.patientName || "",
    patientId: feedbackObj.patientId || "",
    department: feedbackObj.department || "General",
    staffId: feedbackObj.staffId || "",
    staffName: feedbackObj.staffName || "",
    sentiment: feedbackObj.sentiment || "Neutral",
    polarityScore: feedbackObj.polarityScore ?? 0,
    sentimentScore: feedbackObj.sentimentScore ?? 0,
    emotion: feedbackObj.emotion || "neutral",
    category: feedbackObj.category || "General",
    severityScore: feedbackObj.severityScore ?? 5,
    keywords: (feedbackObj.keywords || []).join("|"),
    doctorRating: feedbackObj.doctorRating ?? 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  list.push(item);
  await writeFeedbackList(list);
  return item;
}

export async function deleteFeedbackById(id) {
  const list = await readFeedbackList();
  const filtered = list.filter((f) => f.id !== id);
  await writeFeedbackList(filtered);
}

export async function deleteAllFeedbacks() {
  const header = [
    "id",
    "text",
    "patientName",
    "patientId",
    "department",
    "staffId",
    "staffName",
    "sentiment",
    "polarityScore",
    "sentimentScore",
    "emotion",
    "category",
    "severityScore",
    "keywords",
    "doctorRating",
    "createdAt",
    "updatedAt",
  ].join(",");
  await fs.writeFile(FEEDBACKS_CSV, header + "\n", "utf8");
}

// ========== PATIENT CSV FUNCTIONS ==========

export async function readPatientList() {
  await ensureStorage();
  const text = await fs.readFile(PATIENTS_CSV, "utf8");
  return parseCsv(text);
}

export async function writePatientList(list) {
  await ensureStorage();
  const csv = toCsv(list);
  await fs.writeFile(PATIENTS_CSV, csv + "\n", "utf8");
}

export async function findPatientById(patientId) {
  const list = await readPatientList();
  if (!patientId) return null;
  const target = patientId.toString().trim().toLowerCase();
  return (
    list.find(
      (p) => (p.patientId || "").toString().trim().toLowerCase() === target
    ) || null
  );
}

export async function addPatient(patientObj) {
  const list = await readPatientList();
  if (list.find((p) => p.patientId === patientObj.patientId)) {
    return list.find((p) => p.patientId === patientObj.patientId);
  }
  const timestamp = new Date().toISOString();
  const item = {
    patientId: patientObj.patientId || `P_${Date.now()}`,
    name: patientObj.name || "",
    department: patientObj.department || "General",
    email: patientObj.email || "",
    phone: patientObj.phone || "",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  list.push(item);
  await writePatientList(list);
  return item;
}
