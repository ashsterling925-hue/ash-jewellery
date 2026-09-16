import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import "./AuthPages.css";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();

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
      console.log("Login form is valid.");
    }
  };
  return (
    <div className="login-page">
      {/* ================= LOGIN IMAGE ================= */}

      <div className="login-visual">
        <img
          src="/jewellery/ash-hero-lady.svg"
          alt="ASH Jewellery collection"
        />

        <div className="login-visual-overlay"></div>

        <div className="login-visual-content">
          <p>ASH JEWELLERY</p>

          <h1>
            Timeless pieces.
            <br />
            Meaningful moments.
          </h1>

          <span>PURE CRAFT. TIMELESS YOU.</span>
        </div>
      </div>

      {/* ================= LOGIN FORM ================= */}

      <div className="login-panel">
        <div className="login-container">
          <Link to="/" className="login-brand" aria-label="ASH Jewellery home">
            ASH
            <span>SILVER JEWELLERY</span>
          </Link>

          <div className="login-heading">
            <p className="login-eyebrow">WELCOME BACK</p>

            <h2>Sign in to ASH</h2>

            <p>
              Access your account, view your enquiries and continue your
              jewellery journey with ASH.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* EMAIL */}

            <div className="login-field">
              <label htmlFor="login-email">EMAIL ADDRESS</label>

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
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? "login-email-error" : undefined
                }
              />

              {errors.email && (
                <p id="login-email-error" className="login-error">
                  {errors.email}
                </p>
              )}
            </div>

            {/* PASSWORD */}

            <div className="login-field">
              <label htmlFor="login-password">PASSWORD</label>

              <div className="password-input-wrap">
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
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={
                    errors.password ? "login-password-error" : undefined
                  }
                />

                <button
                  type="button"
                  className="password-toggle"
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
                <p id="login-password-error" className="login-error">
                  {errors.password}
                </p>
              )}
            </div>

            {/* FORGOT PASSWORD */}

            <div className="login-forgot">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            {/* SIGN IN */}

            <button type="submit" className="login-submit">
              SIGN IN
              <ArrowRight size={17} />
            </button>
          </form>

          {/* REGISTER */}

          <div className="login-register">
            <span>Don't have an account?</span>

            <Link to="/register">CREATE ACCOUNT</Link>
          </div>

          {/* BACK HOME */}

          <div className="login-home-link">
            <Link to="/">← Back to ASH Jewellery</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
