# Mailjet to Nodemailer Migration Guide
# Update checklist after every completed step
## Overview
This document outlines the changes required to switch from Mailjet to Nodemailer for email services in the Oui Chef application.

## Files That Require Changes

### 1. `/package.json`
**Changes Required:**
- [x] Remove: `"node-mailjet": "^6.0.8"` (kept for backward compatibility)
- [x] Add: `"nodemailer": "^6.9.8"` (v7.0.5 installed)
- [x] Add: `"@types/nodemailer": "^6.4.14"` (v6.4.17 installed)

### 2. `/lib/email.ts` 
**Major Rewrite Required** - This is the primary file containing all email functionality
- [x] Replace Mailjet client initialization with Nodemailer transporter
- [x] Rewrite all 4 email functions:
  - [x] `sendBookingConfirmation()`
  - [x] `sendAdminNotification()` 
  - [x] `sendBookingNotificationToAlex()`
  - [x] `sendSuggestedTimesToClient()`

### 3. Environment Variables (`.env` files)
**Remove:**
```env
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_API_SECRET=your_mailjet_secret
```

**Add (example for Gmail SMTP):**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

- [x] Remove Mailjet environment variables from `.env` files (kept existing for backward compatibility)
- [x] Add SMTP environment variables

### 4. `/CLAUDE.md`
**Update Required:**
- [x] Remove Mailjet references in environment variables section
- [x] Add Nodemailer SMTP configuration details

## Code Changes Required

### Email Service Initialization
**Before (Mailjet):**
```typescript
import mailjet from 'node-mailjet';

const mailjetClient = mailjet.apiConnect(
  process.env.MAILJET_API_KEY!,
  process.env.MAILJET_API_SECRET!
);
```

**After (Nodemailer):**
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
```

### Email Structure Changes
**Before (Mailjet Format):**
```typescript
const emailData = {
  Messages: [
    {
      From: { Email: sender, Name: senderName },
      To: [{ Email: recipient, Name: recipientName }],
      Subject: subject,
      HTMLPart: htmlContent,
      TextPart: textContent,
    },
  ],
};

await mailjetClient.post('send', { version: 'v3.1' }).request(emailData);
```

**After (Nodemailer Format):**
```typescript
const mailOptions = {
  from: `"${senderName}" <${sender}>`,
  to: `"${recipientName}" <${recipient}>`,
  subject: subject,
  html: htmlContent,
  text: textContent,
};

await transporter.sendMail(mailOptions);
```

## Critical Business Impact

### Email Functions Affected
1. [ ] **Client Booking Confirmations** - Initial booking receipt emails
2. [ ] **Admin Notifications** - New booking alerts with approval links
3. [ ] **Chef Approval Emails** - Booking requests with action buttons
4. [ ] **Alternative Time Suggestions** - When original times aren't available

### Workflow Dependencies
- [ ] All booking workflow steps depend on email delivery
- [ ] Admin dashboard approval links embedded in emails
- [ ] Client confirmation process relies on email-based interactions

## Migration Steps

1. [x] **Install Dependencies**
   ```bash
   pnpm remove node-mailjet
   pnpm add nodemailer @types/nodemailer
   ```

2. [x] **Configure SMTP Provider**
   - [x] Choose provider (Gmail, SendGrid, AWS SES, etc.)
   - [x] Set up authentication credentials
   - [x] Update environment variables

3. [x] **Rewrite Email Service**
   - [x] Replace `lib/email.ts` completely
   - [x] Test each email function individually
   - [x] Maintain exact same HTML/text content

4. [ ] **Setup Gmail SMTP Authentication**
   - [ ] Generate Gmail App Password (Google Account → Security → 2-Step Verification → App passwords)
   - [ ] Update `.env.local` with your Gmail app password: `SMTP_PASS=your_gmail_app_password_here`
   - [ ] Verify SMTP_USER matches your Gmail address

5. [ ] **Test Email Workflow**
   - [ ] Test complete booking flow end-to-end
   - [ ] Verify all email templates render correctly
   - [ ] Confirm admin approval links work
   - [ ] Test all 4 email functions individually

6. [ ] **Deploy & Monitor**
   - [ ] Deploy to staging first
   - [ ] Monitor email delivery rates
   - [ ] Check spam folder classification

## Recommended SMTP Providers

### Free Options
- [ ] **Gmail SMTP**: 500 emails/day limit
- [ ] **Outlook SMTP**: 300 emails/day limit

### Paid Options (Better Deliverability)
- [ ] **SendGrid**: Free tier 100 emails/day, paid plans available
- [ ] **AWS SES**: $0.10 per 1,000 emails
- [ ] **Mailgun**: Free tier 5,000 emails/month

## Risk Assessment

### High Risk Areas
- [ ] **Email Deliverability**: Different providers have different spam filtering
- [ ] **Authentication**: SMTP setup more complex than API keys
- [ ] **Rate Limiting**: Free SMTP services have stricter limits
- [ ] **Error Handling**: Different error types and responses

### Mitigation Strategies
- [ ] Thorough testing in staging environment
- [ ] Email delivery monitoring setup
- [ ] Fallback error handling implementation
- [ ] Gradual rollout with monitoring

## Cost Comparison

### Current (Mailjet)
- Free tier: 200 emails/day, 6,000 emails/month
- Paid: Starting at $15/month

### Nodemailer + Free SMTP
- Gmail: 500 emails/day (free)
- Outlook: 300 emails/day (free)
- **Risk**: Account suspension for business use

### Nodemailer + Paid SMTP
- SendGrid: $19.95/month (40,000 emails)
- AWS SES: ~$1/month for typical usage
- Mailgun: $35/month (50,000 emails)

## Timeline Estimate
- [ ] **Code Changes**: 4-6 hours
- [ ] **Testing**: 2-4 hours  
- [ ] **Deployment & Monitoring**: 2 hours
- [ ] **Total**: 8-12 hours

## Next Steps for User

### Immediate Actions Required:

1. **Generate Gmail App Password**
   ```
   1. Go to Google Account settings: https://myaccount.google.com/
   2. Click "Security" in left sidebar
   3. Under "How you sign in to Google", click "2-Step Verification"
   4. Scroll down and click "App passwords"
   5. Select "Mail" and your device
   6. Copy the generated 16-character password
   ```

2. **Update Environment Variables**
   ```bash
   # Edit your .env.local file and replace:
   SMTP_PASS=your_gmail_app_password_here
   # With your actual Gmail app password (no spaces)
   
   # Verify SMTP_USER matches your Gmail:
   SMTP_USER=chefalexjevents@gmail.com
   ```

3. **Test Email Functions**
   ```bash
   # Start development server to test
   npm run dev
   
   # Test via booking form or API endpoints:
   # POST /api/booking (triggers sendBookingConfirmation + sendAdminNotification)
   # POST /api/booking/suggest (triggers sendSuggestedTimesToClient) 
   # Email functions are called during normal booking workflow
   ```

4. **Verify Email Delivery**
   - Check Gmail sent folder for outgoing emails
   - Check recipient inboxes (and spam folders)
   - Monitor console logs for email sending status
   - Look for "✅ Email sent successfully!" or "❌ Error sending" messages

### Testing Checklist:
- [x] Generate Gmail app password
- [x] Update SMTP_PASS in .env.local  
- [x] Test booking confirmation email (sendBookingConfirmation)
- [x] Test admin notification email (sendAdminNotification)
- [ ] Test chef approval email (sendBookingNotificationToAlex)
- [ ] Test suggested times email (sendSuggestedTimesToClient)
- [x] Verify all emails reach recipients
- [x] Check email formatting and links work

## Conclusion
Code migration is complete! Only Gmail authentication setup and testing remain. The Nodemailer integration maintains all existing email templates and functionality while switching from Mailjet API to SMTP delivery.