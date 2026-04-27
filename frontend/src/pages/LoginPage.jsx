import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

const Logo = () => (
  <div className="flex items-center justify-center gap-3 mb-8">
    <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
      <span className="text-[#0B0C11] font-bold text-lg select-none">J</span>
    </div>
    <span className="text-[#F0F0FF] font-bold text-xl tracking-wide">
      Aura Search
    </span>
  </div>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!form.password) {
      errors.password = "Password is required.";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      // AuthContext.login returns { response: axiosResponse, user: fetchedUser | null }
      const result = await login({
        email: form.email.trim(),
        password: form.password,
      });

      const responseData = result?.response?.data;

      // Handle 2FA requirement — backend returns { tempToken, message } (no cookie set)
      if (responseData?.tempToken) {
        navigate("/verify-2fa", {
          state: { tempToken: responseData.tempToken },
        });
        return;
      }

      toast.success("Welcome back!");
      navigate("/chat");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please try again.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const baseInput =
    "bg-[#1A1B27] border text-[#F0F0FF] placeholder-slate-500 rounded-xl px-4 py-3 w-full outline-none transition-all duration-200 pl-11";
  const normalBorder =
    "border-[#23253A] focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30";
  const errorBorder =
    "border-red-500/60 focus:border-red-400 focus:ring-1 focus:ring-red-400/20";

  return (
    <div className="min-h-screen bg-[#0B0C11] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#15161F] rounded-2xl p-8 border border-[#23253A] shadow-2xl">
        <Logo />

        <h1 className="text-[#F0F0FF] text-2xl font-bold text-center mb-1">
          Welcome back
        </h1>
        <p className="text-slate-400 text-sm text-center mb-8">
          Sign in to your Aura Search account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="text-slate-400 text-sm mb-1 block"
            >
              Email address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={loading}
                className={`${baseInput} ${fieldErrors.email ? errorBorder : normalBorder}`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="text-slate-400 text-sm">
                Password
              </label>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-indigo-400 hover:text-indigo-300 text-xs transition-colors duration-200"
                tabIndex={-1}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                className={`${baseInput} ${fieldErrors.password ? errorBorder : normalBorder} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 transition-colors duration-200 p-1"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-red-400 text-xs mt-1">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Global error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-500 hover:bg-indigo-400 text-[#0B0C11] font-semibold py-3 px-6 rounded-xl transition-all duration-200 w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 mt-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#23253A]" />
          <span className="text-slate-600 text-xs">New to Aura Search?</span>
          <div className="flex-1 h-px bg-[#23253A]" />
        </div>

        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="w-full py-3 px-6 rounded-xl border border-[#23253A] bg-[#1A1B27] text-[#F0F0FF] text-sm font-medium hover:border-indigo-500/40 hover:text-indigo-400 transition-all duration-200"
        >
          Create an account
        </button>
      </div>
    </div>
  );
}
