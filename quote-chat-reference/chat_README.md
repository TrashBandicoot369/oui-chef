# AI Chat Bot Implementation - Shed Shop

## Overview

This documentation provides a complete breakdown of the AI chat bot implementation used in the Shed Shop tattoo studio website. The chat bot is designed to provide rough tattoo quotes and help clients book consultations through an intelligent conversational interface.

## Architecture Overview

The chat bot system consists of several key components:

1. **Frontend Chat Interface** (`components/QuoteChat.tsx`)
2. **Chat API Endpoint** (`app/api/chat/route.ts`)
3. **Booking Integration** (`components/BookingForm.tsx`)
4. **Chat History Summarization** (`lib/summary.ts`)
5. **Supporting utilities and styling**

## Core Files Required for Migration

### 1. Main Chat Component
**File**: `components/QuoteChat.tsx`
- **Purpose**: Main React component that provides the chat interface
- **Key Features**:
  - Real-time conversation interface
  - Message history management
  - Quote detection and booking form trigger
  - Auto-scrolling and focus management
  - Loading states and error handling

### 2. Chat API Route
**File**: `app/api/chat/route.ts`
- **Purpose**: Backend API endpoint that handles chat interactions
- **Key Features**:
  - Uses Groq AI (Llama 3.1 8B model) for responses
  - Specialized system prompt for tattoo quotes
  - Quote extraction from AI responses
  - Support for summary mode
  - Error handling and logging

### 3. Booking Form Component
**File**: `components/BookingForm.tsx`
- **Purpose**: Form that appears after quotes are provided
- **Key Features**:
  - Form validation
  - Integration with booking API
  - Chat history preservation
  - Success/error state management

### 4. Chat History Summarization
**File**: `lib/summary.ts`
- **Purpose**: Utility to create concise summaries of chat conversations
- **Key Features**:
  - Uses Groq AI (Gemma2 9B model) for summarization
  - Fallback to simple concatenation if AI fails
  - Optimized for email and calendar integration

### 5. UI Components (Required Dependencies)
**Files**: `components/ui/*`
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/alert.tsx`

These are from shadcn/ui library and provide the styled components used in the chat interface.

## Dependencies

### Core Dependencies
```json
{
  "groq-sdk": "^0.23.0",
  "axios": "^1.9.0",
  "lucide-react": "^0.416.0",
  "next": "15.2.4",
  "react": "^19",
  "react-dom": "^19"
}
```

### UI Dependencies (shadcn/ui)
```json
{
  "@radix-ui/react-slot": "1.1.1",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.5.5"
}
```

### Styling Dependencies
```json
{
  "tailwindcss": "^3.4.17",
  "tailwindcss-animate": "^1.0.7",
  "autoprefixer": "^10.4.20"
}
```

## Environment Variables Required

Create a `.env.local` file with:

```env
GROQ_API_KEY=your_groq_api_key_here
```

## Tailwind Configuration

The chat uses custom colors defined in `tailwind.config.ts`:

```typescript
colors: {
  cream: "#F5F1EB",
  "forest-dark": "#2D4A3E",
  "forest-medium": "#4A6B5C",
  "forest-light": "#7A9B8A",
  "pale-lilac": "#E8E0F0",
}
```

## How the Chat Bot Works

### 1. System Prompt and AI Behavior
The AI is configured with a specific system prompt that defines its role as a tattoo quote assistant for Shed Shop. Key rules include:

- Must provide quotes in format "QUOTE: $AMOUNT" or "QUOTE: $MIN-$MAX"
- Minimum charge is $100, hourly rate is $80
- Flash tattoos are palm-sized, usually 2 hours ($160)
- Rejects cover-ups and color tattoos (requires in-person consultation)
- Large pieces require multi-session consultations
- Asks for design idea, style, placement, and size before quoting
- Uses CAD currency
- Pleasant, welcoming, professional persona

### 2. Message Flow
1. **User Input**: User types message in input field
2. **API Call**: Frontend sends message history to `/api/chat`
3. **AI Processing**: Groq API processes the conversation with system prompt
4. **Quote Extraction**: Backend extracts quote amounts using regex patterns
5. **Response**: AI response and extracted quote returned to frontend
6. **UI Update**: Message displayed, booking form shown if quote detected

### 3. Quote Detection Logic
The system uses sophisticated regex patterns to extract quotes:

```typescript
const rangeMatch = reply.match(/QUOTE:\s*\$?(\d+(?:\.\d+)?)(?:\s*-\s*\$?(\d+(?:\.\d+)?))?/i) 
  || reply.match(/\$?(\d+(?:\.\d+)?)(?:\s*-\s*\$?(\d+(?:\.\d+)?))?\s*CAD/i);
```

### 4. Booking Integration
When a quote is detected:
1. `shouldShowForm()` function determines if booking form should appear
2. Form pre-fills with the extracted quote amount
3. Chat history is preserved and sent with booking request
4. Chat history gets summarized for email/calendar integration

### 5. State Management
The chat component manages several key states:
- `messages`: Array of conversation messages
- `isLoading`: Loading state during AI responses
- `showBookingForm`: Controls when booking form appears
- `tattooQuote`: Extracted quote amount
- `error`: Error handling state

## Migration Steps

### 1. Set Up New Next.js Project
```bash
npx create-next-app@latest your-project-name --typescript --tailwind --app
cd your-project-name
```

### 2. Install Dependencies
```bash
npm install groq-sdk axios lucide-react
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge
npm install tailwindcss-animate
```

### 3. Set Up shadcn/ui
```bash
npx shadcn@latest init
npx shadcn@latest add button input alert
```

### 4. Copy Core Files
Copy these files maintaining the same directory structure:
- `components/QuoteChat.tsx`
- `app/api/chat/route.ts`
- `components/BookingForm.tsx`
- `lib/summary.ts`

### 5. Update Tailwind Config
Add the custom colors to your `tailwind.config.ts`:

```typescript
extend: {
  colors: {
    cream: "#F5F1EB",
    "forest-dark": "#2D4A3E",
    "forest-medium": "#4A6B5C",
    "forest-light": "#7A9B8A",
    "pale-lilac": "#E8E0F0",
  }
}
```

### 6. Set Up Environment Variables
Create `.env.local` and add your Groq API key.

### 7. Integration Points
- Add `<QuoteChat />` component to your desired page
- Modify the booking API endpoints if needed (`/api/booking/*`)
- Customize the system prompt in `app/api/chat/route.ts` for your use case

## Customization Options

### 1. AI Model Configuration
- **Current Model**: `llama-3.1-8b-instant` for chat, `gemma2-9b-it` for summaries
- **Alternative Models**: Any Groq-supported model can be used
- **System Prompt**: Fully customizable in `app/api/chat/route.ts`

### 2. Styling Customization
- Colors are defined in Tailwind config
- Component styling can be modified in individual components
- Responsive design is built-in

### 3. Quote Logic Customization
- Modify regex patterns for different quote formats
- Adjust pricing rules in system prompt
- Change quote validation logic

### 4. Booking Integration
- `BookingForm.tsx` can be modified for different booking flows
- API endpoints can be customized for different backends
- Validation rules can be adjusted

## Message Interface

All components use a consistent message interface:

```typescript
interface Message {
  role: "user" | "assistant";
  content: string;
  quoted?: boolean;
  quote?: number | null;
}
```

## Error Handling

The system includes comprehensive error handling:
- API failures gracefully fallback with user-friendly messages
- Form validation with field-specific error messages
- AI response failures with retry capabilities
- Network error handling with appropriate user feedback

## Performance Considerations

- Messages auto-scroll to bottom for better UX
- Input focus management for seamless interaction
- Loading states prevent multiple simultaneous requests
- Axios for efficient HTTP requests
- Optimized re-renders with proper React patterns

## Security Features

- Input validation on both frontend and backend
- Environment variable protection for API keys
- Proper error handling without exposing sensitive information
- Type safety throughout the application

## Testing the Implementation

1. Start the development server: `npm run dev`
2. Navigate to the page containing the chat component
3. Test various tattoo-related questions
4. Verify quote detection and booking form appearance
5. Test form submission and error handling

## Troubleshooting Common Issues

### 1. AI Not Responding
- Check GROQ_API_KEY environment variable
- Verify API key is valid and has sufficient credits
- Check network connectivity

### 2. Quotes Not Detected
- Verify regex patterns in quote extraction logic
- Check AI response format matches expected patterns
- Debug by logging AI responses

### 3. Styling Issues
- Ensure Tailwind is properly configured
- Verify custom colors are added to config
- Check component class names

### 4. Booking Form Not Appearing
- Check `shouldShowForm()` logic
- Verify quote detection is working
- Debug state management in React DevTools

This implementation provides a fully functional AI chat bot system that can be easily migrated to any Next.js project with minimal modifications. 