import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Phone } from 'lucide-react';

interface ContactNumber {
  id: number;
  countryCode: string;
  number: string;
  type: 'Office' | 'Fax';
}

interface Airline {
  id: string;
  name: string;
  originCountry: string;
  originCity: string;
  status: 'Active' | 'Inactive';
  contactNumbers: ContactNumber[];
}

// Mock data for cascading dropdowns
const locationData: Record<string, string[]> = {
  'Venezuela': ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Miami'],
  'Colombia': ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'],
  'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey', 'Cancún', 'Tijuana'],
  'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza'],
  'Argentina': ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata'],
  'Spain': ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao'],
  'United Kingdom': ['London', 'Manchester', 'Birmingham', 'Glasgow', 'Liverpool'],
  'Germany': ['Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne'],
  'France': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice'],
};

export function AirlineManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAirline, setEditingAirline] = useState<Airline | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    originCountry: '',
    originCity: '',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const [contactNumbers, setContactNumbers] = useState<ContactNumber[]>([
    { id: 1, countryCode: '', number: '', type: 'Office' as 'Office' | 'Fax' },
  ]);

  // Mock data
  const [airlines, setAirlines] = useState<Airline[]>([
    { 
      id: 'AER-01', 
      name: 'Avior Airlines', 
      originCountry: 'Venezuela', 
      originCity: 'Caracas', 
      status: 'Active',
      contactNumbers: [
        { id: 1, countryCode: '+58', number: '212-555-1234', type: 'Office' },
        { id: 2, countryCode: '+58', number: '212-555-5678', type: 'Fax' },
      ]
    },
    { 
      id: 'AER-02', 
      name: 'American Airlines', 
      originCountry: 'United States', 
      originCity: 'Dallas', 
      status: 'Active',
      contactNumbers: [
        { id: 1, countryCode: '+1', number: '800-433-7300', type: 'Office' },
      ]
    },
    { 
      id: 'AER-03', 
      name: 'Avianca', 
      originCountry: 'Colombia', 
      originCity: 'Bogotá', 
      status: 'Active',
      contactNumbers: [
        { id: 1, countryCode: '+57', number: '1-401-3434', type: 'Office' },
      ]
    },
    { 
      id: 'AER-04', 
      name: 'LATAM Airlines', 
      originCountry: 'Brazil', 
      originCity: 'São Paulo', 
      status: 'Active',
      contactNumbers: [
        { id: 1, countryCode: '+55', number: '11-3003-5700', type: 'Office' },
      ]
    },
    { 
      id: 'AER-05', 
      name: 'Aerolíneas Argentinas', 
      originCountry: 'Argentina', 
      originCity: 'Buenos Aires', 
      status: 'Inactive',
      contactNumbers: [
        { id: 1, countryCode: '+54', number: '11-4320-2000', type: 'Office' },
      ]
    },
    { 
      id: 'AER-06', 
      name: 'Iberia', 
      originCountry: 'Spain', 
      originCity: 'Madrid', 
      status: 'Active',
      contactNumbers: [
        { id: 1, countryCode: '+34', number: '901-111-500', type: 'Office' },
      ]
    },
  ]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(airlines.length / itemsPerPage);

  // Filtered and paginated data
  const filteredAirlines = airlines.filter(airline => {
    const matchesSearch = airline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         airline.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         airline.originCity.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || airline.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedAirlines = filteredAirlines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddNew = () => {
    setEditingAirline(null);
    setFormData({ name: '', originCountry: '', originCity: '', status: 'Active' });
    setContactNumbers([{ id: 1, countryCode: '', number: '', type: 'Office' }]);
    setIsModalOpen(true);
  };

  const handleEdit = (airline: Airline) => {
    setEditingAirline(airline);
    setFormData({
      name: airline.name,
      originCountry: airline.originCountry,
      originCity: airline.originCity,
      status: airline.status,
    });
    setContactNumbers(airline.contactNumbers);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this airline?')) {
      setAirlines(airlines.filter(airline => airline.id !== id));
    }
  };

  const handleSave = () => {
    // Validation
    if (!formData.name.trim()) {
      alert('Please enter an airline name');
      return;
    }
    if (!formData.originCountry) {
      alert('Please select a country');
      return;
    }
    if (!formData.originCity) {
      alert('Please select a city');
      return;
    }

    // Check if at least one contact number is filled
    const validContactNumbers = contactNumbers.filter(
      c => c.countryCode.trim() && c.number.trim()
    );
    if (validContactNumbers.length === 0) {
      alert('Please add at least one contact number');
      return;
    }

    if (editingAirline) {
      // Update existing
      setAirlines(airlines.map(airline =>
        airline.id === editingAirline.id
          ? { 
              ...airline, 
              ...formData, 
              contactNumbers: validContactNumbers 
            }
          : airline
      ));
    } else {
      // Add new - generate ID
      const maxIdNumber = airlines.reduce((max, airline) => {
        const num = parseInt(airline.id.split('-')[1]);
        return num > max ? num : max;
      }, 0);
      const newId = `AER-${String(maxIdNumber + 1).padStart(2, '0')}`;
      
      const newAirline: Airline = {
        id: newId,
        ...formData,
        contactNumbers: validContactNumbers,
      };
      setAirlines([...airlines, newAirline]);
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleCountryChange = (country: string) => {
    setFormData({ ...formData, originCountry: country, originCity: '' });
  };

  const handleAddContactNumber = () => {
    const newId = Math.max(...contactNumbers.map(c => c.id), 0) + 1;
    setContactNumbers([
      ...contactNumbers,
      { id: newId, countryCode: '', number: '', type: 'Office' },
    ]);
  };

  const handleRemoveContactNumber = (id: number) => {
    if (contactNumbers.length > 1) {
      setContactNumbers(contactNumbers.filter(c => c.id !== id));
    }
  };

  const handleContactNumberChange = (
    id: number,
    field: keyof ContactNumber,
    value: string
  ) => {
    setContactNumbers(
      contactNumbers.map(contact =>
        contact.id === id ? { ...contact, [field]: value } : contact
      )
    );
  };

  const availableCities = formData.originCountry ? locationData[formData.originCountry] || [] : [];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[var(--color-text-primary)] mb-2">
          Airline Management
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Manage airline information and partnerships
        </p>
      </div>

      {/* Top Bar - Search, Filters, Add Button */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
              <input
                type="text"
                placeholder="Search airlines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="min-w-[180px]">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Add New Button */}
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue-hover)] text-white rounded-md transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Add Airline</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-background)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">ID</th>
                <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Name</th>
                <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Origin Location</th>
                <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Status</th>
                <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {paginatedAirlines.length > 0 ? (
                paginatedAirlines.map((airline) => (
                  <tr key={airline.id} className="hover:bg-[var(--color-background)] transition-colors">
                    <td className="px-6 py-4 text-[var(--color-text-primary)]">{airline.id}</td>
                    <td className="px-6 py-4 text-[var(--color-text-primary)]">{airline.name}</td>
                    <td className="px-6 py-4 text-[var(--color-text-secondary)]">
                      {airline.originCity}, {airline.originCountry}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                          airline.status === 'Active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {airline.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(airline)}
                          className="p-2 text-[var(--color-primary-blue)] hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(airline.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">
                    No airlines found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredAirlines.length > 0 && (
          <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-between">
            <div className="text-[var(--color-text-secondary)] text-sm">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredAirlines.length)} of {filteredAirlines.length} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-[var(--color-border)] rounded-md hover:bg-[var(--color-background)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    currentPage === index + 1
                      ? 'bg-[var(--color-primary-blue)] text-white'
                      : 'border border-[var(--color-border)] hover:bg-[var(--color-background)] text-[var(--color-text-primary)]'
                  }`}
                >
                  {index + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-[var(--color-border)] rounded-md hover:bg-[var(--color-background)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[var(--color-card)] rounded-lg shadow-xl max-w-3xl w-full my-8">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-[var(--color-text-primary)]">
                {editingAirline ? 'Edit Airline' : 'Add New Airline'}
              </h2>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Airline Details Section */}
              <div>
                <h3 className="text-[var(--color-text-primary)] mb-4 pb-2 border-b border-[var(--color-border)]">
                  Airline Details
                </h3>
                
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-[var(--color-text-primary)] mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                      placeholder="Enter airline name"
                    />
                  </div>

                  {/* Cascading Location Dropdowns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Country Dropdown */}
                    <div>
                      <label className="block text-[var(--color-text-primary)] mb-2">
                        Select Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.originCountry}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                      >
                        <option value="">Select a country</option>
                        {Object.keys(locationData).sort().map(country => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* City Dropdown */}
                    <div>
                      <label className="block text-[var(--color-text-primary)] mb-2">
                        Select City <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.originCity}
                        onChange={(e) => setFormData({ ...formData, originCity: e.target.value })}
                        disabled={!formData.originCountry}
                        className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {formData.originCountry ? 'Select a city' : 'Select country first'}
                        </option>
                        {availableCities.map(city => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-[var(--color-text-primary)] mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
                      className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Numbers Section */}
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--color-border)]">
                  <div className="flex items-center gap-2">
                    <Phone className="w-5 h-5 text-[var(--color-primary-blue)]" />
                    <h3 className="text-[var(--color-text-primary)]">
                      Contact Numbers
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddContactNumber}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue-hover)] text-white rounded-md transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Number</span>
                  </button>
                </div>

                {/* Contact Numbers Table */}
                <div className="border border-[var(--color-border)] rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[var(--color-background)] border-b border-[var(--color-border)]">
                      <tr>
                        <th className="px-4 py-3 text-left text-[var(--color-text-primary)] text-sm">#</th>
                        <th className="px-4 py-3 text-left text-[var(--color-text-primary)] text-sm">Country Code</th>
                        <th className="px-4 py-3 text-left text-[var(--color-text-primary)] text-sm">Number</th>
                        <th className="px-4 py-3 text-left text-[var(--color-text-primary)] text-sm">Type</th>
                        <th className="px-4 py-3 text-left text-[var(--color-text-primary)] text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {contactNumbers.map((contact, index) => (
                        <tr key={contact.id} className="hover:bg-[var(--color-background)] transition-colors">
                          <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                            {index + 1}
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={contact.countryCode}
                              onChange={(e) =>
                                handleContactNumberChange(contact.id, 'countryCode', e.target.value)
                              }
                              className="w-full px-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all text-sm"
                              placeholder="+58"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={contact.number}
                              onChange={(e) =>
                                handleContactNumberChange(contact.id, 'number', e.target.value)
                              }
                              className="w-full px-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all text-sm"
                              placeholder="212-555-1234"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={contact.type}
                              onChange={(e) =>
                                handleContactNumberChange(contact.id, 'type', e.target.value)
                              }
                              className="w-full px-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all text-sm"
                            >
                              <option value="Office">Office</option>
                              <option value="Fax">Fax</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => handleRemoveContactNumber(contact.id)}
                              disabled={contactNumbers.length === 1}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              title="Remove contact number"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2.5 bg-[var(--color-background)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] rounded-md transition-colors border border-[var(--color-border)]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2.5 bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue-hover)] text-white rounded-md transition-colors"
              >
                {editingAirline ? 'Update' : 'Save'} Airline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
