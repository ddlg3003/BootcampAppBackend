import sgMail from '@sendgrid/mail';

const sendMail = async (options) => {
    sgMail.setApiKey(process.env.SMTP_API_KEY);

    const msg = {
        to: options.email, // Change to your recipient
        from: process.env.FROM_EMAIL, // Change to your verified sender
        subject: options.subject,
        // text: options.message,
        html: options.message,
      }

    await sgMail.send(msg);
}

export default sendMail;