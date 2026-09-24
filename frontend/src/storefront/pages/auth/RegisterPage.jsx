import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = "Please enter your name.";
    }

    if (!email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Please enter a password.";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Registration form is valid.");
    }
  };

  return (
    <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-[48%_52%] bg-[#fffdf9] overflow-hidden">
      {/* Visual brand side */}
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
            Begin your
            <br />
            jewellery journey.
          </h1>
          <p className="text-xs text-[#d6cdbf] leading-relaxed mb-6 font-light">
            Join the ASH inner circle for exclusive curations, bespoke commissions, and private previews.
          </p>
          <span className="text-[10px] font-semibold tracking-[0.25em] text-[#c5a265] uppercase">
            PURE CRAFT. TIMELESS YOU.
          </span>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-8 sm:p-14 lg:p-16 bg-[#fffdf9] min-h-screen lg:min-h-0 overflow-y-auto">
        <div className="w-full max-w-[440px] py-6">
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
              WELCOME TO ASH
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#1e1c19] mb-2">
              Create your account
            </h2>
            <p className="text-sm text-[#716b62] leading-relaxed">
              Create an account to save your details, view your enquiries and
              stay connected with ASH Jewellery.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* NAME */}
            <div>
              <label
                htmlFor="register-name"
                className="block text-[11px] font-bold tracking-[0.16em] text-[#1e1c19] uppercase mb-2"
              >
                FULL NAME
              </label>
              <input
                id="register-name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  if (errors.name) {
                    setErrors((current) => ({
                      ...current,
                      name: "",
                    }));
                  }
                }}
                className={`w-full h-12 px-4 bg-[#fbf8f2] border ${
                  errors.name ? "border-[#a64b42]" : "border-[#e7dfd3]"
                } rounded-md text-sm text-[#1e1c19] placeholder:text-[#938c82] focus:outline-none focus:border-[#b99657] focus:ring-1 focus:ring-[#b99657] transition-all`}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && (
                <p className="text-xs text-[#a64b42] mt-1.5">{errors.name}</p>
              )}
            </div>

            {/* EMAIL */}
            <div>
              <label
                htmlFor="register-email"
                className="block text-[11px] font-bold tracking-[0.16em] text-[#1e1c19] uppercase mb-2"
              >
                EMAIL ADDRESS
              </label>
              <input
                id="register-email"
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
              />
              {errors.email && (
                <p className="text-xs text-[#a64b42] mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="register-password"
                className="block text-[11px] font-bold tracking-[0.16em] text-[#1e1c19] uppercase mb-2"
              >
                PASSWORD
              </label>
              <div className="relative flex items-center">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
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
                <p className="text-xs text-[#a64b42] mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
              <label
                htmlFor="register-confirm-password"
                className="block text-[11px] font-bold tracking-[0.16em] text-[#1e1c19] uppercase mb-2"
              >
                CONFIRM PASSWORD
              </label>
              <div className="relative flex items-center">
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    if (errors.confirmPassword) {
                      setErrors((current) => ({
                        ...current,
                        confirmPassword: "",
                      }));
                    }
                  }}
                  className={`w-full h-12 px-4 pr-11 bg-[#fbf8f2] border ${
                    errors.confirmPassword ? "border-[#a64b42]" : "border-[#e7dfd3]"
                  } rounded-md text-sm text-[#1e1c19] placeholder:text-[#938c82] focus:outline-none focus:border-[#b99657] focus:ring-1 focus:ring-[#b99657] transition-all`}
                  aria-invalid={Boolean(errors.confirmPassword)}
                />
                <button
                  type="button"
                  className="absolute right-3 p-1.5 text-[#716b62] hover:text-[#1e1c19] transition-colors"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  onClick={() =>
                    setShowConfirmPassword((current) => !current)
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} strokeWidth={1.6} />
                  ) : (
                    <Eye size={18} strokeWidth={1.6} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-[#a64b42] mt-1.5">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full h-12 mt-2 flex items-center justify-center gap-2 bg-[#10233f] hover:bg-[#0b192d] text-white text-xs font-semibold tracking-[0.18em] uppercase rounded-md shadow-sm transition-all cursor-pointer"
            >
              CREATE ACCOUNT
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="flex items-center justify-center gap-2 text-xs text-[#716b62] mt-8 pt-6 border-t border-[#e7dfd3]">
            <span>Already have an account?</span>
            <Link
              to="/login"
              className="font-semibold text-[#10233f] hover:text-[#b99657] tracking-wider uppercase transition-colors"
            >
              SIGN IN
            </Link>
          </div>

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

export default RegisterPage;
