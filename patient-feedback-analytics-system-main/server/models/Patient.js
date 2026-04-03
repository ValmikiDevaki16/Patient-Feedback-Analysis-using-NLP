import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  patientId: {
    type: String,
    required: true,
    unique: true,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Patient", patientSchema);
