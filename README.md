# Chef Alex J — Private Dining & Events Website

A modern, responsive website built with Next.js 14, TypeScript, and Tailwind CSS showcasing Chef Alex J's private dining and catering services with AI-powered quote generation and advanced design customization tools.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys (see Environment Variables section)

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## ✨ Core Features

### 🤖 AI-Powered Booking System
- **Intelligent Quote Generation**: Groq AI (Llama 3.1 8B) powered chatbot provides personalized catering quotes
- **Smart Form Integration**: Booking form automatically appears when quotes are generated
- **Conversation Summarization**: AI summarizes chat history for consultation records
- **Professional Culinary Expertise**: AI trained with Chef Alex's pricing, menu options, and business rules
- **Real-time Chat Interface**: Modern chat UI with typing indicators and message threading

### 📧 Complete Booking Approval Workflow
- **Multi-Step Email Process**: Automated email notifications with approval links for Chef Alex
- **Admin Approval Interface**: Clean approval page with Accept/Reject/Suggest New Time options
- **Alternative Time Suggestions**: Chef can propose up to 3 alternative time slots to clients
- **Client Confirmation System**: Clients receive confirmation links to finalize bookings
- **Comprehensive Error Logging**: Step-by-step debugging with emoji-coded workflow tracking
- **Professional Email Templates**: Branded HTML emails with booking details and action buttons

### 🎨 Advanced Design Customization Tools

#### Dynamic Color Management System
- **Live Color Editor**: Real-time color palette customization with instant preview
- **Color Theory Schemes**: 
  - Monochrome harmonies
  - Complementary color schemes
  - Analogous color combinations
  - Triadic arrangements
  - Tetradic (rectangular) schemes
  - Split-complementary palettes
  - Neutral + accent combinations
- **Brightness & Saturation Controls**: Fine-tune individual colors or groups
- **Group Adjustments**: Modify primary/accent color groups simultaneously
- **Local Storage Persistence**: Color preferences saved across sessions
- **Accessibility Tools**: Contrast ratio calculations for readability

#### Font Management System
- **Live Font Switching**: Change fonts in real-time without code deployment
- **Google Fonts Integration**: Access to hundreds of web fonts
- **Quick Presets**: Pre-configured font combinations for different styles
- **Category-Based System**: Separate controls for display, body, and button fonts
- **CSS Variable Integration**: Seamless Tailwind CSS integration

### 🎬 Advanced Animation Components

#### Interactive Parallax Hero Section
- **3D Perspective Effects**: Mouse-tracked parallax with tilt and pan
- **Smooth Transitions**: Optimized animations with hardware acceleration
- **Responsive Behavior**: Adapts to different screen sizes and touch devices
- **Performance Optimized**: Uses `willChange` and `transform3d` for smooth rendering

#### Text & Content Animations
- **Horizontal Text Marquee**: Smooth scrolling text with customizable speed
- **Vertical Testimonial Marquee**: Multi-column scrolling testimonials with hover pause
- **Event Gallery Animations**: Framer Motion powered image gallery with expandable descriptions
- **Scroll-Triggered Animations**: Navbar and logo animations based on scroll position

### 🏗️ Modern UI Components

#### Custom UI Library
- **Accessible Button System**: Multiple variants with proper focus states
- **Form Input Components**: Styled inputs with validation and error states
- **Alert System**: Success/error messaging with multiple variants
- **Responsive Grid Layouts**: Flexible layouts that adapt to all screen sizes

#### Interactive Elements
- **Event Highlights Gallery**: Click-to-expand image gallery with descriptions
- **Wave SVG Separators**: Custom organic section dividers
- **Floating Action Buttons**: Fixed-position design tool toggles
- **Smooth Scroll Navigation**: Anchor-based navigation with scroll offset

## 📧 Booking Approval Workflow

### Complete End-to-End Process

1. **Client Booking Submission** (`/api/booking`)
   - Client fills out booking form after receiving AI quote
   - System generates unique booking ID and stores request
   - Sends confirmation email to client
   - Sends approval notification to Chef Alex with booking details and approval link

2. **Chef Alex Approval Process** (`/approve/[bookingId]`)
   - Chef receives email with link to approval page
   - Three action options available:
     - **Accept**: Confirms booking (future: sends client confirmation)
     - **Reject**: Declines booking (future: sends client notification) 
     - **Suggest New Time**: Redirects to suggestion interface

3. **Alternative Time Suggestions** (`/suggest/[bookingId]`)
   - Chef can propose up to 3 alternative time slots
   - Uses datetime-local inputs for precise time selection
   - Suggestions sent to client via email (future implementation)

4. **Client Final Confirmation** (`/confirm/[bookingId]`)
   - Client receives email with suggested times and confirmation links
   - Final confirmation updates booking status to confirmed
   - Triggers final booking confirmation emails

### Error Logging & Debugging

The system includes comprehensive logging with emoji-coded workflows:

- 🚀 **Main Booking Workflow**: Step-by-step booking submission process
- 📧 **Email Services**: Detailed email sending with Mailjet API responses
- ✅ **Accept Workflow**: Booking acceptance process tracking
- ❌ **Reject Workflow**: Booking rejection process tracking  
- 💡 **Suggest Workflow**: Alternative time suggestion handling
- 🎉 **Confirm Workflow**: Client confirmation process tracking

Each step logs success/failure with detailed error information for easy debugging.

### API Routes Documentation

#### POST `/api/booking`
Main booking submission endpoint with comprehensive error handling.

#### POST `/api/booking/accept`
Handles booking acceptance from Chef Alex approval interface.

#### POST `/api/booking/reject` 
Handles booking rejection from Chef Alex approval interface.

#### POST `/api/booking/suggest`
Handles both suggestion preparation and time submission from Chef Alex.

#### POST `/api/booking/confirm`
Handles final booking confirmation from client.

## 🔧 System Architecture

### Frontend Components
```
app/
├── components/
│   ├── ui/                    # Base UI components
│   │   ├── button.tsx         # Accessible button variants
│   │   ├── input.tsx          # Form input component
│   │   └── alert.tsx          # Alert/notification system
│   ├── QuoteChat.tsx          # AI chat interface
│   ├── BookingForm.tsx        # Consultation booking form
│   ├── FontSwitcher.tsx       # Live font customization
│   ├── ColorManager.tsx       # Color palette editor
│   ├── EventHighlights.tsx    # Interactive image gallery
│   ├── TextMarquee.tsx        # Horizontal scrolling text
│   └── VerticalMarquee.tsx    # Vertical scrolling testimonials
├── api/
│   ├── chat/                  # AI quote generation endpoint
│   └── booking/               # Complete booking workflow
│       ├── route.ts           # Main booking submission handler
│       ├── accept/            # Booking acceptance API
│       ├── reject/            # Booking rejection API
│       ├── suggest/           # Alternative time suggestions API
│       └── confirm/           # Client confirmation API
├── approve/[bookingId]/       # Admin approval interface
├── suggest/[bookingId]/       # Time suggestion interface  
├── confirm/[bookingId]/       # Client confirmation interface
└── page.tsx                   # Main homepage component
```

### Backend Services
```
lib/
├── firebase-admin.ts          # Firestore database connection
├── email.ts                   # Complete email service with workflows
│   ├── sendBookingConfirmation()     # Client confirmation emails
│   ├── sendAdminNotification()       # Admin booking notifications  
│   └── sendBookingNotificationToAlex() # Approval workflow emails
├── calendar.ts                # Google Calendar integration
├── summary.ts                 # AI conversation summarization
└── utils.ts                   # Utility functions
```

## 🎨 Design System

### Dynamic Color Palette
The color system uses CSS variables for real-time customization:

```css
:root {
  --color-primary1: '#F13F27'    /* Brand red */
  --color-primary2: '#FFF042'    /* Bright yellow */
  --color-primary3: '#FFD230'    /* Golden yellow */
  --color-accent1: '#6C1234'     /* Deep burgundy */
  --color-accent2: '#F56F4C'     /* Coral red */
  --color-stroke: '#F13F27'      /* Outline color */
}
```

### Typography System
Three-tier font hierarchy:
- **Display**: Headers, logo, major titles
- **Body**: Paragraphs, general content
- **Button**: Call-to-actions, navigation

### Responsive Breakpoints
- **Mobile**: Default (320px+)
- **Small**: `sm:` (640px+)
- **Medium**: `md:` (768px+)
- **Large**: `lg:` (1024px+)
- **Extra Large**: `xl:` (1280px+)

## 🛠️ Tech Stack

### Core Framework
- **Next.js 14**: App Router, Server Components, API Routes
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first styling with custom design system
- **React 18**: Latest React features and hooks

### AI & Backend Services
- **Groq SDK**: AI chat and quote generation
- **Mailjet**: Email service integration
- **Google Calendar API**: Event scheduling
- **Firebase Admin**: Database and authentication

### UI & Animation Libraries
- **Framer Motion**: Advanced animations and transitions
- **Lucide React**: Modern icon library
- **React Fast Marquee**: Horizontal scrolling text
- **Radix UI**: Accessible component primitives
- **Class Variance Authority**: Type-safe component variants

## 🔐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# AI Services
GROQ_API_KEY=your_groq_api_key

# Email Service (Mailjet) - Required for booking workflow
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_API_SECRET=your_mailjet_secret
SENDER_EMAIL=your_sender_email          # Email address for outgoing emails
ADMIN_EMAIL=hello@chefalexj.com         # Chef Alex's email for notifications

# Google Calendar Integration
GOOGLE_CLIENT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
GOOGLE_CALENDAR_ID=your_calendar_id

# Firebase (Optional - for future database features)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
```

## 📊 Implementation Status

### ✅ Fully Implemented & Production Ready

#### Core Website Features
- ✅ **Responsive Design**: Mobile-first, multi-breakpoint layout
- ✅ **SEO Optimized**: Meta tags, semantic HTML, accessibility
- ✅ **Performance Optimized**: WebP images, lazy loading, code splitting
- ✅ **Interactive Animations**: Parallax, marquees, hover effects
- ✅ **Modern UI Components**: Custom button, input, alert systems

#### AI-Powered Quote System
- ✅ **Intelligent Chat Interface**: Context-aware conversation
- ✅ **Quote Generation**: Automatic price extraction and formatting
- ✅ **Business Logic Integration**: Menu pricing, service rates, location factors
- ✅ **Conversation Summarization**: AI-powered chat history summaries
- ✅ **Form Integration**: Seamless chat-to-booking flow
- ✅ **Optimized Chat Scrolling**: Container-scoped scrolling prevents page jumping

#### Design Customization Tools
- ✅ **Color Management**: Real-time palette editing with 7 color schemes
- ✅ **Font Switching**: Live Google Fonts integration
- ✅ **Local Storage**: Persistent design preferences
- ✅ **Accessibility Features**: Contrast checking, responsive design

#### Form & Validation System
- ✅ **Booking Form**: Complete consultation request system
- ✅ **Client-side Validation**: Real-time field validation
- ✅ **Error Handling**: User-friendly error messages
- ✅ **Success Feedback**: Confirmation and booking ID generation

#### Complete Email & Approval Workflow
- ✅ **Email Service Integration**: Full Mailjet implementation with error handling
- ✅ **Admin Approval System**: Dedicated approval pages with Accept/Reject/Suggest options
- ✅ **Alternative Time Suggestions**: Chef can propose up to 3 alternative time slots
- ✅ **Client Confirmation Flow**: Final confirmation system for clients
- ✅ **Comprehensive Error Logging**: Step-by-step debugging with emoji tracking (🚀📧✅❌💡🎉)
- ✅ **Professional Email Templates**: Branded HTML emails with approval links and booking details

### 🟡 Configured But Not Integrated

#### Backend Services (Ready for Production)
- 🟡 **Calendar Integration**: Google Calendar API ready, needs booking connection
- 🟡 **Database System**: Firebase Admin configured, needs data persistence

### 🔴 Missing for Full Production

#### High Priority  
- ❌ **Database Persistence**: Booking data currently only logged to console
- ❌ **Calendar Events**: No automatic calendar booking creation
- ❌ **Email-to-Database Integration**: Approval actions need to update booking status in database

#### Medium Priority
- ❌ **Payment Integration**: No deposit or payment processing
- ❌ **Booking Management**: No status tracking or follow-up system
- ❌ **Analytics**: No user interaction or conversion tracking
- ❌ **Testing Suite**: No automated testing implemented

#### Low Priority
- ❌ **WebSocket Integration**: No real-time chat features
- ❌ **Mobile App**: No native mobile application
- ❌ **Multi-language**: No internationalization support
- ❌ **Advanced Admin Tools**: No bulk operations or reporting

## 📋 Next Development Steps

### Phase 1: Core Backend Integration (Week 1-2)
1. **Database Schema Design**: Create Firestore collections for bookings
2. **Email Workflow**: Connect Mailjet to send confirmation emails
3. **Calendar Integration**: Auto-create Google Calendar events
4. **Admin Notifications**: Set up admin email alerts for new bookings

### Phase 2: Admin Interface (Week 3-4)
1. **Admin Dashboard**: Build consultation request management interface
2. **Booking Status System**: Track consultation stages (pending, confirmed, completed)
3. **Client Communication**: Email templates and follow-up automation
4. **Reporting**: Basic analytics and booking metrics

### Phase 3: Enhanced Features (Week 5-6)
1. **Payment Integration**: Stripe/Square for deposits
2. **Advanced Validation**: Date availability and conflict checking
3. **Customer Portal**: Client login for booking history
4. **Mobile Optimization**: Enhanced mobile experience

### Phase 4: Production Deployment (Week 7-8)
1. **Error Monitoring**: Sentry or similar error tracking
2. **Performance Monitoring**: Analytics and performance metrics
3. **Security Audit**: Rate limiting, input sanitization
4. **Load Testing**: Ensure system can handle traffic

## 📦 Dependencies

```json
{
  "core": {
    "next": "14.0.0",
    "react": "^18",
    "typescript": "^5",
    "tailwindcss": "^3.3.0"
  },
  "ai_services": {
    "groq-sdk": "^0.24.0"
  },
  "backend_services": {
    "firebase-admin": "^12.0.0",
    "node-mailjet": "^6.0.8",
    "googleapis": "^150.0.1"
  },
  "ui_libraries": {
    "framer-motion": "^12.16.0",
    "lucide-react": "^0.514.0",
    "react-fast-marquee": "^1.6.5",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0"
  },
  "development": {
    "axios": "^1.6.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

## 🚀 Deployment Guide

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Environment Setup
```bash
# Production environment variables
GROQ_API_KEY=your_production_groq_key
MAILJET_API_KEY=your_production_mailjet_key
MAILJET_API_SECRET=your_production_mailjet_secret
SENDER_EMAIL=hello@chefalexj.com
GOOGLE_CLIENT_EMAIL=your_service_account
GOOGLE_PRIVATE_KEY=your_production_key
GOOGLE_CALENDAR_ID=your_calendar_id
FIREBASE_PROJECT_ID=your_production_project
```

### Build Commands
```bash
npm run build    # Build for production
npm run start    # Start production server
npm run dev      # Development server
npm run lint     # Code linting
```

## 📞 Support & Development

### Documentation Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Groq AI Documentation](https://console.groq.com/docs)

### Component Usage Examples

#### Using the AI Chat System
```tsx
import QuoteChat from '@/app/components/QuoteChat'

function BookingPage() {
  return (
    <div className="max-w-xl mx-auto">
      <QuoteChat />
    </div>
  )
}
```

#### Implementing Color Management
```tsx
import ColorManager from '@/app/components/ColorManager'

function App() {
  return (
    <>
      <ColorManager /> {/* Fixed position color picker */}
      <main className="bg-primary2 text-accent1">
        {/* Your content using CSS variables */}
      </main>
    </>
  )
}
```

#### Creating Animated Marquees
```tsx
import TextMarquee from '@/app/components/TextMarquee'
import VerticalMarquee from '@/app/components/VerticalMarquee'

function TestimonialSection() {
  return (
    <section>
      <TextMarquee className="text-4xl font-display mb-8">
        Customer Reviews
      </TextMarquee>
      
      <VerticalMarquee 
        items={[
          "Amazing food and service!",
          "Best catering experience ever!",
          "Chef Alex exceeded our expectations!"
        ]}
        speed={30}
        className="max-w-6xl mx-auto"
      />
    </section>
  )
}
```

#### Using Email Service Functions
```tsx
import { sendBookingNotificationToAlex, sendBookingConfirmation } from '@/lib/email'

// Send booking notification to Chef Alex with approval link
await sendBookingNotificationToAlex(bookingId, bookingData, chatSummary)

// Send confirmation email to client
await sendBookingConfirmation(clientEmail, clientName)
```

#### Implementing Approval Pages
```tsx
// Example: /app/approve/[bookingId]/page.tsx
'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ApprovePage({ params }: { params: { bookingId: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleAction = async (action: 'accept' | 'reject' | 'suggest') => {
    setLoading(true)
    await fetch(`/api/booking/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId: params.bookingId }),
    })
    // Handle navigation based on action
    if (action === 'suggest') {
      router.push(`/suggest/${params.bookingId}`)
    } else {
      router.push('/')
    }
  }

  return (
    <div className="max-w-xl mx-auto py-16 text-center space-y-6">
      <h2 className="text-2xl font-bold text-accent1">Booking Request</h2>
      <div className="space-x-4">
        <button onClick={() => handleAction('accept')} disabled={loading}>
          Accept
        </button>
        <button onClick={() => handleAction('reject')} disabled={loading}>
          Reject  
        </button>
        <button onClick={() => handleAction('suggest')} disabled={loading}>
          Suggest New Time
        </button>
      </div>
    </div>
  )
}
```

## 🔄 Recent Updates

### Latest Major Release: Complete Booking Approval Workflow
- ✅ **Email Service Integration**: Full Mailjet email workflow with branded HTML templates
- ✅ **Admin Approval System**: Chef Alex can Accept/Reject/Suggest alternative times via email links
- ✅ **Alternative Time Suggestions**: Interface for Chef to propose up to 3 alternative time slots
- ✅ **Client Confirmation System**: Final confirmation interface for clients to finalize bookings
- ✅ **Comprehensive Error Logging**: Step-by-step debugging with emoji-coded workflow tracking
- ✅ **Professional Email Templates**: Branded emails with booking details and action buttons
- ✅ **Security Improvements**: Sensitive credential files properly excluded from repository

### Previous Improvements
- ✅ **Chat Scrolling Fix**: Fixed page jumping issue when pressing Enter in chat interface
- ✅ **Container-Scoped Scrolling**: Chat messages now scroll within their container only
- ✅ **Improved UX**: Better user experience with smooth in-chat scrolling behavior

---

**Built with ❤️ for Chef Alex J's culinary experiences.**

*This is a living document that evolves with the project. Last updated: January 2025* 