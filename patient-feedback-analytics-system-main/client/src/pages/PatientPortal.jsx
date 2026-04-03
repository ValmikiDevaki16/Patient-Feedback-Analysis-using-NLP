import { useState, useEffect } from "react";
import { Send, CheckCircle, ArrowLeft, Star, Activity } from "lucide-react";
import hospitalImg from "../images/hopital.jpg";
import { feedbackAPI } from "../services/api";
import PatientChatbot from "../components/PatientChatbot";

export default function PatientPortal({ onBack }) {
  const [step, setStep] = useState("login");
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [department, setDepartment] = useState("General");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [doctorRating, setDoctorRating] = useState(0);

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

  useEffect(() => {
    if (step === "feedback") {
      fetchStaffList();
    }
  }, [step]);

  const fetchStaffList = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/staff/staff-list"
      );
      const data = await response.json();
      if (data.success) {
        setStaffList(data.staff || []);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (patientName && patientId) {
      setStep("feedback");
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedStaffMember = staffList.find(
        (s) => s.staffId === selectedStaff
      );
      await feedbackAPI.submit({
        text: feedback,
        patientName,
        patientId,
        department,
        staffId: selectedStaff,
        staffName: selectedStaffMember?.name || null,
        doctorRating,
      });
      setSubmitted(true);
      setFeedback("");
      setSelectedStaff("");
      setDoctorRating(0);
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      alert("Error submitting feedback. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "login") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#041025] via-[#07173a] to-[#021423] p-6 text-slate-200">
        <div className="max-w-md mx-auto pt-20">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl shadow-xl p-8 md:p-8 border border-[rgba(255,255,255,0.04)] backdrop-blur-sm">
            <div className="flex items-center justify-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-cyan-400 rounded-full shadow-lg">
                <Activity className="w-8 h-8 text-black" />
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-cyan-300 mb-2 text-center">
              Patient Login
            </h1>
            <p className="text-slate-300 mb-6 text-center">
              Enter your details to continue
            </p>

            <form onSubmit={handleLogin}>
              <div className="mb-5">
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-300 mb-2">
                  Patient ID
                </label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
                  placeholder="Enter your patient ID"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all shadow-lg"
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#041025] via-[#07173a] to-[#021423] p-6 text-slate-200">
      <div className="max-w-4xl mx-auto pt-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              Patient Portal
            </h1>
            <p className="text-slate-300 font-medium">Welcome, {patientName}</p>
          </div>
          <button
            onClick={() => setStep("login")}
            className="flex items-center gap-2 text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-all font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Logout
          </button>
        </div>

        <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl shadow-xl p-6 md:p-8 border border-[rgba(255,255,255,0.04)] backdrop-blur-sm md:grid md:grid-cols-2 gap-6 items-start">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-6">
              Share Your Feedback
            </h2>

            {submitted && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-400/50 rounded-xl flex items-center gap-3 text-green-300">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">
                  Thank you! Your feedback has been submitted successfully.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmitFeedback}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-pink-300 mb-2">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 border border-pink-400/50 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none bg-slate-700/50 text-white transition-all"
                >
                  {departments.map((dept) => (
                    <option
                      key={dept}
                      value={dept}
                      className="bg-slate-700 text-white"
                    >
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-pink-300 mb-2">
                  Staff Member (Doctor/Nurse/Technician)
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full px-4 py-3 border border-pink-400/50 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none bg-slate-700/50 text-white transition-all"
                >
                  <option value="">-- Select a staff member --</option>
                  {staffList.map((staff) => (
                    <option
                      key={staff.staffId}
                      value={staff.staffId}
                      className="bg-slate-700 text-white"
                    >
                      {staff.name} ({staff.role} - {staff.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-pink-300 mb-2">
                  Rate this Staff Member (optional)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setDoctorRating(star)}
                      className="transition-all hover:scale-125"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= doctorRating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-500"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-pink-300 mb-2">
                  Your Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-3 border border-pink-400/50 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none resize-none bg-slate-700/50 text-white placeholder-purple-400 transition-all"
                  rows="6"
                  placeholder="Tell us about your experience with this staff member..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all transform hover:scale-105 disabled:opacity-50 shadow-lg shadow-pink-500/50 hover:shadow-cyan-500/50 flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                {loading ? "Submitting..." : "Submit Feedback"}
              </button>
            </form>
          </div>

          <div className="mt-6 md:mt-0">
            <img
              src={hospitalImg}
              alt="Hospital"
              className="w-full h-48 md:h-full object-cover rounded-xl shadow-md border border-[rgba(255,255,255,0.04)]"
            />
          </div>
        </div>

        <div className="mt-8 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.03)] rounded-2xl p-6 backdrop-blur-md">
          <h3 className="font-bold text-slate-300 mb-2">💬 Need Help?</h3>
          <p className="text-slate-300 text-sm">
            Use AI chatbot for instant answers to common questions about visiting hours, facilities, and more!
          </p>
        </div>
      </div>

      <PatientChatbot patientName={patientName} patientId={patientId} />
    </div>
  );
}
