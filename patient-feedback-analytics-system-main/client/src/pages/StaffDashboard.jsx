import { useState, useEffect } from "react";
import {
  ArrowLeft,
  BarChart3,
  MessageSquare,
  TrendingUp,
  Star,
  User,
  Activity,
} from "lucide-react";

export default function StaffDashboard({ staff, onBack }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/staff-feedback/dashboard/${staff.staffId}`
      );
      const data = await response.json();

      if (data.success) {
        setDashboardData(data);
      } else {
        setError(data.message || "Failed to load dashboard");
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#041025] via-[#07173a] to-[#021423] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#041025] via-[#07173a] to-[#021423] p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="max-w-2xl mx-auto p-6 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#041025] via-[#07173a] to-[#021423] p-6 text-slate-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Role Selection
          </button>
        </div>

        {/* Profile Section */}
        <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl shadow-xl p-8 border border-[rgba(255,255,255,0.04)] backdrop-blur-sm mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="p-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-1">
                  {staff.name}
                </h1>
                <p className="text-slate-400 text-lg">
                  {staff.role} • {staff.department}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  Staff ID: {staff.staffId}
                </p>
              </div>
            </div>

            {/* Rating Badge */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                <span className="text-3xl font-bold text-yellow-400">
                  {stats.averageRating || "0"}
                </span>
              </div>
              <p className="text-slate-400 text-sm">Average Rating</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {["overview", "feedback", "analysis"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                  : "bg-[rgba(255,255,255,0.05)] text-slate-300 border border-[rgba(255,255,255,0.1)] hover:border-green-400/50"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-4">
              <StatCard
                icon={<MessageSquare className="w-6 h-6" />}
                label="Total Feedback"
                value={stats.totalFeedback || 0}
                color="blue"
              />
              <StatCard
                icon={<TrendingUp className="w-6 h-6" />}
                label="Positive"
                value={stats.positive || 0}
                color="green"
              />
              <StatCard
                icon={<Activity className="w-6 h-6" />}
                label="Neutral"
                value={stats.neutral || 0}
                color="yellow"
              />
              <StatCard
                icon={<BarChart3 className="w-6 h-6" />}
                label="Negative"
                value={stats.negative || 0}
                color="red"
              />
            </div>

            {/* Sentiment Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl p-6 border border-[rgba(255,255,255,0.04)] backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-6">
                  Sentiment Distribution
                </h3>
                <div className="space-y-3">
                  {dashboardData?.sentimentBreakdown &&
                    Object.entries(dashboardData.sentimentBreakdown).map(
                      ([sentiment, count]) => {
                        const total = stats.totalFeedback || 1;
                        const percentage = ((count / total) * 100).toFixed(1);
                        const colors = {
                          Positive: "from-green-500 to-emerald-500",
                          Neutral: "from-yellow-500 to-orange-500",
                          Negative: "from-red-500 to-pink-500",
                        };
                        return (
                          <div key={sentiment}>
                            <div className="flex justify-between mb-2">
                              <span className="text-slate-300">
                                {sentiment}
                              </span>
                              <span className="text-white font-bold">
                                {count} ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-700/50 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full bg-gradient-to-r ${
                                  colors[sentiment] || "from-slate-500"
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      }
                    )}
                </div>
              </div>

              {/* Recent Feedback Summary */}
              <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl p-6 border border-[rgba(255,255,255,0.04)] backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
                    <p className="text-slate-400 text-sm">Average Rating</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">
                      {stats.averageRating} / 5
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/30">
                    <p className="text-slate-400 text-sm">Total Feedbacks</p>
                    <p className="text-2xl font-bold text-blue-400 mt-1">
                      {stats.totalFeedback}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30">
                    <p className="text-slate-400 text-sm">Satisfaction Rate</p>
                    <p className="text-2xl font-bold text-purple-400 mt-1">
                      {stats.totalFeedback > 0
                        ? (
                            ((stats.positive || 0) /
                              (stats.totalFeedback || 1)) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === "feedback" && (
          <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl p-6 border border-[rgba(255,255,255,0.04)] backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-6">
              Recent Feedback
            </h3>

            {dashboardData?.recentFeedback &&
            dashboardData.recentFeedback.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentFeedback.map((feedback, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-green-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-slate-300 font-medium">
                          {feedback.patientName}
                        </p>
                        <p className="text-slate-500 text-sm">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          feedback.sentiment === "Positive"
                            ? "bg-green-500/20 text-green-300 border border-green-500/30"
                            : feedback.sentiment === "Neutral"
                            ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                            : "bg-red-500/20 text-red-300 border border-red-500/30"
                        }`}
                      >
                        {feedback.sentiment}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">
                      {feedback.text}
                    </p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-slate-500">
                        Category: {feedback.category}
                      </span>
                      {feedback.doctorRating > 0 && (
                        <span className="text-yellow-400 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          {feedback.doctorRating}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No feedback yet</p>
              </div>
            )}
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === "analysis" && (
          <div className="space-y-6">
            {/* Category Breakdown */}
            {dashboardData?.categoryBreakdown &&
              Object.keys(dashboardData.categoryBreakdown).length > 0 && (
                <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl p-6 border border-[rgba(255,255,255,0.04)] backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-white mb-6">
                    Feedback by Category
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(dashboardData.categoryBreakdown).map(
                      ([category, count]) => (
                        <div
                          key={category}
                          className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                        >
                          <p className="text-slate-300 text-sm mb-2">
                            {category}
                          </p>
                          <p className="text-2xl font-bold text-green-400">
                            {count}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Top Keywords */}
            {dashboardData?.topKeywords &&
              dashboardData.topKeywords.length > 0 && (
                <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl p-6 border border-[rgba(255,255,255,0.04)] backdrop-blur-sm">
                  <h3 className="text-lg font-bold text-white mb-6">
                    Top Keywords Mentioned
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {dashboardData.topKeywords.map((item, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full"
                      >
                        <span className="text-green-300 font-medium">
                          {item.keyword}
                        </span>
                        <span className="text-green-400 text-xs ml-2">
                          ({item.count})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: "from-blue-500/10 to-cyan-500/10 border-blue-500/30 text-blue-400",
    green:
      "from-green-500/10 to-emerald-500/10 border-green-500/30 text-green-400",
    yellow:
      "from-yellow-500/10 to-orange-500/10 border-yellow-500/30 text-yellow-400",
    red: "from-red-500/10 to-pink-500/10 border-red-500/30 text-red-400",
  };

  return (
    <div
      className={`p-6 bg-gradient-to-br ${colorClasses[color]} rounded-xl border backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-slate-900/50 rounded-lg">{icon}</div>
      </div>
      <p className="text-slate-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}
