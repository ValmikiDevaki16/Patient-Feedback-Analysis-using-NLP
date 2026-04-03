import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
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
  sentiment: {
    type: String,
    enum: ["Positive", "Neutral", "Negative"],
    default: "Neutral",
  },
  polarityScore: {
    type: Number,
    default: 0,
  },
  sentimentScore: {
    type: Number,
    default: 0,
    min: -1,
    max: 1,
  },
  emotion: {
    type: String,
    default: "neutral",
  },
  category: {
    type: String,
    default: "General",
    enum: [
      "Wait Time",
      "Staff Behavior",
      "Cleanliness",
      "Food Quality",
      "Medical Care",
      "Facilities",
      "Cost",
      "General",
    ],
  },
  severityScore: {
    type: Number,
    default: 5,
    min: 1,
    max: 10,
  },
  keywords: [String],
  patientName: {
    type: String,
    required: true,
  },
  patientId: {
    type: String,
    required: true,
  },
  staffId: {
    type: String,
    default: null,
  },
  staffName: {
    type: String,
    default: null,
  },
  doctorRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Feedback", feedbackSchema);
