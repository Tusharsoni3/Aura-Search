import nodemailer from "nodemailer";
import crypto from "crypto";
import "dotenv/config";

/**
 * Strict email validation regex (RFC 5322 simplified)
 * Checks for:
 * - Valid local part (alphanumeric, dots, hyphens, underscores)
 * - Valid domain (alphanumeric, hyphens, dots)
 * - Valid TLD (2-6 chars, alphabetic only)
 */
const STRICT_EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

/**
 * Validates an email address against strict rules
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const trimmed = email.trim();
  if (trimmed.length > 254) return false; // RFC 5321
  if (trimmed.length < 5) return false; // Minimum viable length

  // Check regex pattern
  if (!STRICT_EMAIL_REGEX.test(trimmed)) return false;

  // Reject common disposable email domains
  const disposableDomains = [
    "tempmail.com",
    "guerrillamail.com",
    "mailinator.com",
    "10minutemail.com",
    "throwaway.email",
    "temp-mail.org",
    "yopmail.com",
    "trashmail.com",
    "fakeinbox.com",
    "maildrop.cc",
    "spam4.me",
    "temp-mail.io",
  ];
  const domain = trimmed.split("@")[1].toLowerCase();
  if (disposableDomains.includes(domain)) return false;

  return true;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ─── OTP Email ───────────────────────────────────────────────────────────────

export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const sendEmail = async ({ to }) => {
  const otp = generateOTP();

  const info = await transporter.sendMail({
    from: `"Advanced Auth System" <${process.env.GMAIL_USER}>`,
    to,
    subject: "Your 2FA Verification Code",
    html: `
      <div style="font-family: sans-serif; text-align: center;">
        <h2>Verification Code</h2>
        <p>Use the code below to complete your login. It expires in 10 minutes.</p>
        <h1 style="letter-spacing: 5px; color: #4A90E2;">${otp}</h1>
      </div>`,
  });

  console.log("OTP Email sent:", info.messageId);
  return otp;
};

// ─── Welcome / Thank You Email ────────────────────────────────────────────────

export const sendWelcomeEmail = async ({ to, name }) => {
  try {
    if (!to) {
      console.error("❌ Error: Recipient email is missing!");
      return false;
    }

    const info = await transporter.sendMail({
      from: `"Aura Search" <${process.env.GMAIL_USER}>`,
      to,
      subject: "🚀 Welcome to Aura Search – Thank You for Signing Up!",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #030B18 0%, #0C1A30 100%); border-radius: 12px; color: #E2F0FF;">

          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid rgba(34,211,238,0.2);">
            <div style="font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #22D3EE 0%, #A78BFA 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 10px;">
              Aura Search
            </div>
            <p style="font-size: 18px; margin: 0; color: #E2F0FF;">Welcome Aboard! 🎉</p>
          </div>

          <!-- Main Content -->
          <div style="margin-bottom: 30px;">
            <p style="font-size: 16px; color: #E2F0FF; margin: 0 0 15px 0;">
              Hi <strong>${name || "there"}</strong>,
            </p>
            <p style="font-size: 14px; color: #C8DCF5; line-height: 1.6; margin: 0 0 15px 0;">
              Thank you for creating an account with <strong>Aura Search</strong>! We're thrilled to have you join our community.
            </p>
            <p style="font-size: 14px; color: #C8DCF5; line-height: 1.6; margin: 0 0 15px 0;">
              Your account is now active and ready to use. Dive into the power of AI-driven conversations with real-time web search.
            </p>
          </div>

          <!-- Features -->
          <div style="background: rgba(12,26,48,0.5); border: 1px solid rgba(34,211,238,0.3); border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <p style="font-size: 14px; font-weight: 600; color: #22D3EE; margin: 0 0 12px 0;">✨ What You Can Do:</p>
            <ul style="margin: 0; padding-left: 20px; list-style: none;">
              <li style="font-size: 13px; color: #C8DCF5; margin: 8px 0; padding-left: 24px; position: relative;">
                <span style="position: absolute; left: 0;">🔍</span> Ask questions and get AI-powered answers
              </li>
              <li style="font-size: 13px; color: #C8DCF5; margin: 8px 0; padding-left: 24px; position: relative;">
                <span style="position: absolute; left: 0;">🌐</span> Access real-time web search results
              </li>
              <li style="font-size: 13px; color: #C8DCF5; margin: 8px 0; padding-left: 24px; position: relative;">
                <span style="position: absolute; left: 0;">💬</span> Save and organize your conversations
              </li>
              <li style="font-size: 13px; color: #C8DCF5; margin: 8px 0; padding-left: 24px; position: relative;">
                <span style="position: absolute; left: 0;">⚡</span> Get instant responses with streaming
              </li>
            </ul>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="http://localhost:5173/chat" style="display: inline-block; background: linear-gradient(135deg, #22D3EE 0%, #0EA5E9 100%); color: #030B18; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 0 20px rgba(34,211,238,0.3);">
              🚀 Start Chatting Now
            </a>
          </div>

          <!-- Quick Tips -->
          <div style="background: rgba(167,139,250,0.08); border-left: 3px solid #A78BFA; padding: 16px; border-radius: 6px; margin-bottom: 30px;">
            <p style="font-size: 12px; font-weight: 600; color: #A78BFA; margin: 0 0 8px 0; text-transform: uppercase;">💡 Pro Tip</p>
            <p style="font-size: 13px; color: #C8DCF5; margin: 0; line-height: 1.5;">
              Try asking Aura Search complex questions, request code explanations, or have deep conversations about any topic. The more specific you are, the better the answers!
            </p>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid rgba(34,211,238,0.2); padding-top: 20px; text-align: center;">
            <p style="font-size: 12px; color: #64748B; margin: 0 0 8px 0;">
              Questions? Contact our support team at <strong>${process.env.GMAIL_USER}</strong>
            </p>
            <p style="font-size: 12px; color: #475569; margin: 0;">
              © ${new Date().getFullYear()} Aura Search. All rights reserved.
            </p>
          </div>

        </div>
      `,
    });

    console.log("Welcome Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Welcome Email Error:", error);
    return false;
  }
};

// ─── Reset Password Email ─────────────────────────────────────────────────────

export const resetPasswordSendEmail = async ({ to, resetUrl }) => {
  try {
    if (!to) {
      console.error("❌ Error: Recipient email is missing!");
      return;
    }

    const info = await transporter.sendMail({
      from: `"Advanced Auth System" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Password Reset Request",
      html: `
        <h2>Reset Your Password</h2>
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${resetUrl}" style="background: blue; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    console.log("Reset Password Email sent:", info.messageId);
  } catch (error) {
    console.error("❌ Forgot Password email Error:", error);
  }
};

// ─── 2FA Email ────────────────────────────────────────────────────────────────

export const send2FAEmail = async ({ to, code }) => {
  try {
    if (!to || !code) {
      console.error("❌ Error: Recipient email or 2FA code is missing!");
      return false;
    }

    const info = await transporter.sendMail({
      from: `"Advanced Auth System" <${process.env.GMAIL_USER}>`,
      to,
      subject: "Your 2FA Login Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4F46E5;">Two-Factor Authentication</h2>
          <p>Please enter the following verification code to complete your login:</p>
          <div style="background: #f4f4f4; padding: 10px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <h1 style="font-size: 32px; letter-spacing: 5px; color: #333; margin: 0;">${code}</h1>
          </div>
          <p>This code expires in <strong>10 minutes</strong>.</p>
          <p style="font-size: 12px; color: #666;">If you did not attempt to login, please change your password immediately.</p>
        </div>
      `,
    });

    console.log("2FA Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ 2FA Email Error:", error);
    return false;
  }
};
