import mailjet from 'node-mailjet';

console.log('🔧 Email service initializing...');
console.log('📧 Environment check:', {
  hasMailjetApiKey: !!process.env.MAILJET_API_KEY,
  hasMailjetApiSecret: !!process.env.MAILJET_API_SECRET,
  hasSenderEmail: !!process.env.SENDER_EMAIL,
  hasAdminEmail: !!process.env.ADMIN_EMAIL,
  mailjetApiKeyLength: process.env.MAILJET_API_KEY?.length || 0,
  mailjetApiSecretLength: process.env.MAILJET_API_SECRET?.length || 0,
  senderEmail: process.env.SENDER_EMAIL,
  adminEmail: process.env.ADMIN_EMAIL
});

const mailjetClient = mailjet.apiConnect(
  process.env.MAILJET_API_KEY!,
  process.env.MAILJET_API_SECRET!
);

export async function sendBookingConfirmation(toEmail: string, name: string) {
  console.log('📧 STEP 1: Starting sendBookingConfirmation');
  console.log('📧 STEP 1: Parameters:', { toEmail, name });
  
  try {
    console.log('📧 STEP 1: Preparing email data...');
    const emailData = {
      Messages: [
        {
          From: {
            Email: process.env.SENDER_EMAIL!,
            Name: 'Chef Alex J',
          },
          To: [{ Email: toEmail, Name: name }],
          Subject: 'Thanks for your booking request!',
          TextPart: 'We got your request. Chef Alex will get back to you shortly.',
        },
      ],
    };
    
    console.log('📧 STEP 1: Email data:', JSON.stringify(emailData, null, 2));
    console.log('📧 STEP 1: Sending email via Mailjet API...');
    
    const result = await mailjetClient
      .post('send', { version: 'v3.1' })
      .request(emailData);
    
    console.log('📧 STEP 1: ✅ Email sent successfully!');
    console.log('📧 STEP 1: Mailjet response:', JSON.stringify(result.body, null, 2));
    
    return result;
  } catch (error) {
    console.error('📧 STEP 1: ❌ Error sending booking confirmation email:');
    console.error('📧 STEP 1: Error details:', error);
    console.error('📧 STEP 1: Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('📧 STEP 1: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error && typeof error === 'object' && 'response' in error) {
      console.error('📧 STEP 1: API Response error:', (error as any).response?.data || (error as any).response);
    }
    
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
    `;
    
    console.log('📧 STEP 2: Email text content:', text);
    
    const emailData = {
      Messages: [
        {
          From: {
            Email: process.env.SENDER_EMAIL!,
            Name: 'Chef Alex J Booking Bot',
          },
          To: [{ Email: process.env.ADMIN_EMAIL!, Name: 'Chef Alex' }],
          Subject: 'New Booking Request',
          TextPart: text,
        },
      ],
    };
    
    console.log('📧 STEP 2: Email data:', JSON.stringify(emailData, null, 2));
    console.log('📧 STEP 2: Sending email via Mailjet API...');
    
    const result = await mailjetClient
      .post('send', { version: 'v3.1' })
      .request(emailData);
    
    console.log('📧 STEP 2: ✅ Admin notification sent successfully!');
    console.log('📧 STEP 2: Mailjet response:', JSON.stringify(result.body, null, 2));
    
    return result;
  } catch (error) {
    console.error('📧 STEP 2: ❌ Error sending admin notification email:');
    console.error('📧 STEP 2: Error details:', error);
    console.error('📧 STEP 2: Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('📧 STEP 2: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error && typeof error === 'object' && 'response' in error) {
      console.error('📧 STEP 2: API Response error:', (error as any).response?.data || (error as any).response);
    }
    
    throw error;
  }
}

export async function sendBookingNotificationToAlex(bookingId: string, data: any, summary: string) {
  console.log('📧 STEP 3: Starting sendBookingNotificationToAlex');
  console.log('📧 STEP 3: Parameters:', { bookingId, data, summary });
  
  try {
    console.log('📧 STEP 3: Preparing approval URL...');
    const approvalUrl = `https://chefalexj.com/approve/${bookingId}`;
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
    
    const emailData = {
      Messages: [
        {
          From: {
            Email: process.env.SENDER_EMAIL!,
            Name: 'Chef Alex Booking Bot',
          },
          To: [
            {
              Email: 'hello@chefalexj.com',
              Name: 'Chef Alex',
            },
          ],
          Subject: `New Booking Request from ${data.fullName}`,
          HTMLPart: htmlContent,
        },
      ],
    };
    
    console.log('📧 STEP 3: Email data:', JSON.stringify(emailData, null, 2));
    console.log('📧 STEP 3: Sending email via Mailjet API...');
    
    const result = await mailjetClient.post('send', { version: 'v3.1' }).request(emailData);
    
    console.log('📧 STEP 3: ✅ Booking notification to Alex sent successfully!');
    console.log('📧 STEP 3: Mailjet response:', JSON.stringify(result.body, null, 2));
    
    return result;
  } catch (error) {
    console.error('📧 STEP 3: ❌ Error sending booking notification to Alex:');
    console.error('📧 STEP 3: Error details:', error);
    console.error('📧 STEP 3: Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('📧 STEP 3: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error && typeof error === 'object' && 'response' in error) {
      console.error('📧 STEP 3: API Response error:', (error as any).response?.data || (error as any).response);
    }
    
    throw error;
  }
}
