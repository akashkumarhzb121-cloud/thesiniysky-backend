const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || process.env.SMTP_FROM_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

exports.sendContactEmail = async (contactData) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'TheSiniySky'}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: process.env.SMTP_FROM_EMAIL,
      replyTo: contactData.email,
      subject: `New Contact: ${contactData.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Subject:</strong> ${contactData.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${contactData.message}</p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

exports.sendNewsletterConfirmation = async (email) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'TheSiniySky'}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: 'Welcome to TheSiniySky Newsletter!',
      html: `
        <h2>Thank you for subscribing!</h2>
        <p>You'll receive our latest updates, tips, and news directly to your inbox.</p>
        <p>Stay tuned!</p>
        <br>
        <p><small>To unsubscribe, <a href="${process.env.APP_URL}/unsubscribe">click here</a></small></p>
      `,
    });
    return true;
  } catch (error) {
    console.error('Newsletter email error:', error);
    return false;
  }
};

exports.sendNewsletter = async (subject, content) => {
  try {
    // For production, you'd fetch all subscribers from DB
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'TheSiniySky'}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: process.env.SMTP_FROM_EMAIL,
      subject: subject,
      html: content,
    });
    return true;
  } catch (error) {
    console.error('Newsletter send error:', error);
    return false;
  }
};
