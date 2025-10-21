const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendReportToParent(parentEmail, studentName, reportBuffer, options = {}) {
    const { academic_year, term } = options;

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'ReporTube'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: parentEmail,
      subject: `${studentName} - Academic Report ${academic_year || ''} ${term || ''}`,
      html: this.getReportEmailTemplate(studentName, academic_year, term),
      attachments: [
        {
          filename: `${studentName.replace(/\s+/g, '_')}_Report_${term || ''}.pdf`,
          content: reportBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${parentEmail}:`, info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Failed to send email to ${parentEmail}:`, error);
      throw error;
    }
  }

  async sendBulkReports(reportData) {
    const results = [];

    for (const report of reportData) {
      try {
        const result = await this.sendReportToParent(
          report.parentEmail,
          report.studentName,
          report.reportBuffer,
          {
            academic_year: report.academic_year,
            term: report.term,
          }
        );
        results.push({ ...result, email: report.parentEmail, success: true });
      } catch (error) {
        results.push({
          email: report.parentEmail,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  async sendWelcomeEmail(email, fullName, password, role) {
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'ReporTube'}" <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: email,
      subject: `Welcome to ${process.env.APP_NAME || 'ReporTube'}`,
      html: this.getWelcomeEmailTemplate(fullName, email, password, role),
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Welcome email sent to ${email}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Failed to send welcome email to ${email}:`, error);
      throw error;
    }
  }

  getReportEmailTemplate(studentName, academic_year, term) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${process.env.APP_NAME || 'ReporTube'}</h1>
            <p>Academic Performance Report</p>
          </div>
          <div class="content">
            <h2>Dear Parent/Guardian,</h2>
            <p>We are pleased to share with you the academic performance report for <strong>${studentName}</strong>.</p>
            <p><strong>Academic Year:</strong> ${academic_year || 'N/A'}<br>
            <strong>Term:</strong> ${term || 'N/A'}</p>
            <p>Please find the detailed report attached to this email as a PDF document.</p>
            <p>We encourage you to review the report carefully and discuss it with your child. If you have any questions or concerns, please do not hesitate to contact the school.</p>
            <p>Thank you for your continued support in your child's education.</p>
            <p><strong>Best regards,</strong><br>
            The Academic Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email from ${process.env.APP_NAME || 'ReporTube'}. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'ReporTube'}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeEmailTemplate(fullName, email, password, role) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .warning { color: #e74c3c; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ${process.env.APP_NAME || 'ReporTube'}</h1>
          </div>
          <div class="content">
            <h2>Hello ${fullName},</h2>
            <p>Your account has been created as a <strong>${role}</strong> on ${process.env.APP_NAME || 'ReporTube'}.</p>
            <div class="credentials">
              <h3>Your Login Credentials:</h3>
              <p><strong>Email:</strong> ${email}<br>
              <strong>Password:</strong> ${password}</p>
              <p class="warning">⚠️ Please change your password after your first login.</p>
            </div>
            <p>You can access the system at: <a href="${process.env.APP_URL || 'http://localhost:3000'}">${process.env.APP_URL || 'http://localhost:3000'}</a></p>
            <p>If you have any questions, please contact the administrator.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ${process.env.APP_NAME || 'ReporTube'}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('❌ SMTP connection failed:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
