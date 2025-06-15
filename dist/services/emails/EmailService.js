"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class PasswordService {
    static sendEmail(email, arg1, emailContent) {
        throw new Error("Method not implemented.");
    }
    static log(level, message, ...meta) {
        const prefix = level.toUpperCase();
        console[level](`${prefix}: ${message}`, ...meta);
    }
    static generatePassword(length = this.PASSWORD_LENGTH) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }
    static getTransporter() {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
            throw new Error('GMAIL credentials not configured');
        }
        return nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD,
            },
        });
    }
    static generateWelcomeEmailContent(email, password, username, firstName, lastName) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <style>
    body { font-family: "Outfit", sans-serif; background: #f0f2f5; color: #333; }
    .container { max-width: 600px; margin: 30px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .header { background-color: #00618b; color: white; padding: 20px; text-align: center; font-size: 28px; font-family: "Itim", serif; }
    .credentials { background: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 10px; font-family: monospace; margin-top: 20px; }
    .footer { background: #00618b; color: white; text-align: center; padding: 15px; font-size: 14px; }
    .footer a { color: #ddd; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">Welcome to GiraffeSpace!</div>
    <div>
      <img src="https://images.unsplash.com/photo-1596495577886-d920f1fb7238" alt="Event" style="width: 100%; border-bottom: 2px solid #1557b0;" />
    </div>
    <h2>Hello: ${firstName} ${lastName},</h2>
    <p>We're excited to welcome you to <strong>GiraffeSpace</strong> — your go-to platform for seamless event management. 🎉</p>
    <p>You now have access to your account. Here are your temporary login credentials:</p>
    <div class="credentials">
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
    </div>
    <p style="margin-top: 20px;">
      <a href="https://your-app-link.com/login">Login here</a>. Please change your password immediately. This password is valid for ${this.EXPIRY_HOURS} hours.
    </p>
    <div class="footer">
      &copy; 2025 GiraffeSpace. All rights reserved. <br/>
      Need help? <a href="mailto:support@giraffespace.com">Contact support</a>
    </div>
  </div>
</body>
</html>`;
    }
    static generateResetEmailContent(resetLink) {
        return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
  <h2 style="color: #333;">Password Reset Request</h2>
  <p>You requested a password reset. Click the button below to set a new password:</p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
  </div>
  <p><strong>This link will expire in 1 hour.</strong></p>
  <p>If you didn't request a password reset, you can safely ignore this email.</p>
  <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
  <p style="font-size: 12px; color: #777;">This is an automated email. Please do not reply to this message.</p>
</div>`;
    }
    static setSessionData(req, data) {
        if (!req.session) {
            this.log('error', 'Session object is undefined');
            return;
        }
        req.session.defaultPassword = data.password;
        req.session.defaultEmail = data.email;
        req.session.passwordExpiry = data.expiry;
        req.session.username = data.username;
        req.session.lastname = data.lastname;
        req.session.firstname = data.firstname;
    }
    static clearSessionData(req) {
        if (!req.session)
            return;
        delete req.session.defaultPassword;
        delete req.session.defaultEmail;
        delete req.session.passwordExpiry;
        delete req.session.username;
        delete req.session.lastname;
        delete req.session.firstname;
    }
    static sendDefaultPassword(email, lastName, firstName, username, req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const password = this.generatePassword();
                const expiry = Date.now() + this.EXPIRY_HOURS * 60 * 60 * 1000;
                this.setSessionData(req, {
                    password,
                    email,
                    expiry,
                    username,
                    lastname: lastName,
                    firstname: firstName
                });
                const transporter = this.getTransporter();
                const mailOptions = {
                    from: process.env.GMAIL_USER,
                    to: email,
                    subject: `Your Temporary Login Credentials (Valid for ${this.EXPIRY_HOURS} Hours)`,
                    html: this.generateWelcomeEmailContent(email, password, username, firstName, lastName),
                };
                this.log('info', `Sending email to ${email}`);
                const info = yield transporter.sendMail(mailOptions);
                this.log('info', 'Email sent successfully:', info.response);
                return true;
            }
            catch (error) {
                this.log('error', 'Error in sendDefaultPassword:', error);
                return false;
            }
        });
    }
    static invalidateDefaultPassword(req, email) {
        if (!req.session) {
            this.log('warn', 'Session object is undefined while invalidating default password');
            return;
        }
        if (req.session.defaultEmail === email) {
            this.clearSessionData(req);
            this.log('info', `Default password invalidated for email: ${email}`);
        }
        else {
            this.log('warn', `Email mismatch during password invalidation. Provided: ${email}, Session: ${req.session.defaultEmail}`);
        }
    }
    static verifyDefaultPassword(email, password, req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.session) {
                    this.log('error', 'Session object is undefined');
                    return false;
                }
                const { session } = req;
                const isVerified = (session.defaultPassword === password &&
                    session.defaultEmail === email &&
                    session.passwordExpiry &&
                    Date.now() <= session.passwordExpiry);
                if (!isVerified) {
                    this.log('warn', 'Verification failed: Invalid password or expired.');
                    return false;
                }
                this.clearSessionData(req);
                this.log('info', 'Password verified successfully.');
                return true;
            }
            catch (error) {
                this.log('error', 'Error verifying password:', error);
                return false;
            }
        });
    }
    static sendPasswordResetEmail(email, resetLink) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transporter = this.getTransporter();
                const mailOptions = {
                    from: process.env.GMAIL_USER,
                    to: email,
                    subject: 'Password Reset Request',
                    html: this.generateResetEmailContent(resetLink),
                };
                yield transporter.sendMail(mailOptions);
                this.log('info', `Password reset email sent to ${email}`);
            }
            catch (error) {
                this.log('error', `Failed to send password reset email to ${email}:`, error);
                throw error;
            }
        });
    }
    static sendSuccessPasswordForgetEmail(email, username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const emailContent = `
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Itim&family=Outfit&display=swap');
  
          body { font-family: "Outfit", sans-serif; background: #f0f2f5; color: #333; }
          .container { max-width: 600px; margin: 30px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { background-color: #00618b; color: white; padding: 20px; text-align: center; font-size: 28px; font-family: "Itim", serif; }
          .credentials { background: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 10px; font-family: monospace; margin-top: 20px; }
          .footer { background: #00618b; color: white; text-align: center; padding: 15px; font-size: 14px; }
          .footer a { color: #ddd; text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            Password Reset Successful
          </div>
          <p>Hello <strong>${username}</strong>,</p>
          <p>Your password has been successfully changed. Below are your updated credentials:</p>
  
          <div class="credentials">
            <p><strong>Password:</strong> ${password}</p>
          </div>
  
          <p>Please keep your password safe and do not share it with anyone.</p>
          <p>You can now <a href="https://your-frontend-url.com/login">log in here</a> with your new password.</p>
  
          <div class="footer">
            &copy; ${new Date().getFullYear()} Your Company. All rights reserved.<br>
            <a href="https://your-frontend-url.com/support">Contact Support</a> if you didn’t request this change.
          </div>
        </div>
      </body>
      </html>
    `;
            try {
                const transporter = this.getTransporter();
                const mailOptions = {
                    from: process.env.GMAIL_USER,
                    to: email,
                    subject: 'Your Password Has Been Changed',
                    html: emailContent,
                };
                yield transporter.sendMail(mailOptions);
                this.log('info', `Password reset success email sent to ${email}`);
            }
            catch (error) {
                this.log('error', `Failed to send password reset success email to ${email}:`, error);
                throw error;
            }
        });
    }
}
PasswordService.PASSWORD_LENGTH = 12;
PasswordService.EXPIRY_HOURS = 24;
PasswordService.SALT_ROUNDS = 10;
PasswordService.EMAIL_TEMPLATES = {
    welcome: 'welcome-email-template',
    reset: 'reset-password-template'
};
exports.default = PasswordService;
