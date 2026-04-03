import { useState, useEffect } from "react";
import {
  ArrowLeft,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  Download,
} from "lucide-react";
import { adminAPI, feedbackAPI } from "../services/api";
import AnalyticsCharts from "../components/AnalyticsCharts";
import DepartmentAnalytics from "../components/DepartmentAnalytics";
import AdminChatbot from "../components/AdminChatbot";

export default function AdminDashboard({ onBack }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  // New state for doctors and feedback
  const [tab, setTab] = useState("analytics");
  const [doctors, setDoctors] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [doctorForm, setDoctorForm] = useState({
    staffId: "",
    name: "",
    department: "",
    specialization: "General",
    email: "",
    phone: "",
    password: "",
  });
  const [doctorAddLoading, setDoctorAddLoading] = useState(false);
  const [doctorAddError, setDoctorAddError] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [improvementsSummary, setImprovementsSummary] = useState(null);
  const [improvementsLoading, setImprovementsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/hospital-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setAuthenticated(true);
        fetchStats();
      } else {
        setError("Invalid password");
      }
    } catch (err) {
      setError("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setError("");
    setStatsLoading(true);
    try {
      const response = await adminAPI.getOverview();
      setStats(response.data.stats || null);
      setLastUpdated(new Date());

      // Fetch top doctors from storage
      try {
        const docResponse = await adminAPI.getTopDoctors();
        if (docResponse.data.topDoctors) {
          setTopDoctors(docResponse.data.topDoctors);
        }
      } catch (docErr) {
        console.warn("Could not fetch top doctors:", docErr.message);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to fetch stats. Check server.");
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch all doctors (placeholder, needs API)
  const fetchDoctors = async () => {
    try {
      // Replace with actual API call
      const res = await fetch("http://localhost:5000/api/admin/doctors");
      const data = await res.json();
      setDoctors(data.doctors || []);
    } catch (err) {
      setDoctors([]);
    }
  };

  // Fetch feedbacks using client API wrapper
  const fetchFeedbacks = async () => {
    setFeedbackLoading(true);
    try {
      const res = await feedbackAPI.getAll();
      setFeedbacks(res.data.feedbacks || []);
    } catch (err) {
      console.error("Error fetching feedbacks:", err);
      setFeedbacks([]);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Add doctor handler
  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setDoctorAddError("");
    setDoctorAddLoading(true);
    try {
      // Replace with actual API call
      const res = await fetch("http://localhost:5000/api/admin/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(doctorForm),
      });
      const data = await res.json();
      if (data.success) {
        setDoctorForm({
          staffId: "",
          name: "",
          department: "",
          specialization: "General",
          email: "",
          phone: "",
          password: "",
        });
        fetchDoctors();
      } else {
        setDoctorAddError(data.message || "Failed to add doctor");
      }
    } catch (err) {
      setDoctorAddError("Failed to add doctor");
    } finally {
      setDoctorAddLoading(false);
    }
  };

  // Clear all feedbacks
  const handleClearFeedbacks = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete all feedbacks? This cannot be undone."
      )
    ) {
      return;
    }
    setFeedbackLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/feedback/all", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setFeedbacks([]);
        fetchStats();
      } else {
        console.error("Failed to clear feedbacks:", data.message);
      }
    } catch (err) {
      console.error("Error clearing feedbacks:", err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  // Fetch improvements summary
  const fetchImprovements = async () => {
    setImprovementsLoading(true);
    try {
      const res = await adminAPI.summary();
      setImprovementsSummary(res.data);
    } catch (err) {
      console.error("Error fetching improvements:", err);
      setImprovementsSummary(null);
    } finally {
      setImprovementsLoading(false);
    }
  };

  const downloadFeedbackCSV = () => {
    if (!feedbacks.length) return;
    const headers = Object.keys(feedbacks[0]);
    const csvRows = [headers.join(",")];
    feedbacks.forEach((fb) => {
      csvRows.push(
        headers
          .map((h) => `"${(fb[h] || "").toString().replace(/"/g, '""')}"`)
          .join(",")
      );
    });
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedbacks_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (authenticated) {
      fetchStats();
      fetchDoctors();
      fetchFeedbacks();
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#041025] via-[#07173a] to-[#021423] p-6 text-slate-200">
        <div className="max-w-md mx-auto pt-20">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-300 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl shadow-xl p-8 border border-[rgba(255,255,255,0.04)] backdrop-blur-sm">
            <h1 className="text-3xl font-extrabold text-cyan-300 mb-2">
              Admin Login
            </h1>
            <p className="text-slate-300 mb-8">
              Enter admin password to access dashboard
            </p>

            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Admin Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-slate-200"
                  placeholder="Enter admin password"
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-200 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#041025] via-[#07173a] to-[#021423] p-6 text-slate-200">
      <div className="max-w-7xl mx-auto pt-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-cyan-300">
              Hospital Admin Dashboard
            </h1>
            <p className="text-slate-300">
              Real-time feedback analytics and insights
            </p>
            {lastUpdated && (
              <p className="text-xs text-slate-400 mt-1">
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAuthenticated(false);
                setStats(null);
              }}
              className="flex items-center gap-2 text-slate-300 hover:text-white px-4 py-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.03)]"
            >
              <ArrowLeft className="w-4 h-4" />
              Logout
            </button>
            <button
              onClick={fetchStats}
              disabled={statsLoading}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
            >
              {statsLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-cyan-900/40">
          <button
            className={`px-4 py-2 font-semibold rounded-t-lg ${
              tab === "analytics"
                ? "bg-cyan-900/30 text-cyan-200"
                : "text-slate-300"
            }`}
            onClick={() => setTab("analytics")}
          >
            Analytics
          </button>
          <button
            className={`px-4 py-2 font-semibold rounded-t-lg ${
              tab === "feedbacks"
                ? "bg-cyan-900/30 text-cyan-200"
                : "text-slate-300"
            }`}
            onClick={() => setTab("feedbacks")}
          >
            Feedbacks
          </button>
          <button
            className={`px-4 py-2 font-semibold rounded-t-lg ${
              tab === "improvements"
                ? "bg-cyan-900/30 text-cyan-200"
                : "text-slate-300"
            }`}
            onClick={() => {
              setTab("improvements");
              fetchImprovements();
            }}
          >
            Improvements
          </button>
          <button
            className={`px-4 py-2 font-semibold rounded-t-lg ${
              tab === "doctors"
                ? "bg-cyan-900/30 text-cyan-200"
                : "text-slate-300"
            }`}
            onClick={() => setTab("doctors")}
          >
            Doctors
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Analytics Tab */}
        {tab === "analytics" && (
          <>
            {stats ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-[rgba(255,255,255,0.03)] rounded-xl shadow-lg p-6 border border-[rgba(255,255,255,0.04)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-300 mb-1">
                          Total Feedback
                        </p>
                        <p className="text-3xl font-bold text-slate-100">
                          {stats?.totalFeedback ?? 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-900/40 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-cyan-300" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-[rgba(255,255,255,0.03)] rounded-xl shadow-lg p-6 border border-[rgba(255,255,255,0.04)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-300 mb-1">Positive</p>
                        <p className="text-3xl font-bold text-emerald-300">
                          {stats?.sentimentCounts?.Positive ?? 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-900/30 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-emerald-300" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-[rgba(255,255,255,0.03)] rounded-xl shadow-lg p-6 border border-[rgba(255,255,255,0.04)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-300 mb-1">Negative</p>
                        <p className="text-3xl font-bold text-rose-300">
                          {stats?.sentimentCounts?.Negative ?? 0}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-rose-900/30 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-rose-300" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top 3 Doctors */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-cyan-200 mb-2">
                    Top 3 Best Performing Doctors
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {topDoctors && topDoctors.length > 0
                      ? topDoctors.slice(0, 3).map((doc, idx) => (
                          <div
                            key={idx}
                            className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-800"
                          >
                            <div className="font-semibold text-cyan-100">
                              {doc.staffName}
                            </div>
                            <div className="text-slate-300 text-sm mb-2">
                              {doc.departmentName || "Department"}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Rating:</span>
                                <span className="text-emerald-300 font-bold">
                                  {doc.averageRating}/5
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">
                                  Satisfaction:
                                </span>
                                <span className="text-blue-300 font-bold">
                                  {doc.satisfactionRate}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">
                                  Feedback:
                                </span>
                                <span className="text-cyan-300 font-bold">
                                  {doc.totalFeedback}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      : [
                          {
                            staffName: "Dr. A",
                            departmentName: "Cardiology",
                            averageRating: 4.8,
                            satisfactionRate: 98,
                            totalFeedback: 45,
                          },
                          {
                            staffName: "Dr. B",
                            departmentName: "Neurology",
                            averageRating: 4.75,
                            satisfactionRate: 95,
                            totalFeedback: 38,
                          },
                          {
                            staffName: "Dr. C",
                            departmentName: "Orthopedics",
                            averageRating: 4.65,
                            satisfactionRate: 93,
                            totalFeedback: 32,
                          },
                        ].map((doc, idx) => (
                          <div
                            key={idx}
                            className="bg-cyan-900/20 rounded-lg p-4 border border-cyan-800"
                          >
                            <div className="font-semibold text-cyan-100">
                              {doc.staffName}
                            </div>
                            <div className="text-slate-300 text-sm mb-2">
                              {doc.departmentName}
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Rating:</span>
                                <span className="text-emerald-300 font-bold">
                                  {doc.averageRating}/5
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">
                                  Satisfaction:
                                </span>
                                <span className="text-blue-300 font-bold">
                                  {doc.satisfactionRate}%
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">
                                  Feedback:
                                </span>
                                <span className="text-cyan-300 font-bold">
                                  {doc.totalFeedback}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                  </div>
                </div>

                <AnalyticsCharts stats={stats} />
                <div className="mt-8">
                  <DepartmentAnalytics stats={stats} />
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-slate-400">
                No stats available. Click Refresh to load data.
              </div>
            )}
            <div className="mt-8 bg-[rgba(0,255,210,0.03)] border border-[rgba(0,255,210,0.06)] rounded-2xl p-6">
              <h3 className="font-semibold text-cyan-200 mb-2">
                AI Analyst Available
              </h3>
              <p className="text-cyan-100 text-sm">
                Use the AI chatbot in the bottom right corner to get insights.
                Try asking "How is feedback this week?" or "What should we
                improve?"
              </p>
            </div>
          </>
        )}

        {/* Feedbacks Tab */}
        {tab === "feedbacks" && (
          <div className="bg-[rgba(255,255,255,0.03)] rounded-xl shadow-lg p-6 border border-[rgba(255,255,255,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-cyan-200">
                Feedback Messages
              </h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={downloadFeedbackCSV}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
                  disabled={!feedbacks.length}
                >
                  <Download className="w-4 h-4" /> Download CSV
                </button>
                <button
                  onClick={handleClearFeedbacks}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold"
                  disabled={!feedbacks.length || feedbackLoading}
                >
                  Clear All
                </button>
              </div>
            </div>
            {feedbackLoading ? (
              <div className="text-slate-400">Loading feedbacks...</div>
            ) : feedbacks.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-cyan-900/30">
                      {Object.keys(feedbacks[0] || {}).map((h) => (
                        <th
                          key={h}
                          className="px-3 py-2 text-left text-cyan-200 font-semibold"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((fb, i) => (
                      <tr
                        key={i}
                        className="border-b border-cyan-900/20 hover:bg-cyan-900/10"
                      >
                        {Object.keys(feedbacks[0] || {}).map((h) => (
                          <td key={h} className="px-3 py-2 text-slate-100">
                            {fb[h]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-slate-400">No feedbacks found.</div>
            )}
          </div>
        )}

        {/* Doctors Tab */}
        {tab === "doctors" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[rgba(255,255,255,0.03)] rounded-xl shadow-lg p-6 border border-[rgba(255,255,255,0.04)]">
              <h2 className="text-xl font-bold text-cyan-200 mb-4">
                Add Doctor
              </h2>
              <form onSubmit={handleAddDoctor}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Staff ID
                  </label>
                  <input
                    type="text"
                    value={doctorForm.staffId}
                    onChange={(e) =>
                      setDoctorForm((f) => ({ ...f, staffId: e.target.value }))
                    }
                    className="w-full px-4 py-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-slate-200"
                    placeholder="e.g., DOC061"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={doctorForm.name}
                    onChange={(e) =>
                      setDoctorForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full px-4 py-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-slate-200"
                    placeholder="Doctor Name"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    value={doctorForm.department}
                    onChange={(e) =>
                      setDoctorForm((f) => ({
                        ...f,
                        department: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-slate-200"
                    placeholder="Department"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Specialization
                  </label>
                  <select
                    value={doctorForm.specialization}
                    onChange={(e) =>
                      setDoctorForm((f) => ({
                        ...f,
                        specialization: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-slate-200"
                  >
                    <option>General</option>
                    <option>Cardiology</option>
                    <option>Dermatology</option>
                    <option>Orthopedics</option>
                    <option>Pediatrics</option>
                    <option>Neurology</option>
                    <option>OBGYN</option>
                    <option>ENT</option>
                    <option>Ophthalmology</option>
                    <option>Laboratory</option>
                  </select>
                </div>

                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={doctorForm.email}
                      onChange={(e) =>
                        setDoctorForm((f) => ({ ...f, email: e.target.value }))
                      }
                      className="w-full px-4 py-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-slate-200"
                      placeholder="doctor@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={doctorForm.phone}
                      onChange={(e) =>
                        setDoctorForm((f) => ({ ...f, phone: e.target.value }))
                      }
                      className="w-full px-4 py-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-slate-200"
                      placeholder="9000012345"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={doctorForm.password}
                    onChange={(e) =>
                      setDoctorForm((f) => ({ ...f, password: e.target.value }))
                    }
                    className="w-full px-4 py-2 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none text-slate-200"
                    placeholder="Set a password"
                  />
                </div>
                {doctorAddError && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-800 text-red-200 rounded-lg text-sm">
                    {doctorAddError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={doctorAddLoading}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-2 rounded-lg transition disabled:opacity-50"
                >
                  {doctorAddLoading ? "Adding..." : "Add Doctor"}
                </button>
              </form>
            </div>
            <div className="bg-[rgba(255,255,255,0.03)] rounded-xl shadow-lg p-6 border border-[rgba(255,255,255,0.04)]">
              <h2 className="text-xl font-bold text-cyan-200 mb-4">
                Doctors List
              </h2>
              {doctors.length ? (
                <ul className="divide-y divide-cyan-900/20">
                  {doctors.map((doc, i) => (
                    <li key={i} className="py-2 flex flex-col">
                      <span className="font-semibold text-cyan-100">
                        {doc.name}
                      </span>
                      <span className="text-slate-300 text-sm">
                        {doc.department}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-slate-400">No doctors found.</div>
              )}
            </div>
          </div>
        )}

        {/* Improvements Tab */}
        {tab === "improvements" && (
          <div className="space-y-6">
            {improvementsLoading ? (
              <div className="text-slate-400 py-8 text-center">
                Loading improvement suggestions...
              </div>
            ) : improvementsSummary ? (
              <>
                {/* Analytics Summary Card */}
                <div className="bg-[rgba(255,255,255,0.03)] rounded-xl shadow-lg p-6 border border-[rgba(255,255,255,0.04)]">
                  <h2 className="text-2xl font-bold text-cyan-300 mb-4">
                    📊 Analytics Summary
                  </h2>
                  <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-lg p-4 mb-4 border border-cyan-900/40">
                    <p className="text-slate-100 text-lg leading-relaxed whitespace-pre-line">
                      {improvementsSummary.summary}
                    </p>
                  </div>

                  {improvementsSummary.stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-[rgba(255,255,255,0.02)] rounded-lg p-3 border border-[rgba(255,255,255,0.04)]">
                        <p className="text-slate-400 text-sm">Total Feedback</p>
                        <p className="text-2xl font-bold text-cyan-300">
                          {improvementsSummary.stats.total}
                        </p>
                      </div>
                      <div className="bg-[rgba(255,255,255,0.02)] rounded-lg p-3 border border-[rgba(255,255,255,0.04)]">
                        <p className="text-slate-400 text-sm">Positive</p>
                        <p className="text-2xl font-bold text-emerald-300">
                          {improvementsSummary.stats.positive}
                        </p>
                      </div>
                      <div className="bg-[rgba(255,255,255,0.02)] rounded-lg p-3 border border-[rgba(255,255,255,0.04)]">
                        <p className="text-slate-400 text-sm">Neutral</p>
                        <p className="text-2xl font-bold text-yellow-300">
                          {improvementsSummary.stats.neutral}
                        </p>
                      </div>
                      <div className="bg-[rgba(255,255,255,0.02)] rounded-lg p-3 border border-[rgba(255,255,255,0.04)]">
                        <p className="text-slate-400 text-sm">Negative</p>
                        <p className="text-2xl font-bold text-red-300">
                          {improvementsSummary.stats.negative}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Top Areas of Concern */}
                {improvementsSummary.stats?.topHeat &&
                  improvementsSummary.stats.topHeat.length > 0 && (
                    <div className="bg-[rgba(255,255,255,0.03)] rounded-xl shadow-lg p-6 border border-[rgba(255,255,255,0.04)]">
                      <h3 className="text-xl font-bold text-yellow-300 mb-4">
                        ⚠️ Top Areas of Concern
                      </h3>
                      <div className="space-y-3">
                        {improvementsSummary.stats.topHeat.map((area, idx) => (
                          <div
                            key={idx}
                            className="bg-red-900/20 border border-red-800/40 rounded-lg p-4 flex items-start gap-4"
                          >
                            <div className="text-2xl font-bold text-red-300 min-w-[40px]">
                              #{idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-cyan-100 mb-1">
                                {area.department} - {area.category}
                              </p>
                              <div className="flex gap-4 text-sm text-slate-300">
                                <span>
                                  Severity:{" "}
                                  <span className="text-red-300 font-bold">
                                    {area.avgSeverity}/10
                                  </span>
                                </span>
                                <span>
                                  Feedback Count:{" "}
                                  <span className="text-cyan-300 font-bold">
                                    {area.count}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* AI Improvement Suggestions */}
                {improvementsSummary.suggestions && (
                  <div className="bg-[rgba(255,255,255,0.03)] rounded-xl shadow-lg p-6 border border-[rgba(255,255,255,0.04)]">
                    <h3 className="text-xl font-bold text-emerald-300 mb-4">
                      💡 AI Improvement Suggestions
                    </h3>
                    <div className="bg-gradient-to-r from-emerald-900/20 to-green-900/20 rounded-lg p-4 border border-emerald-900/40">
                      <p className="text-slate-100 whitespace-pre-line leading-relaxed text-sm">
                        {improvementsSummary.suggestions}
                      </p>
                    </div>
                  </div>
                )}

                {!improvementsSummary.suggestions && (
                  <div className="bg-[rgba(255,255,255,0.03)] rounded-xl shadow-lg p-6 border border-[rgba(255,255,255,0.04)]">
                    <h3 className="text-xl font-bold text-slate-300 mb-4">
                      💡 Suggestions
                    </h3>
                    <p className="text-slate-400">
                      NLP service is not available. To see detailed improvement
                      suggestions, ensure the NLP microservice is running (see
                      documentation).
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-slate-400 py-8 text-center">
                No improvement data available. Click the tab to fetch data.
              </div>
            )}
          </div>
        )}
      </div>
      {/* Floating AI chatbot shown on all admin dashboard tabs */}
      <AdminChatbot />
    </div>
  );
}
