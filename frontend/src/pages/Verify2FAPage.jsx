import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
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

export default function Verify2FAPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const tempToken = location.state?.tempToken;

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (!tempToken) {
      toast.error("Session expired. Please log in again.");
      navigate("/login");
    } else {
      // Auto-focus first input on mount
      inputRefs.current[0]?.focus();
    }
  }, [tempToken, navigate]);

  const submitCode = useCallback(
    async (code) => {
      if (!tempToken || hasSubmitted.current) return;
      hasSubmitted.current = true;
      setLoading(true);
      setError("");
      try {
        await authAPI.verify2FAcode(code, tempToken);
        toast.success("Two-factor authentication verified!");
        navigate("/chat");
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Verification failed. Please try again.";
        setError(msg);
        setDigits(["", "", "", "", "", ""]);
        hasSubmitted.current = false;
        setTimeout(() => inputRefs.current[0]?.focus(), 0);
      } finally {
        setLoading(false);
      }
    },
    [tempToken, navigate],
  );

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when last digit is filled
    if (index === 5 && value) {
      const code = [...newDigits.slice(0, 5), value.slice(-1)].join("");
      if (code.length === 6 && !newDigits.slice(0, 5).includes("")) {
        submitCode(code);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      const code = digits.join("");
      if (code.length === 6 && !digits.includes("")) {
        submitCode(code);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const newDigits = Array(6).fill("");
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    setError("");
    const lastFilledIndex = Math.min(pasted.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();
    if (pasted.length === 6) {
      submitCode(pasted);
    }
  };

  const handleManualSubmit = () => {
    const code = digits.join("");
    if (code.length === 6 && !digits.includes("")) {
      submitCode(code);
    }
  };

  const code = digits.join("");
  const isComplete = code.length === 6 && !digits.includes("");

  return (
    <div className="min-h-screen bg-[#0B0C11] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#15161F] rounded-2xl p-8 border border-[#23253A] shadow-2xl">
        <Logo />

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
              <ShieldCheck size={28} className="text-indigo-400" />
            </div>
            <div className="absolute inset-0 rounded-full bg-indigo-400/10 animate-ping" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-[#F0F0FF] text-2xl font-bold text-center mb-2">
          Two-Factor Authentication
        </h1>
        <p className="text-slate-400 text-sm text-center mb-8 leading-relaxed">
          Enter the 6-digit code from your authenticator app to verify your
          identity
        </p>

        {/* OTP Digit Inputs */}
        <div className="flex gap-2 sm:gap-3 justify-center mb-6">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              disabled={loading}
              className={[
                "w-11 h-14 sm:w-12 sm:h-14",
                "bg-[#1A1B27] text-[#F0F0FF] text-xl font-bold text-center",
                "rounded-xl outline-none transition-all duration-200",
                "border",
                digit
                  ? "border-indigo-500/70 shadow-sm shadow-indigo-500/20"
                  : "border-[#23253A]",
                "focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "caret-indigo-400",
              ].join(" ")}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-5">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleManualSubmit}
          disabled={!isComplete || loading}
          className="bg-indigo-500 hover:bg-indigo-400 text-[#0B0C11] font-semibold py-3 px-6 rounded-xl transition-all duration-200 w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mb-4 shadow-lg shadow-indigo-500/20"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <span>Verify Code</span>
          )}
        </button>

        {/* Back to login */}
        <button
          onClick={() => navigate("/login")}
          disabled={loading}
          className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors duration-200 flex items-center gap-1.5 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={15} />
          Back to login
        </button>
      </div>
    </div>
  );
}
