import { useState, useEffect } from 'react';
import { Calendar, MapPin, Package, Clock, CreditCard, ChevronRight, AlertCircle, ShoppingBag, Star, Trash2, DollarSign, Eye, Users, Plane, X, User, Plus } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { getUserBookings, getCurrentUser, toggleWishlist, getWishlist, addPassengersToBooking, processPayment } from '../services/database';

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
  composition?: string;
}

interface Passenger {
  id: number;
  firstName: string;
  lastName: string;
  passportNumber: string;
  dob: string;
}

interface PaymentDetails {
  method: 'USDt' | 'PagoMovil' | 'DepositoBancario' | 'TransferenciaBancaria' | 'TarjetaCreditoDebito' | 'Cheque' | 'Zelle' | 'Milla';
  amount?: number;
  // TarjetaCreditoDebito fields
  cardType?: 'Debit' | 'Credit';
  cardNumber?: string;
  cvv?: string;
  cardBankName?: string;
  expiryDate?: string;
  cardHolder?: string;
  // Cheque fields
  checkNumber?: string;
  checkHolder?: string;
  checkBank?: string;
  checkIssueDate?: string;
  checkAccountCode?: string;
  // DepositoBancario fields
  depositNumber?: string;
  depositBank?: string;
  depositDate?: string;
  depositReference?: string;
  // TransferenciaBancaria fields
  transferNumber?: string;
  transferTime?: string;
  // PagoMovil fields
  pmReference?: string;
  pmTime?: string;
  // USDt fields
  usdtDate?: string;
  usdtTime?: string;
  usdtWallet?: string;
  usdtId?: string;
  // Zelle fields
  zelleConfirmation?: string;
  zelleDate?: string;
  zelleTime?: string;
  // Milla fields
  miles?: number;
}


export function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [wishlist, setWishlist] = useState<any[]>([]);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([
    { id: 1, firstName: '', lastName: '', passportNumber: '', dob: '' }
  ]);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    method: 'TarjetaCreditoDebito',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadBookings = () => loadData();

  const handleRemoveFromWishlist = async (pkgId: number) => {
    if (!user) return;
    try {
      await toggleWishlist(user.cod, pkgId);
      setWishlist(wishlist.filter(item => item.id !== pkgId));
    } catch (err) {
      console.error('Failed to remove from wishlist', err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (currentUser?.cod) {
        const data = await getUserBookings(currentUser.cod);
        // Map backend data to frontend Booking interface
        const userBookings: Booking[] = data.map((b: any) => ({
          id: b.id,
          packageName: b.packageName || b.packagename || b.package_name,
          destination: b.destination || 'Destino Variable',
          imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&q=80',
          startDate: b.startDate ? new Date(b.startDate).toISOString().split('T')[0] : (b.start_date ? new Date(b.start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
          duration: b.duration,
          status: (b.status === 'Active' ? 'Pending Payment' : b.status) as BookingStatus,
          totalPrice: parseFloat(b.totalPrice || b.totalprice || b.total_price || 0),
          passengers: b.passengers || 1,
          bookingDate: b.bookingDate ? new Date(b.bookingDate).toISOString().split('T')[0] : (b.booking_date ? new Date(b.booking_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
          bookingCode: `BK-2025-${b.id.toString().padStart(3, '0')}`,
          composition: b.composition
        }));
        setBookings(userBookings);

        const userWishlist = await getWishlist(currentUser.cod);
        setWishlist(userWishlist || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePassengerChange = (id: number, field: keyof Passenger, value: string) => {
    setPassengers(passengers.map((p: Passenger) =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleAddPassenger = () => {
    const newId = Math.max(...passengers.map((p: Passenger) => p.id), 0) + 1;
    setPassengers([...passengers, {
      id: newId,
      firstName: '',
      lastName: '',
      passportNumber: '',
      dob: ''
    }]);
  };

  const handleRemovePassenger = (id: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((p: Passenger) => p.id !== id));
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedBooking) return;

    // Validate passengers
    const invalidPassenger = passengers.find((p: Passenger) =>
      !p.firstName.trim() || !p.lastName.trim() || !p.passportNumber.trim() || !p.dob
    );
    if (invalidPassenger) {
      alert('Please fill in all passenger details');
      return;
    }

    // Validate payment details based on method
    if (paymentDetails.method === 'TarjetaCreditoDebito') {
      if (!paymentDetails.cardNumber || !paymentDetails.cvv || !paymentDetails.expiryDate || !paymentDetails.cardHolder) {
        alert('Please fill in all card details');
        return;
      }
    }

    try {
      // Get current user for payment processing
      const user = await getCurrentUser();
      if (!user) {
        alert('Not authenticated. Please log in.');
        return;
      }

      // Add passeng to booking first
      await addPassengersToBooking(
        selectedBooking.id,
        passengers.map((p: Passenger) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          passportNumber: p.passportNumber,
          dob: p.dob
        }))
      );

      // Process payment
      await processPayment(
        user.cod,
        selectedBooking.id,
        selectedBooking.totalPrice,
        paymentDetails.method,
        `Payment for ${selectedBooking.packageName}`,
        {
          cardNumber: paymentDetails.cardNumber,
          cardHolder: paymentDetails.cardHolder,
          expiryDate: paymentDetails.expiryDate,
          cvv: paymentDetails.cvv,
          cardBankName: paymentDetails.cardBankName,
          checkNumber: paymentDetails.checkNumber,
          checkHolder: paymentDetails.checkHolder,
          checkBank: paymentDetails.checkBank,
          checkIssueDate: paymentDetails.checkIssueDate,
          checkAccountCode: paymentDetails.checkAccountCode,
          depositNumber: paymentDetails.depositNumber,
          depositBank: paymentDetails.depositBank,
          depositDate: paymentDetails.depositDate,
          depositReference: paymentDetails.depositReference,
          transferNumber: paymentDetails.transferNumber,
          transferTime: paymentDetails.transferTime,
          pmReference: paymentDetails.pmReference,
          pmTime: paymentDetails.pmTime,
          usdtWallet: paymentDetails.usdtWallet,
          usdtDate: paymentDetails.usdtDate,
          usdtTime: paymentDetails.usdtTime,
          zelleConfirmation: paymentDetails.zelleConfirmation,
          zelleDate: paymentDetails.zelleDate,
          zelleTime: paymentDetails.zelleTime,
          miles: paymentDetails.miles
        }
      );

      alert('Payment processed successfully!');
      setShowPaymentModal(false);
      setSelectedBooking(null);
      setPassengers([{ id: 1, firstName: '', lastName: '', passportNumber: '', dob: '' }]);
      setPaymentDetails({ method: 'TarjetaCreditoDebito' });
      await loadBookings(); // Refresh bookings list
    } catch (error) {
      console.error('Payment failed:', error);
      alert(`Payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
    const booking = bookings.find((b: Booking) => b.id === bookingId);
    if (booking) {
      setSelectedBooking(booking);
      setShowPaymentModal(true);
    }
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

      {/* Wishlist Section */}
      {wishlist.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-6 h-6 text-yellow-500 fill-current" />
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">My Wishlist</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((item: any) => (
              <div key={item.id} className="bg-[var(--color-card)] rounded-xl shadow-sm border border-[var(--color-border)] overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-[var(--color-text-primary)]">{item.packageName || item.packagename}</h3>
                    <button
                      onClick={() => handleRemoveFromWishlist(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[var(--color-text-secondary)] text-sm mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-[var(--color-text-secondary)] mb-4">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[var(--color-primary-blue)]" />
                      {item.duracion} days
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[var(--color-primary-blue)]" />
                      {item.millaje} miles
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
                    <span className="font-bold text-[var(--color-text-primary)]">${Number(item.totalPrice || item.totalprice).toLocaleString()}</span>
                    <button
                      className="text-sm font-medium text-[var(--color-primary-blue)] hover:underline flex items-center gap-1"
                      onClick={() => window.location.href = '/itinerary'}
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookings Count */}
      <div className="mb-6">
        <p className="text-[var(--color-text-secondary)] text-sm">
          {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} found
        </p>
      </div>

      {/* Bookings List */}
      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((booking: Booking) => (
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
                  {booking.composition && (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-2 italic bg-[var(--color-background)] p-2 rounded border border-[var(--color-border)]">
                      Includes: {booking.composition}
                    </p>
                  )}
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

      {/* Payment Modal */}
      {showPaymentModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--color-card)] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[var(--color-card)] border-b border-[var(--color-border)] p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Complete Payment</h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {selectedBooking.packageName} - ${selectedBooking.totalPrice.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedBooking(null);
                }}
                className="p-2 hover:bg-[var(--color-background)] rounded-md transition-colors"
              >
                <X className="w-6 h-6 text-[var(--color-text-secondary)]" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-8">
              {/* Passenger Details Section */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Passenger Details</h3>
                <div className="space-y-4">
                  {passengers.map((passenger: Passenger, index: number) => (
                    <div key={passenger.id} className="border border-[var(--color-border)] rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[var(--color-text-primary)] flex items-center gap-2">
                          <User className="w-5 h-5 text-[var(--color-primary-blue)]" />
                          Passenger {index + 1}
                        </h4>
                        {passengers.length > 1 && (
                          <button
                            onClick={() => handleRemovePassenger(passenger.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Remove passenger"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={passenger.firstName}
                            onChange={(e) => handlePassengerChange(passenger.id, 'firstName', e.target.value)}
                            className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                            placeholder="Enter first name"
                          />
                        </div>
                        <div>
                          <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={passenger.lastName}
                            onChange={(e) => handlePassengerChange(passenger.id, 'lastName', e.target.value)}
                            className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                            placeholder="Enter last name"
                          />
                        </div>
                        <div>
                          <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                            Passport Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={passenger.passportNumber}
                            onChange={(e) => handlePassengerChange(passenger.id, 'passportNumber', e.target.value)}
                            className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                            placeholder="Enter passport number"
                          />
                        </div>
                        <div>
                          <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                            Date of Birth <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={passenger.dob}
                            onChange={(e) => handlePassengerChange(passenger.id, 'dob', e.target.value)}
                            className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={handleAddPassenger}
                    className="w-full py-3 border-2 border-dashed border-[var(--color-border)] rounded-lg text-[var(--color-text-secondary)] hover:border-[var(--color-primary-blue)] hover:text-[var(--color-primary-blue)] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Another Passenger
                  </button>
                </div>
              </div>

              {/* Payment Method Section */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Payment Method</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {(['TarjetaCreditoDebito', 'Zelle', 'USDt', 'PagoMovil', 'DepositoBancario', 'TransferenciaBancaria', 'Cheque', 'Milla'] as const).map(method => (
                    <button
                      key={method}
                      onClick={() => setPaymentDetails({ ...paymentDetails, method })}
                      className={`px-4 py-3 border-2 rounded-lg transition-all text-xs font-medium ${paymentDetails.method === method
                        ? 'border-[var(--color-primary-blue)] bg-blue-50 text-[var(--color-primary-blue)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-primary-blue)] text-[var(--color-text-primary)]'
                        }`}
                    >
                      {method === 'TarjetaCreditoDebito' ? 'Tarjeta C/D' :
                        method === 'PagoMovil' ? 'Pago Móvil' :
                          method === 'DepositoBancario' ? 'Depósito' :
                            method === 'TransferenciaBancaria' ? 'Transferencia' :
                              method}
                    </button>
                  ))}
                </div>

                {/* Payment Details Form */}
                <div className="border border-[var(--color-border)] rounded-lg p-6 space-y-4">
                  <h4 className="text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-[var(--color-primary-blue)]" />
                    {paymentDetails.method} Details
                  </h4>

                  {/* Tarjeta Crédito/Débito */}
                  {paymentDetails.method === 'TarjetaCreditoDebito' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                          Card Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={paymentDetails.cardNumber || ''}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                        />
                      </div>
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Card Holder Name <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={paymentDetails.cardHolder || ''}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cardHolder: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                          placeholder="Name as on card"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Expiry Date <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={paymentDetails.expiryDate || ''}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                            className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                        <div>
                          <label className="block text-[var(--color-text-primary)] mb-2 text-sm">CVV <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            value={paymentDetails.cvv || ''}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                            className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Zelle */}
                  {paymentDetails.method === 'Zelle' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Confirmation Number <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={paymentDetails.zelleConfirmation || ''}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, zelleConfirmation: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                        />
                      </div>
                    </div>
                  )}

                  {/* USDt */}
                  {paymentDetails.method === 'USDt' && (
                    <div className="space-y-4">
                      <div className="bg-gray-100 p-3 rounded text-sm text-[var(--color-text-secondary)] break-all">
                        Send to: <strong>0x123...abc</strong> (Network: TRC20)
                      </div>
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Your Wallet Address <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={paymentDetails.usdtWallet || ''}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, usdtWallet: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                        />
                      </div>
                    </div>
                  )}

                  {/* Pago Móvil */}
                  {paymentDetails.method === 'PagoMovil' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Reference Number <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={paymentDetails.pmReference || ''}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, pmReference: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                          placeholder="Enter reference number"
                        />
                      </div>
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Payment Time <span className="text-red-500">*</span></label>
                        <input
                          type="datetime-local"
                          value={paymentDetails.pmTime || ''}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, pmTime: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                        />
                      </div>
                    </div>
                  )}

                  {/* Depósito Bancario */}
                  {paymentDetails.method === 'DepositoBancario' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Deposit Number <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={paymentDetails.depositNumber || ''}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, depositNumber: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Bank <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={paymentDetails.depositBank || ''}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, depositBank: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Deposit Date <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          value={paymentDetails.depositDate || ''}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, depositDate: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Reference Number</label>
                        <input
                          type="text"
                          value={paymentDetails.depositReference || ''}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, depositReference: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                        />
                      </div>
                    </div>
                  )}

                  {/* Transferencia Bancaria */}
                  {paymentDetails.method === 'TransferenciaBancaria' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Transfer Number <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={paymentDetails.transferNumber || ''}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, transferNumber: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Transfer Time <span className="text-red-500">*</span></label>
                        <input
                          type="datetime-local"
                          value={paymentDetails.transferTime || ''}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, transferTime: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                        />
                      </div>
                    </div>
                  )}

                  {/* Cheque */}
                  {paymentDetails.method === 'Cheque' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Check Number <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={paymentDetails.checkNumber || ''}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, checkNumber: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Account Code <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={paymentDetails.checkAccountCode || ''}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, checkAccountCode: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Check Holder <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={paymentDetails.checkHolder || ''}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, checkHolder: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Issuing Bank <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          value={paymentDetails.checkBank || ''}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, checkBank: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Issue Date <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          value={paymentDetails.checkIssueDate || ''}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, checkIssueDate: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                        />
                      </div>
                    </div>
                  )}

                  {/* Milla */}
                  {paymentDetails.method === 'Milla' && (
                    <div className="space-y-4">
                      <p className="text-sm text-[var(--color-text-secondary)]">Payment with accumulated miles.</p>
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Miles to Redeem <span className="text-red-500">*</span></label>
                        <input
                          type="number"
                          value={paymentDetails.miles || ''}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, miles: parseInt(e.target.value) })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                          placeholder="Amount of miles"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-[var(--color-card)] border-t border-[var(--color-border)] p-6 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedBooking(null);
                }}
                className="px-6 py-3 bg-[var(--color-background)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] rounded-md transition-colors border border-[var(--color-border)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPayment}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Complete Payment ${selectedBooking.totalPrice.toLocaleString()}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
