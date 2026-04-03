// This file contains the list of 10+ doctors and hospital staff to seed into the database
// Run this in MongoDB or use a seeding script to add these staff members

const staffMembers = [
  {
    staffId: "STF001",
    name: "Dr. Rajesh Kumar",
    role: "Doctor",
    department: "Emergency",
    specialization: "Emergency Medicine",
    email: "rajesh.kumar@hospital.com",
    phone: "+91-9876543210",
    avatar: "https://i.pravatar.cc/150?img=1",
    totalFeedbackCount: 0,
    averageRating: 0,
    positiveCount: 0,
    neutralCount: 0,
    negativeCount: 0,
  },
  {
    staffId: "STF002",
    name: "Dr. Priya Singh",
    role: "Doctor",
    department: "OPD",
    specialization: "General Medicine",
    email: "priya.singh@hospital.com",
    phone: "+91-9876543211",
    avatar: "https://i.pravatar.cc/150?img=2",
    totalFeedbackCount: 0,
    averageRating: 0,
    positiveCount: 0,
    neutralCount: 0,
    negativeCount: 0,
  },
  {
    staffId: "STF003",
    name: "Dr. Amitabh Verma",
    role: "Doctor",
    department: "Surgery",
    specialization: "General Surgery",
    email: "amitabh.verma@hospital.com",
    phone: "+91-9876543212",
    avatar: "https://i.pravatar.cc/150?img=3",
    totalFeedbackCount: 0,
    averageRating: 0,
    positiveCount: 0,
    neutralCount: 0,
    negativeCount: 0,
  },
  {
    staffId: "STF004",
    name: "Dr. Neha Patel",
    role: "Doctor",
    department: "IPD",
    specialization: "Internal Medicine",
    email: "neha.patel@hospital.com",
    phone: "+91-9876543213",
    avatar: "https://i.pravatar.cc/150?img=4",
    totalFeedbackCount: 0,
    averageRating: 0,
    positiveCount: 0,
    neutralCount: 0,
    negativeCount: 0,
  },
  {
    staffId: "STF005",
    name: "Dr. Vikram Desai",
    role: "Doctor",
    department: "Radiology",
    specialization: "Diagnostic Imaging",
    email: "vikram.desai@hospital.com",
    phone: "+91-9876543214",
    avatar: "https://i.pravatar.cc/150?img=5",
    totalFeedbackCount: 0,
    averageRating: 0,
    positiveCount: 0,
    neutralCount: 0,
    negativeCount: 0,
  },
  {
    staffId: "STF006",
    name: "Sister Ananya Das",
    role: "Nurse",
    department: "Emergency",
    specialization: "Emergency Nursing",
    email: "ananya.das@hospital.com",
    phone: "+91-9876543215",
    avatar: "https://i.pravatar.cc/150?img=6",
    totalFeedbackCount: 0,
    averageRating: 0,
    positiveCount: 0,
    neutralCount: 0,
    negativeCount: 0,
  },
  {
    staffId: "STF007",
    name: "Nurse Priya Sharma",
    role: "Nurse",
    department: "IPD",
    specialization: "ICU Nursing",
    email: "priya.sharma@hospital.com",
    phone: "+91-9876543216",
    avatar: "https://i.pravatar.cc/150?img=7",
    totalFeedbackCount: 0,
    averageRating: 0,
    positiveCount: 0,
    neutralCount: 0,
    negativeCount: 0,
  },
  {
    staffId: "STF008",
    name: "Mr. Arjun Mehta",
    role: "Technician",
    department: "Laboratory",
    specialization: "Clinical Pathology",
    email: "arjun.mehta@hospital.com",
    phone: "+91-9876543217",
    avatar: "https://i.pravatar.cc/150?img=8",
    totalFeedbackCount: 0,
    averageRating: 0,
    positiveCount: 0,
    neutralCount: 0,
    negativeCount: 0,
  },
  {
    staffId: "STF009",
    name: "Ms. Ritika Gupta",
    role: "Technician",
    department: "Radiology",
    specialization: "X-Ray & Ultrasound",
    email: "ritika.gupta@hospital.com",
    phone: "+91-9876543218",
    avatar: "https://i.pravatar.cc/150?img=9",
    totalFeedbackCount: 0,
    averageRating: 0,
    positiveCount: 0,
    neutralCount: 0,
    negativeCount: 0,
  },
  {
    staffId: "STF010",
    name: "Dr. Anil Kapoor",
    role: "Doctor",
    department: "Pharmacy",
    specialization: "Clinical Pharmacy",
    email: "anil.kapoor@hospital.com",
    phone: "+91-9876543219",
    avatar: "https://i.pravatar.cc/150?img=10",
    totalFeedbackCount: 0,
    averageRating: 0,
    positiveCount: 0,
    neutralCount: 0,
    negativeCount: 0,
  },
  {
    staffId: "STF011",
    name: "Mr. Suresh Rao",
    role: "Administrator",
    department: "General",
    specialization: "Hospital Administration",
    email: "suresh.rao@hospital.com",
    phone: "+91-9876543220",
    avatar: "https://i.pravatar.cc/150?img=11",
    totalFeedbackCount: 0,
    averageRating: 0,
    positiveCount: 0,
    neutralCount: 0,
    negativeCount: 0,
  },
  {
    staffId: "STF012",
    name: "Dr. Pooja Iyer",
    role: "Doctor",
    department: "General",
    specialization: "General Practitioner",
    email: "pooja.iyer@hospital.com",
    phone: "+91-9876543221",
    avatar: "https://i.pravatar.cc/150?img=12",
    totalFeedbackCount: 0,
    averageRating: 0,
    positiveCount: 0,
    neutralCount: 0,
    negativeCount: 0,
  },
];

// SETUP INSTRUCTIONS:
// ==================
//
// 1. Connect to MongoDB with a client tool (MongoDB Compass, mongosh, etc.)
// 2. Use the database: medifeedback
// 3. Run the following command to insert the staff members:
//
// db.staffs.insertMany([...copy and paste the staffMembers array...])
//
// OR
//
// Use this command in mongosh:
// const staffMembers = [...];
// db.staffs.insertMany(staffMembers);
//
// 4. Verify with: db.staffs.find().pretty()
//
// For each staff member:
// - Staff ID: Use the staffId provided (STF001 - STF012)
// - Password: All staff members use the SAME password set in .env file as STAFF_PASSWORD
// - Default in .env: STAFF_PASSWORD=staff123
// - Each staff can login with their name and the common password
//
// ==================
//
// IMPORTANT NOTE ON PASSWORDS:
// All staff members share the SAME password defined in the .env file (STAFF_PASSWORD)
// They differentiate themselves by their staffId and name.
// This design allows for easy password management and staff login via name + common password.

module.exports = staffMembers;
