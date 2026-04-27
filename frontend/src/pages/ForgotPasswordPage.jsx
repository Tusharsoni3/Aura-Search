import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { authAPI } from "../lib/api.js";

const Logo = () => (
  <div className="flex items-center justify-center gap-3 mb-8">
    <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
      <span className="text-[#0B0C11] font-bold text-lg">J</span>
    </div>
    <span className="text-[#F0F0FF] font-bold text-xl tracking-wide">
      Aura Search
    </span>
  </div>
);

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success("Reset link sent! Check your email.");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send reset link.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C11] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#15161F] rounded-2xl p-8 border border-[#23253A] shadow-2xl">
        <Logo />

        {sent ? (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                <CheckCircle size={30} className="text-indigo-400" />
              </div>
            </div>

            <h1 className="text-[#F0F0FF] text-2xl font-bold mb-3">
              Reset link sent!
            </h1>
            <p className="text-slate-400 text-sm mb-2">
              We've sent a password reset link to
            </p>
            <p className="text-indigo-400 font-medium text-sm mb-6 break-all">
              {email}
            </p>
            <p className="text-slate-500 text-xs mb-8 leading-relaxed">
              Check your inbox and follow the instructions in the email. If you
              don't see it, check your spam folder.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors flex items-center gap-1.5 mx-auto"
            >
              <ArrowLeft size={16} />
              Back to login
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                <Mail size={28} className="text-indigo-400" />
              </div>
            </div>

            <h1 className="text-[#F0F0FF] text-2xl font-bold text-center mb-2">
              Forgot password?
            </h1>
            <p className="text-slate-400 text-sm text-center mb-8">
              No worries — enter your email and we'll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-slate-400 text-sm mb-1 block">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                  className="bg-[#1A1B27] border border-[#23253A] text-[#F0F0FF] placeholder-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 rounded-xl px-4 py-3 w-full outline-none transition"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm flex items-start gap-1.5">
                  <span className="mt-0.5 shrink-0">⚠</span>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-500 hover:bg-indigo-400 text-[#0B0C11] font-semibold py-3 px-6 rounded-xl transition-all duration-200 w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <div className="flex justify-center mt-6">
              <button
                onClick={() => navigate("/login")}
                className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft size={16} />
                Back to login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
