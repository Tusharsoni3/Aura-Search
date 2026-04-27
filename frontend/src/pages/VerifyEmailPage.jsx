import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Loader2, RotateCcw, ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

const OTP_LENGTH = 6;

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

export default function VerifyEmailPage() {
  const navigate = useNavigate();

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const inputRefs = useRef([]);
  const hasSubmitted = useRef(false);

  // Auto-focus first box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const submitOtp = useCallback(
    async (code) => {
      if (hasSubmitted.current) return;
      hasSubmitted.current = true;
      setLoading(true);
      setError("");
      try {
        await authAPI.verify(code);
        toast.success("Email verified successfully!");
        navigate("/chat", { replace: true });
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Invalid or expired code. Please try again.";
        setError(msg);
        setDigits(Array(OTP_LENGTH).fill(""));
        hasSubmitted.current = false;
        setTimeout(() => inputRefs.current[0]?.focus(), 0);
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const char = value.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError("");

    if (char && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when last digit filled
    if (index === OTP_LENGTH - 1 && char) {
      const code = [...newDigits.slice(0, OTP_LENGTH - 1), char].join("");
      if (
        code.length === OTP_LENGTH &&
        !newDigits.slice(0, OTP_LENGTH - 1).includes("")
      ) {
        submitOtp(code);
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
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === "Enter") {
      const code = digits.join("");
      if (code.length === OTP_LENGTH && !digits.includes("")) {
        submitOtp(code);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newDigits = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    setError("");
    const lastIndex = Math.min(pasted.length - 1, OTP_LENGTH - 1);
    inputRefs.current[lastIndex]?.focus();
    if (pasted.length === OTP_LENGTH) {
      submitOtp(pasted);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length === OTP_LENGTH && !digits.includes("")) {
      submitOtp(code);
    }
  };

  const handleResend = () => {
    if (countdown > 0 || resending) return;
    // The backend sends the OTP during login/signup — instruct the user to
    // re-login if they need a fresh code. There is no dedicated resend endpoint.
    toast("To receive a new code, please log in again.", { icon: "📧" });
    setCountdown(60);
    setDigits(Array(OTP_LENGTH).fill(""));
    hasSubmitted.current = false;
    setTimeout(() => inputRefs.current[0]?.focus(), 0);
  };

  const isComplete = digits.every((d) => d !== "");

  return (
    <div className="min-h-screen bg-[#0B0C11] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#15161F] rounded-2xl p-8 border border-[#23253A] shadow-2xl">
        <Logo />

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
            <Mail size={28} className="text-indigo-400" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-[#F0F0FF] text-2xl font-bold text-center mb-2">
          Check your email
        </h1>
        <p className="text-slate-400 text-sm text-center mb-8 leading-relaxed">
          Enter the 6-digit code sent to your inbox to verify your account
        </p>

        <form onSubmit={handleManualSubmit}>
          {/* OTP Digit Inputs */}
          <div
            className="flex gap-2 sm:gap-3 justify-center mb-6"
            onPaste={handlePaste}
          >
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
                onFocus={(e) => e.target.select()}
                disabled={loading}
                aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
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

          {/* Verify Button */}
          <button
            type="submit"
            disabled={!isComplete || loading}
            className="bg-indigo-500 hover:bg-indigo-400 text-[#0B0C11] font-semibold py-3 px-6 rounded-xl transition-all duration-200 w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 mb-5"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify Email</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="border-t border-[#23253A] pt-5">
          <p className="text-slate-400 text-sm text-center mb-3">
            Didn&apos;t receive a code?
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || resending || loading}
            className={[
              "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium",
              "border border-[#23253A] transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              countdown > 0
                ? "text-slate-500"
                : "text-indigo-400 hover:text-indigo-300 hover:border-indigo-400/40",
            ].join(" ")}
          >
            {resending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Sending...</span>
              </>
            ) : countdown > 0 ? (
              <>
                <RotateCcw size={15} />
                <span>Resend in {countdown}s</span>
              </>
            ) : (
              <>
                <RotateCcw size={15} />
                <span>Resend code</span>
              </>
            )}
          </button>
        </div>

        {/* Spam hint */}
        <p className="text-slate-500 text-xs text-center mt-4">
          Can&apos;t find it? Check your spam or junk folder.
        </p>
      </div>
    </div>
  );
}
