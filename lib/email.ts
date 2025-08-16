import nodemailer from 'nodemailer';

console.log('🔧 Email service initializing...');
console.log('📧 Environment check:', {
  hasSmtpHost: !!process.env.SMTP_HOST,
  hasSmtpUser: !!process.env.SMTP_USER,
  hasSmtpPass: !!process.env.SMTP_PASS,
  hasSenderEmail: !!process.env.SENDER_EMAIL,
  hasAdminEmail: !!process.env.ADMIN_EMAIL,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: process.env.SMTP_PORT,
  smtpUser: process.env.SMTP_USER,
  senderEmail: process.env.SENDER_EMAIL,
  adminEmail: process.env.ADMIN_EMAIL
});

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendBookingConfirmation(bookingData: {
  email: string;
  fullName: string;
  phone: string;
  eventDate: string;
  eventTime?: string;
  location: string;
  guestCount: number;
  quote: number;
  additionalNotes?: string;
}) {
  console.log('📧 STEP 1: Starting sendBookingConfirmation');
  console.log('📧 STEP 1: Parameters:', { bookingData });
  
  try {
    console.log('📧 STEP 1: Preparing HTML email content...');
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffe4d6;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #F13F27; font-size: 28px; margin: 0;">Chef Alex J</h1>
            <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">Private Dining & Catering</p>
          </div>
          
          <h2 style="color: #F13F27; font-size: 24px; margin-bottom: 20px;">Thank you for your booking request!</h2>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hi ${bookingData.fullName},
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            We've received your request for a private dining experience. Here are the details we have on file:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #F13F27; font-size: 18px; margin: 0 0 15px 0;">Event Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Date:</td>
                <td style="padding: 8px 0; color: #333;">${bookingData.eventDate}${bookingData.eventTime ? ` at ${bookingData.eventTime}` : ''}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Location:</td>
                <td style="padding: 8px 0; color: #333;">${bookingData.location}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Guests:</td>
                <td style="padding: 8px 0; color: #333;">${bookingData.guestCount}</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Estimated Quote:</td>
                <td style="padding: 8px 0; color: #333;">$${bookingData.quote} CAD</td>
              </tr>
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Contact:</td>
                <td style="padding: 8px 0; color: #333;">${bookingData.phone}</td>
              </tr>
              ${bookingData.additionalNotes ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">Notes:</td>
                <td style="padding: 8px 0; color: #333;">${bookingData.additionalNotes}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            <strong>What happens next?</strong><br>
            Chef Alex will personally review your request and get back to you within 24 hours with confirmation and any additional details about your event.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/#booking" 
               style="display: inline-block; background-color: #F13F27; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
              View Booking Page
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
              Questions? Reply to this email or contact us:
            </p>
            <p style="color: #F13F27; font-size: 14px; margin: 0;">
              <strong>hello@chefalexj.com</strong> • <strong>Toronto, ON</strong>
            </p>
          </div>
        </div>
      </div>
    `;
    
    console.log('📧 STEP 1: Preparing email data...');
    const mailOptions = {
      from: `"Chef Alex J" <${process.env.SENDER_EMAIL}>`,
      to: `"${bookingData.fullName}" <${bookingData.email}>`,
      subject: `Booking Request Received - ${bookingData.eventDate}`,
      html: htmlContent,
      text: `Hi ${bookingData.fullName},

Thank you for your booking request! We've received your request for a private dining experience on ${bookingData.eventDate} for ${bookingData.guestCount} guests at ${bookingData.location}.

Estimated Quote: $${bookingData.quote} CAD

Chef Alex will personally review your request and get back to you within 24 hours with confirmation and any additional details about your event.

 You can view your booking details at: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/#booking

Questions? Reply to this email or contact us at hello@chefalexj.com

Best regards,
Chef Alex J Team`,
    };
    
    console.log('📧 STEP 1: Email data prepared');
    console.log('📧 STEP 1: Sending email via Nodemailer SMTP...');
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('📧 STEP 1: ✅ Email sent successfully!');
    console.log('📧 STEP 1: Nodemailer response:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('📧 STEP 1: ❌ Error sending booking confirmation email:');
    console.error('📧 STEP 1: Error details:', error);
    console.error('📧 STEP 1: Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('📧 STEP 1: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    throw error;
  }
}

export async function sendAdminNotification(data: any) {
  console.log('📧 STEP 2: Starting sendAdminNotification');
  console.log('📧 STEP 2: Parameters:', JSON.stringify(data, null, 2));
  
  try {
    console.log('📧 STEP 2: Preparing email content...');
    const text = `
New Booking Request:
Name: ${data.client.name}
Email: ${data.client.email}
Phone: ${data.client.phone}

Event Date: ${data.event.date}
Event Time: ${data.event.time}
Location: ${data.event.location}
Guests: ${data.event.guestCount}
Quote: $${data.event.estimatedQuote}
Notes: ${data.event.additionalNotes}

Summary:
${data.chatSummary}

Admin Dashboard: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin
    `;
    
    console.log('📧 STEP 2: Email text content:', text);
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #F13F27; font-size: 24px; margin-bottom: 20px;">New Booking Request</h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #F13F27; font-size: 18px; margin: 0 0 15px 0;">Client Details</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${data.client.name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${data.client.email}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${data.client.phone}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #F13F27; font-size: 18px; margin: 0 0 15px 0;">Event Details</h3>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${data.event.date}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${data.event.time}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${data.event.location}</p>
            <p style="margin: 5px 0;"><strong>Guests:</strong> ${data.event.guestCount}</p>
            <p style="margin: 5px 0;"><strong>Quote:</strong> $${data.event.estimatedQuote}</p>
            ${data.event.additionalNotes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${data.event.additionalNotes}</p>` : ''}
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #F13F27; font-size: 18px; margin: 0 0 15px 0;">Chat Summary</h3>
            <div style="white-space: pre-line; line-height: 1.6;">${data.chatSummary}</div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/admin" 
               style="display: inline-block; background-color: #F13F27; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-right: 15px;">
              View Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    `;
    
    const mailOptions = {
      from: `"Chef Alex J Booking Bot" <${process.env.SENDER_EMAIL}>`,
      to: `"Chef Alex" <${process.env.ADMIN_EMAIL}>`,
      subject: 'New Booking Request',
      html: htmlContent,
      text: text,
    };
    
    console.log('📧 STEP 2: Email data:', JSON.stringify(mailOptions, null, 2));
    console.log('📧 STEP 2: Sending email via Nodemailer SMTP...');
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('📧 STEP 2: ✅ Admin notification sent successfully!');
    console.log('📧 STEP 2: Nodemailer response:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('📧 STEP 2: ❌ Error sending admin notification email:');
    console.error('📧 STEP 2: Error details:', error);
    console.error('📧 STEP 2: Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('📧 STEP 2: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    throw error;
  }
}

export async function sendBookingNotificationToAlex(bookingId: string, data: any, summary: string) {
  console.log('📧 STEP 3: Starting sendBookingNotificationToAlex');
  console.log('📧 STEP 3: Parameters:', { bookingId, data, summary });
  
  try {
    console.log('📧 STEP 3: Preparing approval URL...');
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const approvalUrl = `${baseUrl}/approve/${bookingId}`;
    console.log('📧 STEP 3: Approval URL:', approvalUrl);
    
    console.log('📧 STEP 3: Preparing HTML content...');
    const htmlContent = `
      <h3>New Event Consultation Request</h3>
      <p><strong>Name:</strong> ${data.fullName}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone}</p>
      <p><strong>Date:</strong> ${data.eventDate} @ ${data.eventTime}</p>
      <p><strong>Location:</strong> ${data.location}</p>
      <p><strong>Guests:</strong> ${data.guestCount}</p>
      <p><strong>Notes:</strong> ${data.additionalNotes}</p>
      <hr/>
      <p><strong>Quote:</strong> $${data.quote} CAD</p>
      <p><strong>Summary:</strong> ${summary}</p>
      <br/>
      <a href="${approvalUrl}" style="padding: 10px 20px; background-color: #F13F27; color: white; text-decoration: none;">Review Request</a>
    `;
    
    console.log('📧 STEP 3: HTML content:', htmlContent);
    
    const mailOptions = {
      from: `"Chef Alex Booking Bot" <${process.env.SENDER_EMAIL}>`,
      to: `"Chef Alex" <hello@chefalexj.com>`,
      subject: `New Booking Request from ${data.fullName}`,
      html: htmlContent,
    };
    
    console.log('📧 STEP 3: Email data:', JSON.stringify(mailOptions, null, 2));
    console.log('📧 STEP 3: Sending email via Nodemailer SMTP...');
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('📧 STEP 3: ✅ Booking notification to Alex sent successfully!');
    console.log('📧 STEP 3: Nodemailer response:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('📧 STEP 3: ❌ Error sending booking notification to Alex:');
    console.error('📧 STEP 3: Error details:', error);
    console.error('📧 STEP 3: Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('📧 STEP 3: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    throw error;
  }
}

export async function sendSuggestedTimesToClient(bookingData: {
  bookingId: string;
  clientEmail: string;
  clientName: string;
  suggestedTimes: string[];
  originalEventDate: string;
  location: string;
  guestCount: number;
}) {
  console.log('📧 STEP 4: Starting sendSuggestedTimesToClient');
  console.log('📧 STEP 4: Parameters:', { bookingData });
  
  try {
    console.log('📧 STEP 4: Preparing suggested times email content...');
    
    const formatDateTime = (isoString: string) => {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffe4d6;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #F13F27; font-size: 28px; margin: 0;">Chef Alex J</h1>
            <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">Private Dining & Catering</p>
          </div>
          
          <h2 style="color: #F13F27; font-size: 24px; margin-bottom: 20px;">Alternative Times Available</h2>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Hi ${bookingData.clientName},
          </p>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Thank you for your patience! Unfortunately, your requested date of <strong>${bookingData.originalEventDate}</strong> isn't available, but I have some great alternative times that would work perfectly for your event:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #F13F27; font-size: 18px; margin: 0 0 15px 0;">Available Times</h3>
            ${bookingData.suggestedTimes.map((time, index) => `
              <div style="margin-bottom: 15px; padding: 15px; background-color: white; border-radius: 5px; border-left: 4px solid #F13F27;">
                <div style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 8px;">
                  Option ${index + 1}: ${formatDateTime(time)}
                </div>
                <div style="text-align: center;">
                  <a href="${baseUrl}/confirm/${bookingData.bookingId}?time=${encodeURIComponent(time)}" 
                     style="display: inline-block; background-color: #F13F27; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">
                    Choose This Time
                  </a>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #F13F27; font-size: 18px; margin: 0 0 15px 0;">Event Details</h3>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${bookingData.location}</p>
            <p style="margin: 5px 0;"><strong>Guests:</strong> ${bookingData.guestCount}</p>
          </div>
          
          <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Simply click on "Choose This Time" for your preferred option, and I'll send you the final confirmation. If none of these times work, please reply to this email and we'll find something that does!
          </p>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">
              Questions? Reply to this email or contact us:
            </p>
            <p style="color: #F13F27; font-size: 14px; margin: 0;">
              <strong>hello@chefalexj.com</strong> • <strong>Toronto, ON</strong>
            </p>
          </div>
        </div>
      </div>
    `;
    
    const textContent = `Hi ${bookingData.clientName},

Thank you for your patience! Unfortunately, your requested date of ${bookingData.originalEventDate} isn't available, but I have some great alternative times that would work perfectly for your event:

AVAILABLE TIMES:
${bookingData.suggestedTimes.map((time, index) => `
Option ${index + 1}: ${formatDateTime(time)}
Confirm this time: ${baseUrl}/confirm/${bookingData.bookingId}?time=${encodeURIComponent(time)}
`).join('')}

Event Details:
Location: ${bookingData.location}
Guests: ${bookingData.guestCount}

Simply click on the confirmation link for your preferred option, and I'll send you the final confirmation. If none of these times work, please reply to this email and we'll find something that does!

Questions? Reply to this email or contact us at hello@chefalexj.com

Best regards,
Chef Alex J`;
    
    console.log('📧 STEP 4: Preparing email data...');
    const mailOptions = {
      from: `"Chef Alex J" <${process.env.SENDER_EMAIL}>`,
      to: `"${bookingData.clientName}" <${bookingData.clientEmail}>`,
      subject: `Alternative Times Available - Your Event Booking`,
      html: htmlContent,
      text: textContent,
    };
    
    console.log('📧 STEP 4: Email data prepared');
    console.log('📧 STEP 4: Sending suggested times email via Nodemailer SMTP...');
    
    const result = await transporter.sendMail(mailOptions);
    
    console.log('📧 STEP 4: ✅ Suggested times email sent successfully!');
    console.log('📧 STEP 4: Nodemailer response:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('📧 STEP 4: ❌ Error sending suggested times email:');
    console.error('📧 STEP 4: Error details:', error);
    console.error('📧 STEP 4: Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('📧 STEP 4: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    throw error;
  }
}