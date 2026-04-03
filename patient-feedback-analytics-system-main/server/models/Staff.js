import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  staffId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["Doctor", "Nurse", "Technician", "Administrator"],
    default: "Doctor",
  },
  department: {
    type: String,
    default: "General",
    enum: [
      "Emergency",
      "OPD",
      "IPD",
      "Surgery",
      "Pharmacy",
      "Laboratory",
      "Radiology",
      "General",
    ],
  },
  specialization: {
    type: String,
    default: "General",
  },
  email: {
    type: String,
    default: "",
  },
  phone: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default: "https://via.placeholder.com/150",
  },
  totalFeedbackCount: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  positiveCount: {
    type: Number,
    default: 0,
  },
  neutralCount: {
    type: Number,
    default: 0,
  },
  negativeCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Staff", staffSchema);
