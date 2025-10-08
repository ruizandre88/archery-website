const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static site (optional)
app.use(express.static(path.join(__dirname, '..')));

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, purpose, instructor, 'lesson-date': lessonDate, 'class-select': classSelect, participants, message } = req.body;

    const recipient = process.env.CONTACT_RECIPIENT || 'archery-education@example.com';

    let subject = `Website contact: ${purpose}`;
    let body = [];
    body.push(`Name: ${name}`);
    body.push(`Email: ${email}`);
    if (phone) body.push(`Phone: ${phone}`);
    if (purpose === 'private') {
      if (instructor) body.push(`Preferred instructor: ${instructor}`);
      if (lessonDate) body.push(`Preferred date: ${lessonDate}`);
    }
    if (purpose === 'register') {
      body.push(`Class: ${classSelect}`);
      body.push(`Participants: ${participants}`);
    }
    body.push('\nMessage:\n' + message);

    // create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mail = {
      from: process.env.FROM_ADDRESS || process.env.SMTP_USER,
      to: recipient,
      subject: subject,
      text: body.join('\n')
    };

    const info = await transporter.sendMail(mail);
    console.log('Message sent: %s', info.messageId);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
