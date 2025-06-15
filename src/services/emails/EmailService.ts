import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { Request } from 'express';

// Extend the SessionData interface
declare module 'express-session' {
  interface SessionData {
    defaultPassword?: string;
    defaultEmail?: string;
    passwordExpiry?: number;
    username?: string;
    lastname?: string;
    firstname?: string;
  }
}

dotenv.config();

class PasswordService {
static async sendTicketEmail({
    to,
    subject,
    eventName,
    eventDate,
    venueName,
    ticketPdf,
    qrCode
}: {
    to: string;
    subject: string;
    eventName: string;
    eventDate: Date;
    venueName: string;
    ticketPdf: Buffer;
    qrCode?: string;
}): Promise<boolean> {
    try {
        // Configure Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Set your email environment variable
                pass: process.env.EMAIL_PASS  // Set your password securely
            }
        });

        // Email content
        const mailOptions = {
            from: `"Event Tickets" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html: `
                <h2>Your Ticket for ${eventName}</h2>
                <p><strong>Event Date:</strong> ${eventDate.toDateString()}</p>
                <p><strong>Venue:</strong> ${venueName}</p>
                <p>Attached is your ticket. Please present the QR code below at the event.</p>
                ${qrCode ? `<img src="${qrCode}" alt="QR Code" width="150"/>` : ''}
                <p>Thank you for booking with us!</p>
            `,
            attachments: [
                {
                    filename: `${eventName}_Ticket.pdf`,
                    content: ticketPdf, // Attach ticket PDF
                    contentType: 'application/pdf'
                }
            ]
        };

        // Send email
        await transporter.sendMail(mailOptions);
        console.log(`Ticket email sent successfully to ${to}`);
        return true;
    } catch (error) {
        console.error('Error sending ticket email:', error);
        return false;
    }
  }
  static sendEmail(email: string, arg1: string, emailContent: string) {
    throw new Error("Method not implemented.");
  }
  private static readonly PASSWORD_LENGTH = 12;
  private static readonly EXPIRY_HOURS = 24;
  private static readonly SALT_ROUNDS = 10;
  private static readonly EMAIL_TEMPLATES = {
    welcome: 'welcome-email-template',
    reset: 'reset-password-template'
  };

  private static log(level: 'info' | 'warn' | 'error', message: string, ...meta: any[]) {
    const prefix = level.toUpperCase();
    console[level](`${prefix}: ${message}`, ...meta);
  }

  private static generatePassword(length = this.PASSWORD_LENGTH): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  private static getTransporter() {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_PASSWORD) {
      throw new Error('GMAIL credentials not configured');
    }
    
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }

  private static generateWelcomeEmailContent(
    email: string, 
    password: string, 
    username: string, 
    firstName: string, 
    lastName: string
  ): string {
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

  private static generateResetEmailContent(resetLink: string): string {
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

  private static setSessionData(
    req: Request,
    data: {
      password: string;
      email: string;
      expiry: number;
      username: string;
      lastname: string;
      firstname: string;
    }
  ) {
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

  private static clearSessionData(req: Request) {
    if (!req.session) return;

    delete req.session.defaultPassword;
    delete req.session.defaultEmail;
    delete req.session.passwordExpiry;
    delete req.session.username;
    delete req.session.lastname;
    delete req.session.firstname;
  }

  public static async sendDefaultPassword(
    email: string,
    lastName: string,
    firstName: string,
    username: string,
    req: Request
  ): Promise<boolean> {
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

      const info = await transporter.sendMail(mailOptions);
      this.log('info', 'Email sent successfully:', info.response);
      return true;
    } catch (error) {
      this.log('error', 'Error in sendDefaultPassword:', error);
      return false;
    }
  }

  public static invalidateDefaultPassword(req: Request, email: string): void {
    if (!req.session) {
      this.log('warn', 'Session object is undefined while invalidating default password');
      return;
    }
  
    if (req.session.defaultEmail === email) {
      this.clearSessionData(req);
      this.log('info', `Default password invalidated for email: ${email}`);
    } else {
      this.log('warn', `Email mismatch during password invalidation. Provided: ${email}, Session: ${req.session.defaultEmail}`);
    }
  }

  public static async verifyDefaultPassword(
    email: string,
    password: string,
    req: Request
  ): Promise<boolean> {
    try {
      if (!req.session) {
        this.log('error', 'Session object is undefined');
        return false;
      }

      const { session } = req;
      const isVerified = (
        session.defaultPassword === password &&
        session.defaultEmail === email &&
        session.passwordExpiry &&
        Date.now() <= session.passwordExpiry
      );

      if (!isVerified) {
        this.log('warn', 'Verification failed: Invalid password or expired.');
        return false;
      }

      this.clearSessionData(req);
      this.log('info', 'Password verified successfully.');
      return true;
    } catch (error) {
      this.log('error', 'Error verifying password:', error);
      return false;
    }
  }


















  public static async sendPasswordResetEmail(email: string, resetLink: string): Promise<void> {
    try {
      const transporter = this.getTransporter();

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        html: this.generateResetEmailContent(resetLink),
      };

      await transporter.sendMail(mailOptions);
      this.log('info', `Password reset email sent to ${email}`);
    } catch (error) {
      this.log('error', `Failed to send password reset email to ${email}:`, error);
      throw error;
    }
  }


   

  public static async sendSuccessPasswordForgetEmail(
    email: string,
    username: string,
    password: string
  ): Promise<void> {
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
  
      await transporter.sendMail(mailOptions);
      this.log('info', `Password reset success email sent to ${email}`);
    } catch (error) {
      this.log('error', `Failed to send password reset success email to ${email}:`, error);
      throw error;
    }
  }
  
}  

export default PasswordService;