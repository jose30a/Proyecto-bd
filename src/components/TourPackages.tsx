import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Save, X, Plane, Hotel, Calendar, Users, Clock, DollarSign, Package, Tag } from 'lucide-react';

interface Service {
  id: number;
  type: 'Hotel' | 'Flight';
  name: string;
  startDate: string;
  endDate: string;
}

interface TourPackage {
  id: number;
  name: string;
  description: string;
  totalCost: number;
  capacity: number;
  duration: number;
  services: Service[];
  tags: string[];
  status: 'Active' | 'Inactive';
}

export function TourPackages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDetailView, setIsDetailView] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TourPackage | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    totalCost: 0,
    capacity: 0,
    duration: 0,
    status: 'Active' as 'Active' | 'Inactive',
  });

  const [services, setServices] = useState<Service[]>([]);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    type: 'Hotel' as 'Hotel' | 'Flight',
    name: '',
    startDate: '',
    endDate: '',
  });

  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  // Predefined tag suggestions
  const tagSuggestions = [
    'Beach',
    'Mountain',
    'City',
    'Adventure',
    'Relaxation',
    'Culture',
    'Historical',
    'Luxury',
    'Budget',
    'Family',
    'Romantic',
    'Wildlife',
    'Food & Wine',
    'Shopping',
    'Cruise',
    'Backpacking',
  ];

  const availableTagSuggestions = tagSuggestions.filter(
    tag => !tags.includes(tag) && tag.toLowerCase().includes(tagInput.toLowerCase())
  );

  // Mock data
  const [packages, setPackages] = useState<TourPackage[]>([
    { 
      id: 1, 
      name: 'European Grand Tour', 
      description: 'Comprehensive tour covering major European cities with cultural experiences',
      totalCost: 3500,
      capacity: 25,
      duration: 14,
      services: [
        { id: 1, type: 'Flight', name: 'Air France AF123 - JFK to CDG', startDate: '2024-06-01', endDate: '2024-06-01' },
        { id: 2, type: 'Hotel', name: 'Le Grand Paris - Deluxe Room', startDate: '2024-06-01', endDate: '2024-06-05' },
      ],
      tags: ['City', 'Culture', 'Historical'],
      status: 'Active' 
    },
    { 
      id: 2, 
      name: 'Caribbean Paradise', 
      description: 'Tropical island hopping with beach resorts and water activities',
      totalCost: 2200,
      capacity: 30,
      duration: 7,
      services: [
        { id: 1, type: 'Flight', name: 'Delta DL456 - MIA to KIN', startDate: '2024-07-10', endDate: '2024-07-10' },
        { id: 2, type: 'Hotel', name: 'Jamaica Beach Resort - Ocean View', startDate: '2024-07-10', endDate: '2024-07-17' },
      ],
      tags: ['Beach', 'Relaxation', 'Adventure'],
      status: 'Active' 
    },
    { 
      id: 3, 
      name: 'Asian Adventure', 
      description: 'Explore vibrant Asian cities with cultural immersion and culinary experiences',
      totalCost: 2800,
      capacity: 20,
      duration: 10,
      services: [],
      tags: ['City', 'Food & Wine', 'Culture'],
      status: 'Active' 
    },
    { 
      id: 4, 
      name: 'Mountain Retreat', 
      description: 'Alpine adventure with hiking, skiing, and mountain lodge accommodations',
      totalCost: 1950,
      capacity: 15,
      duration: 5,
      services: [],
      tags: ['Mountain', 'Adventure', 'Relaxation'],
      status: 'Active' 
    },
  ]);

  const itemsPerPage = 8;
  const totalPages = Math.ceil(packages.length / itemsPerPage);

  // Filtered and paginated data
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedPackages = filteredPackages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddNew = () => {
    setEditingPackage(null);
    setFormData({ name: '', description: '', totalCost: 0, capacity: 0, duration: 0, status: 'Active' });
    setServices([]);
    setTags([]);
    setIsDetailView(true);
  };

  const handleEdit = (pkg: TourPackage) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      totalCost: pkg.totalCost,
      capacity: pkg.capacity,
      duration: pkg.duration,
      status: pkg.status,
    });
    setServices(pkg.services);
    setTags(pkg.tags);
    setIsDetailView(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this package?')) {
      setPackages(packages.filter(pkg => pkg.id !== id));
    }
  };

  const handleSave = () => {
    // Validation
    if (!formData.name.trim()) {
      alert('Please enter a package name');
      return;
    }
    if (formData.totalCost <= 0) {
      alert('Please enter a valid total cost');
      return;
    }
    if (formData.capacity <= 0) {
      alert('Please enter a valid capacity');
      return;
    }
    if (formData.duration <= 0) {
      alert('Please enter a valid duration');
      return;
    }

    if (editingPackage) {
      // Update existing
      setPackages(packages.map(pkg =>
        pkg.id === editingPackage.id
          ? { 
              ...pkg, 
              ...formData,
              services,
              tags,
            }
          : pkg
      ));
    } else {
      // Add new
      const newPackage: TourPackage = {
        id: Math.max(...packages.map(p => p.id), 0) + 1,
        ...formData,
        services,
        tags,
      };
      setPackages([...packages, newPackage]);
    }
    setIsDetailView(false);
  };

  const handleCancel = () => {
    setIsDetailView(false);
  };

  const handleAddService = () => {
    if (!newService.name.trim() || !newService.startDate || !newService.endDate) {
      alert('Please fill in all service fields');
      return;
    }

    const service: Service = {
      id: Math.max(...services.map(s => s.id), 0) + 1,
      ...newService,
    };
    setServices([...services, service]);
    setNewService({ type: 'Hotel', name: '', startDate: '', endDate: '' });
    setIsServiceModalOpen(false);
  };

  const handleRemoveService = (id: number) => {
    if (confirm('Remove this service?')) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim())) {
      setTags([...tags, tag.trim()]);
      setTagInput('');
      setShowTagSuggestions(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  // List View
  if (!isDetailView) {
    return (
      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[var(--color-text-primary)] mb-2">
            Package Management
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Manage tour packages and service configurations
          </p>
        </div>

        {/* Top Bar */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1 w-full md:w-auto">
              <div className="relative flex-1 min-w-[300px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                <input
                  type="text"
                  placeholder="Search packages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                />
              </div>

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

            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue-hover)] text-white rounded-md transition-colors whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span>New Package</span>
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
                  <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Package Name</th>
                  <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Duration</th>
                  <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Capacity</th>
                  <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Total Cost</th>
                  <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Services</th>
                  <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Status</th>
                  <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {paginatedPackages.length > 0 ? (
                  paginatedPackages.map((pkg) => (
                    <tr key={pkg.id} className="hover:bg-[var(--color-background)] transition-colors">
                      <td className="px-6 py-4 text-[var(--color-text-primary)]">PKG-{String(pkg.id).padStart(3, '0')}</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-[var(--color-text-primary)]">{pkg.name}</div>
                          <div className="text-sm text-[var(--color-text-secondary)] truncate max-w-xs">{pkg.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-text-secondary)]">{pkg.duration} days</td>
                      <td className="px-6 py-4 text-[var(--color-text-secondary)]">{pkg.capacity} people</td>
                      <td className="px-6 py-4 text-[var(--color-text-primary)]">${pkg.totalCost.toLocaleString()}</td>
                      <td className="px-6 py-4 text-[var(--color-text-secondary)]">{pkg.services.length} service(s)</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                            pkg.status === 'Active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {pkg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(pkg)}
                            className="p-2 text-[var(--color-primary-blue)] hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(pkg.id)}
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
                    <td colSpan={8} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">
                      No packages found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredPackages.length > 0 && (
            <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-between">
              <div className="text-[var(--color-text-secondary)] text-sm">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredPackages.length)} of {filteredPackages.length} entries
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
      </div>
    );
  }

  // Detail/Edit View
  return (
    <div>
      {/* Header with Back Button */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[var(--color-text-primary)] mb-2">
            {editingPackage ? 'Edit Package' : 'New Package'}
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Configure package details, services, and attributes
          </p>
        </div>
        <button
          onClick={handleCancel}
          className="px-4 py-2.5 bg-[var(--color-background)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] rounded-md transition-colors border border-[var(--color-border)]"
        >
          Back to List
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Panel - Left Side (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information Card */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg">
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[var(--color-primary-blue)]" />
                <h2 className="text-[var(--color-text-primary)]">Package Information</h2>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Package Name */}
              <div>
                <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                  Package Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                  placeholder="Enter package name"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all resize-none"
                  placeholder="Enter package description"
                />
              </div>

              {/* Grid for metrics */}
              <div className="grid grid-cols-3 gap-4">
                {/* Total Cost */}
                <div>
                  <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                    Total Cost ($) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                    <input
                      type="number"
                      value={formData.totalCost || ''}
                      onChange={(e) => setFormData({ ...formData, totalCost: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                {/* Capacity */}
                <div>
                  <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                    Capacity <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                    <input
                      type="number"
                      value={formData.capacity || ''}
                      onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                    Duration (Days) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                    <input
                      type="number"
                      value={formData.duration || ''}
                      onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
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

          {/* Services Tab */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg">
            <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="text-[var(--color-text-primary)]">Included Services</h2>
              <button
                onClick={() => setIsServiceModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue-hover)] text-white rounded-md transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-background)] border-b border-[var(--color-border)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-[var(--color-text-primary)] text-sm">Service Type</th>
                    <th className="px-6 py-3 text-left text-[var(--color-text-primary)] text-sm">Service Name</th>
                    <th className="px-6 py-3 text-left text-[var(--color-text-primary)] text-sm">Start Date</th>
                    <th className="px-6 py-3 text-left text-[var(--color-text-primary)] text-sm">End Date</th>
                    <th className="px-6 py-3 text-left text-[var(--color-text-primary)] text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {services.length > 0 ? (
                    services.map((service) => (
                      <tr key={service.id} className="hover:bg-[var(--color-background)] transition-colors">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            {service.type === 'Flight' ? (
                              <Plane className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Hotel className="w-4 h-4 text-purple-600" />
                            )}
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs ${
                              service.type === 'Flight'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {service.type}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-[var(--color-text-primary)] text-sm">{service.name}</td>
                        <td className="px-6 py-3 text-[var(--color-text-secondary)] text-sm">{service.startDate}</td>
                        <td className="px-6 py-3 text-[var(--color-text-secondary)] text-sm">{service.endDate}</td>
                        <td className="px-6 py-3">
                          <button
                            onClick={() => handleRemoveService(service.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Remove service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-[var(--color-text-secondary)] text-sm">
                        No services added yet. Click "Add Service" to include services.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tags Section - Right Side (1/3) */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg sticky top-6">
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-[var(--color-primary-blue)]" />
                <h2 className="text-[var(--color-text-primary)]">Package Tags</h2>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Tag Input */}
              <div className="relative">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value);
                    setShowTagSuggestions(true);
                  }}
                  onKeyDown={handleTagInputKeyDown}
                  onFocus={() => setShowTagSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
                  className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all text-sm"
                  placeholder="Type to add tags (press Enter)"
                />

                {/* Tag Suggestions Dropdown */}
                {showTagSuggestions && availableTagSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {availableTagSuggestions.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        className="w-full text-left px-4 py-2 hover:bg-[var(--color-background)] transition-colors text-[var(--color-text-primary)] text-sm"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Tags Display */}
              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">Selected Tags:</p>
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-primary-blue)] text-white rounded-md text-sm"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--color-text-secondary)] italic">
                    No tags added
                  </p>
                )}
              </div>

              {/* Quick Tags */}
              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">Quick Add:</p>
                <div className="flex flex-wrap gap-2">
                  {['Beach', 'Mountain', 'City', 'Adventure'].filter(t => !tags.includes(t)).map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleAddTag(tag)}
                      className="px-3 py-1.5 bg-[var(--color-background)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] rounded-md transition-colors text-sm border border-[var(--color-border)]"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <button
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue-hover)] text-white rounded-md transition-colors"
            >
              <Save className="w-5 h-5" />
              <span>{editingPackage ? 'Update Package' : 'Save Package'}</span>
            </button>
            <button
              onClick={handleCancel}
              className="w-full px-4 py-3 bg-[var(--color-background)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] rounded-md transition-colors border border-[var(--color-border)]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Add Service Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-card)] rounded-lg shadow-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-[var(--color-text-primary)]">Add Service</h2>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                  Service Type
                </label>
                <select
                  value={newService.type}
                  onChange={(e) => setNewService({ ...newService, type: e.target.value as 'Hotel' | 'Flight' })}
                  className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                >
                  <option value="Hotel">Hotel</option>
                  <option value="Flight">Flight</option>
                </select>
              </div>

              <div>
                <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                  Service Name
                </label>
                <input
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                  placeholder="Enter service name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newService.startDate}
                    onChange={(e) => setNewService({ ...newService, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[var(--color-text-primary)] mb-2 text-sm">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={newService.endDate}
                    onChange={(e) => setNewService({ ...newService, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-end gap-3">
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="px-4 py-2.5 bg-[var(--color-background)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] rounded-md transition-colors border border-[var(--color-border)]"
              >
                Cancel
              </button>
              <button
                onClick={handleAddService}
                className="px-4 py-2.5 bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue-hover)] text-white rounded-md transition-colors"
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
