'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ApprovePage({ params }: { params: { bookingId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: 'accept' | 'reject' | 'suggest') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/booking/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId: params.bookingId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} booking`);
      }

      if (action === 'suggest') {
        router.push(`/suggest/${params.bookingId}`);
      } else {
        // Show success message and redirect to admin dashboard
        router.push('/admin');
      }
    } catch (error) {
      console.error(`Error ${action}ing booking:`, error);
      alert(`Failed to ${action} booking. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-16 text-center space-y-6">
      <h2 className="text-2xl font-bold text-accent1">Booking Request</h2>
      <p className="text-sm text-gray-700">How would you like to respond?</p>
      <div className="space-x-4">
        <button 
          className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50" 
          onClick={() => handleAction('accept')} 
          disabled={loading}
        >
          Accept
        </button>
        <button 
          className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50" 
          onClick={() => handleAction('reject')} 
          disabled={loading}
        >
          Reject
        </button>
        <button 
          className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 disabled:opacity-50" 
          onClick={() => handleAction('suggest')} 
          disabled={loading}
        >
          Suggest New Time
        </button>
      </div>
    </div>
  );
} 