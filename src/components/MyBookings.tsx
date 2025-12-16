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
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');



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

  // Filter bookings based on selected filter
  const today = new Date();
  const filteredBookings = bookings.filter(booking => {
    const startDate = new Date(booking.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + booking.duration);

    if (filter === 'upcoming') {
      return endDate >= today && booking.status !== 'Cancelled';
    } else {
      return endDate < today || booking.status === 'Cancelled';
    }
  });

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
          View and manage your travel bookings
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-2 mb-6 inline-flex gap-2">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-6 py-2.5 rounded-md transition-all ${filter === 'upcoming'
            ? 'bg-[var(--color-primary-blue)] text-white'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background)]'
            }`}
        >
          Upcoming Trips
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-6 py-2.5 rounded-md transition-all ${filter === 'past'
            ? 'bg-[var(--color-primary-blue)] text-white'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-background)]'
            }`}
        >
          Past History
        </button>
      </div>

      {/* Bookings Count */}
      <div className="mb-6">
        <p className="text-[var(--color-text-secondary)] text-sm">
          {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'} found
        </p>
      </div>

      {/* Bookings List */}
      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredBookings.map(booking => (
            <div
              key={booking.id}
              className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallback
                  src={booking.imageUrl}
                  alt={booking.packageName}
                  className="w-full h-full object-cover"
                />
                {/* Status Badge Overlay */}
                <div className="absolute top-4 right-4">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs border ${getStatusBadgeStyles(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                {/* Title and Destination */}
                <div className="mb-4">
                  <h3 className="text-[var(--color-text-primary)] mb-2">
                    {booking.packageName}
                  </h3>
                  <div className="flex items-center gap-2 text-[var(--color-text-secondary)] text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{booking.destination}</span>
                  </div>
                </div>

                {/* Booking Details Grid */}
                <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-[var(--color-border)]">
                  {/* Start Date */}
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-[var(--color-primary-blue)] mt-0.5" />
                    <div>
                      <p className="text-xs text-[var(--color-text-secondary)] mb-0.5">
                        Start Date
                      </p>
                      <p className="text-sm text-[var(--color-text-primary)]">
                        {formatDate(booking.startDate)}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-[var(--color-primary-blue)] mt-0.5" />
                    <div>
                      <p className="text-xs text-[var(--color-text-secondary)] mb-0.5">
                        Duration
                      </p>
                      <p className="text-sm text-[var(--color-text-primary)]">
                        {booking.duration} {booking.duration === 1 ? 'day' : 'days'}
                      </p>
                    </div>
                  </div>

                  {/* Passengers */}
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-[var(--color-primary-blue)] mt-0.5" />
                    <div>
                      <p className="text-xs text-[var(--color-text-secondary)] mb-0.5">
                        Passengers
                      </p>
                      <p className="text-sm text-[var(--color-text-primary)]">
                        {booking.passengers} {booking.passengers === 1 ? 'person' : 'people'}
                      </p>
                    </div>
                  </div>

                  {/* Booking Code */}
                  <div className="flex items-start gap-2">
                    <Plane className="w-4 h-4 text-[var(--color-primary-blue)] mt-0.5" />
                    <div>
                      <p className="text-xs text-[var(--color-text-secondary)] mb-0.5">
                        Booking Code
                      </p>
                      <p className="text-sm text-[var(--color-text-primary)]">
                        {booking.bookingCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[var(--color-primary-blue)]" />
                    <div>
                      <p className="text-xs text-[var(--color-text-secondary)]">Total Price</p>
                      <p className="text-xl text-[var(--color-text-primary)]">
                        ${booking.totalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div>
                    {booking.status === 'Pending Payment' ? (
                      <button
                        onClick={() => handlePayNow(booking.id)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors"
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>Pay Now</span>
                      </button>
                    ) : booking.status === 'Cancelled' ? (
                      <button
                        onClick={() => handleViewItinerary(booking.id)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-background)] text-[var(--color-text-secondary)] rounded-md transition-colors border border-[var(--color-border)] cursor-not-allowed opacity-50"
                        disabled
                      >
                        <Eye className="w-4 h-4" />
                        <span>Cancelled</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleViewItinerary(booking.id)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue-hover)] text-white rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    )}
                  </div>
                </div>
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
                No {filter === 'upcoming' ? 'Upcoming' : 'Past'} Trips
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                {filter === 'upcoming'
                  ? "You don't have any upcoming trips scheduled."
                  : "You don't have any past trips in your history."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
