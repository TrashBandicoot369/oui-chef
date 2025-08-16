'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/app/components/ui/input';
import { Button } from '@/app/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';

// Define Message interface
interface Message {
  role: "user" | "assistant";
  content: string;
  quoted?: boolean;
  quote?: number | null;
}

interface BookingFormProps {
  quote: number;
  onBookingSuccess: () => void;
  chatHistory: Message[];
  onClose?: () => void; // Add onClose prop
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  eventDate: string;
  eventTime: string;
  location: string;
  guestCount: string;
  additionalNotes: string;
}

const initialFormData: FormData = {
  fullName: '',
  email: '',
  phone: '',
  eventDate: '',
  eventTime: '',
  location: '',
  guestCount: '',
  additionalNotes: '',
};

export default function BookingForm({ quote, onBookingSuccess, chatHistory, onClose }: BookingFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    let isValid = true;

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
      isValid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^[\d\s()+-]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
      isValid = false;
    }
    if (!formData.eventDate) {
      newErrors.eventDate = 'Event date is required';
      isValid = false;
    }
    if (!formData.location.trim()) {
      newErrors.location = 'Event location is required';
      isValid = false;
    }
    if (!formData.guestCount.trim()) {
      newErrors.guestCount = 'Guest count is required';
      isValid = false;
    } else if (!/^\d+$/.test(formData.guestCount) || parseInt(formData.guestCount) < 1) {
      newErrors.guestCount = 'Please enter a valid number of guests';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          ...formData, 
          quote, 
          chatHistory,
          guestCount: parseInt(formData.guestCount)
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      setSuccess(true);
      onBookingSuccess();
      setFormData(initialFormData);
    } catch (err: any) {
      setError(err.message || 'Something went wrong, please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Alert variant="default" className="bg-primary1 border-accent1 text-accent1 shadow-xl">
        <AlertTitle className="font-semibold">Consultation Request Sent!</AlertTitle>
        <AlertDescription>
          Thank you! Chef Alex will get back to you within 24 hours to discuss your event details.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border border-accent1/20 rounded-lg bg-primary2 shadow-xl">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-accent1">Book Your Consultation</h3>
        {onClose && (
          <button 
            type="button" 
            onClick={onClose}
            className="text-accent1 hover:text-accent2 text-2xl leading-none"
            aria-label="Close form"
          >
            &times;
          </button>
        )}
      </div>
      
      <div>
        <label htmlFor="quoteDisplay" className="block text-sm font-medium text-accent1">Estimated Quote</label>
        <Input 
          type="text" 
          id="quoteDisplay" 
          value={`${quote.toFixed(0)} CAD`} 
          readOnly 
          className="mt-1 block w-full bg-primary3 border-accent1/30 rounded-md shadow-sm text-accent1 font-semibold"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-accent1">Full Name</label>
          <Input 
            type="text" 
            name="fullName" 
            id="fullName" 
            value={formData.fullName} 
            onChange={handleChange} 
            placeholder="Your full name" 
            className={`mt-1 bg-primary3 border-accent1/30 text-accent1 placeholder:text-accent1/60 focus-visible:ring-accent1 ${errors.fullName ? 'border-red-500' : ''}`}
          />
          {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-accent1">Email</label>
          <Input 
            type="email" 
            name="email" 
            id="email" 
            value={formData.email} 
            onChange={handleChange} 
            placeholder="you@example.com" 
            className={`mt-1 bg-primary3 border-accent1/30 text-accent1 placeholder:text-accent1/60 focus-visible:ring-accent1 ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-accent1">Phone</label>
          <Input 
            type="tel" 
            name="phone" 
            id="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            placeholder="(416) 555-0123" 
            className={`mt-1 bg-primary3 border-accent1/30 text-accent1 placeholder:text-accent1/60 focus-visible:ring-accent1 ${errors.phone ? 'border-red-500' : ''}`}
          />
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="guestCount" className="block text-sm font-medium text-accent1">Number of Guests</label>
          <Input 
            type="number" 
            name="guestCount" 
            id="guestCount" 
            value={formData.guestCount} 
            onChange={handleChange} 
            placeholder="8" 
            min="1"
            className={`mt-1 bg-primary3 border-accent1/30 text-accent1 placeholder:text-accent1/60 focus-visible:ring-accent1 ${errors.guestCount ? 'border-red-500' : ''}`}
          />
          {errors.guestCount && <p className="text-xs text-red-600 mt-1">{errors.guestCount}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="eventDate" className="block text-sm font-medium text-accent1">Event Date</label>
          <Input 
            type="date" 
            name="eventDate" 
            id="eventDate" 
            value={formData.eventDate} 
            onChange={handleChange} 
            min={new Date().toISOString().split('T')[0]}
            className={`mt-1 bg-primary3 border-accent1/30 text-accent1 focus-visible:ring-accent1 ${errors.eventDate ? 'border-red-500' : ''}`}
          />
          {errors.eventDate && <p className="text-xs text-red-600 mt-1">{errors.eventDate}</p>}
        </div>

        <div>
          <label htmlFor="eventTime" className="block text-sm font-medium text-accent1">Preferred Time</label>
          <Input 
            type="time" 
            name="eventTime" 
            id="eventTime" 
            value={formData.eventTime} 
            onChange={handleChange} 
            className="mt-1 bg-primary3 border-accent1/30 text-accent1 focus-visible:ring-accent1"
          />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-accent1">Event Location</label>
        <Input 
          type="text" 
          name="location" 
          id="location" 
          value={formData.location} 
          onChange={handleChange} 
          placeholder="Address or venue name" 
          className={`mt-1 bg-primary3 border-accent1/30 text-accent1 placeholder:text-accent1/60 focus-visible:ring-accent1 ${errors.location ? 'border-red-500' : ''}`}
        />
        {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location}</p>}
      </div>

      <div>
        <label htmlFor="additionalNotes" className="block text-sm font-medium text-accent1">Additional Notes</label>
        <textarea 
          name="additionalNotes" 
          id="additionalNotes" 
          value={formData.additionalNotes} 
          onChange={handleChange} 
          placeholder="Dietary restrictions, special requests, etc..." 
          rows={3}
          className="mt-1 block w-full rounded-md border border-accent1/30 bg-primary3 px-3 py-2 text-sm text-accent1 placeholder:text-accent1/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent1 focus-visible:ring-offset-2"
        />
      </div>

      {error && (
        <Alert variant="destructive" className="bg-primary1 border-red-500 text-red-400">
          <AlertTitle className="font-semibold">Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full bg-accent1 hover:bg-accent2 text-white py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent1/50 disabled:opacity-50"
      >
        {isLoading ? 'Submitting...' : 'Request Consultation'}
      </Button>
    </form>
  );
} 