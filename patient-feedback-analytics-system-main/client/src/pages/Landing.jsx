import { useState } from "react";
import { Activity } from "lucide-react";
import hospitalImg from "../images/hopital.jpg";

export default function Landing({ onContinue, onAdmin, onPatient, onStaff }) {
  const [showServices, setShowServices] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#041025] via-[#07173a] to-[#021423] p-6 text-slate-200">
      <div className="max-w-4xl mx-auto pt-20">
        <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
          <button
            onClick={() => onStaff && onStaff()}
            className="px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 backdrop-blur-sm text-sm text-slate-200"
          >
            Staff Login
          </button>
          <button
            onClick={() => onAdmin && onAdmin()}
            className="px-3 py-2 rounded-md bg-cyan-500 hover:bg-cyan-400 text-black text-sm font-semibold"
          >
            Admin
          </button>
        </div>

        <div className="bg-[rgba(255,255,255,0.03)] rounded-2xl shadow-xl p-6 md:p-8 border border-[rgba(255,255,255,0.04)] backdrop-blur-sm">
          <div className="md:grid md:grid-cols-2 gap-6 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-cyan-400 rounded-full shadow-lg">
                  <Activity className="w-8 h-8 text-black" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold text-cyan-300">
                    St. Aurora General Hospital
                  </h1>
                  <p className="text-slate-300">
                    Patient-centered feedback platform
                  </p>
                </div>
              </div>

              <p className="text-slate-300 mb-6">
                Welcome! Select Patient Feedback To submit feedback. Staff and administrators can login from the
                top-right.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => window.open("/explore.html", "_blank")}
                  className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 text-black rounded-md font-semibold"
                >
                  Explore Services
                </button>
                <button
                  onClick={() => onPatient && onPatient()}
                  className="px-5 py-3 bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] rounded-md text-slate-200"
                >
                  Patient Feedback
                </button>
              </div>
            </div>

            <div className="mt-6 md:mt-0">
              <img
                src={hospitalImg}
                alt="St. Aurora General Hospital"
                className="w-full h-48 md:h-56 object-cover rounded-xl shadow-md border border-[rgba(255,255,255,0.04)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Unlock modal removed — top-right Staff Login now navigates to staff login page */}
      {/* Services modal */}
      {showServices && (
        <div className="fixed inset-0 z-30 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowServices(false)}
          />
          <div className="relative z-40 w-full max-w-3xl p-6 bg-white/5 rounded-2xl backdrop-blur-md border border-white/8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-cyan-200">
                Hospital Services
              </h3>
              <button
                onClick={() => setShowServices(false)}
                className="text-sm text-white/60"
              >
                Close
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/6 rounded-lg">
                <h4 className="font-bold text-white">Emergency & Trauma</h4>
                <p className="text-sm text-white/70 mt-2">
                  24/7 emergency services with a dedicated trauma team.
                </p>
              </div>
              <div className="p-4 bg-white/6 rounded-lg">
                <h4 className="font-bold text-white">Outpatient Services</h4>
                <p className="text-sm text-white/70 mt-2">
                  Specialist consultations, diagnostics, and day procedures.
                </p>
              </div>
              <div className="p-4 bg-white/6 rounded-lg">
                <h4 className="font-bold text-white">Surgery & ICU</h4>
                <p className="text-sm text-white/70 mt-2">
                  Advanced surgical care and intensive monitoring units.
                </p>
              </div>
              <div className="p-4 bg-white/6 rounded-lg">
                <h4 className="font-bold text-white">Radiology & Lab</h4>
                <p className="text-sm text-white/70 mt-2">
                  Comprehensive imaging and laboratory diagnostics.
                </p>
              </div>
              <div className="p-4 bg-white/6 rounded-lg">
                <h4 className="font-bold text-white">Pharmacy</h4>
                <p className="text-sm text-white/70 mt-2">
                  On-site pharmacy with prescription support.
                </p>
              </div>
              <div className="p-4 bg-white/6 rounded-lg">
                <h4 className="font-bold text-white">Rehabilitation</h4>
                <p className="text-sm text-white/70 mt-2">
                  Physical and occupational therapy services.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
