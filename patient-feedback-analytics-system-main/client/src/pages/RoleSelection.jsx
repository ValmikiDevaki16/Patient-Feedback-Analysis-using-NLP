import { Heart, BarChart3, Users } from "lucide-react";

export default function RoleSelection({ onSelectRole }) {
  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center relative overflow-hidden text-white">
      {/* Background image like landing */}
      <div
        className="absolute inset-0 bg-cover bg-center filter brightness-60"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1582719478250-4a0c3d5f6b2f?q=80&w=1600&auto=format&fit=crop&ixlib=rb-4.0.3&s=2f2f2f3f6f3f')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/60" />
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      <div className="relative z-10 w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-2xl shadow-cyan-500/50">
              <Heart className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg">
                MediFeedback
              </h1>
              <p className="text-lg font-semibold text-transparent bg-gradient-to-r from-cyan-300 to-pink-300 bg-clip-text mt-1">
                Hospital Feedback Management
              </p>
            </div>
          </div>
          <p className="text-xl text-purple-300 font-medium mb-2">
            Welcome to Your Hospital Experience
          </p>
          <p className="text-purple-400">Select your role to get started</p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative z-10">
          {/* Patient Card */}
          <button
            onClick={() => onSelectRole("patient")}
            className="group relative p-8 bg-gradient-to-br from-blue-900/50 to-cyan-900/50 rounded-3xl border-2 border-cyan-400 hover:border-pink-400 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/50 cursor-pointer backdrop-blur-sm transform hover:scale-105 hover:-translate-y-2"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="p-6 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl shadow-lg shadow-cyan-400/50 group-hover:shadow-pink-500/50 transition-all">
                  <Heart className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text mb-3">
                Patient Portal
              </h2>
              <p className="text-purple-300 mb-6 text-lg font-medium">
                Share your valuable feedback about your hospital experience
              </p>
              <div className="flex items-center justify-center gap-2 text-cyan-400 group-hover:text-pink-400 transition-colors font-semibold">
                <span>Get Started</span>
                <span className="group-hover:translate-x-2 transition-transform">
                  →
                </span>
              </div>
            </div>

            {/* Border glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/0 via-cyan-400/50 to-pink-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </button>

          {/* Staff Card */}
          <button
            onClick={() => onSelectRole("staff")}
            className="group relative p-8 bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-3xl border-2 border-green-400 hover:border-yellow-400 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/50 cursor-pointer backdrop-blur-sm transform hover:scale-105 hover:-translate-y-2"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="p-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl shadow-lg shadow-green-400/50 group-hover:shadow-yellow-500/50 transition-all">
                  <Users className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text mb-3">
                Staff Portal
              </h2>
              <p className="text-purple-300 mb-6 text-lg font-medium">
                View your feedback and performance analytics
              </p>
              <div className="flex items-center justify-center gap-2 text-green-400 group-hover:text-yellow-400 transition-colors font-semibold">
                <span>Login</span>
                <span className="group-hover:translate-x-2 transition-transform">
                  →
                </span>
              </div>
            </div>

            {/* Border glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-green-500/0 via-green-400/50 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </button>

          {/* Admin Card */}
          <button
            onClick={() => onSelectRole("admin")}
            className="group relative p-8 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-3xl border-2 border-pink-400 hover:border-cyan-400 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/50 cursor-pointer backdrop-blur-sm transform hover:scale-105 hover:-translate-y-2"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="p-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl shadow-lg shadow-pink-400/50 group-hover:shadow-cyan-500/50 transition-all">
                  <BarChart3 className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text mb-3">
                Admin Dashboard
              </h2>
              <p className="text-purple-300 mb-6 text-lg font-medium">
                View analytics and top performing doctors
              </p>
              <div className="flex items-center justify-center gap-2 text-pink-400 group-hover:text-cyan-400 transition-colors font-semibold">
                <span>View Analytics</span>
                <span className="group-hover:translate-x-2 transition-transform">
                  →
                </span>
              </div>
            </div>

            {/* Border glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-pink-500/0 via-pink-400/50 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center relative z-10">
          <p className="text-cyan-200 text-sm">
            💙 Dedicated to improving patient care through your feedback 💙
          </p>
        </div>
      </div>
    </div>
  );
}
