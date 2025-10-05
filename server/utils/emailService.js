const nodemailer = require('nodemailer');
const config = require('../config/config');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  // Initialize email transporter
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.port === 465, // true for 465, false for other ports
        auth: {
          user: config.email.user,
          pass: config.email.pass,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verify connection configuration
      this.verifyConnection();
    } catch (error) {
      console.error('Email transporter initialization failed:', error);
    }
  }

  // Verify email connection
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('Email server connection established successfully');
    } catch (error) {
      console.error('Email server connection failed:', error);
    }
  }

  // Send email utility function
  async sendEmail(mailOptions) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Template for new ticket creation notification
  async sendTicketCreatedNotification(ticket, user) {
    const subject = `New Ticket Created: ${ticket.title} [#${ticket._id.toString().slice(-6)}]`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .ticket-info { background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .priority-${ticket.priority} { border-left: 4px solid ${this.getPriorityColor(ticket.priority)}; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Support Ticket Created</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>A new support ticket has been created and assigned to you:</p>
            
            <div class="ticket-info priority-${ticket.priority}">
              <h3>Ticket Details</h3>
              <p><strong>Ticket ID:</strong> #${ticket._id.toString().slice(-6)}</p>
              <p><strong>Title:</strong> ${ticket.title}</p>
              <p><strong>Priority:</strong> ${ticket.priority.toUpperCase()}</p>
              <p><strong>Category:</strong> ${ticket.category}</p>
              <p><strong>Created:</strong> ${new Date(ticket.createdAt).toLocaleString()}</p>
              <p><strong>SLA Deadline:</strong> ${new Date(ticket.slaDeadline).toLocaleString()}</p>
            </div>
            
            <div class="ticket-info">
              <h4>Description:</h4>
              <p>${ticket.description}</p>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${this.getTicketUrl(ticket._id)}" class="btn">View Ticket</a>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated notification from HelpDesk Mini System</p>
            <p>Please do not reply to this email directly</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
New Support Ticket Created

Hello ${user.name},

A new support ticket has been created:

Ticket ID: #${ticket._id.toString().slice(-6)}
Title: ${ticket.title}
Priority: ${ticket.priority.toUpperCase()}
Category: ${ticket.category}
Created: ${new Date(ticket.createdAt).toLocaleString()}
SLA Deadline: ${new Date(ticket.slaDeadline).toLocaleString()}

Description:
${ticket.description}

View ticket: ${this.getTicketUrl(ticket._id)}

---
This is an automated notification from HelpDesk Mini System
    `;

    const mailOptions = {
      from: `"HelpDesk Mini" <${config.email.user}>`,
      to: user.email,
      subject: subject,
      text: textContent,
      html: htmlContent
    };

    return await this.sendEmail(mailOptions);
  }

  // Template for ticket assignment notification
  async sendTicketAssignedNotification(ticket, assignedAgent, assignedBy) {
    const subject = `Ticket Assigned: ${ticket.title} [#${ticket._id.toString().slice(-6)}]`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .ticket-info { background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .priority-${ticket.priority} { border-left: 4px solid ${this.getPriorityColor(ticket.priority)}; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ticket Assigned to You</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${assignedAgent.name}</strong>,</p>
            <p>A support ticket has been assigned to you by <strong>${assignedBy.name}</strong>:</p>
            
            <div class="ticket-info priority-${ticket.priority}">
              <h3>Ticket Details</h3>
              <p><strong>Ticket ID:</strong> #${ticket._id.toString().slice(-6)}</p>
              <p><strong>Title:</strong> ${ticket.title}</p>
              <p><strong>Priority:</strong> ${ticket.priority.toUpperCase()}</p>
              <p><strong>Status:</strong> ${ticket.status.toUpperCase()}</p>
              <p><strong>SLA Deadline:</strong> ${new Date(ticket.slaDeadline).toLocaleString()}</p>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${this.getTicketUrl(ticket._id)}" class="btn">View & Work on Ticket</a>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated notification from HelpDesk Mini System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"HelpDesk Mini" <${config.email.user}>`,
      to: assignedAgent.email,
      subject: subject,
      html: htmlContent
    };

    return await this.sendEmail(mailOptions);
  }

  // Template for SLA breach notification
  async sendSLABreachNotification(ticket, agents) {
    const subject = `🚨 SLA BREACHED: ${ticket.title} [#${ticket._id.toString().slice(-6)}]`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .ticket-info { background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #dc3545; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 10px 20px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; }
          .urgent { background-color: #fff3cd; padding: 10px; border-radius: 5px; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 SLA DEADLINE BREACHED</h1>
          </div>
          <div class="content">
            <div class="urgent">
              <strong>URGENT ACTION REQUIRED:</strong> The following ticket has exceeded its SLA deadline and requires immediate attention.
            </div>
            
            <div class="ticket-info">
              <h3>Ticket Details</h3>
              <p><strong>Ticket ID:</strong> #${ticket._id.toString().slice(-6)}</p>
              <p><strong>Title:</strong> ${ticket.title}</p>
              <p><strong>Priority:</strong> ${ticket.priority.toUpperCase()}</p>
              <p><strong>Status:</strong> ${ticket.status.toUpperCase()}</p>
              <p><strong>Created:</strong> ${new Date(ticket.createdAt).toLocaleString()}</p>
              <p><strong>SLA Deadline:</strong> ${new Date(ticket.slaDeadline).toLocaleString()}</p>
              <p><strong>Time Overdue:</strong> ${this.calculateOverdueTime(ticket.slaDeadline)}</p>
              <p><strong>Assigned To:</strong> ${ticket.assignedTo ? ticket.assignedTo.name : 'Unassigned'}</p>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${this.getTicketUrl(ticket._id)}" class="btn">Take Immediate Action</a>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated SLA breach notification from HelpDesk Mini System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to multiple agents
    const emailPromises = agents.map(agent => {
      const mailOptions = {
        from: `"HelpDesk Mini Alert" <${config.email.user}>`,
        to: agent.email,
        subject: subject,
        html: htmlContent,
        priority: 'high'
      };
      return this.sendEmail(mailOptions);
    });

    return await Promise.allSettled(emailPromises);
  }

  // Template for ticket status update notification
  async sendTicketStatusUpdateNotification(ticket, user, updatedBy, oldStatus) {
    const subject = `Ticket Updated: ${ticket.title} [#${ticket._id.toString().slice(-6)}]`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #17a2b8; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .ticket-info { background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .status-change { background-color: #e9f7ef; padding: 10px; border-radius: 5px; border-left: 4px solid #28a745; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 10px 20px; background-color: #17a2b8; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Ticket Status Updated</h1>
          </div>
          <div class="content">
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Your support ticket has been updated by <strong>${updatedBy.name}</strong>:</p>
            
            <div class="status-change">
              <strong>Status Change:</strong> ${oldStatus.toUpperCase()} → ${ticket.status.toUpperCase()}
            </div>
            
            <div class="ticket-info">
              <h3>Ticket Details</h3>
              <p><strong>Ticket ID:</strong> #${ticket._id.toString().slice(-6)}</p>
              <p><strong>Title:</strong> ${ticket.title}</p>
              <p><strong>Current Status:</strong> ${ticket.status.toUpperCase()}</p>
              <p><strong>Priority:</strong> ${ticket.priority.toUpperCase()}</p>
              <p><strong>Last Updated:</strong> ${new Date(ticket.updatedAt).toLocaleString()}</p>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${this.getTicketUrl(ticket._id)}" class="btn">View Ticket Details</a>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated notification from HelpDesk Mini System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"HelpDesk Mini" <${config.email.user}>`,
      to: user.email,
      subject: subject,
      html: htmlContent
    };

    return await this.sendEmail(mailOptions);
  }

  // Template for new comment notification
  async sendNewCommentNotification(ticket, comment, recipients) {
    const subject = `New Comment: ${ticket.title} [#${ticket._id.toString().slice(-6)}]`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #6f42c1; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .ticket-info { background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .comment-box { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #6f42c1; margin: 15px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          .btn { display: inline-block; padding: 10px 20px; background-color: #6f42c1; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Comment Added</h1>
          </div>
          <div class="content">
            <p>A new comment has been added to ticket <strong>#${ticket._id.toString().slice(-6)}</strong>:</p>
            
            <div class="ticket-info">
              <h3>${ticket.title}</h3>
              <p><strong>Status:</strong> ${ticket.status.toUpperCase()}</p>
              <p><strong>Priority:</strong> ${ticket.priority.toUpperCase()}</p>
            </div>
            
            <div class="comment-box">
              <p><strong>Comment by:</strong> ${comment.authorId.name} (${comment.authorId.role})</p>
              <p><strong>Posted:</strong> ${new Date(comment.createdAt).toLocaleString()}</p>
              <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #dee2e6;">
                ${comment.content}
              </div>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${this.getTicketUrl(ticket._id)}" class="btn">View Full Conversation</a>
            </p>
          </div>
          <div class="footer">
            <p>This is an automated notification from HelpDesk Mini System</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to multiple recipients
    const emailPromises = recipients.map(recipient => {
      const mailOptions = {
        from: `"HelpDesk Mini" <${config.email.user}>`,
        to: recipient.email,
        subject: subject,
        html: htmlContent
      };
      return this.sendEmail(mailOptions);
    });

    return await Promise.allSettled(emailPromises);
  }

  // Helper methods
  getPriorityColor(priority) {
    const colors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545'
    };
    return colors[priority] || colors.medium;
  }

  getTicketUrl(ticketId) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/tickets/${ticketId}`;
  }

  calculateOverdueTime(slaDeadline) {
    const now = new Date();
    const deadline = new Date(slaDeadline);
    const diffMs = now.getTime() - deadline.getTime();
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days} days, ${hours} hours`;
    } else if (hours > 0) {
      return `${hours} hours, ${minutes} minutes`;
    } else {
      return `${minutes} minutes`;
    }
  }

  // Bulk email sending for system announcements
  async sendBulkNotification(users, subject, htmlContent, textContent) {
    const emailPromises = users.map(user => {
      const personalizedHtml = htmlContent.replace('{{userName}}', user.name);
      const personalizedText = textContent.replace('{{userName}}', user.name);
      
      const mailOptions = {
        from: `"HelpDesk Mini System" <${config.email.user}>`,
        to: user.email,
        subject: subject,
        html: personalizedHtml,
        text: personalizedText
      };
      
      return this.sendEmail(mailOptions);
    });

    return await Promise.allSettled(emailPromises);
  }
}

// Export singleton instance
module.exports = new EmailService();
