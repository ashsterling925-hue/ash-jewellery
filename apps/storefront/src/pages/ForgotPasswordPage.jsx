import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import "./AuthPages.css";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
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
    setSubmitted(true);
  };

  return (
    <div className="forgot-page">
      <div className="forgot-container">
        <Link to="/" className="forgot-brand" aria-label="ASH Jewellery home">
          ASH
          <span>SILVER JEWELLERY</span>
        </Link>

        {!submitted ? (
          <>
            <div className="forgot-heading">
              <p className="forgot-eyebrow">ACCOUNT RECOVERY</p>

              <h1>Forgot your password?</h1>

              <p>
                Enter the email address associated with your ASH account and
                we'll help you reset your password.
              </p>
            </div>

            <form className="forgot-form" onSubmit={handleSubmit} noValidate>
              <div className="forgot-field">
                <label htmlFor="forgot-email">EMAIL ADDRESS</label>

                <input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError("");
                  }}
                  aria-invalid={Boolean(error)}
                />

                {error && <p className="forgot-error">{error}</p>}
              </div>

              <button type="submit" className="forgot-submit">
                SEND RESET LINK
                <ArrowRight size={17} />
              </button>
            </form>
          </>
        ) : (
          <div className="forgot-success">
            <CheckCircle2 size={42} strokeWidth={1.4} />

            <p className="forgot-eyebrow">CHECK YOUR EMAIL</p>

            <h1>Reset link sent.</h1>

            <p>
              If an account exists for <strong>{email}</strong>, you'll receive
              instructions to reset your password.
            </p>

            <Link to="/login" className="forgot-back-button">
              BACK TO SIGN IN
              <ArrowRight size={17} />
            </Link>
          </div>
        )}

        {!submitted && (
          <div className="forgot-login">
            Remember your password?
            <Link to="/login">BACK TO SIGN IN</Link>
          </div>
        )}

        <div className="forgot-home">
          <Link to="/">← Back to ASH Jewellery</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
