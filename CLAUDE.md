# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# NEVER install with npm - only use pnpm
pnpm install                 # Install dependencies


## Project Architecture

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS with custom CSS variables for dynamic theming
- **Database**: Firebase Admin SDK with Firestore
- **AI Service**: Groq SDK with Llama 3.1 8B for quote generation
- **Email**: Nodemailer with SMTP for booking workflow emails
- **Animations**: GSAP + ScrollTrigger, Framer Motion
- **Image Optimization**: Sharp for WebP conversion

### Key Directories

#### `/app` - Next.js App Router Structure
- `api/` - API routes for booking workflow, admin management, and AI chat
- `components/` - Reusable UI components and business logic components
- `admin/` - Admin dashboard for booking and content management
- `approve/[bookingId]/` - Chef booking approval interface
- `suggest/[bookingId]/` - Alternative time suggestion interface
- `confirm/[bookingId]/` - Client confirmation interface

#### `/lib` - Core Services
- `firebase-admin.ts` - Firestore database connection with environment validation
- `email.ts` - Complete Nodemailer SMTP email service with booking workflow templates
- `summary.ts` - AI conversation summarization using Groq
- `calendar.ts` - Google Calendar integration (configured but not fully connected)
- `auth.ts` - Authentication utilities
- `apiHandler.ts` - API response standardization

## Critical Architecture Details

### Dynamic Color System
Uses CSS variables for real-time color customization:
- `--color-primary1`, `--color-primary2`, `--color-primary3`
- `--color-accent1`, `--color-accent2`
- `--color-stroke`

Tailwind config maps these to classes: `primary1`, `primary2`, `accent1`, etc.

### Font System
Three-tier hierarchy using CSS variables:
- `--font-display` - Headers and titles
- `--font-sans` - Body text
- `--font-button` - Buttons and CTAs

### Booking Workflow Architecture
Complex multi-step process with email notifications:
1. Client submits booking via `/api/booking`
2. Admin receives approval email with link to `/approve/[bookingId]`
3. Chef can Accept, Reject, or Suggest alternatives via `/suggest/[bookingId]`
4. Client receives final confirmation via `/confirm/[bookingId]`

Each step has comprehensive logging with emoji prefixes (🚀📧✅❌💡🎉📊).

### API Route Patterns
- `GET /api/admin/*` - Admin dashboard data fetching
- `POST /api/booking/*` - Booking workflow actions
- `POST /api/chat` - AI quote generation with business logic

### Component Architecture
- `components/ui/` - Base accessible components (button, input, alert)
- `components/admin/` - Admin dashboard tabs and management interfaces
- Main page components handle animations, chat interface, and booking forms

## Environment Variables Required

```env
# AI Services
GROQ_API_KEY=your_groq_api_key

# Email Service (Critical for booking workflow)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail_email@gmail.com
SMTP_PASS=your_gmail_app_password
SENDER_EMAIL=hello@chefalexj.com
ADMIN_EMAIL=hello@chefalexj.com

# Firebase (Required for admin dashboard)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key

# Google Calendar (Configured but not connected)
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_CALENDAR_ID=your_calendar_id
```

## Key Business Logic

### AI Quote System (`/api/chat`)
- Uses extensive business data function with menu pricing tiers
- Extracts quotes from conversation and formats them
- Integrates with booking form when quote is generated

### Email Templates (`lib/email.ts`)
Professional HTML templates for:
- Client booking confirmations
- Admin notifications with approval links
- Alternative time suggestions
- Final confirmations

## Development Guidelines

### Component Conventions
- Use className merging with `cn()` utility from `lib/utils.ts`
- Follow existing color/font variable patterns
- Animations use either GSAP or Framer Motion consistently
- All forms include proper validation and error states

### API Route Patterns
- Extensive logging with emoji prefixes for workflow tracking
- Consistent error handling with try/catch blocks
- Database operations use Firebase Admin SDK
- Email operations include detailed response logging

### Styling Approach
- Tailwind-first with custom CSS variables for theming
- Responsive design with mobile-first approach
- Custom animations for marquees, parallax effects, and interactions
- Component-scoped styles when needed (especially for animations)

## Testing Notes
- No testing framework currently configured
- Manual testing focuses on booking workflow and admin dashboard
- Email workflow testing requires valid SMTP credentials and app password

## Common Issues
- Images must be optimized with Sharp script before deployment
- Email workflows require all environment variables to be properly set
- Firebase credentials must be properly formatted (private key newlines)
- Chat interface scrolling is container-scoped to prevent page jumping