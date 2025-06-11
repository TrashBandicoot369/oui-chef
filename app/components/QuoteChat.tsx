"use client";

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { SendHorizonal, ChefHat, User, Loader2 } from 'lucide-react';
import BookingForm from './BookingForm';

interface Message {
  role: "user" | "assistant";
  content: string;
  quoted?: boolean;
  quote?: number | null;
}

// Helper function to determine if the booking form should be shown
const shouldShowForm = (msg: Message): boolean => {
  if (msg.role !== "assistant") return false;
  return !!( // Ensure boolean return type
    msg.quoted ||
    /\$/.test(msg.content) ||
    /QUOTE:/i.test(msg.content)
  );
};

const QuoteChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [cateringQuote, setCateringQuote] = useState<number | null>(null);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current && !isLoading && !showBookingForm) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [isLoading, showBookingForm]);

  useEffect(() => {
    setMessages([
      { role: "assistant", content: "Hello! I'm here to help you plan your perfect event with Chef Alex J. Tell me about your upcoming occasion and I'll provide you with a personalized quote!" }
    ]);
  }, []);

  const handleSend = async () => {
    if (input.trim() === '') return;

    const newUserMessage: Message = { role: "user", content: input };
    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    setInput('');
    setIsLoading(true);
    setError(null);
    setShowBookingForm(false); // Reset form visibility on new user message
    setCateringQuote(null);     // Reset quote on new user message

    try {
      const response = await axios.post<{ reply: string; quoted?: boolean; quote?: number | null }>('/api/chat', { history: currentMessages });
      const assistantResponseData = response.data;
      
      const newAssistantMessage: Message = {
        role: "assistant",
        content: assistantResponseData.reply,
        quoted: assistantResponseData.quoted,
        quote: assistantResponseData.quote
      };
      setMessages(prevMessages => [...prevMessages, newAssistantMessage]);

      // Updated logic: Trigger booking form based on shouldShowForm helper
      if (shouldShowForm(newAssistantMessage) && typeof newAssistantMessage.quote === 'number') {
        setCateringQuote(newAssistantMessage.quote);
        setShowBookingForm(true);
      }

    } catch (err) {
      console.error("Error sending message:", err);
      const errorMessage = "Sorry, I'm having trouble connecting. Please try again later.";
      setError(errorMessage);
      setMessages(prevMessages => [...prevMessages, { role: "assistant", content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSend();
    }
  };

  const handleBookingSuccess = () => {
    console.log("Booking successful, form will hide on next user message.");
    // Form hides automatically when user sends a new message due to setShowBookingForm(false) in handleSend
  };

  return (
    // 🎨 MAIN CHAT CONTAINER - Overall chat window styling
    <div className="flex flex-col h-[calc(100vh-100px)] md:h-[600px] max-w-lg mx-auto bg-primary2 rounded-lg shadow-xl font-sans">
      
      {/* 🎨 CHAT HEADER - Top bar with title */}
      <header className="bg-accent2 text-white p-4 rounded-t-lg">
        <h3 className="text-lg font-semibold text-center">Chef Alex J - Event Planner</h3>
      </header>

      {/* 🎨 MESSAGES AREA - Chat conversation background */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-primary2/20">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] p-3 rounded-xl shadow ${
                msg.role === 'user' 
                  ? 'bg-primary3 text-white rounded-br-none' /* 🎨 USER MESSAGE BUBBLE */
                  : 'bg-white/50 text-accent1 rounded-bl-none' /* 🎨 AI ASSISTANT MESSAGE BUBBLE */
              }`}
            >
              {/* 🎨 CHEF HAT ICON - Assistant message icon */}
              {msg.role === 'assistant' && <ChefHat className="w-5 h-5 inline mr-2 mb-1 text-accent1/70" />}
              {/* 🎨 USER ICON - User message icon */}
              {msg.role === 'user' && <User className="w-5 h-5 inline mr-2 mb-1 text-white/70" />}
              {msg.content}
              {/* 🎨 QUOTE DISPLAY - Shows estimated price in message */}
              {msg.quoted && msg.quote != null && (
                <p className="text-xs mt-1 pt-1 border-t border-accent1/20">
                  <span className="font-semibold">Estimated Quote:</span> ${msg.quote} CAD
                </p>
              )}
            </div>
          </div>
        ))}
        {/* 🎨 LOADING MESSAGE - Shows while AI is thinking */}
        {isLoading && messages[messages.length -1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-xl shadow bg-primary3/50 text-accent1 rounded-bl-none flex items-center">
              <Loader2 className="w-5 h-5 inline mr-2 animate-spin text-accent1/70" />
              Preparing your quote...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 🎨 BOOKING FORM CONTAINER - Area where booking form appears */}
      {showBookingForm && cateringQuote !== null && (
        <div className="p-4 border-t border-accent1/30 bg-primary2">
          <BookingForm quote={cateringQuote} onBookingSuccess={handleBookingSuccess} chatHistory={messages} />
        </div>
      )}
      
      {/* 🎨 ERROR MESSAGE - Red error display */}
      {error && !showBookingForm && (
        <div className="p-4 text-center bg-red-100 text-red-700">
          {error}
        </div>
      )}

      {/* 🎨 INPUT AREA - Bottom section with text input and send button */}
      <div className="p-4 border-t border-accent1/30 bg-white rounded-b-lg">
        <div className="flex items-center space-x-2">
          {/* 🎨 TEXT INPUT FIELD - Where users type messages */}
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tell me about your event..."
            className="flex-grow focus-visible:ring-accent1 border-accent1/50"
            disabled={isLoading || (showBookingForm && cateringQuote !== null)}
          />
          {/* 🎨 SEND BUTTON - Button to send messages */}
          <Button 
            onClick={handleSend} 
            disabled={isLoading || input.trim() === '' || (showBookingForm && cateringQuote !== null)}
            className="bg-accent1 hover:bg-accent2 text-white"
          >
            {isLoading && messages[messages.length -1]?.role === 'user' ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizonal className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuoteChat; 