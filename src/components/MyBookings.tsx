import { useState, useEffect } from 'react';
import { Calendar, Clock, DollarSign, Eye, CreditCard, MapPin, Users, Plane } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getUserBookings, getCurrentUser } from '../services/database';

type BookingStatus = 'Confirmed' | 'Pending Payment' | 'Cancelled';

interface Booking {
  id: number;
  packageName: string;
  destination: string;
  imageUrl: string;
  startDate: string;
  duration: number;
  status: BookingStatus;
  totalPrice: number;
  passengers: number;
  bookingDate: string;
  bookingCode: string;
}

export function MyBookings() {




  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const user = await getCurrentUser();
      if (user?.cod) {
        const data = await getUserBookings(user.cod);
        // Map backend data to frontend Booking interface
        const mappedBookings: Booking[] = data.map((b: any) => ({
          id: b.id,
          packageName: b.package_name,
          destination: 'Destino Variable', // Backend doesn't give destination yet, or strictly linked. Using placeholder.
          imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80', // Placeholder image
          startDate: new Date(b.start_date).toISOString().split('T')[0],
          duration: b.duration,
          status: b.status as BookingStatus,
          totalPrice: parseFloat(b.total_price),
          passengers: 1, // Placeholder, need detailed passenger count query
          bookingDate: new Date(b.booking_date).toISOString().split('T')[0],
          bookingCode: `BK-2025-${b.id.toString().padStart(3, '0')}`,
        }));
        setBookings(mappedBookings);
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoading(false);
    }
  };



  const getStatusBadgeStyles = (status: BookingStatus): string => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending Payment':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleViewItinerary = (bookingId: number) => {
    alert(`View itinerary for booking ID: ${bookingId}`);
  };

  const handlePayNow = (bookingId: number) => {
    alert(`Proceed to payment for booking ID: ${bookingId}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[var(--color-text-primary)] mb-2">
          My Trips
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          View and manage all your travel bookings
        </p>
      </div>

      {/* Bookings Count */}
      <div className="mb-6">
        <p className="text-[var(--color-text-secondary)] text-sm">
          {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} found
        </p>
      </div>

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map(booking => (
            <div
              key={booking.id}
              className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Main Info */}
              <div className="flex-1">
                <div className="mb-2">
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {booking.packageName}
                  </h3>
                  <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{booking.destination}</span>
                    <span className="mx-2">•</span>
                    <Plane className="w-4 h-4" />
                    <span>{booking.bookingCode}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-4">
                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <Calendar className="w-4 h-4 text-[var(--color-primary-blue)]" />
                    <span>{formatDate(booking.startDate)}</span>
                  </div>
                  {/* Duration */}
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <Clock className="w-4 h-4 text-[var(--color-primary-blue)]" />
                    <span>{booking.duration} days</span>
                  </div>
                  {/* Passengers */}
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <Users className="w-4 h-4 text-[var(--color-primary-blue)]" />
                    <span>{booking.passengers} pax</span>
                  </div>
                </div>
              </div>

              {/* Status & Price */}
              <div className="flex flex-col items-start md:items-end gap-2 min-w-[140px]">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeStyles(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
                <div className="text-right">
                  <div className="text-sm text-[var(--color-text-secondary)]">Total</div>
                  <div className="text-xl font-bold text-[var(--color-text-primary)]">
                    ${booking.totalPrice.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="min-w-[120px] flex justify-end">
                {booking.status === 'Pending Payment' ? (
                  <button
                    onClick={() => handlePayNow(booking.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors text-sm font-medium shadow-sm"
                  >
                    <CreditCard className="w-4 h-4" />
                    Pay Now
                  </button>
                ) : booking.status === 'Cancelled' ? (
                  <button
                    className="w-full px-4 py-2 bg-[var(--color-background)] text-[var(--color-text-secondary)] rounded-md border border-[var(--color-border)] cursor-not-allowed opacity-60 text-sm font-medium"
                    disabled
                  >
                    Cancelled
                  </button>
                ) : (
                  <button
                    onClick={() => handleViewItinerary(booking.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue-hover)] text-white rounded-md transition-colors text-sm font-medium shadow-sm"
                  >
                    <Eye className="w-4 h-4" />
                    Details
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-[var(--color-background)] rounded-full flex items-center justify-center">
              <Plane className="w-8 h-8 text-[var(--color-text-secondary)]" />
            </div>
            <div>
              <h3 className="text-[var(--color-text-primary)] mb-2">
                No Trips Found
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                You don't have any trips booked yet.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
