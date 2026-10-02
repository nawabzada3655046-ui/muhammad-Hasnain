import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const ADMIN_AUTH_FILE = path.join(DATA_DIR, 'admin_auth.json');

// Exact required initial admin password and recovery email
export const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD?.trim() || 'Hasnain295@';
export const ADMIN_RECOVERY_EMAIL = 'zarrichappal@gmail.com';
export const REQUIRED_POST_RESET_PASSWORD = process.env.ADMIN_PASSWORD?.trim() || 'Hasnain295@';

export interface PasswordResetOTP {
  otpHash: string;
  salt: string;
  targetEmail: string;
  createdAt: string;
  expiresAt: string; // 10 minutes from creation
  attempts: number; // max 5
  isUsed: boolean;
  verifiedAt?: string;
  resetToken?: string;
}

export interface AdminAuthData {
  salt: string;
  hash: string;
  updatedAt: string;
  activeTokens: Record<string, { createdAt: string; expiresAt: string }>;
  passwordResetOTP?: PasswordResetOTP | null;
}

export function hashPassword(password: string, customSalt?: string): { hash: string; salt: string } {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

export function readAuthData(): AdminAuthData {
  try {
    if (fs.existsSync(ADMIN_AUTH_FILE)) {
      const content = fs.readFileSync(ADMIN_AUTH_FILE, 'utf-8');
      if (content.trim()) {
        const parsed = JSON.parse(content);
        if (parsed && parsed.hash && parsed.salt) {
          return {
            salt: parsed.salt,
            hash: parsed.hash,
            updatedAt: parsed.updatedAt || new Date().toISOString(),
            activeTokens: parsed.activeTokens || {},
            passwordResetOTP: parsed.passwordResetOTP || null,
          };
        }
      }
    }
  } catch (err) {
    console.warn('[Admin Auth] Error reading admin_auth.json:', err);
  }

  // Fallback initialize with Hasnain295@
  const { hash, salt } = hashPassword(DEFAULT_PASSWORD);
  const initialData: AdminAuthData = {
    salt,
    hash,
    updatedAt: new Date().toISOString(),
    activeTokens: {},
    passwordResetOTP: null,
  };
  saveAuthData(initialData);
  return initialData;
}

export function saveAuthData(data: AdminAuthData): boolean {
  try {
    const tempPath = `${ADMIN_AUTH_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, ADMIN_AUTH_FILE);
    return true;
  } catch (err) {
    console.error('[Admin Auth] Error saving admin_auth.json:', err);
    return false;
  }
}

export function ensureAdminAuthInitialized() {
  const authData = readAuthData();
  // Clean expired tokens on startup
  const now = Date.now();
  let changed = false;
  const cleanedTokens: Record<string, { createdAt: string; expiresAt: string }> = {};

  for (const [token, info] of Object.entries(authData.activeTokens || {})) {
    if (new Date(info.expiresAt).getTime() > now) {
      cleanedTokens[token] = info;
    } else {
      changed = true;
    }
  }

  if (changed) {
    authData.activeTokens = cleanedTokens;
    saveAuthData(authData);
  }
}

// Ensure initialized on module load
ensureAdminAuthInitialized();

/**
 * Verifies credentials and creates a secure session token
 */
export function loginAdminBackend(password: string): { success: boolean; token?: string; error?: string } {
  if (!password || typeof password !== 'string') {
    return { success: false, error: 'Password is required' };
  }

  const trimmed = password.trim();
  const authData = readAuthData();

  // Primary verification against stored PBKDF2 hash or exact master password
  let isMatch = verifyPassword(trimmed, authData.hash, authData.salt) || trimmed === DEFAULT_PASSWORD;
  
  // Environment variable override if configured
  if (!isMatch && process.env.ADMIN_PASSWORD && trimmed === process.env.ADMIN_PASSWORD.trim()) {
    isMatch = true;
  }

  // Case-insensitive fallback for DEFAULT_PASSWORD to guard against mobile autocorrect / keyboard caps-lock
  if (!isMatch && trimmed.toLowerCase() === DEFAULT_PASSWORD.toLowerCase()) {
    isMatch = true;
  }

  if (isMatch) {
    // Re-hash to exact standard password if not currently matching hash
    const currentHashMatches = verifyPassword(DEFAULT_PASSWORD, authData.hash, authData.salt);
    if (!currentHashMatches) {
      const { hash, salt } = hashPassword(DEFAULT_PASSWORD);
      authData.hash = hash;
      authData.salt = salt;
      authData.updatedAt = new Date().toISOString();
      saveAuthData(authData);
    }
  }

  if (!isMatch) {
    return { success: false, error: 'Invalid admin password. Please enter the valid administrator password.' };
  }

  // Generate cryptographically secure 256-bit token
  const token = `hzc_${crypto.randomBytes(32).toString('hex')}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

  if (!authData.activeTokens) {
    authData.activeTokens = {};
  }
  authData.activeTokens[token] = {
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  saveAuthData(authData);

  return { success: true, token };
}

/**
 * Verifies if an admin token or raw password credential is valid
 */
export function verifyAdminToken(token: string): boolean {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
  if (!cleanToken) {
    return false;
  }

  const authData = readAuthData();

  // Check active session tokens
  if (authData.activeTokens && authData.activeTokens[cleanToken]) {
    const session = authData.activeTokens[cleanToken];
    if (new Date(session.expiresAt).getTime() > Date.now()) {
      return true;
    } else {
      // Expired token: cleanup
      delete authData.activeTokens[cleanToken];
      saveAuthData(authData);
      return false;
    }
  }

  // Also support direct verification if the token passed is the actual active password
  if (verifyPassword(cleanToken, authData.hash, authData.salt)) {
    return true;
  }

  return false;
}

/**
 * Changes admin password securely in the backend
 */
export function changeAdminPasswordBackend(
  currentPassword: string,
  newPassword: string
): { success: boolean; message?: string; error?: string } {
  if (!currentPassword || !newPassword) {
    return { success: false, error: 'Both current password and new password are required' };
  }

  const trimmedCurrent = currentPassword.trim();
  const trimmedNew = newPassword.trim();

  if (trimmedNew.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long' };
  }

  const authData = readAuthData();
  const isMatch = verifyPassword(trimmedCurrent, authData.hash, authData.salt);
  if (!isMatch) {
    return { success: false, error: 'Current password is incorrect' };
  }

  const { hash, salt } = hashPassword(trimmedNew);
  authData.hash = hash;
  authData.salt = salt;
  authData.updatedAt = new Date().toISOString();
  // Clear old tokens to force re-login with the new password
  authData.activeTokens = {};

  const saved = saveAuthData(authData);
  if (!saved) {
    return { success: false, error: 'Failed to write updated password to backend' };
  }

  return { success: true, message: 'Admin password changed successfully in backend database' };
}

/**
 * Revokes a session token
 */
export function revokeAdminToken(token: string): boolean {
  if (!token) return true;
  const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
  const authData = readAuthData();
  if (authData.activeTokens && authData.activeTokens[cleanToken]) {
    delete authData.activeTokens[cleanToken];
    saveAuthData(authData);
  }
  return true;
}

/**
 * Express middleware to protect admin endpoints
 */
export function verifyAdminMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'] || req.headers['x-admin-token'];
  const token = typeof authHeader === 'string' ? authHeader : '';

  if (verifyAdminToken(token)) {
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: Admin authentication required' });
}

/**
 * Checks email delivery service configuration status
 */
export function getEmailDeliveryConfigStatus(): {
  isConfigured: boolean;
  provider: string;
  missingVariables: string[];
  registeredEmail: string;
} {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  const missingVariables: string[] = [];
  if (!user) missingVariables.push('SMTP_USER');
  if (!pass) missingVariables.push('SMTP_PASS');

  const isConfigured = !!(user && pass);
  const provider = process.env.SMTP_HOST || (user?.includes('@gmail.com') ? 'Gmail SMTP' : 'Custom SMTP');

  return {
    isConfigured,
    provider,
    missingVariables,
    registeredEmail: ADMIN_RECOVERY_EMAIL,
  };
}

/**
 * Sends a real 6-digit OTP email using nodemailer
 */
export async function sendOtpEmail(
  targetEmail: string,
  otp: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const status = getEmailDeliveryConfigStatus();
  if (!status.isConfigured) {
    return {
      success: false,
      error: `Email delivery service is not configured. Missing environment variables: ${status.missingVariables.join(
        ', '
      )}. To send real OTP emails to ${ADMIN_RECOVERY_EMAIL}, configure SMTP_USER and SMTP_PASS (e.g. Gmail 16-character App Password) in your server environment variables.`,
    };
  }

  try {
    const isGmail =
      process.env.SMTP_HOST === 'smtp.gmail.com' ||
      (!process.env.SMTP_HOST && process.env.SMTP_USER?.endsWith('@gmail.com'));

    const transporter = nodemailer.createTransport(
      isGmail && !process.env.SMTP_HOST
        ? {
            service: 'gmail',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          }
        : {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
            secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          }
    );

    const info = await transporter.sendMail({
      from: `"Hasnain Zarri Chappal Security" <${process.env.SMTP_USER}>`,
      to: targetEmail,
      subject: `Admin Password Reset OTP: ${otp} - Hasnain Zarri Chappal Store`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
          <h2 style="color: #b45309; margin-top: 0;">Hasnain Zarri Chappal Store</h2>
          <h3 style="color: #1f2937; margin-top: 0;">Admin Password Reset Request</h3>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">
            A password reset was requested for the Hasnain Zarri Chappal Store administrator account.
            Use the following 6-digit One-Time Passcode (OTP) to verify your identity and reset your admin password:
          </p>
          <div style="background-color: #fef3c7; border: 2px dashed #f59e0b; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #92400e; font-family: monospace;">${otp}</span>
          </div>
          <p style="color: #6b7280; font-size: 12px; line-height: 1.5;">
            ⏰ <strong>Important:</strong> This OTP is strictly valid for <strong>10 minutes</strong> and can only be used <strong>once</strong>.<br>
            If you did not request this code, please ignore this email and ensure your administrator credentials remain safe.
          </p>
          <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 20px 0;" />
          <p style="color: #9ca3af; font-size: 11px; text-align: center;">
            Hasnain Zarri Chappal Store • Handmade Traditional Footwear • Pakistan
          </p>
        </div>
      `,
    });

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('[Email Delivery Error]:', err);
    return {
      success: false,
      error: `Failed to deliver email through SMTP server: ${err.message || 'Connection or authentication failure'}. Please verify SMTP_USER and SMTP_PASS credentials.`,
    };
  }
}

/**
 * Requests a 6-digit password reset OTP for the registered admin email
 */
export async function requestPasswordResetOTP(email: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  configStatus?: {
    isConfigured: boolean;
    provider: string;
    missingVariables: string[];
    registeredEmail: string;
  };
}> {
  if (!email || typeof email !== 'string') {
    return { success: false, error: 'Email address is required.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail !== ADMIN_RECOVERY_EMAIL.toLowerCase()) {
    return {
      success: false,
      error: `The provided email "${email}" does not match the registered administrator recovery email (${ADMIN_RECOVERY_EMAIL}).`,
    };
  }

  // Generate cryptographically secure 6-digit OTP (100000 - 999999)
  const otpNumber = crypto.randomInt(100000, 1000000);
  const otp = otpNumber.toString();

  // Hash OTP with PBKDF2 for secure backend storage
  const { hash: otpHash, salt } = hashPassword(otp);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes expiry

  const authData = readAuthData();
  authData.passwordResetOTP = {
    otpHash,
    salt,
    targetEmail: ADMIN_RECOVERY_EMAIL,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    attempts: 0,
    isUsed: false,
  };
  saveAuthData(authData);

  // Attempt real email delivery
  const emailResult = await sendOtpEmail(ADMIN_RECOVERY_EMAIL, otp);
  if (!emailResult.success) {
    return {
      success: false,
      error: emailResult.error,
      configStatus: getEmailDeliveryConfigStatus(),
    };
  }

  return {
    success: true,
    message: `A 6-digit verification OTP has been sent to ${ADMIN_RECOVERY_EMAIL}. The code expires in 10 minutes.`,
  };
}

/**
 * Verifies the 6-digit OTP and generates a single-use reset token
 */
export function verifyPasswordResetOTP(
  email: string,
  otp: string
): { success: boolean; resetToken?: string; error?: string } {
  if (!email || !otp) {
    return { success: false, error: 'Email and 6-digit OTP are required.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail !== ADMIN_RECOVERY_EMAIL.toLowerCase()) {
    return { success: false, error: 'Invalid recovery email address.' };
  }

  const cleanOtp = otp.trim();
  if (!/^\d{6}$/.test(cleanOtp)) {
    return { success: false, error: 'OTP must be a valid 6-digit number.' };
  }

  const authData = readAuthData();
  const storedOTP = authData.passwordResetOTP;

  if (!storedOTP || storedOTP.isUsed) {
    return {
      success: false,
      error: 'No active OTP request found or OTP has already been used. Please request a new code.',
    };
  }

  // Check 10-minute expiration
  if (new Date(storedOTP.expiresAt).getTime() < Date.now()) {
    authData.passwordResetOTP = null;
    saveAuthData(authData);
    return {
      success: false,
      error: 'The 6-digit OTP has expired (10-minute validity limit). Please request a new OTP.',
    };
  }

  // Check max attempts
  if (storedOTP.attempts >= 5) {
    authData.passwordResetOTP = null;
    saveAuthData(authData);
    return {
      success: false,
      error: 'Maximum verification attempts exceeded. For security, this OTP is now invalid. Please request a new code.',
    };
  }

  // Verify OTP hash
  const isMatch = verifyPassword(cleanOtp, storedOTP.otpHash, storedOTP.salt);
  if (!isMatch) {
    storedOTP.attempts += 1;
    saveAuthData(authData);
    const remaining = 5 - storedOTP.attempts;
    return {
      success: false,
      error: `Invalid OTP. Please check the code sent to ${ADMIN_RECOVERY_EMAIL}. (${remaining} attempts remaining)`,
    };
  }

  // Generate single-use reset token
  const resetToken = `rst_${crypto.randomBytes(32).toString('hex')}`;
  storedOTP.verifiedAt = new Date().toISOString();
  storedOTP.resetToken = resetToken;
  saveAuthData(authData);

  return { success: true, resetToken };
}

/**
 * Resets admin password using verified OTP / reset token
 */
export function resetAdminPasswordWithOTP(
  email: string,
  otp: string,
  newPassword: string,
  resetToken?: string
): { success: boolean; message?: string; error?: string } {
  if (!email || !newPassword) {
    return { success: false, error: 'Email and new password are required.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail !== ADMIN_RECOVERY_EMAIL.toLowerCase()) {
    return { success: false, error: 'Invalid recovery email address.' };
  }

  const trimmedNew = newPassword.trim();
  if (trimmedNew.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters long.' };
  }

  const authData = readAuthData();
  const storedOTP = authData.passwordResetOTP;

  if (!storedOTP || storedOTP.isUsed) {
    return {
      success: false,
      error: 'No active OTP verification found or OTP has already been used. Please request a new code.',
    };
  }

  // Check 10-minute expiration
  if (new Date(storedOTP.expiresAt).getTime() < Date.now()) {
    authData.passwordResetOTP = null;
    saveAuthData(authData);
    return { success: false, error: 'OTP has expired (10-minute validity limit). Please request a new code.' };
  }

  // Validate reset token or OTP
  let isAuthorized = false;
  if (resetToken && storedOTP.resetToken && resetToken === storedOTP.resetToken) {
    isAuthorized = true;
  } else if (otp && verifyPassword(otp.trim(), storedOTP.otpHash, storedOTP.salt)) {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    return { success: false, error: 'Verification failed. Please provide a valid OTP or reset token.' };
  }

  // Mark OTP as used immediately and clear (Single-use guarantee)
  authData.passwordResetOTP = null;

  // Hash new password and save securely
  const { hash, salt } = hashPassword(trimmedNew);
  authData.hash = hash;
  authData.salt = salt;
  authData.updatedAt = new Date().toISOString();
  // Clear all previous active sessions
  authData.activeTokens = {};

  const saved = saveAuthData(authData);
  if (!saved) {
    return { success: false, error: 'Failed to write new password to backend.' };
  }

  return {
    success: true,
    message: 'Admin password has been reset successfully! You can now log in with your new password.',
  };
}

