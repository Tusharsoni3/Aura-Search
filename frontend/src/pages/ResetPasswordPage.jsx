import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { authAPI } from "../lib/api.js";

const Logo = () => (
  <div className="flex items-center justify-center gap-3 mb-8">
    <div className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
      <span className="text-[#0B0C11] font-bold text-lg select-none">J</span>
    </div>
    <span className="text-[#F0F0FF] font-bold text-xl tracking-wide">
      Aura Search
    </span>
  </div>
);

const getPasswordStrength = (password) => {
  if (!password) return { label: "", level: 0, color: "", textColor: "" };
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  if (score <= 2)
    return {
      label: "Weak",
      level: 1,
      color: "bg-red-500",
      textColor: "text-red-400",
    };
  if (score <= 3)
    return {
      label: "Medium",
      level: 2,
      color: "bg-yellow-500",
      textColor: "text-yellow-400",
    };
  return {
    label: "Strong",
    level: 3,
    color: "bg-emerald-500",
    textColor: "text-emerald-400",
  };
};

const PasswordStrengthBar = ({ password }) => {
  const strength = getPasswordStrength(password);
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1.5">
        {[1, 2, 3].map((seg) => (
          <div
            key={seg}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              strength.level >= seg ? strength.color : "bg-[#23253A]"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${strength.textColor}`}>
        {strength.label}
      </p>
    </div>
  );
};

const requirements = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /\d/.test(p) },
  { label: "One special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errors = {};
    if (!form.newPassword) {
      errors.newPassword = "Password is required.";
    } else if (form.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters.";
    }
    if (!form.confirmPassword) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (form.newPassword !== form.confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
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
      await authAPI.resetPassword(token, form.newPassword);
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reset password. The link may have expired.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "bg-[#1A1B27] border text-[#F0F0FF] placeholder-slate-500 rounded-xl px-4 py-3 w-full outline-none transition pr-12 pl-11";
  const inputNormal = `${inputBase} border-[#23253A] focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30`;
  const inputError = `${inputBase} border-red-500/60 focus:border-red-400 focus:ring-1 focus:ring-red-400/20`;

  return (
    <div className="min-h-screen bg-[#0B0C11] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#15161F] rounded-2xl p-8 border border-[#23253A] shadow-2xl">
        <Logo />

        {success ? (
          /* ── Success State ── */
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                <CheckCircle size={30} className="text-indigo-400" />
              </div>
            </div>
            <h1 className="text-[#F0F0FF] text-2xl font-bold mb-3">
              Password Updated!
            </h1>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Your password has been reset successfully. You can now sign in
              with your new password.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-indigo-500 hover:bg-indigo-400 text-[#0B0C11] font-semibold py-3 px-6 rounded-xl transition-all duration-200 w-full"
            >
              Go to Login
            </button>
          </div>
        ) : (
          /* ── Form State ── */
          <>
            {/* Icon + Heading */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                <Lock size={26} className="text-indigo-400" />
              </div>
            </div>
            <h1 className="text-[#F0F0FF] text-2xl font-bold text-center mb-2">
              Set new password
            </h1>
            <p className="text-slate-400 text-sm text-center mb-8">
              Choose a strong password to secure your account.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* New Password */}
              <div>
                <label className="text-slate-400 text-sm mb-1 block">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                  <input
                    type={showNew ? "text" : "password"}
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    className={
                      fieldErrors.newPassword ? inputError : inputNormal
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 transition"
                    tabIndex={-1}
                    aria-label={showNew ? "Hide password" : "Show password"}
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <PasswordStrengthBar password={form.newPassword} />
                {fieldErrors.newPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    {fieldErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-slate-400 text-sm mb-1 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                  />
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    className={
                      fieldErrors.confirmPassword ||
                      (form.confirmPassword &&
                        form.newPassword !== form.confirmPassword)
                        ? inputError
                        : inputNormal
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 transition"
                    tabIndex={-1}
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.confirmPassword &&
                  form.newPassword !== form.confirmPassword &&
                  !fieldErrors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">
                      Passwords do not match.
                    </p>
                  )}
                {form.confirmPassword &&
                  form.newPassword === form.confirmPassword && (
                    <p className="text-emerald-400 text-xs mt-1">
                      ✓ Passwords match
                    </p>
                  )}
                {fieldErrors.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Requirements checklist */}
              {form.newPassword && (
                <ul className="space-y-1 px-1">
                  {requirements.map(({ label, test }) => {
                    const met = test(form.newPassword);
                    return (
                      <li
                        key={label}
                        className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
                          met ? "text-emerald-400" : "text-slate-500"
                        }`}
                      >
                        <span className="text-base leading-none">
                          {met ? "✓" : "·"}
                        </span>
                        {label}
                      </li>
                    );
                  })}
                </ul>
              )}

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
                className="bg-indigo-500 hover:bg-indigo-400 text-[#0B0C11] font-semibold py-3 px-6 rounded-xl transition-all duration-200 w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-lg shadow-indigo-500/20"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            {/* Back to login */}
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft size={15} />
                Back to login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
