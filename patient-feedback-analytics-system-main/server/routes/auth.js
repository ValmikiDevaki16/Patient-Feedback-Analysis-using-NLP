import express from 'express';
import { readStaffList, findStaffById, verifyPassword } from '../utils/csvStore.js';

const router = express.Router();

// Verify clerk or staff by credentials (migrated from env-based key)
router.post('/verify-clerk', async (req, res) => {
  try {
    const { key, staffId, password } = req.body;

    // Backwards-compatible: if caller still sends a key and it matches env, allow temporarily
    if (key && process.env.CLERK_SECRET && key === process.env.CLERK_SECRET) {
      return res.json({ success: true, message: 'Access granted' });
    }

    // Prefer CSV-based credentials: staffId + password
    if (staffId && password) {
      const ok = await verifyPassword(staffId, password);
      if (!ok) return res.status(401).json({ success: false, message: 'Invalid credentials' });
      const staff = await findStaffById(staffId);
      return res.json({ success: true, message: 'Access granted', staff });
    }

    return res.status(401).json({ success: false, message: 'Missing credentials' });
  } catch (err) {
    console.error('verify-clerk error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Hospital admin login: verify against Administrator entry in CSV
router.post('/hospital-login', async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, message: 'Missing password' });

    const list = await readStaffList();
    // find admin user(s)
    const admins = list.filter((s) => (s.role || '').toLowerCase() === 'administrator' || (s.role || '').toLowerCase() === 'admin');
    for (const admin of admins) {
      const ok = await verifyPassword(admin.staffId, password);
      if (ok) return res.json({ success: true, message: 'Admin authenticated', staff: { staffId: admin.staffId, name: admin.name } });
    }

    // no admin matched
    return res.status(401).json({ success: false, message: 'Invalid password' });
  } catch (err) {
    console.error('hospital-login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
