'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Alert } from '@/app/components/ui/alert';

interface BookingData {
  id: string;
  timestamp: string;
  client: {
    name: string;
    email: string;
    phone: string;
  };
  event: {
    date: string;
    time: string;
    location: string;
    guestCount: number;
    estimatedQuote: number;
    additionalNotes: string;
  };
  chatSummary: string;
  status: 'pending_review' | 'approved' | 'rejected' | 'suggested_alternative' | 'confirmed';
}

export default function BookingsTab() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/bookings/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update booking status');
      }

      // Refresh bookings
      fetchBookings();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update booking');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'approved') return booking.status === 'approved' || booking.status === 'confirmed';
    return booking.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'suggested_alternative': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent1 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 font-display">Admin Dashboard</h1>
            <p className="mt-1 text-gray-600">Manage booking requests and event consultations</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6">
            <div className="text-red-800">{error}</div>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
            <div className="text-gray-600">Total Bookings</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'pending_review').length}
            </div>
            <div className="text-gray-600">Pending Review</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'approved' || b.status === 'confirmed').length}
            </div>
            <div className="text-gray-600">Approved</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">
              {bookings.filter(b => b.status === 'rejected').length}
            </div>
            <div className="text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { key: 'all', label: 'All Bookings' },
                { key: 'pending_review', label: 'Pending Review' },
                { key: 'approved', label: 'Approved' },
                { key: 'rejected', label: 'Rejected' },
                { key: 'suggested_alternative', label: 'Alternative Suggested' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-accent1 text-accent1'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Bookings List */}
        <div className="bg-white shadow rounded-lg">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg">No bookings found</div>
              <p className="text-gray-400 mt-2">
                {filter === 'all' 
                  ? 'No booking requests have been submitted yet.' 
                  : `No bookings with status "${filter.replace('_', ' ')}" found.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.client.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                          {booking.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                        <div>
                          <strong>Email:</strong> {booking.client.email}
                        </div>
                        <div>
                          <strong>Phone:</strong> {booking.client.phone}
                        </div>
                        <div>
                          <strong>Submitted:</strong> {formatDate(booking.timestamp)}
                        </div>
                        <div>
                          <strong>Event Date:</strong> {booking.event.date}
                        </div>
                        <div>
                          <strong>Event Time:</strong> {booking.event.time}
                        </div>
                        <div>
                          <strong>Guests:</strong> {booking.event.guestCount}
                        </div>
                        <div>
                          <strong>Location:</strong> {booking.event.location}
                        </div>
                        <div>
                          <strong>Estimated Quote:</strong> ${booking.event.estimatedQuote?.toLocaleString() || 'N/A'}
                        </div>
                      </div>

                      {booking.event.additionalNotes && (
                        <div className="mb-4">
                          <strong className="text-sm text-gray-600">Additional Notes:</strong>
                          <p className="text-sm text-gray-700 mt-1">{booking.event.additionalNotes}</p>
                        </div>
                      )}

                      {booking.chatSummary && (
                        <div className="mb-4">
                          <strong className="text-sm text-gray-600">Chat Summary:</strong>
                          <p className="text-sm text-gray-700 mt-1">{booking.chatSummary}</p>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 flex-shrink-0">
                      <div className="flex flex-col space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/approve/${booking.id}`, '_blank')}
                        >
                          Detailed Review
                        </Button>
                        
                        {booking.status === 'pending_review' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              Quick Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateBookingStatus(booking.id, 'rejected')}
                              className="border-red-600 text-red-600 hover:bg-red-50"
                            >
                              Quick Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 