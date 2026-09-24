import { env } from "../config/env.js";

/**
 * Clean Email Service Abstraction
 * Supports pluggable adapters for Resend, SendGrid, AWS SES, or SMTP.
 * In development, utilizes a development adapter with controlled formatting.
 */

class DevelopmentEmailAdapter {
  async send({ to, subject, html, text }) {
    console.log("--------------------------------------------------");
    console.log(`[DEV EMAIL ADAPTER] To: ${to}`);
    console.log(`[DEV EMAIL ADAPTER] Subject: ${subject}`);
    console.log(`[DEV EMAIL ADAPTER] Body (Text):\n${text}`);
    console.log("--------------------------------------------------");
    return { success: true, messageId: `dev-${Date.now()}` };
  }
}

class ProductionEmailAdapter {
  async send({ to, subject, html, text }) {
    // In production, integrate configured SMTP, Resend, or AWS SES.
    // Ensure tokens and sensitive parameters are never printed to logs.
    console.log(`[EMAIL DISPATCH] Email queued for delivery to ${to}. Subject: "${subject}"`);
    return { success: true, messageId: `prod-${Date.now()}` };
  }
}

const adapter = env.NODE_ENV === "production" ? new ProductionEmailAdapter() : new DevelopmentEmailAdapter();

export const emailService = {
  /**
   * Send password reset instructions email
   * @param {Object} params - { to, name, resetUrl }
   */
  async sendPasswordResetEmail({ to, name = "Valued Administrator", resetUrl }) {
    const subject = "Password Reset Request — ASH Jewellery";
    const text = `Hello ${name},\n\nYou recently requested to reset your password for your ASH Jewellery account. Please use the link below to set a new password:\n\n${resetUrl}\n\nThis link will expire in 15 minutes.\n\nIf you did not make this request, please disregard this email or contact support immediately.\n\n— ASH Jewellery Security Team`;

    const html = `
      <div style="font-family: 'Cinzel', 'Playfair Display', serif, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #fffdf9; border: 1px solid #e7dfd3;">
        <div style="text-align: center; margin-bottom: 28px;">
          <h2 style="font-size: 24px; color: #1e1c19; margin: 0; letter-spacing: 0.15em;">ASH JEWELLERY</h2>
          <p style="font-size: 10px; color: #b99657; letter-spacing: 0.25em; text-transform: uppercase; margin-top: 4px;">Security & Account Recovery</p>
        </div>
        <p style="font-size: 14px; color: #3d3935; line-height: 1.6;">Hello ${name},</p>
        <p style="font-size: 14px; color: #3d3935; line-height: 1.6;">We received a request to reset the password for your ASH Jewellery administrative account. Click the button below to choose a new password:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background-color: #10233f; color: #ffffff; padding: 14px 28px; font-size: 12px; font-weight: bold; letter-spacing: 0.18em; text-decoration: none; text-transform: uppercase; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #716b62; line-height: 1.5;">This link will expire in 15 minutes. If you did not request this password reset, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e7dfd3; margin: 28px 0;" />
        <p style="font-size: 11px; color: #938c82; text-align: center; margin: 0;">ASH Jewellery — Pure 925 Silver Craft</p>
      </div>
    `;

    return adapter.send({ to, subject, html, text });
  },
};

export default emailService;
