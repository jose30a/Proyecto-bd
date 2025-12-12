import { useState } from 'react';
import { Check, Search, ShoppingCart, User, CreditCard, DollarSign, Package, Plane, Hotel, Plus, Trash2, ChevronRight, ChevronLeft, Calendar, Users, X } from 'lucide-react';

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
  method: 'Credit Card' | 'Cash' | 'Zelle';
  // Credit Card fields
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
  // Zelle fields
  zelleEmail: string;
  zellePhone: string;
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
  });

  // Mock packages data
  const packages: PackageItem[] = [
    {
      id: 1,
      name: 'European Grand Tour',
      description: 'Comprehensive tour covering major European cities with cultural experiences',
      price: 3500,
      duration: 14,
      services: 5,
    },
    {
      id: 2,
      name: 'Caribbean Paradise',
      description: 'Tropical island hopping with beach resorts and water activities',
      price: 2200,
      duration: 7,
      services: 3,
    },
    {
      id: 3,
      name: 'Asian Adventure',
      description: 'Explore vibrant Asian cities with cultural immersion',
      price: 2800,
      duration: 10,
      services: 4,
    },
    {
      id: 4,
      name: 'Mountain Retreat',
      description: 'Alpine adventure with hiking and mountain lodge accommodations',
      price: 1950,
      duration: 5,
      services: 3,
    },
  ];

  // Mock services data
  const services: ServiceItem[] = [
    {
      id: 1,
      type: 'Flight',
      name: 'New York to Paris - Air France',
      description: 'Direct flight - Economy Class',
      price: 850,
      details: 'Departure: 10:00 AM | Duration: 7h 30m',
    },
    {
      id: 2,
      type: 'Flight',
      name: 'London to Dubai - Emirates',
      description: 'Direct flight - Business Class',
      price: 1200,
      details: 'Departure: 2:00 PM | Duration: 6h 45m',
    },
    {
      id: 3,
      type: 'Flight',
      name: 'Caracas to Miami - American Airlines',
      description: 'Direct flight - Economy Class',
      price: 450,
      details: 'Departure: 8:00 AM | Duration: 4h 15m',
    },
    {
      id: 4,
      type: 'Hotel',
      name: 'Grand Hotel Paris',
      description: 'Luxury 5-star accommodation',
      price: 350,
      details: 'Per night | City center location',
    },
    {
      id: 5,
      type: 'Hotel',
      name: 'Dubai Marina Resort',
      description: 'Beachfront resort with spa',
      price: 450,
      details: 'Per night | All-inclusive',
    },
    {
      id: 6,
      type: 'Hotel',
      name: 'Hilton Caracas',
      description: 'Modern hotel in business district',
      price: 180,
      details: 'Per night | Free breakfast included',
    },
  ];

  const steps = [
    { number: 1, title: 'Selection', icon: ShoppingCart },
    { number: 2, title: 'Passenger Details', icon: User },
    { number: 3, title: 'Payment', icon: CreditCard },
  ];

  // Filter items based on search
  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCost = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleAddPackageToCart = (pkg: PackageItem) => {
    const cartId = `pkg-${pkg.id}`;
    const existing = cart.find(item => item.id === cartId);
    
    if (existing) {
      setCart(cart.map(item =>
        item.id === cartId ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, {
        id: cartId,
        itemType: 'package',
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        quantity: 1,
        details: `${pkg.duration} days | ${pkg.services} services included`,
      }]);
    }
  };

  const handleAddServiceToCart = (service: ServiceItem) => {
    const cartId = `svc-${service.id}`;
    const existing = cart.find(item => item.id === cartId);
    
    if (existing) {
      setCart(cart.map(item =>
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
    setCart(cart.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleAddPassenger = () => {
    const newId = Math.max(...passengers.map(p => p.id), 0) + 1;
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
    setPassengers(passengers.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1) {
      if (cart.length === 0) {
        alert('Please add at least one package or service to your cart');
        return;
      }
    } else if (currentStep === 2) {
      // Validate passenger details
      for (const passenger of passengers) {
        if (!passenger.firstName.trim() || !passenger.lastName.trim() ||
            !passenger.passportNumber.trim() || !passenger.dob) {
          alert('Please fill in all passenger details');
          return;
        }
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    // Validate payment details
    if (paymentDetails.method === 'Credit Card') {
      if (!paymentDetails.cardNumber || !paymentDetails.cardHolder ||
          !paymentDetails.expiryDate || !paymentDetails.cvv) {
        alert('Please fill in all credit card details');
        return;
      }
    } else if (paymentDetails.method === 'Zelle') {
      if (!paymentDetails.zelleEmail && !paymentDetails.zellePhone) {
        alert('Please provide either Zelle email or phone number');
        return;
      }
    }

    alert('Booking completed successfully!\n\nTotal: $' + totalCost.toLocaleString() + '\nPassengers: ' + passengers.length + '\nPayment Method: ' + paymentDetails.method);
    
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
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
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
                    className={`mt-2 text-sm ${
                      isActive
                        ? 'text-[var(--color-primary-blue)]'
                        : 'text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-4 ${
                      currentStep > step.number
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
          <div>
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-[var(--color-text-primary)]">Step 1: Select Packages & Services</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Search and add packages or individual services to your cart
              </p>
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
                        {filteredPackages.map(pkg => (
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
                        {filteredServices.map(service => (
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
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                                    service.type === 'Flight'
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
                        cart.map(item => (
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
          </div>
        )}

        {/* Step 2: Passenger Details */}
        {currentStep === 2 && (
          <div>
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-[var(--color-text-primary)]">Step 2: Passenger Details</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Enter information for all passengers
              </p>
            </div>

            <div className="p-6">
              <div className="max-w-4xl mx-auto space-y-4">
                {passengers.map((passenger, index) => (
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
            </div>
          </div>
        )}

        {/* Step 3: Payment */}
        {currentStep === 3 && (
          <div>
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-[var(--color-text-primary)]">Step 3: Payment Information</h2>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Complete your booking by providing payment details
              </p>
            </div>

            <div className="p-6">
              <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payment Form - Left 2/3 */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Payment Method Selection */}
                  <div>
                    <label className="block text-[var(--color-text-primary)] mb-3 text-sm">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {(['Credit Card', 'Cash', 'Zelle'] as const).map(method => (
                        <button
                          key={method}
                          onClick={() => setPaymentDetails({ ...paymentDetails, method })}
                          className={`px-4 py-3 border-2 rounded-lg transition-all text-sm ${
                            paymentDetails.method === method
                              ? 'border-[var(--color-primary-blue)] bg-blue-50 text-[var(--color-primary-blue)]'
                              : 'border-[var(--color-border)] hover:border-[var(--color-primary-blue)] text-[var(--color-text-primary)]'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Credit Card Fields */}
                  {paymentDetails.method === 'Credit Card' && (
                    <div className="border border-[var(--color-border)] rounded-lg p-6 space-y-4">
                      <h3 className="text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
                        <CreditCard className="w-5 h-5 text-[var(--color-primary-blue)]" />
                        Credit Card Details
                      </h3>
                      
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
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                          Card Holder Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={paymentDetails.cardHolder}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, cardHolder: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                            Expiry Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={paymentDetails.expiryDate}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                            className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>

                        <div>
                          <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                            CVV <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={paymentDetails.cvv}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                            className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                            placeholder="123"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash Payment */}
                  {paymentDetails.method === 'Cash' && (
                    <div className="border border-[var(--color-border)] rounded-lg p-6">
                      <div className="flex items-start gap-3">
                        <DollarSign className="w-6 h-6 text-green-600 mt-1" />
                        <div>
                          <h3 className="text-[var(--color-text-primary)] mb-2">Cash Payment</h3>
                          <p className="text-sm text-[var(--color-text-secondary)]">
                            The client will pay in cash at our office. Please ensure to collect the total amount of <strong>${totalCost.toLocaleString()}</strong> before finalizing the booking.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Zelle Payment */}
                  {paymentDetails.method === 'Zelle' && (
                    <div className="border border-[var(--color-border)] rounded-lg p-6 space-y-4">
                      <h3 className="text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5 text-[var(--color-primary-blue)]" />
                        Zelle Payment Details
                      </h3>
                      
                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                          Zelle Email
                        </label>
                        <input
                          type="email"
                          value={paymentDetails.zelleEmail}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, zelleEmail: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                          placeholder="email@example.com"
                        />
                      </div>

                      <div className="text-center text-sm text-[var(--color-text-secondary)]">
                        OR
                      </div>

                      <div>
                        <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                          Zelle Phone Number
                        </label>
                        <input
                          type="tel"
                          value={paymentDetails.zellePhone}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, zellePhone: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <p className="text-xs text-[var(--color-text-secondary)] italic">
                        * Please provide either email or phone number for Zelle payment
                      </p>
                    </div>
                  )}
                </div>

                {/* Order Summary - Right 1/3 */}
                <div className="lg:col-span-1">
                  <div className="bg-[var(--color-background)] border border-[var(--color-border)] rounded-lg sticky top-6">
                    <div className="px-4 py-3 border-b border-[var(--color-border)]">
                      <h3 className="text-[var(--color-text-primary)]">Order Summary</h3>
                    </div>
                    
                    <div className="p-4 space-y-4">
                      {/* Cart Items Summary */}
                      <div>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-2">Items:</p>
                        <div className="space-y-2">
                          {cart.map(item => (
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

                      <div className="border-t border-[var(--color-border)] pt-4">
                        <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                          <Users className="w-4 h-4" />
                          <span>{passengers.length} passenger(s)</span>
                        </div>
                      </div>
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
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              Complete Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
