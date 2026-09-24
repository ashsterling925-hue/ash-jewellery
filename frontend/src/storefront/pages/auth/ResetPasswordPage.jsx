import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { authApi } from "@/lib/api/authApi";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing from the URL. Please request a new password reset link.");
      return;
    }

    if (!password) {
      setError("Please enter your new password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword({ token, newPassword: password });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3500);
    } catch (err) {
      setError(err.message || "Failed to reset password. The link may have expired.");
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

        {!success ? (
          <>
            <div className="mb-8">
              <p className="text-[10px] font-bold tracking-[0.24em] text-[#b99657] uppercase mb-2">
                ACCOUNT RECOVERY
              </p>

              <h1 className="font-serif text-2xl sm:text-3xl font-medium text-[#1e1c19] mb-2">
                Choose New Password
              </h1>

              <p className="text-sm text-[#716b62] leading-relaxed">
                Please enter a secure new password for your administrative account.
              </p>
            </div>

            {error && (
              <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-[#fcf2f1] border border-[#f3d3cf] text-xs text-[#a64b42]">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              {/* NEW PASSWORD */}
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-[11px] font-bold tracking-[0.16em] text-[#1e1c19] uppercase mb-2"
                >
                  NEW PASSWORD
                </label>
                <div className="relative flex items-center">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter at least 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 px-4 pr-11 bg-white border border-[#e7dfd3] rounded-md text-sm text-[#1e1c19] placeholder:text-[#938c82] focus:outline-none focus:border-[#b99657] focus:ring-1 focus:ring-[#b99657] transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-3 p-1.5 text-[#716b62] hover:text-[#1e1c19] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-[11px] font-bold tracking-[0.16em] text-[#1e1c19] uppercase mb-2"
                >
                  CONFIRM PASSWORD
                </label>
                <div className="relative flex items-center">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-12 px-4 pr-11 bg-white border border-[#e7dfd3] rounded-md text-sm text-[#1e1c19] placeholder:text-[#938c82] focus:outline-none focus:border-[#b99657] focus:ring-1 focus:ring-[#b99657] transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-3 p-1.5 text-[#716b62] hover:text-[#1e1c19] transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-2 bg-[#10233f] hover:bg-[#0b192d] text-white text-xs font-semibold tracking-[0.18em] uppercase rounded-md shadow-sm transition-all cursor-pointer disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    UPDATING PASSWORD...
                  </>
                ) : (
                  <>
                    UPDATE PASSWORD
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <CheckCircle2
              size={48}
              strokeWidth={1.4}
              className="mx-auto text-[#52735b] mb-4"
            />

            <p className="text-[10px] font-bold tracking-[0.24em] text-[#b99657] uppercase mb-2">
              PASSWORD UPDATED
            </p>

            <h1 className="font-serif text-2xl font-medium text-[#1e1c19] mb-3">
              Success!
            </h1>

            <p className="text-sm text-[#716b62] leading-relaxed mb-6">
              Your password has been reset successfully. Redirecting you to sign in...
            </p>

            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 h-11 bg-[#10233f] hover:bg-[#0b192d] text-white text-xs font-semibold tracking-[0.18em] uppercase rounded-md transition-all"
            >
              SIGN IN NOW
              <ArrowRight size={16} />
            </Link>
          </div>
        )}

        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-xs text-[#716b62] hover:text-[#1e1c19] transition-colors"
          >
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
