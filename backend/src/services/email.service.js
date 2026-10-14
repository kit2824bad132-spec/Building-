const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter using configured credentials
const createTransporter = () => {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

  if (!user || !pass) {
    console.warn('[Email Warning] EMAIL_USER or EMAIL_PASS not configured. Emails will fail.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass
    }
  });
};

/**
 * Send an email notification for a new construction enquiry
 * @param {Object} enquiry
 * @returns {Promise<Object>}
 */
async function sendEnquiryNotificationEmail(enquiry) {
  const transporter = createTransporter();
  const receiverEmail = process.env.ENQUIRY_RECEIVER_EMAIL || 'sabarispm7708@gmail.com';
  const senderEmail = process.env.EMAIL_USER || receiverEmail;

  const {
    customer_name,
    phone,
    email,
    construction_location,
    built_up_area_sqft,
    budget_range,
    message,
    submission_date = new Date()
  } = enquiry;

  // Format date in IST
  const formattedDate = new Date(submission_date).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const cleanPhone = phone ? phone.replace(/[^\d+]/g, '') : '';
  const waPhone = cleanPhone.replace(/^\+/, '');
  const waLink = `https://wa.me/${waPhone}?text=Hello%20${encodeURIComponent(customer_name)},%20this%20is%20Saravanan%20Builders%20following%20up%20on%20your%20construction%20enquiry.`;

  // HTML Email Template matching Saravanan Builders White, Gold (#C8A24D), and Navy (#17243A) aesthetic
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Construction Enquiry</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F8F6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #17243A;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F8F8F6; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(23, 36, 58, 0.08); border: 1px solid #E5E7EB;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #17243A; padding: 28px 30px; text-align: center; border-bottom: 3px solid #C8A24D;">
              <h1 style="margin: 0; color: #FFFFFF; font-size: 22px; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 800;">
                SARAVANAN <span style="color: #C8A24D;">BUILDERS</span>
              </h1>
              <p style="margin: 6px 0 0 0; color: #E8D7A6; font-size: 13px; letter-spacing: 0.1em; text-transform: uppercase;">
                New Construction Enquiry Received
              </p>
            </td>
          </tr>

          <!-- Notification Alert Banner -->
          <tr>
            <td style="background-color: #FBF8EE; border-bottom: 1px solid #E8D7A6; padding: 14px 30px; text-align: center;">
              <span style="display: inline-block; font-size: 13px; font-weight: 600; color: #C8A24D;">
                🔔 Lead Alert: A new client submitted the website enquiry form
              </span>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 30px;">
              
              <!-- Client Overview Table -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 25px;">
                <tr>
                  <td colspan="2" style="padding-bottom: 15px;">
                    <h2 style="margin: 0; font-size: 17px; color: #17243A; font-weight: 700; border-bottom: 2px solid #F3F4F6; padding-bottom: 8px;">
                      Client Information & Project Details
                    </h2>
                  </td>
                </tr>

                <tr>
                  <td width="38%" style="padding: 10px 0; font-size: 14px; color: #6B7280; font-weight: 500;">Client Name:</td>
                  <td width="62%" style="padding: 10px 0; font-size: 15px; color: #17243A; font-weight: 700;">${customer_name}</td>
                </tr>

                <tr style="background-color: #F9FAFB;">
                  <td style="padding: 10px 8px; font-size: 14px; color: #6B7280; font-weight: 500;">Phone Number:</td>
                  <td style="padding: 10px 8px; font-size: 15px; color: #17243A; font-weight: 700;">
                    <a href="tel:${cleanPhone}" style="color: #17243A; text-decoration: none;">${phone}</a>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #6B7280; font-weight: 500;">Email Address:</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #17243A; font-weight: 600;">
                    ${email ? `<a href="mailto:${email}" style="color: #C8A24D; text-decoration: underline;">${email}</a>` : '<span style="color: #9CA3AF; font-style: italic;">Not Provided</span>'}
                  </td>
                </tr>

                <tr style="background-color: #F9FAFB;">
                  <td style="padding: 10px 8px; font-size: 14px; color: #6B7280; font-weight: 500;">Construction Location:</td>
                  <td style="padding: 10px 8px; font-size: 15px; color: #17243A; font-weight: 700;">📍 ${construction_location}</td>
                </tr>

                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #6B7280; font-weight: 500;">Approx. Built-up Area:</td>
                  <td style="padding: 10px 0; font-size: 14px; color: #17243A; font-weight: 600;">
                    ${built_up_area_sqft ? `<strong>${Number(built_up_area_sqft).toLocaleString('en-IN')}</strong> sq.ft.` : '<span style="color: #9CA3AF;">Not specified</span>'}
                  </td>
                </tr>

                <tr style="background-color: #F9FAFB;">
                  <td style="padding: 10px 8px; font-size: 14px; color: #6B7280; font-weight: 500;">Estimated Budget:</td>
                  <td style="padding: 10px 8px; font-size: 15px; color: #C8A24D; font-weight: 700;">
                    ${budget_range || '<span style="color: #9CA3AF; font-weight: normal;">Not specified</span>'}
                  </td>
                </tr>

                <tr>
                  <td style="padding: 10px 0; font-size: 14px; color: #6B7280; font-weight: 500;">Submission Time:</td>
                  <td style="padding: 10px 0; font-size: 13px; color: #4B5563;">${formattedDate}</td>
                </tr>
              </table>

              <!-- Message / Plot Details Box -->
              <div style="background-color: #F8F8F6; border-left: 4px solid #C8A24D; padding: 18px 20px; border-radius: 6px; margin: 25px 0;">
                <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #17243A; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">
                  Plot Dimensions & Client Requirements:
                </h3>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #374151; white-space: pre-wrap;">${message}</p>
              </div>

              <!-- Quick Action Buttons -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 25px;">
                <tr>
                  <td align="center" style="padding: 5px;">
                    <a href="tel:${cleanPhone}" style="display: inline-block; background-color: #17243A; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 22px; border-radius: 6px; margin: 4px;">
                      📞 Call Client (${cleanPhone})
                    </a>
                    <a href="${waLink}" style="display: inline-block; background-color: #25D366; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 22px; border-radius: 6px; margin: 4px;">
                      💬 Open in WhatsApp
                    </a>
                    ${email ? `
                    <a href="mailto:${email}?subject=Regarding%20Your%20Construction%20Enquiry%20-%20Saravanan%20Builders" style="display: inline-block; background-color: #C8A24D; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 22px; border-radius: 6px; margin: 4px;">
                      ✉️ Reply by Email
                    </a>` : ''}
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F3F4F6; padding: 20px 30px; text-align: center; border-top: 1px solid #E5E7EB; font-size: 12px; color: #6B7280;">
              <p style="margin: 0 0 4px 0; font-weight: 600; color: #17243A;">Saravanan Builders Operations Management</p>
              <p style="margin: 0;">124, Gandhi Road, Anna Nagar, Chennai, Tamil Nadu - 600040</p>
              <p style="margin: 6px 0 0 0; color: #9CA3AF;">This notification was automatically dispatched from the Saravanan Builders website contact form.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  // Plaintext version
  const textContent = `
NEW CONSTRUCTION ENQUIRY — SARAVANAN BUILDERS
====================================================

Client Full Name: ${customer_name}
Phone Number:     ${phone}
Email Address:    ${email || 'Not Provided'}
Location:         ${construction_location}
Built-up Area:    ${built_up_area_sqft ? `${built_up_area_sqft} sq.ft.` : 'Not specified'}
Budget Range:     ${budget_range || 'Not specified'}
Submission Time:  ${formattedDate}

Plot Details & Message:
----------------------------------------------------
${message}
----------------------------------------------------

Direct WhatsApp Link: ${waLink}
Direct Call: tel:${cleanPhone}

--
Saravanan Builders Automated Enquiry Notification
  `.trim();

  const mailOptions = {
    from: `"Saravanan Builders Website" <${senderEmail}>`,
    to: receiverEmail,
    replyTo: email && email.trim() ? email.trim() : senderEmail,
    subject: `🏠 New Construction Enquiry: ${customer_name} (${construction_location})`,
    text: textContent,
    html: htmlContent
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[Email Service] Enquiry notification successfully delivered to ${receiverEmail}. MessageId: ${info.messageId}`);
  return info;
}

module.exports = {
  sendEnquiryNotificationEmail,
  createTransporter
};
