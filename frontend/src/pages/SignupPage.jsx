import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, User, Mail, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

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
  if (!password) return { label: "", level: 0 };
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

// ─── Strict Email Validator ──────────────────────────────────────────────────
const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const DISPOSABLE_DOMAINS = [
  "tempmail.com",
  "guerrillamail.com",
  "mailinator.com",
  "10minutemail.com",
  "throwaway.email",
  "temp-mail.org",
  "yopmail.com",
  "trashmail.com",
  "fakeinbox.com",
  "maildrop.cc",
  "spam4.me",
  "temp-mail.io",
];

const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length > 254 || trimmed.length < 5) return false;
  if (!STRICT_EMAIL_REGEX.test(trimmed)) return false;
  const domain = trimmed.split("@")[1].toLowerCase();
  if (DISPOSABLE_DOMAINS.includes(domain)) return false;
  return true;
};

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [emailValid, setEmailValid] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));

    // Live email validation while typing
    if (name === "email") {
      const valid = isValidEmail(value);
      setEmailValid(valid);
      // If already touched show inline hint immediately
      if (emailTouched && !valid) {
        setFieldErrors((prev) => ({
          ...prev,
          email: "Please use a valid email address (not disposable).",
        }));
      } else {
        setFieldErrors((prev) => ({ ...prev, email: "" }));
      }
    }
  };

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Full name is required.";
    else if (form.name.trim().length < 2)
      errors.name = "Name must be at least 2 characters.";

    if (!form.email.trim()) errors.email = "Email is required.";
    else if (!isValidEmail(form.email))
      errors.email = "Please use a valid email address (not disposable).";

    if (!form.password) errors.password = "Password is required.";
    else if (form.password.length < 8)
      errors.password = "Password must be at least 8 characters.";

    if (!form.confirmPassword)
      errors.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      errors.confirmPassword = "Passwords do not match.";

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
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success("🎉 Welcome to Aura Search! Check your email for details.");
      navigate("/chat");
    } catch (err) {
      // Prefer structured backend validation errors when available
      const resp = err?.response?.data;
      // Clear previous field errors (we may set some below)
      let handled = false;
      if (resp) {
        // If backend returns structured field errors e.g. { errors: { email: ['...'] } }
        if (resp.errors && typeof resp.errors === "object") {
          const fieldErrs = {};
          for (const key in resp.errors) {
            const val = resp.errors[key];
            fieldErrs[key] = Array.isArray(val) ? String(val[0]) : String(val);
          }
          setFieldErrors((prev) => ({ ...prev, ...fieldErrs }));
          // If there is an email error, surface it as the primary message too
          if (fieldErrs.email) {
            setError(fieldErrs.email);
          }
          handled = true;
        } else if (typeof resp.message === "string") {
          const msg = resp.message;
          // If backend message mentions email specifically, show it as email field error
          if (msg.toLowerCase().includes("email")) {
            setFieldErrors((prev) => ({ ...prev, email: msg }));
            setError(msg);
          } else {
            // Generic message from backend
            setError(msg);
          }
          handled = true;
        }
      }
      if (!handled) {
        // Fallback to network / unexpected errors
        const fallback = err?.message || "Signup failed. Please try again.";
        setError(fallback);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "bg-[#1A1B27] border border-[#23253A] text-[#F0F0FF] placeholder-slate-500 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 rounded-xl px-4 py-3 w-full outline-none transition pl-11";
  const inputErrorClass =
    "bg-[#1A1B27] border border-red-500/60 text-[#F0F0FF] placeholder-slate-500 focus:border-red-400 focus:ring-1 focus:ring-red-400/20 rounded-xl px-4 py-3 w-full outline-none transition pl-11";

  return (
    <div className="min-h-screen bg-[#0B0C11] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#15161F] rounded-2xl p-8 border border-[#23253A] shadow-2xl">
        <Logo />

        <h1 className="text-[#F0F0FF] text-2xl font-bold text-center mb-1">
          Create your account
        </h1>
        <p className="text-slate-400 text-sm text-center mb-8">
          Start your Aura Search journey today
        </p>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Full Name */}
          <div>
            <label className="text-slate-400 text-sm mb-1 block">
              Full Name
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                autoComplete="name"
                className={fieldErrors.name ? inputErrorClass : inputClass}
              />
            </div>
            {fieldErrors.name && (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-slate-400 text-sm mb-1 block">Email</label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={() => {
                  setEmailTouched(true);
                  const valid = isValidEmail(form.email);
                  setEmailValid(valid);
                  setFieldErrors((prev) => ({
                    ...prev,
                    email: valid
                      ? ""
                      : "Please use a valid email address (not disposable).",
                  }));
                }}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={!emailValid && emailTouched}
                className={`${fieldErrors.email ? inputErrorClass : inputClass} ${emailValid ? "ring-1 ring-emerald-500/30" : ""}`}
              />
            </div>
            {fieldErrors.email ? (
              <p className="text-red-400 text-xs mt-1">{fieldErrors.email}</p>
            ) : emailTouched && !emailValid ? (
              <p className="text-red-400 text-xs mt-1">
                Please use a valid email address (not disposable).
              </p>
            ) : null}
          </div>

          {/* Password */}
          <div>
            <label className="text-slate-400 text-sm mb-1 block">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                className={`${fieldErrors.password ? inputErrorClass : inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-400 transition"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <PasswordStrengthBar password={form.password} />
            {fieldErrors.password && (
              <p className="text-red-400 text-xs mt-1">
                {fieldErrors.password}
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
                className={`${
                  fieldErrors.confirmPassword ||
                  (form.confirmPassword &&
                    form.password !== form.confirmPassword)
                    ? inputErrorClass
                    : inputClass
                } pr-12`}
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
              form.password !== form.confirmPassword &&
              !fieldErrors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  Passwords do not match.
                </p>
              )}
            {fieldErrors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* Global Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !emailValid}
            aria-disabled={loading || !emailValid}
            title={!emailValid ? "Enter a valid email to register" : undefined}
            className={`bg-indigo-500 hover:bg-indigo-400 text-[#0B0C11] font-semibold py-3 px-6 rounded-xl transition-all duration-200 w-full flex items-center justify-center gap-2 ${loading || !emailValid ? "opacity-50 cursor-not-allowed" : ""} mt-2`}
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-slate-400 text-sm text-center mt-6">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-indigo-400 hover:text-indigo-300 transition font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
