import { useState } from "react";
import { ArrowLeft, LogIn } from "lucide-react";

export default function StaffLogin({ onBack, onLogin }) {
  const [staffId, setStaffId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/staff/staff-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staffId, password }),
        }
      );

      const data = await response.json();

      if (data.success) {
        onLogin(data.staff);
      } else {
        setError(data.message || "Authentication failed");
      }
    } catch (err) {
      setError("Failed to connect to server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#041025] via-[#07173a] to-[#021423] p-6 text-slate-200">
      <div className="max-w-md mx-auto pt-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Role Selection
        </button>

        <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl shadow-xl p-8 border border-[rgba(255,255,255,0.04)] backdrop-blur-sm">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl">
              <LogIn className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-green-300 mb-2 text-center">
            Staff Portal
          </h1>
          <p className="text-slate-300 mb-8 text-center">
            Login to view your feedback and analytics
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Staff ID
              </label>
              <input
                type="text"
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder="Enter your staff ID (e.g., STF001)"
                className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-[rgba(255,255,255,0.05)] border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-green-400 focus:ring-2 focus:ring-green-400/20 transition-all"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !staffId || !password}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-8 p-4 bg-slate-900/30 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-400 text-center">
              💡 <strong>Note:</strong> Staff login checks IDs and passwords
              against the CSV store at <code>server/storage/staff.csv</code>.
              Use the Staff ID and its corresponding password listed there.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
