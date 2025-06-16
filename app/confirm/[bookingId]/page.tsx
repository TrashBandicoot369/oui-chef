'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function ConfirmPage({ params }: { params: { bookingId: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  useEffect(() => {
    const timeParam = searchParams.get('time');
    setSelectedTime(timeParam);
  }, [searchParams]);

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const confirmBooking = async () => {
    setLoading(true);
    try {
      await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bookingId: params.bookingId,
          selectedTime: selectedTime 
        }),
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
      
      {selectedTime && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selected Time</h3>
          <p className="text-accent1 font-semibold text-lg">
            {formatDateTime(selectedTime)}
          </p>
        </div>
      )}
      
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