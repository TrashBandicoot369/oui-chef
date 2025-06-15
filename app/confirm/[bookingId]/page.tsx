'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ConfirmPage({ params }: { params: { bookingId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const confirmBooking = async () => {
    setLoading(true);
    try {
      await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: params.bookingId }),
      });
      router.push('/');
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Error confirming booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-20 text-center">
      <h2 className="text-xl font-semibold text-accent1 mb-6">Confirm Your Event</h2>
      <p className="text-gray-600 mb-8">
        Ready to confirm this booking? Click below to finalize your event with Chef Alex.
      </p>
      <button 
        className="bg-green-700 text-white py-3 px-6 rounded hover:bg-green-800 disabled:opacity-50" 
        onClick={confirmBooking}
        disabled={loading}
      >
        {loading ? 'Confirming...' : 'Confirm This Time'}
      </button>
    </div>
  );
} 