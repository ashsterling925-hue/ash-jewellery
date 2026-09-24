import { Eye, EyeOff, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to destination or dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const destination = location.state?.from?.pathname || "/admin/dashboard";
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError("");
    const newErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Please enter your password.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setSubmitting(true);
      try {
        await login(email, password);
        const destination = location.state?.from?.pathname || "/admin/dashboard";
        navigate(destination, { replace: true });
      } catch (err) {
        setServerError(err.message || "Invalid email or password.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-[48%_52%] bg-[#fffdf9] overflow-hidden">
      {/* ================= LOGIN BRAND PANEL ================= */}
      <div className="relative hidden lg:flex flex-col justify-between h-full p-12 xl:p-16 bg-gradient-to-br from-[#1b1815] via-[#28221b] to-[#12100d] overflow-hidden text-white">
        <div className="relative z-10">
          <Link to="/" className="inline-block" aria-label="ASH Jewellery Home">
            <img
              src="/jewellery/ash-logo.svg"
              alt="ASH Silver Jewellery"
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>
        </div>

        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#b99657]/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 bottom-10 w-80 h-80 rounded-full bg-[#6b1d2f]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-md">
          <p className="text-[10px] font-bold tracking-[0.28em] uppercase text-[#c5a265] mb-3">
            HERITAGE 925 SILVER
          </p>
          <h1 className="font-serif text-4xl xl:text-5xl font-medium leading-tight mb-4 text-white">
            Timeless pieces.
            <br />
            Meaningful moments.
          </h1>
          <p className="text-xs text-[#d6cdbf] leading-relaxed mb-6 font-light">
            Handcrafted with authentic hallmarked purity, bridging ancient Indian motifs with modern grace.
          </p>
          <span className="text-[10px] font-semibold tracking-[0.25em] text-[#c5a265] uppercase">
            PURE CRAFT. TIMELESS YOU.
          </span>
        </div>
      </div>

      {/* ================= LOGIN FORM ================= */}
      <div className="flex items-center justify-center p-8 sm:p-14 lg:p-16 bg-[#fffdf9] min-h-screen lg:min-h-0">
        <div className="w-full max-w-[440px]">
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

          <div className="mb-8">
            <p className="text-[10px] font-bold tracking-[0.24em] text-[#b99657] uppercase mb-2">
              WELCOME BACK
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1e1c19] mb-2">
              Sign in to ASH
            </h2>
            <p className="text-sm text-[#716b62] leading-relaxed">
              Access your account, view your enquiries and continue your
              jewellery journey with ASH.
            </p>
          </div>

          {serverError && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-[#fcf2f1] border border-[#f3d3cf] text-xs text-[#a64b42]">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {/* EMAIL */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-[11px] font-bold tracking-[0.16em] text-[#1e1c19] uppercase mb-2"
              >
                EMAIL ADDRESS
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (errors.email) {
                    setErrors((current) => ({
                      ...current,
                      email: "",
                    }));
                  }
                }}
                className={`w-full h-12 px-4 bg-[#fbf8f2] border ${
                  errors.email ? "border-[#a64b42]" : "border-[#e7dfd3]"
                } rounded-md text-sm text-[#1e1c19] placeholder:text-[#938c82] focus:outline-none focus:border-[#b99657] focus:ring-1 focus:ring-[#b99657] transition-all`}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "login-email-error" : undefined}
              />
              {errors.email && (
                <p id="login-email-error" className="text-xs text-[#a64b42] mt-1.5">
                  {errors.email}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-[11px] font-bold tracking-[0.16em] text-[#1e1c19] uppercase mb-2"
              >
                PASSWORD
              </label>
              <div className="relative flex items-center">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (errors.password) {
                      setErrors((current) => ({
                        ...current,
                        password: "",
                      }));
                    }
                  }}
                  className={`w-full h-12 px-4 pr-11 bg-[#fbf8f2] border ${
                    errors.password ? "border-[#a64b42]" : "border-[#e7dfd3]"
                  } rounded-md text-sm text-[#1e1c19] placeholder:text-[#938c82] focus:outline-none focus:border-[#b99657] focus:ring-1 focus:ring-[#b99657] transition-all`}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "login-password-error" : undefined
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 p-1.5 text-[#716b62] hover:text-[#1e1c19] transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={1.6} />
                  ) : (
                    <Eye size={18} strokeWidth={1.6} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p id="login-password-error" className="text-xs text-[#a64b42] mt-1.5">
                  {errors.password}
                </p>
              )}
            </div>

            {/* FORGOT PASSWORD */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-[#716b62] hover:text-[#b99657] transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* SIGN IN */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 flex items-center justify-center gap-2 bg-[#10233f] hover:bg-[#0b192d] text-white text-xs font-semibold tracking-[0.18em] uppercase rounded-md shadow-sm transition-all cursor-pointer disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  SIGNING IN...
                </>
              ) : (
                <>
                  SIGN IN
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* REGISTER */}
          <div className="flex items-center justify-center gap-2 text-xs text-[#716b62] mt-8 pt-6 border-t border-[#e7dfd3]">
            <span>Don't have an account?</span>
            <Link
              to="/register"
              className="font-semibold text-[#10233f] hover:text-[#b99657] tracking-wider uppercase transition-colors"
            >
              CREATE ACCOUNT
            </Link>
          </div>

          {/* BACK HOME */}
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
    </div>
  );
}

export default LoginPage;
