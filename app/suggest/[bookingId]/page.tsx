'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SuggestTimePage({ params }: { params: { bookingId: string } }) {
  const router = useRouter();
  const [times, setTimes] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);

  const handleChange = (i: number, val: string) => {
    const updated = [...times];
    updated[i] = val;
    setTimes(updated);
  };

  const handleSubmit = async () => {
    const validTimes = times.filter(Boolean);
    if (validTimes.length === 0) {
      alert('Please provide at least one alternative time.');
      return;
    }

    setLoading(true);
    try {
      await fetch('/api/booking/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bookingId: params.bookingId, 
          options: validTimes 
        }),
      });
      router.push('/');
    } catch (error) {
      console.error('Error submitting suggestions:', error);
      alert('Error sending suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12">
      <h2 className="text-lg font-bold text-accent1 mb-4">Suggest Up to 3 Alternate Times</h2>
      <p className="text-sm text-gray-600 mb-6">
        Provide alternative time slots for this booking. Use the format: YYYY-MM-DDTHH:mm
      </p>
      {times.map((t, i) => (
        <input 
          key={i} 
          type="datetime-local"
          value={t} 
          onChange={(e) => handleChange(i, e.target.value)} 
          placeholder="YYYY-MM-DDTHH:mm" 
          className="block mb-3 w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-accent1" 
        />
      ))}
      <button 
        className="bg-accent1 text-white py-2 px-4 rounded hover:opacity-90 disabled:opacity-50" 
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send to Client'}
      </button>
    </div>
  );
} 