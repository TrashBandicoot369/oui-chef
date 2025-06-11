'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Define Message interface (as it's not imported)
interface Message {
  role: "user" | "assistant";
  content: string;
  quoted?: boolean;
  quote?: number | null;
}

interface BookingFormProps {
  quote: number;
  onBookingSuccess: () => void;
  chatHistory: Message[]; // Added chatHistory prop
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
}

const initialFormData: FormData = {
  fullName: '',
  email: '',
  phone: '',
  date: '',
  time: '',
};

export default function BookingForm({ quote, onBookingSuccess, chatHistory }: BookingFormProps) {
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
    }
    // Basic phone validation (numbers and common characters)
    else if (!/^[\d\s()+-]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
      isValid = false;
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
      isValid = false;
    }
    if (!formData.time) {
      newErrors.time = 'Time is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
        setErrors(prev => ({...prev, [name]: undefined}))
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
        body: JSON.stringify({ ...formData, quote, chatHistory }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      setSuccess(true);
      onBookingSuccess(); // Callback to inform parent
      setFormData(initialFormData); // Reset form
    } catch (err: any) {
      setError(err.message || 'Something went wrong, please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Alert variant="default" className="bg-forest-light/20 border-forest-dark text-forest-dark my-4">
        <AlertTitle className="font-semibold">Booking Request Sent!</AlertTitle>
        <AlertDescription>
          Thanks! We will get back to you shortly.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-forest-dark/20 rounded-md my-4 bg-cream shadow-md">
      <h3 className="text-lg font-semibold text-forest-dark">Request a Booking</h3>
      <div>
        <label htmlFor="quoteDisplay" className="block text-sm font-medium text-gray-700">Rough Quote</label>
        <Input 
          type="text" 
          id="quoteDisplay" 
          value={`CA$${quote.toFixed(2)}`} 
          readOnly 
          className="mt-1 block w-full bg-gray-100 border-gray-300 rounded-md shadow-sm text-gray-500"
        />
      </div>
      
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-forest-dark">Full Name</label>
        <Input 
          type="text" 
          name="fullName" 
          id="fullName" 
          value={formData.fullName} 
          onChange={handleChange} 
          placeholder="Your full name" 
          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-forest-dark focus:border-forest-dark sm:text-sm ${errors.fullName ? 'border-red-500' : ''}`}
        />
        {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-forest-dark">Email</label>
        <Input 
          type="email" 
          name="email" 
          id="email" 
          value={formData.email} 
          onChange={handleChange} 
          placeholder="you@example.com" 
          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-forest-dark focus:border-forest-dark sm:text-sm ${errors.email ? 'border-red-500' : ''}`}
        />
        {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-forest-dark">Phone</label>
        <Input 
          type="tel" 
          name="phone" 
          id="phone" 
          value={formData.phone} 
          onChange={handleChange} 
          placeholder="(123) 456-7890" 
          className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-forest-dark focus:border-forest-dark sm:text-sm ${errors.phone ? 'border-red-500' : ''}`}
        />
        {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-forest-dark">Preferred Date</label>
          <Input 
            type="date" 
            name="date" 
            id="date" 
            value={formData.date} 
            onChange={handleChange} 
            min={new Date().toISOString().split('T')[0]} // Prevent past dates
            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-forest-dark focus:border-forest-dark sm:text-sm ${errors.date ? 'border-red-500' : ''}`}
          />
          {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
        </div>
        <div>
          <label htmlFor="time" className="block text-sm font-medium text-forest-dark">Preferred Time</label>
          <Input 
            type="time" 
            name="time" 
            id="time" 
            value={formData.time} 
            onChange={handleChange} 
            className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-forest-dark focus:border-forest-dark sm:text-sm ${errors.time ? 'border-red-500' : ''}`}
          />
          {errors.time && <p className="text-xs text-red-600 mt-1">{errors.time}</p>}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-100 border-red-500 text-red-700">
          <AlertTitle className="font-semibold">Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        disabled={isLoading} 
        className="w-full bg-forest-dark hover:bg-forest-dark/90 text-cream py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest-dark/50 disabled:opacity-50"
      >
        {isLoading ? 'Submitting...' : 'Request Booking'}
      </Button>
    </form>
  );
} 