import { useState, useEffect } from 'react';
import { Check, Search, ShoppingCart, User, CreditCard, DollarSign, Package, Plane, Hotel, Plus, Trash2, ChevronRight, ChevronLeft, Calendar, Users, X } from 'lucide-react';
import { getAllPackages, getPackageDetails, createPackageReturningId, addChildPackage, getCurrentUser, processPayment } from '../services/database';

interface ServiceItem {
  id: number;
  type: 'Flight' | 'Hotel';
  name: string;
  description: string;
  price: number;
  details: string;
}

interface PackageItem {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  services: number;
}

interface CartItem {
  id: string;
  itemType: 'package' | 'service';
  name: string;
  description: string;
  price: number;
  quantity: number;
  details?: string;
}

interface Passenger {
  id: number;
  firstName: string;
  lastName: string;
  passportNumber: string;
  dob: string;
}

interface PaymentDetails {
  method: 'Credit Card' | 'Cash' | 'Zelle' | 'USDt' | 'PagoMovil' | 'DepositoBancario' | 'TransferenciaBancaria' | 'TarjetaCreditoDebito' | 'Cheque' | 'Milla';
  // Common / Shared
  amount?: number;

  // Tarjeta (Credit/Debit)
  cardType?: 'Debit' | 'Credit';
  cardNumber?: string;
  cvv?: string;
  cardBankName?: string;
  expiryDate?: string;
  cardHolder?: string;

  // Cheque
  checkNumber?: string;
  checkHolder?: string;
  checkBank?: string;
  checkIssueDate?: string;
  checkAccountCode?: string;

  // Deposito
  depositNumber?: string;
  depositBank?: string;
  depositDate?: string;
  depositReference?: string;

  // Transferencia
  transferNumber?: string;
  transferTime?: string; // Time or datetime

  // Pago Movil
  pmReference?: string;
  pmTime?: string;

  // USDt
  usdtDate?: string;
  usdtTime?: string;
  usdtWallet?: string;

  // Zelle
  zelleConfirmation?: string;
  zelleDate?: string;
  zelleTime?: string;
  // keeping these for backward compat or removing if replaced by confirmation/date/time
  zelleEmail?: string;
  zellePhone?: string;

  // Milla
  miles?: number;

  // Legacy / Other
  referenceNumber?: string; // Generic ref
  bankName?: string; // Generic bank
  cedula?: string;
  phoneNumber?: string;
  walletAddress?: string;
}

export function BuildItinerary() {
  const [currentStep, setCurrentStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'packages' | 'services'>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([
    { id: 1, firstName: '', lastName: '', passportNumber: '', dob: '' }
  ]);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    method: 'Credit Card',
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
    zelleEmail: '',
    zellePhone: '',
    referenceNumber: '',
    bankName: '',
    cedula: '',
    walletAddress: '',
  });

  const [mode, setMode] = useState<'booking' | 'itinerary'>('booking');

  const [itineraryDetails, setItineraryDetails] = useState({
    name: '',
    description: '',
  });

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await getAllPackages();
        if (!mounted) return;
        const mapped = await Promise.all((rows || []).map(async (r: any) => {
          const pkgId = r.p_cod ?? r.id;
          const details = await getPackageDetails(pkgId).catch(() => []);
          const svc: ServiceItem[] = (details || []).map((d: any, idx: number) => ({
            id: d.item_id ?? idx,
            type: d.item_type === 'hotel' ? 'Hotel' : 'Flight',
            name: d.item_name || '',
            description: d.item_name || '',
            price: Number(d.costo || 0) || 0,
            details: d.inicio ? `${d.inicio}${d.fin ? ' - ' + d.fin : ''}` : '',
          }));
          return {
            id: pkgId,
            name: r.p_nombre_paq ?? r.name,
            description: (r.p_descripcion_paq ?? r.description) || '',
            price: Number(r.p_millaje_paq || r.price || 0) || 0,
            duration: Number(r.p_duracion_paq || r.duration || 0) || 0,
            services: svc.length,
          } as PackageItem;
        }));
        if (!mounted) return;
        setPackages(mapped);
      } catch (err) {
        console.error('Failed to load packages', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const steps = mode === 'booking' ? [
    { number: 1, title: 'Selection', icon: ShoppingCart },
    { number: 2, title: 'Passenger Details', icon: User },
    { number: 3, title: 'Payment', icon: CreditCard },
  ] : [
    { number: 1, title: 'Selection', icon: ShoppingCart },
    { number: 2, title: 'Itinerary Details', icon: Package },
    { number: 3, title: 'Review & Save', icon: Check },
  ];

  // Filter items based on search (defensive)
  const filteredPackages = packages.filter((pkg: PackageItem) => {
    const s = (searchTerm || '').toLowerCase();
    const name = (pkg.name || '').toLowerCase();
    const desc = (pkg.description || '').toLowerCase();
    return name.includes(s) || desc.includes(s);
  });

  const filteredServices = services.filter((service: ServiceItem) => {
    const s = (searchTerm || '').toLowerCase();
    const name = (service.name || '').toLowerCase();
    const desc = (service.description || '').toLowerCase();
    return name.includes(s) || desc.includes(s);
  });

  const totalCost = cart.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);

  const handleAddPackageToCart = (pkg: PackageItem) => {
    const cartId = `pkg-${pkg.id}`;
    const existing = cart.find(item => item.id === cartId);

    if (existing) {
      setCart(cart.map((item: CartItem) =>
        item.id === cartId ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      // Fetch package details to show included items in cart details
      (async () => {
        try {
          const details = await getPackageDetails(pkg.id as number);
          const detailText = (details || []).map(d => d.item_name + (d.inicio ? ` (${d.inicio}${d.fin ? ' - ' + d.fin : ''})` : '')).join(', ');
          setCart((prev: CartItem[]) => ([...prev, {
            id: cartId,
            itemType: 'package',
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            quantity: 1,
            details: detailText || `${pkg.duration} days | ${pkg.services} services included`,
          }]));
        } catch (err) {
          console.error('Failed to load package details', err);
          setCart(prev => ([...prev, {
            id: cartId,
            itemType: 'package',
            name: pkg.name,
            description: pkg.description,
            price: pkg.price,
            quantity: 1,
            details: `${pkg.duration} days | ${pkg.services} services included`,
          }]));
        }
      })();
    }
  };

  const handleAddServiceToCart = (service: ServiceItem) => {
    const cartId = `svc-${service.id}`;
    const existing = cart.find(item => item.id === cartId);

    if (existing) {
      setCart(cart.map((item: CartItem) =>
        item.id === cartId ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, {
        id: cartId,
        itemType: 'service',
        name: service.name,
        description: service.description,
        price: service.price,
        quantity: 1,
        details: service.details,
      }]);
    }
  };

  const handleRemoveFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(cart.map((item: CartItem) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleAddPassenger = () => {
    const newId = Math.max(...passengers.map((p: Passenger) => p.id), 0) + 1;
    setPassengers([...passengers, {
      id: newId,
      firstName: '',
      lastName: '',
      passportNumber: '',
      dob: '',
    }]);
  };

  const handleRemovePassenger = (id: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter(p => p.id !== id));
    }
  };

  const handlePassengerChange = (id: number, field: keyof Passenger, value: string) => {
    setPassengers(passengers.map((p: Passenger) =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleCreateItinerary = async () => {
    if (!itineraryDetails.name || !itineraryDetails.description) {
      alert('Please provide a name and description for the itinerary.');
      return;
    }

    try {
      let totalMileage = 0;
      let totalCost = 0;

      cart.forEach((item: CartItem) => {
        totalCost += item.price * item.quantity;
        totalMileage += 0;
      });

      // Use a default user ID if not available (ideally fetch current user)
      const currentUser = await getCurrentUser().catch(() => null);
      const userId = currentUser?.cod || 1;

      const parentId = await createPackageReturningId(
        itineraryDetails.name,
        itineraryDetails.description,
        'Active',
        totalMileage,
        totalCost,
        0,
        userId
      );

      if (!parentId) throw new Error('Failed to create itinerary package');

      // Add Children
      for (const item of cart) {
        if (item.itemType === 'package') {
          const childId = parseInt(item.id.replace('pkg-', ''), 10);
          if (!isNaN(childId)) {
            // Add package multiple times if quantity > 1? 
            // For now, iterate quantity
            for (let i = 0; i < item.quantity; i++) {
              // Wait, paq_paq might enforce unique constraint (PK on parent,child). 
              // If so, we can only add once. Assuming paq_paq is (padre, hijo).
              // If duplicate allowed? The procedure checks "SELECT EXISTS".
              // So we can only add once.
              if (i === 0) await addChildPackage(parentId, childId);
            }
          }
        }
      }

      alert('Itinerary created successfully!');
      setCart([]);
      setItineraryDetails({ name: '', description: '' });
      setCurrentStep(1);

    } catch (err) {
      console.error(err);
      alert('Failed to create itinerary. See console for details.');
    }
  };

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1) {
      if (cart.length === 0) {
        alert('Please add at least one package or service to your cart');
        return;
      }
    } else if (mode === 'booking' && currentStep === 2) {
      // Validate passenger details
      for (const passenger of passengers) {
        if (!passenger.firstName.trim() || !passenger.lastName.trim() ||
          !passenger.passportNumber.trim() || !passenger.dob) {
          alert('Please fill in all passenger details');
          return;
        }
      }
    } else if (mode === 'itinerary' && currentStep === 2) {
      if (!itineraryDetails.name.trim() || !itineraryDetails.description.trim()) {
        alert('Please fill in itinerary name and description');
        return;
      }
    }

    // Final Step Action vs Next Step
    const isLastStep = (mode === 'booking' && currentStep === 3) || (mode === 'itinerary' && currentStep === 3);

    if (isLastStep) {
      if (mode === 'booking') handleSubmit();
      else handleCreateItinerary();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    // Validate payment details
    if (paymentDetails.method === 'Credit Card' || paymentDetails.method === 'TarjetaCreditoDebito') {
      if (!paymentDetails.cardNumber || !paymentDetails.cardHolder ||
        !paymentDetails.expiryDate || !paymentDetails.cvv) {
        alert('Please fill in all card details');
        return;
      }
    } else if (paymentDetails.method === 'Zelle') {
      if (!paymentDetails.zelleEmail && !paymentDetails.zellePhone) {
        alert('Please provide either Zelle email or phone number');
        return;
      }
    }

    try {
      // 1. Get Current User
      const currentUser = await getCurrentUser().catch(() => null);
      if (!currentUser || !currentUser.cod) {
        alert('You must be logged in to book.');
        // ideally redirect to login or show modal
        return;
      }
      const userId = currentUser.cod;

      // 2. Create the Package (Itinerary/Booking wrapper)
      const bookingName = `Booking ${new Date().toLocaleDateString()}`; // Default name for booking
      const bookingDesc = `Booking for ${passengers.length} passenger(s)`;

      const parentId = await createPackageReturningId(
        bookingName,
        bookingDesc,
        'Active', // Or 'Pending' initially
        0, // Mileage logic can be improved
        totalCost,
        0, // Carbon footprint placeholder
        userId
      );

      if (!parentId) throw new Error('Failed to create booking package');

      // 3. Add Items to Package
      for (const item of cart) {
        if (item.itemType === 'package') {
          const childId = parseInt(item.id.replace('pkg-', ''), 10);
          if (!isNaN(childId)) {
            for (let i = 0; i < item.quantity; i++) {
              if (i === 0) await addChildPackage(parentId, childId);
            }
          }
        }
        // NOTE: Services might need a different linking mechanism (ser_paq) than child packages (paq_paq).
        // For this sprint/prototype, we focus on packages.
      }

      // 4. Process Payment
      await processPayment(
        userId,
        parentId,
        totalCost,
        paymentDetails.method,
        `Payment for Booking #${parentId}`,
        {
          cardNumber: paymentDetails.cardNumber,
          cardHolder: paymentDetails.cardHolder,
          expiryDate: paymentDetails.expiryDate,
          cvv: paymentDetails.cvv,
          zelleEmail: paymentDetails.zelleEmail,
          zellePhone: paymentDetails.zellePhone,
          refNumber: paymentDetails.referenceNumber,
          bankName: paymentDetails.bankName,
          cedula: paymentDetails.cedula,
          phoneNumber: paymentDetails.phoneNumber,
          walletAddress: paymentDetails.walletAddress
        }
      );

      alert('Booking and Payment completed successfully!\n\nTotal: $' + totalCost.toLocaleString());

      // Reset wizard
      setCurrentStep(1);
      setCart([]);
      setPassengers([{ id: 1, firstName: '', lastName: '', passportNumber: '', dob: '' }]);
      setPaymentDetails({
        method: 'Credit Card',
        cardNumber: '',
        cardHolder: '',
        expiryDate: '',
        cvv: '',
        zelleEmail: '',
        zellePhone: '',
      });

    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[var(--color-text-primary)] mb-2">
          Client Itinerary Booking
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Create a customized travel itinerary for your client
        </p>
      </div>

      {/* Step Indicator */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          {steps.map((step: any, index: number) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                        ? 'bg-[var(--color-primary-blue)] text-white'
                        : 'bg-[var(--color-background)] text-[var(--color-text-secondary)] border-2 border-[var(--color-border)]'
                      }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <p
                    className={`mt-2 text-sm ${isActive
                      ? 'text-[var(--color-primary-blue)]'
                      : 'text-[var(--color-text-secondary)]'
                      }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-4 ${currentStep > step.number
                      ? 'bg-green-500'
                      : 'bg-[var(--color-border)]'
                      }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg">
        {/* Step 1: Selection */}
        {currentStep === 1 && (
          <>
            {/* Header */}
            <div className="bg-[var(--color-card)] border-b border-[var(--color-border)] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)] font-heading">
                  {mode === 'booking' ? 'Build Your Trip' : 'Create Custom Itinerary'}
                </h1>
                <p className="text-[var(--color-text-secondary)] mt-1">
                  {mode === 'booking'
                    ? 'Select packages and services to book for your trip'
                    : 'Combine multiple packages into a new custom itinerary'}
                </p>
              </div>

              <div className="flex bg-[var(--color-background)] p-1 rounded-lg border border-[var(--color-border)]">
                <button
                  onClick={() => { setMode('booking'); setCurrentStep(1); setCart([]); }}
                  className={`px-4 py-2 text-sm rounded-md transition-all flex items-center gap-2 font-medium ${mode === 'booking'
                    ? 'bg-[var(--color-primary-blue)] text-white shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Booking
                </button>
                <button
                  onClick={() => { setMode('itinerary'); setCurrentStep(1); setCart([]); }}
                  className={`px-4 py-2 text-sm rounded-md transition-all flex items-center gap-2 font-medium ${mode === 'itinerary'
                    ? 'bg-[var(--color-primary-blue)] text-white shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                    }`}
                >
                  <Package className="w-4 h-4" />
                  Create Itinerary
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Search and Results - Left 2/3 */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Search Bar */}
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                      <input
                        type="text"
                        placeholder="Search packages or services..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                      />
                    </div>
                    <select
                      value={searchType}
                      onChange={(e) => setSearchType(e.target.value as 'all' | 'packages' | 'services')}
                      className="px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                    >
                      <option value="all">All</option>
                      <option value="packages">Packages Only</option>
                      <option value="services">Services Only</option>
                    </select>
                  </div>

                  {/* Packages Section */}
                  {(searchType === 'all' || searchType === 'packages') && filteredPackages.length > 0 && (
                    <div>
                      <h3 className="text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                        <Package className="w-5 h-5 text-[var(--color-primary-blue)]" />
                        Packages
                      </h3>
                      <div className="space-y-3">
                        {filteredPackages.map((pkg: PackageItem) => (
                          <div
                            key={pkg.id}
                            className="border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-primary-blue)] transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="text-[var(--color-text-primary)] mb-1">{pkg.name}</h4>
                                <p className="text-sm text-[var(--color-text-secondary)] mb-2">{pkg.description}</p>
                                <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {pkg.duration} days
                                  </span>
                                  <span>{pkg.services} services included</span>
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-[var(--color-text-primary)] mb-2">${pkg.price.toLocaleString()}</div>
                                <button
                                  onClick={() => handleAddPackageToCart(pkg)}
                                  className="px-3 py-1.5 bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue-hover)] text-white rounded-md transition-colors text-sm flex items-center gap-1"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Services Section */}
                  {(searchType === 'all' || searchType === 'services') && filteredServices.length > 0 && (
                    <div>
                      <h3 className="text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                        <Plane className="w-5 h-5 text-[var(--color-primary-blue)]" />
                        Individual Services
                      </h3>
                      <div className="space-y-3">
                        {filteredServices.map((service: ServiceItem) => (
                          <div
                            key={service.id}
                            className="border border-[var(--color-border)] rounded-lg p-4 hover:border-[var(--color-primary-blue)] transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {service.type === 'Flight' ? (
                                    <Plane className="w-4 h-4 text-blue-600" />
                                  ) : (
                                    <Hotel className="w-4 h-4 text-purple-600" />
                                  )}
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${service.type === 'Flight'
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-purple-100 text-purple-700'
                                    }`}>
                                    {service.type}
                                  </span>
                                </div>
                                <h4 className="text-[var(--color-text-primary)] mb-1">{service.name}</h4>
                                <p className="text-sm text-[var(--color-text-secondary)] mb-1">{service.description}</p>
                                <p className="text-xs text-[var(--color-text-secondary)]">{service.details}</p>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-[var(--color-text-primary)] mb-2">${service.price.toLocaleString()}</div>
                                <button
                                  onClick={() => handleAddServiceToCart(service)}
                                  className="px-3 py-1.5 bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue-hover)] text-white rounded-md transition-colors text-sm flex items-center gap-1"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No Results */}
                  {((searchType === 'all' && filteredPackages.length === 0 && filteredServices.length === 0) ||
                    (searchType === 'packages' && filteredPackages.length === 0) ||
                    (searchType === 'services' && filteredServices.length === 0)) && (
                      <div className="text-center py-12 text-[var(--color-text-secondary)]">
                        No results found
                      </div>
                    )}
                </div>

                {/* Cart - Right 1/3 */}
                <div className="lg:col-span-1">
                  <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg sticky top-6">
                    <div className="px-4 py-3 border-b border-[var(--color-border)]">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-[var(--color-primary-blue)]" />
                        <h3 className="text-[var(--color-text-primary)]">Cart</h3>
                        <span className="ml-auto bg-[var(--color-primary-blue)] text-white text-xs px-2 py-0.5 rounded-full">
                          {cart.length}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                      {cart.length > 0 ? (
                        cart.map((item: CartItem) => (
                          <div key={item.id} className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 pr-2">
                                <h4 className="text-sm text-[var(--color-text-primary)] mb-1">{item.name}</h4>
                                <p className="text-xs text-[var(--color-text-secondary)]">{item.details}</p>
                              </div>
                              <button
                                onClick={() => handleRemoveFromCart(item.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                  className="w-6 h-6 border border-[var(--color-border)] rounded hover:bg-[var(--color-background)] transition-colors flex items-center justify-center text-sm"
                                >
                                  -
                                </button>
                                <span className="text-sm text-[var(--color-text-primary)] w-8 text-center">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                  className="w-6 h-6 border border-[var(--color-border)] rounded hover:bg-[var(--color-background)] transition-colors flex items-center justify-center text-sm"
                                >
                                  +
                                </button>
                              </div>
                              <div className="text-sm text-[var(--color-text-primary)]">
                                ${(item.price * item.quantity).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-sm text-[var(--color-text-secondary)]">
                          Cart is empty
                        </div>
                      )}
                    </div>

                    {cart.length > 0 && (
                      <div className="px-4 py-3 border-t border-[var(--color-border)]">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[var(--color-text-primary)]">Total:</span>
                          <span className="text-[var(--color-text-primary)]">${totalCost.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 2: Passenger Details or Itinerary Details */}
        {currentStep === 2 && (
          <div>
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-[var(--color-text-primary)]">
                {mode === 'booking' ? 'Step 2: Passenger Details' : 'Step 2: Itinerary Details'}
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {mode === 'booking' ? 'Enter information for all passengers' : 'Provide a name and description for your new itinerary'}
              </p>
            </div>

            <div className="p-6">
              {mode === 'booking' ? (
                <div className="max-w-4xl mx-auto space-y-4">
                  {passengers.map((passenger: Passenger, index: number) => (
                    <div key={passenger.id} className="border border-[var(--color-border)] rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[var(--color-text-primary)] flex items-center gap-2">
                          <User className="w-5 h-5 text-[var(--color-primary-blue)]" />
                          Passenger {index + 1}
                        </h3>
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
              ) : (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div>
                    <label className="block text-[var(--color-text-primary)] mb-2 text-sm font-medium">
                      Itinerary Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={itineraryDetails.name}
                      onChange={(e) => setItineraryDetails({ ...itineraryDetails, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                      placeholder="e.g., Summer Vacation 2025"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--color-text-primary)] mb-2 text-sm font-medium">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={itineraryDetails.description}
                      onChange={(e) => setItineraryDetails({ ...itineraryDetails, description: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all h-32 resize-none"
                      placeholder="Describe your trip plan..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Payment or Review */}
        {currentStep === 3 && (
          <div>
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-[var(--color-text-primary)]">
                {mode === 'booking' ? 'Step 3: Payment Information' : 'Step 3: Review & Save'}
              </h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {mode === 'booking' ? 'Complete your booking by providing payment details' : 'Review your itinerary details before saving'}
              </p>
            </div>

            <div className="p-6">
              <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {mode === 'booking' ? (
                    <>
                      {/* Payment Method Selection */}
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-3 text-sm">
                          Payment Method <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {(['Credit Card', 'TarjetaCreditoDebito', 'Cash', 'Zelle', 'USDt', 'PagoMovil', 'DepositoBancario', 'TransferenciaBancaria', 'Cheque', 'Milla'] as const).map(method => (
                            <button
                              key={method}
                              onClick={() => setPaymentDetails({ ...paymentDetails, method })}
                              className={`px-3 py-2 border-2 rounded-lg transition-all text-xs font-medium ${paymentDetails.method === method
                                ? 'border-[var(--color-primary-blue)] bg-blue-50 text-[var(--color-primary-blue)]'
                                : 'border-[var(--color-border)] hover:border-[var(--color-primary-blue)] text-[var(--color-text-primary)]'
                                }`}
                            >
                              {method === 'TarjetaCreditoDebito' ? 'Tarjeta C/D' : method.replace(/([A-Z])/g, ' $1').trim()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Dynamic Payment Fields */}
                      <div className="border border-[var(--color-border)] rounded-lg p-6 space-y-4">
                        <h3 className="text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
                          <DollarSign className="w-5 h-5 text-[var(--color-primary-blue)]" />
                          {paymentDetails.method === 'TarjetaCreditoDebito' ? 'Tarjeta C/D' : paymentDetails.method} Details
                        </h3>

                        {/* Credit Card / Tarjeta C/D */}
                        {(paymentDetails.method === 'Credit Card' || paymentDetails.method === 'TarjetaCreditoDebito') && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                                Card Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={paymentDetails.cardNumber}
                                onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                                className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                              />
                            </div>
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Card Holder Name <span className="text-red-500">*</span></label>
                              <input type="text" value={paymentDetails.cardHolder || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, cardHolder: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" placeholder="Name as on card" />
                            </div>
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Bank Name <span className="text-red-500">*</span></label>
                              <input type="text" value={paymentDetails.cardBankName || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, cardBankName: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" placeholder="e.g. Bank of America" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Expiry Date <span className="text-red-500">*</span></label>
                                <input type="text" value={paymentDetails.expiryDate || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" placeholder="MM/YY" maxLength={5} />
                              </div>
                              <div>
                                <label className="block text-[var(--color-text-primary)] mb-2 text-sm">CVV <span className="text-red-500">*</span></label>
                                <input type="text" value={paymentDetails.cvv || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" placeholder="123" maxLength={4} />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Cash */}
                        {paymentDetails.method === 'Cash' && (
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            Please collect <strong>${totalCost.toLocaleString()}</strong> in cash.
                          </p>
                        )}

                        {/* Check / Cheque */}
                        {paymentDetails.method === 'Cheque' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Check Number <span className="text-red-500">*</span></label>
                              <input type="text" value={paymentDetails.checkNumber || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, checkNumber: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
                            </div>
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Account Code <span className="text-red-500">*</span></label>
                              <input type="text" value={paymentDetails.checkAccountCode || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, checkAccountCode: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
                            </div>
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Check Holder <span className="text-red-500">*</span></label>
                              <input type="text" value={paymentDetails.checkHolder || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, checkHolder: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
                            </div>
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Issuing Bank <span className="text-red-500">*</span></label>
                              <input type="text" value={paymentDetails.checkBank || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, checkBank: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
                            </div>
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Issue Date <span className="text-red-500">*</span></label>
                              <input type="date" value={paymentDetails.checkIssueDate || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, checkIssueDate: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
                            </div>
                          </div>
                        )}

                        {/* Deposito */}
                        {paymentDetails.method === 'DepositoBancario' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Deposit Number <span className="text-red-500">*</span></label>
                              <input type="text" value={paymentDetails.depositNumber || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, depositNumber: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
                            </div>
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Bank <span className="text-red-500">*</span></label>
                              <input type="text" value={paymentDetails.depositBank || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, depositBank: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
                            </div>
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Deposit Date <span className="text-red-500">*</span></label>
                              <input type="date" value={paymentDetails.depositDate || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, depositDate: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
                            </div>
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Reference Number <span className="text-red-500">*</span></label>
                              <input type="text" value={paymentDetails.depositReference || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, depositReference: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
                            </div>
                          </div>
                        )}

                        {/* Transferencia */}
                        {paymentDetails.method === 'TransferenciaBancaria' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Transfer Number <span className="text-red-500">*</span></label>
                              <input type="text" value={paymentDetails.transferNumber || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, transferNumber: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
                            </div>
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Transfer Time <span className="text-red-500">*</span></label>
                              <input type="datetime-local" value={paymentDetails.transferTime || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, transferTime: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
                            </div>
                          </div>
                        )}

                        {/* PagoMovil */}
                        {paymentDetails.method === 'PagoMovil' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Reference Number <span className="text-red-500">*</span></label>
                              <input type="text" value={paymentDetails.pmReference || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, pmReference: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
                            </div>
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Payment Time <span className="text-red-500">*</span></label>
                              <input type="datetime-local" value={paymentDetails.pmTime || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, pmTime: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
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
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Wallet Address <span className="text-red-500">*</span></label>
                              <input type="text" value={paymentDetails.usdtWallet || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, usdtWallet: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
                            </div>
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Date <span className="text-red-500">*</span></label>
                              <input type="date" value={paymentDetails.usdtDate || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, usdtDate: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
                            </div>
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Time <span className="text-red-500">*</span></label>
                              <input type="time" value={paymentDetails.usdtTime || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, usdtTime: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
                            </div>
                          </div>
                        )}

                        {/* Zelle */}
                        {paymentDetails.method === 'Zelle' && (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Confirmation Number <span className="text-red-500">*</span></label>
                              <input type="text" value={paymentDetails.zelleConfirmation || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, zelleConfirmation: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
                            </div>
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Date <span className="text-red-500">*</span></label>
                              <input type="date" value={paymentDetails.zelleDate || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, zelleDate: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
                            </div>
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Time <span className="text-red-500">*</span></label>
                              <input type="time" value={paymentDetails.zelleTime || ''} onChange={(e) => setPaymentDetails({ ...paymentDetails, zelleTime: e.target.value })} className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" />
                            </div>
                          </div>
                        )}

                        {/* Milla */}
                        {paymentDetails.method === 'Milla' && (
                          <div className="space-y-4">
                            <p className="text-sm text-[var(--color-text-secondary)]">Payment with aggregated miles.</p>
                            <div>
                              <label className="block text-[var(--color-text-primary)] mb-2 text-sm">Miles to Redeem</label>
                              <input type="number" className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md" placeholder="Amount" />
                            </div>
                          </div>
                        )}

                      </div>    </>
                  ) : (
                    <div className="border border-[var(--color-border)] rounded-lg p-6 space-y-4">
                      <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">Itinerary Summary</h3>

                      <div className="space-y-4">
                        <div>
                          <span className="text-sm text-[var(--color-text-secondary)] block">Itinerary Name</span>
                          <span className="text-base text-[var(--color-text-primary)] font-medium">{itineraryDetails.name}</span>
                        </div>

                        <div>
                          <span className="text-sm text-[var(--color-text-secondary)] block">Description</span>
                          <p className="text-sm text-[var(--color-text-primary)] mt-1 bg-[var(--color-background)] p-3 rounded border border-[var(--color-border)]">
                            {itineraryDetails.description}
                          </p>
                        </div>

                        <div>
                          <span className="text-sm text-[var(--color-text-secondary)] block mb-2">Selected Packages ({cart.filter((i: CartItem) => i.itemType === 'package').length})</span>
                          <div className="space-y-2">
                            {cart.filter((i: CartItem) => i.itemType === 'package').map((pkg: CartItem) => (
                              <div key={pkg.id} className="flex items-center gap-3 p-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md">
                                <Package className="w-5 h-5 text-[var(--color-primary-blue)]" />
                                <div>
                                  <div className="text-sm font-medium text-[var(--color-text-primary)]">{pkg.name}</div>
                                  <div className="text-xs text-[var(--color-text-secondary)]">{pkg.quantity} unit(s)</div>
                                </div>
                              </div>
                            ))}
                            {cart.filter((i: CartItem) => i.itemType === 'package').length === 0 && (
                              <div className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded border border-yellow-200">
                                No packages selected. Please add packages to your itinerary.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Summary - Right 1/3 */}
                <div className="lg:col-span-1">
                  <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg sticky top-6">
                    <div className="px-4 py-3 border-b border-[var(--color-border)]">
                      <h3 className="text-[var(--color-text-primary)]">
                        {mode === 'booking' ? 'Order Summary' : 'Itinerary Total'}
                      </h3>
                    </div>

                    <div className="p-4 space-y-4">
                      {/* Cart Items Summary */}
                      <div>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-2">Items:</p>
                        <div className="space-y-2">
                          {cart.length === 0 && <span className="text-sm text-[var(--color-text-secondary)]">No items</span>}
                          {cart.map((item: CartItem) => (
                            <div key={item.id} className="flex items-start justify-between text-sm">
                              <div className="flex-1 pr-2">
                                <span className="text-[var(--color-text-primary)]">{item.name}</span>
                                <span className="text-[var(--color-text-secondary)]"> x{item.quantity}</span>
                              </div>
                              <span className="text-[var(--color-text-primary)]">
                                ${(item.price * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-[var(--color-border)] pt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-[var(--color-text-secondary)]">Subtotal:</span>
                          <span className="text-[var(--color-text-primary)]">${totalCost.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-[var(--color-text-secondary)]">Tax (0%):</span>
                          <span className="text-[var(--color-text-primary)]">$0</span>
                        </div>
                      </div>

                      <div className="border-t border-[var(--color-border)] pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--color-text-primary)]">Total:</span>
                          <span className="text-[var(--color-text-primary)] text-xl">${totalCost.toLocaleString()}</span>
                        </div>
                      </div>

                      {mode === 'booking' && (
                        <div className="border-t border-[var(--color-border)] pt-4">
                          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                            <Users className="w-4 h-4" />
                            <span>{passengers.length} passenger(s)</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-4 py-2.5 bg-[var(--color-background)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] rounded-md transition-colors border border-[var(--color-border)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2.5 bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue-hover)] text-white rounded-md transition-colors flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={mode === 'booking' ? handleSubmit : handleCreateItinerary}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              {mode === 'booking' ? 'Complete Booking' : 'Create Itinerary'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
