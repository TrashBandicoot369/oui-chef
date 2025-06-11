"use client";

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SendHorizonal, Bot, User, Loader2 } from 'lucide-react';
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
  const [tattooQuote, setTattooQuote] = useState<number | null>(null);

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
      { role: "assistant", content: "Hello! I can help you get a rough quote for your tattoo. Tell me about your idea!" }
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
    setTattooQuote(null);     // Reset quote on new user message

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
        setTattooQuote(newAssistantMessage.quote);
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
    <div className="flex flex-col h-[calc(100vh-100px)] md:h-[600px] max-w-lg mx-auto bg-white rounded-lg shadow-xl font-sans">
      <header className="bg-forest-dark text-cream p-4 rounded-t-lg">
        <h3 className="text-lg font-semibold text-center">Tattoo Quote Assistant</h3>
      </header>

      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-cream/30">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] p-3 rounded-xl shadow ${
                msg.role === 'user' 
                  ? 'bg-forest-medium text-cream rounded-br-none' 
                  : 'bg-pale-lilac/50 text-forest-dark rounded-bl-none'
              }`}
            >
              {msg.role === 'assistant' && <Bot className="w-5 h-5 inline mr-2 mb-1 text-forest-dark/70" />}
              {msg.role === 'user' && <User className="w-5 h-5 inline mr-2 mb-1 text-cream/70" />}
              {msg.content}
              {msg.quoted && msg.quote != null && (
                <p className="text-xs mt-1 pt-1 border-t border-forest-dark/20">
                  <span className="font-semibold">Rough Quote:</span> CA${msg.quote}
                </p>
              )}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length -1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-xl shadow bg-pale-lilac/50 text-forest-dark rounded-bl-none flex items-center">
              <Loader2 className="w-5 h-5 inline mr-2 animate-spin text-forest-dark/70" />
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showBookingForm && tattooQuote !== null && (
        <div className="p-4 border-t border-forest-light/30 bg-white">
          <BookingForm quote={tattooQuote} onBookingSuccess={handleBookingSuccess} chatHistory={messages} />
        </div>
      )}
      {error && !showBookingForm && (
        <div className="p-4 text-center bg-red-100 text-red-700">
          {error}
        </div>
      )}

      <div className="p-4 border-t border-forest-light/30 bg-white rounded-b-lg">
        <div className="flex items-center space-x-2">
          <Input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your tattoo idea..."
            className="flex-grow focus-visible:ring-forest-medium border-forest-light/50"
            disabled={isLoading || (showBookingForm && tattooQuote !== null)}
          />
          <Button 
            onClick={handleSend} 
            disabled={isLoading || input.trim() === '' || (showBookingForm && tattooQuote !== null)}
            className="bg-forest-dark hover:bg-forest-medium text-cream"
          >
            {isLoading && messages[messages.length -1]?.role === 'user' ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizonal className="w-5 h-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuoteChat; 