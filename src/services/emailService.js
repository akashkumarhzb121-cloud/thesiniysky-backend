const { Resend } = require('resend');

function getTransporter() {
  if (process.env.RESEND_API_KEY) {
    return new Resend(process.env.RESEND_API_KEY);
  }
  return null;
}

exports.sendContactEmail = async (contactData) => {
  try {
    const resend = getTransporter();
    if (resend) {
      await resend.emails.send({
        from: 'TheSiniySky <onboarding@resend.dev>',
        to: process.env.SMTP_FROM_EMAIL || 'thesiniysky@gmail.com',
        replyTo: contactData.email,
        subject: 'New Contact: ' + contactData.subject,
        html: '<h2>New Contact Form</h2><p><b>Name:</b> ' + contactData.name + '</p><p><b>Email:</b> ' + contactData.email + '</p><p><b>Subject:</b> ' + contactData.subject + '</p><p><b>Message:</b> ' + contactData.message + '</p>'
      });
      return true;
    }
    return false;
  } catch (error) {
    console.error('Resend error:', error.message);
    return false;
  }
};

exports.sendNewsletterConfirmation = async (email) => {
  try {
    const resend = getTransporter();
    if (resend) {
      await resend.emails.send({
        from: 'TheSiniySky <onboarding@resend.dev>',
        to: email,
        subject: 'Welcome to TheSiniySky Newsletter!',
        html: '<h2>Thank you for subscribing!</h2><p>You will receive our latest updates directly to your inbox.</p>'
      });
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

exports.sendNewsletter = async (subject, content) => {
  try {
    const resend = getTransporter();
    if (resend) {
      await resend.emails.send({
        from: 'TheSiniySky <onboarding@resend.dev>',
        to: process.env.SMTP_FROM_EMAIL || 'thesiniysky@gmail.com',
        subject: subject,
        html: content
      });
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};
