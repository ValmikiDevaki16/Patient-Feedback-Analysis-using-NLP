import express from "express";
import {
  readStaffList,
  findStaffById,
  addStaff,
  updatePassword,
  verifyPassword,
} from "../utils/csvStore.js";
import Feedback from "../models/Feedback.js";

const router = express.Router();

// Staff login - check staffId and password against CSV store
router.post("/staff-login", async (req, res) => {
  try {
    const { staffId, password } = req.body;
    if (!staffId || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const ok = await verifyPassword(staffId, password);
    if (!ok) {
      console.warn(
        `staff-login failed: invalid password for staffId=${staffId}`
      );
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const staff = await findStaffById(staffId);
    if (!staff) {
      console.warn(
        `staff-login: staffId not found after password verify: ${staffId}`
      );
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    }

    res.json({
      success: true,
      staff: {
        staffId: staff.staffId,
        name: staff.name,
        role: staff.role,
        department: staff.department,
        specialization: staff.specialization,
      },
    });
  } catch (err) {
    console.error("staff-login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get all staff members (for patient feedback dropdown)
router.get("/staff-list", async (req, res) => {
  try {
    const list = await readStaffList();
    const minimal = list.map((s) => ({
      staffId: s.staffId,
      name: s.name,
      role: s.role,
      department: s.department,
      specialization: s.specialization,
    }));
    res.json({ success: true, staff: minimal });
  } catch (err) {
    console.error("staff-list error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get single staff details
router.get("/staff/:staffId", async (req, res) => {
  try {
    const { staffId } = req.params;
    const staff = await findStaffById(staffId);
    if (!staff)
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    res.json({ success: true, staff });
  } catch (err) {
    console.error("staff/:staffId error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin: add a new staff member (expects admin auth on frontend)
router.post("/add", async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || !payload.staffId || !payload.name) {
      return res
        .status(400)
        .json({ success: false, message: "Missing staffId or name" });
    }
    // password should be provided; if not, default to staffId + 'Pass!'
    const password = payload.password || `${payload.staffId}Pass!`;
    const created = await addStaff({ ...payload, password });
    res.json({ success: true, staff: created });
  } catch (err) {
    console.error("add staff error:", err);
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
});

// Change password (staff or admin)
router.post("/change-password", async (req, res) => {
  try {
    const { staffId, oldPassword, newPassword } = req.body;
    if (!staffId || !newPassword)
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });

    // If oldPassword provided, verify it; otherwise assume admin
    if (oldPassword) {
      const ok = await verifyPassword(staffId, oldPassword);
      if (!ok)
        return res
          .status(401)
          .json({ success: false, message: "Old password incorrect" });
    }

    // For now we write plaintext newPassword into CSV (could be hashed later)
    const updated = await updatePassword(staffId, newPassword);
    res.json({
      success: true,
      staff: { staffId: updated.staffId, name: updated.name },
    });
  } catch (err) {
    console.error("change-password error:", err);
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
});

// Staff dashboard: get feedbacks for this staff
router.get("/dashboard/:staffId", async (req, res) => {
  try {
    const { staffId } = req.params;
    const feedbacks = await Feedback.find({ staffId }).sort({ createdAt: -1 });
    res.json({ success: true, feedbacks });
  } catch (err) {
    console.error("dashboard error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
