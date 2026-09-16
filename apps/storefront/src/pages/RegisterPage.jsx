import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import "./AuthPages.css";

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
    <div className="register-page">
      <div className="register-visual">
        <img
          src="/jewellery/ash-hero-lady.svg"
          alt="ASH Jewellery collection"
        />

        <div className="register-visual-overlay"></div>

        <div className="register-visual-content">
          <p>ASH JEWELLERY</p>

          <h1>
            Begin your
            <br />
            jewellery journey.
          </h1>

          <span>PURE CRAFT. TIMELESS YOU.</span>
        </div>
      </div>

      <div className="register-panel">
        <div className="register-container">
          <Link
            to="/"
            className="register-brand"
            aria-label="ASH Jewellery home"
          >
            ASH
            <span>SILVER JEWELLERY</span>
          </Link>

          <div className="register-heading">
            <p className="register-eyebrow">WELCOME TO ASH</p>

            <h2>Create your account</h2>

            <p>
              Create an account to save your details, view your enquiries and
              stay connected with ASH Jewellery.
            </p>
          </div>

          <form className="register-form" onSubmit={handleSubmit} noValidate>
            <div className="register-field">
              <label htmlFor="register-name">FULL NAME</label>

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
                aria-invalid={Boolean(errors.name)}
              />

              {errors.name && <p className="register-error">{errors.name}</p>}
            </div>

            <div className="register-field">
              <label htmlFor="register-email">EMAIL ADDRESS</label>

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
                aria-invalid={Boolean(errors.email)}
              />

              {errors.email && <p className="register-error">{errors.email}</p>}
            </div>

            <div className="register-field">
              <label htmlFor="register-password">PASSWORD</label>

              <div className="register-password-wrap">
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
                  aria-invalid={Boolean(errors.password)}
                />

                <button
                  type="button"
                  className="register-password-toggle"
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
                <p className="register-error">{errors.password}</p>
              )}
            </div>

            <div className="register-field">
              <label htmlFor="register-confirm-password">
                CONFIRM PASSWORD
              </label>

              <div className="register-password-wrap">
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
                  aria-invalid={Boolean(errors.confirmPassword)}
                />

                <button
                  type="button"
                  className="register-password-toggle"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  onClick={() => setShowConfirmPassword((current) => !current)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} strokeWidth={1.6} />
                  ) : (
                    <Eye size={18} strokeWidth={1.6} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="register-error">{errors.confirmPassword}</p>
              )}
            </div>

            <button type="submit" className="register-submit">
              CREATE ACCOUNT
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="register-login">
            <span>Already have an account?</span>
            <Link to="/login">SIGN IN</Link>
          </div>

          <div className="register-home-link">
            <Link to="/">← Back to ASH Jewellery</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
