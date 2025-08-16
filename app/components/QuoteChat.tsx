"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { SendHorizonal, ChefHat, User, Loader2 } from "lucide-react";
import BookingForm from "./BookingForm";

interface Message {
  role: "user" | "assistant";
  content: string;
  quoted?: boolean;
  quote?: number | null;
}

// Helper function to determine if the booking form should be shown
const shouldShowForm = (msg: Message): boolean => {
  if (msg.role !== "assistant") return false;
  return !!(
    msg.quoted ||
    /estimated quote.*\$[\d,]+/i.test(msg.content)
  );
};


const QuoteChat: React.FC = () => {
  /* ──────────────────────────────── state */
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [cateringQuote, setCateringQuote] = useState<number | null>(null);
  const [hasShownBookingForm, setHasShownBookingForm] = useState(false); // Track if form was shown

  /* ──────────────────────────────── refs */
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (messages.length > 1) scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current && !isLoading && !showBookingForm) {
      const isDesktop =
        typeof window !== 'undefined' && window.innerWidth >= 1024
      if (isDesktop) {
        try {
          inputRef.current.focus({ preventScroll: true })
        } catch {
          inputRef.current.focus() // fallback for browsers that don't support preventScroll
        }
      }
    }
  }, [isLoading, showBookingForm])

  /* initial greeting */
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I'm here to help you plan your perfect event with Chef Alex J. Tell me about your upcoming occasion and I'll provide you with a personalized quote!",
      },
    ]);
  }, []);

  /* ─────────────────────────────── send handler */
  const handleSend = async () => {
    if (input.trim() === "") return;

    const newUserMessage: Message = { role: "user", content: input };
    const currentMessages = [...messages, newUserMessage];
    setMessages(currentMessages);
    setInput("");
    setIsLoading(true);
    setError(null);
    // Don't automatically hide the form on new messages
    // setShowBookingForm(false);
    // Only reset cateringQuote if we're getting a new quote from the API

    try {
      const filtered = currentMessages.map(({ role, content }) => ({
        role,
        content,
      }));

      const res = await axios.post<{
        reply: string;
        quoted?: boolean;
        quote?: number | null;
      }>("/api/chat", { history: filtered });

      const botMsg: Message = {
        role: "assistant",
        content: res.data.reply,
        quoted: res.data.quoted,
        quote: res.data.quote,
      };

      setMessages((m) => [...m, botMsg]);

      if (shouldShowForm(botMsg) && typeof botMsg.quote === "number") {
        setCateringQuote(botMsg.quote);
        setShowBookingForm(true);
        setHasShownBookingForm(true); // Mark that the form has been shown
      }
      // If the API response doesn't include a new quote, keep the existing one
    } catch (e) {
      console.error(e);
      const err =
        "Sorry, I'm having trouble connecting. Please try again later.";
      setError(err);
      setMessages((m) => [...m, { role: "assistant", content: err }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) handleSend();
  };

  const handleBookingSuccess = () => {
    // Add a message to the chat to instruct the user
    const instructionMessage: Message = {
      role: "assistant",
      content: "Thank you for submitting your consultation request! Chef Alex will review your details and get back to you soon. Please check your email for confirmation.",
    };
    
    setMessages((m) => [...m, instructionMessage]);
    
    // Hide the form after submission but keep the quote
    setShowBookingForm(false);
    // setCateringQuote(null); // Don't reset the quote
  };

  // Function to reopen the booking form
  const handleReopenBookingForm = () => {
    if (cateringQuote !== null) {
      setShowBookingForm(true);
    }
  };

  /* ─────────────────────────────── render */
  return (
    // 🎨 MAIN CONTAINER - Side-by-side layout when booking form is shown
    <div
      className={`flex ${
        showBookingForm
          ? "flex-col lg:flex-row lg:justify-center gap-6" /* ⬅️ added lg:justify-between */
          : "justify-center"
      } ${
        showBookingForm ? "w-full max-w-7xl" : "max-w-lg"
      } mx-auto font-sans transition-all duration-300`}
    >
      {/* 🎨 CHAT CONTAINER - Chat window */}
<div
  className={`flex flex-col h-[calc(100vh-100px)] md:h-[600px]
    ${showBookingForm ? 'lg:w-2/3 lg:min-w-[500px] ' : 'max-w-lg lg:translate-x-0'}
    bg-primary2 rounded-lg opacity-90 shadow-xl
    transition-transform duration-300 ease-in-out   /* ⬅︎ keep transition on every state */
    ${showBookingForm ? 'relative' : ''} /* Add relative positioning when form is shown */
    ${showBookingForm ? 'lg:overflow-hidden' : ''} /* Hide overflow on desktop when form is shown */
  `}
>

        {/* 🎨 CHAT HEADER - Top bar with title */}
        <header className="text-white p-4 rounded-t-lg">
          <h3 className="text-lg font-semibold text-center text-accent2">
            Chef Alex J - Event Planner
          </h3>
        </header>

        {/* 🎨 MESSAGES AREA - Chat conversation background */}
        <div ref={messagesContainerRef} className="flex-grow p-4 overflow-y-auto space-y-4 bg-primary2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[70%] p-3 rounded-xl shadow ${
                  msg.role === "user"
                    ? "bg-accent1 text-primary1 rounded-br-none" /* 🎨 USER MESSAGE BUBBLE */
                    : "bg-primary1 text-accent1 rounded-bl-none" /* 🎨 AI MESSAGE BUBBLE */
                }`}
              >
                {/* 🎨 CHEF HAT ICON - Assistant message icon */}
                {msg.role === "assistant" && (
                  <ChefHat className="w-5 h-5 inline mr-2 mb-1 text-accent1" />
                )}
                {/* 🎨 USER ICON - User message icon */}
                {msg.role === "user" && (
                  <User className="w-5 h-5 inline mr-2 mb-1 text-primary1" />
                )}
                {msg.content}
                {/* 🎨 QUOTE DISPLAY - Shows estimated price in message */}
                {msg.quoted && msg.quote != null && (
                  <p className="text-xs mt-1 pt-1 border-t border-accent1">
                    <span className="font-semibold">Estimated Quote:</span> $
                    {msg.quote} CAD
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* 🎨 LOADING MESSAGE - Shows while AI is thinking */}
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex justify-start">
              <div className="max-w-[90%] sm:max-w-[70%] p-3 rounded-xl shadow bg-primary1 text-accent1 rounded-bl-none flex items-center">
                <Loader2 className="w-5 h-5 inline mr-2 animate-spin text-accent1" />
                Typing...
              </div>
            </div>
          )}

          {/* 🎨 REOPEN BOOKING FORM BUTTON - Shows when form is closed but was previously shown */}
          {!showBookingForm && hasShownBookingForm && cateringQuote !== null && (
            <div className="flex justify-center">
              <Button 
                onClick={handleReopenBookingForm}
                className="bg-accent1 hover:bg-accent2 text-white mt-2"
                size="sm"
              >
                Reopen Booking Form
              </Button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 🎨 ERROR MESSAGE - Red error display */}
        {error && (
          <div className="p-4 text-center bg-red-100 text-red-700 border-t border-accent1/30">
            {error}
          </div>
        )}

        {/* 🎨 INPUT AREA - Bottom section with text input and send button */}
        <div className="p-4 border-t border-stroke  rounded-b-lg">
          <div className="flex items-center space-x-2">
            {/* 🎨 TEXT INPUT FIELD - Where users type messages */}
            <Input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me about your event..."
              className="flex-grow focus-visible:ring-stroke text-stroke border-accent1/50"
              disabled={isLoading}
            />
            {/* 🎨 SEND BUTTON - Button to send messages */}
            <Button
              onClick={handleSend}
              disabled={isLoading || input.trim() === ""}
              className="bg-accent1 hover:bg-accent2 text-white"
            >
              {isLoading &&
              messages[messages.length - 1]?.role === "user" ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <SendHorizonal className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 🎨 BOOKING FORM CONTAINER - Side panel for booking form */}
{showBookingForm && cateringQuote !== null && (
  <div
    className="
      lg:w-[500px] lg:min-w-[500px]            /* same width as chat */
      
      transition-opacity duration-300          /* fades in 300 ms */
      opacity-100                              /* mounted with full opacity */
      
      /* Mobile overlay styles */
      fixed inset-0 z-50
      lg:relative lg:inset-auto lg:z-auto
      flex items-center justify-center
      bg-black/50 lg:bg-transparent
    "
    onClick={(e) => {
      // Close the form if the backdrop is clicked (mobile only)
      if (e.target === e.currentTarget) {
        setShowBookingForm(false);
        setCateringQuote(null);
      }
    }}
  >
    <div 
      className="
        bg-primary2 rounded-lg shadow-xl
        w-full max-w-md max-h-[90vh] overflow-y-auto
        lg:w-[500px] lg:min-w-[500px]
        lg:max-h-none lg:overflow-visible
      "
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the form
    >
      <BookingForm
        quote={cateringQuote}
        onBookingSuccess={handleBookingSuccess}
        chatHistory={messages}
        onClose={() => {
          setShowBookingForm(false);
          setCateringQuote(null);
        }}
      />
    </div>
  </div>
)}
    </div>
  );
};

export default QuoteChat;
