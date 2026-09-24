import { ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { authApi } from "@/lib/api/authApi";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await authApi.forgotPassword({ email });
      setSubmitted(true);
    } catch (err) {
      // Even if error, generic security response unless network error
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-6 sm:p-12 bg-[#fffdf9]">
      <div className="w-full max-w-[460px] bg-[#fbf8f2] border border-[#e7dfd3] rounded-lg p-8 sm:p-12 shadow-sm">
        <Link
          to="/"
          className="inline-flex flex-col mb-8 text-2xl font-serif tracking-wider text-[#1e1c19] hover:opacity-90"
          aria-label="ASH Jewellery home"
        >
          ASH
          <span className="text-[9px] font-sans font-semibold tracking-[0.3em] text-[#716b62]">
            SILVER JEWELLERY
          </span>
        </Link>

        {!submitted ? (
          <>
            <div className="mb-8">
              <p className="text-[10px] font-bold tracking-[0.24em] text-[#b99657] uppercase mb-2">
                ACCOUNT RECOVERY
              </p>

              <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1e1c19] mb-2">
                Forgot your password?
              </h1>

              <p className="text-sm text-[#716b62] leading-relaxed">
                Enter the email address associated with your ASH account and
                we'll help you reset your password.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label
                  htmlFor="forgot-email"
                  className="block text-[11px] font-bold tracking-[0.16em] text-[#1e1c19] uppercase mb-2"
                >
                  EMAIL ADDRESS
                </label>

                <input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  className={`w-full h-12 px-4 bg-white border ${
                    error ? "border-[#a64b42]" : "border-[#e7dfd3]"
                  } rounded-md text-sm text-[#1e1c19] placeholder:text-[#938c82] focus:outline-none focus:border-[#b99657] focus:ring-1 focus:ring-[#b99657] transition-all`}
                  aria-invalid={Boolean(error)}
                />

                {error && <p className="text-xs text-[#a64b42] mt-1.5">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-2 bg-[#10233f] hover:bg-[#0b192d] text-white text-xs font-semibold tracking-[0.18em] uppercase rounded-md shadow-sm transition-all cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    SENDING LINK...
                  </>
                ) : (
                  <>
                    SEND RESET LINK
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <CheckCircle2
              size={44}
              strokeWidth={1.4}
              className="mx-auto text-[#52735b] mb-4"
            />

            <p className="text-[10px] font-bold tracking-[0.24em] text-[#b99657] uppercase mb-2">
              CHECK YOUR EMAIL
            </p>

            <h1 className="font-serif text-2xl font-medium text-[#1e1c19] mb-3">
              Reset link sent.
            </h1>

            <p className="text-sm text-[#716b62] leading-relaxed mb-6">
              If an account exists for <strong>{email}</strong>, you'll receive
              instructions to reset your password.
            </p>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 h-11 bg-[#10233f] hover:bg-[#0b192d] text-white text-xs font-semibold tracking-[0.18em] uppercase rounded-md transition-all"
            >
              BACK TO SIGN IN
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {!submitted && (
          <div className="flex items-center justify-center gap-2 text-xs text-[#716b62] mt-8 pt-6 border-t border-[#e7dfd3]">
            Remember your password?
            <Link
              to="/login"
              className="font-semibold text-[#10233f] hover:text-[#b99657] tracking-wider uppercase transition-colors"
            >
              BACK TO SIGN IN
            </Link>
          </div>
        )}

        <div className="text-center mt-6">
          <Link
            to="/"
            className="text-xs text-[#716b62] hover:text-[#1e1c19] transition-colors"
          >
            ← Back to ASH Jewellery
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
