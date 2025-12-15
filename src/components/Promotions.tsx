import React, { useState, useEffect } from 'react';
import { getAllPromotions, upsertPromotion, deletePromotion, getAllServices, getPromotionServices, assignPromotionToService, removePromotionFromService } from '../services/database';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Tag } from 'lucide-react';

interface Promotion {
  id: number;
  name: string;
  code: string;
  discount: number;
  validFrom: string;
  validTo: string;
  status: 'Active' | 'Inactive' | 'Expired';
}

export function Promotions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    discount: 0,
    validFrom: '',
    validTo: '',
    status: 'Active' as 'Active' | 'Inactive' | 'Expired',
  });

  const [promotions, setPromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await getAllPromotions();
        if (!mounted) return;
        setPromotions(rows.map(r => ({ id: r.id, name: r.tipo, code: '', discount: r.discount || 0, validFrom: '', validTo: '', status: 'Active' })));
      } catch (err) {
        console.error('Failed to load promotions', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(promotions.length / itemsPerPage);

  // Filtered and paginated data (defensive)
  const filteredPromotions = promotions.filter(promo => {
    const s = (searchTerm || '').toLowerCase();
    const name = (promo.name || '').toLowerCase();
    const code = (promo.code || '').toLowerCase();
    const matchesSearch = name.includes(s) || code.includes(s);
    const matchesStatus = statusFilter === 'all' || promo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedPromotions = filteredPromotions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddNew = () => {
    setEditingPromotion(null);
    setFormData({ name: '', code: '', discount: 0, validFrom: '', validTo: '', status: 'Active' });
    setIsModalOpen(true);
  };

  const handleEdit = (promo: Promotion) => {
    setEditingPromotion(promo);
    setFormData({
      name: promo.name,
      code: promo.code,
      discount: promo.discount,
      validFrom: promo.validFrom,
      validTo: promo.validTo,
      status: promo.status,
    });
    setIsModalOpen(true);
  };

  // Error state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      try {
        await deletePromotion(id);
        setPromotions(promotions.filter(promo => promo.id !== id));
      } catch (err: any) {
        console.error('Failed to delete promotion', err);
        setError(err.message || 'Failed to delete promotion');
      }
    }
  };

  const handleSave = async () => {
    setError(null);
    try {
      if (editingPromotion) {
        // Update existing
        await upsertPromotion(editingPromotion.id, formData.name, formData.discount);

        // Only update state if API succeeds
        const updated = promotions.map(promo => promo.id === editingPromotion.id ? { ...promo, ...formData } : promo);
        setPromotions(updated);
      } else {
        // Add new
        await upsertPromotion(null, formData.name, formData.discount);

        // Refresh list to get new ID (or simplistic approach: reload all)
        // For simplicity: reload all to match DB ID
        const rows = await getAllPromotions();
        setPromotions(rows.map(r => ({ id: r.id, name: r.tipo, code: '', discount: r.discount || 0, validFrom: '', validTo: '', status: 'Active' })));
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save promotion', err);
      // Keep modal open to show error? Or close and show toast?
      // User asked for "message saying user is not allowed"
      // Show error in the main view or modal?
      // Main view is safer if modal closes.
      setError(err.message || 'Failed to save promotion');
      setIsModalOpen(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setError(null);
  };

  // Assignment state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPromoForAssign, setSelectedPromoForAssign] = useState<Promotion | null>(null);
  const [availableServices, setAvailableServices] = useState<{ id: number, name: string }[]>([]);
  const [assignedServices, setAssignedServices] = useState<any[]>([]);
  const [assignFormData, setAssignFormData] = useState({
    serviceId: 0,
    startDate: '',
    endDate: '',
  });

  const handleOpenAssign = async (promo: Promotion) => {
    setSelectedPromoForAssign(promo);
    setIsAssignModalOpen(true);
    // Load services and current assignments
    try {
      const [services, currentAssignments] = await Promise.all([
        getAllServices(),
        getPromotionServices(promo.id)
      ]);
      setAvailableServices(services);
      setAssignedServices(currentAssignments);
      // Default to first service if available
      if (services.length > 0) {
        setAssignFormData(prev => ({ ...prev, serviceId: services[0].id }));
      }
    } catch (err) {
      console.error('Failed to load assignment data', err);
      setError('Failed to load assignment data');
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedPromoForAssign || !assignFormData.serviceId) return;
    try {
      await assignPromotionToService(
        selectedPromoForAssign.id,
        assignFormData.serviceId,
        assignFormData.startDate,
        assignFormData.endDate
      );
      // Refresh assignments
      const currentAssignments = await getPromotionServices(selectedPromoForAssign.id);
      setAssignedServices(currentAssignments);
      // Reset dates but keep service for quick multi-assign
      setAssignFormData(prev => ({ ...prev, startDate: '', endDate: '' }));
    } catch (err: any) {
      console.error('Failed to assign service', err);
      alert(err.message || 'Failed to assign service'); // Show alert for modal
    }
  };

  const handleRemoveAssignment = async (serviceId: number) => {
    if (!selectedPromoForAssign || !confirm('Remove this assignment?')) return;
    try {
      await removePromotionFromService(selectedPromoForAssign.id, serviceId);
      setAssignedServices(prev => prev.filter(p => p.cod !== serviceId));
    } catch (err: any) {
      console.error('Failed to remove assignment', err);
      alert(err.message || 'Failed to remove assignment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700';
      case 'Expired':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      {/* Error Alert */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[var(--color-text-primary)] mb-2">
          Promotions
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Manage promotional offers and discount codes
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
                placeholder="Search promotions..."
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
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Add New Button */}
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue-hover)] text-white rounded-md transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span>Add New</span>
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
                <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Promotion Name</th>
                <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Discount</th>
                <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Status</th>
                <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {paginatedPromotions.length > 0 ? (
                paginatedPromotions.map((promo) => (
                  <tr key={promo.id} className="hover:bg-[var(--color-background)] transition-colors">
                    <td className="px-6 py-4 text-[var(--color-text-primary)]">{promo.id}</td>
                    <td className="px-6 py-4 text-[var(--color-text-primary)]">{promo.name}</td>
                    <td className="px-6 py-4 text-[var(--color-text-primary)]">{promo.discount}%</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${getStatusColor(promo.status)}`}
                      >
                        {promo.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenAssign(promo)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Assign to Service"
                        >
                          <Tag className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(promo)}
                          className="p-2 text-[var(--color-primary-blue)] hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(promo.id)}
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
                  <td colSpan={7} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">
                    No promotions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {filteredPromotions.length > 0 && (
          <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-between">
            <div className="text-[var(--color-text-secondary)] text-sm">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredPromotions.length)} of {filteredPromotions.length} entries
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
                  className={`px-4 py-2 rounded-md transition-colors ${currentPage === index + 1
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-card)] rounded-lg shadow-xl max-w-lg w-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-[var(--color-text-primary)]">
                {editingPromotion ? 'Edit Promotion' : 'Add New Promotion'}
              </h2>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-[var(--color-text-primary)] mb-2">
                  Promotion Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                  placeholder="Enter promotion name"
                />
              </div>

              <div>
                <label className="block text-[var(--color-text-primary)] mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                  placeholder="Enter discount percentage"
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-[var(--color-text-primary)] mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' | 'Expired' })}
                  className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired</option>
                </select>
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
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Overlay for Assign Service */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-card)] rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-[var(--color-text-primary)]">
                Assign to Service
              </h2>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="block text-[var(--color-text-primary)] mb-2">Select Service</label>
                <select
                  className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                  value={assignFormData.serviceId}
                  onChange={e => setAssignFormData({ ...assignFormData, serviceId: Number(e.target.value) })}
                >
                  {availableServices.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--color-text-primary)] mb-2">Start Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                    value={assignFormData.startDate}
                    onChange={e => setAssignFormData({ ...assignFormData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-text-primary)] mb-2">End Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md"
                    value={assignFormData.endDate}
                    onChange={e => setAssignFormData({ ...assignFormData, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleAssignSubmit}
                  className="px-4 py-2 bg-[var(--color-primary-blue)] text-white rounded-md hover:bg-[var(--color-primary-blue-hover)]"
                >
                  Assign
                </button>
              </div>

              {/* List of currently assigned */}
              {assignedServices.length > 0 && (
                <div className="mt-6 border-t border-[var(--color-border)] pt-4">
                  <h3 className="font-medium mb-2 text-[var(--color-text-primary)]">Assigned Services</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {assignedServices.map(as => (
                      <div key={as.cod} className="flex justify-between items-center text-sm p-2 bg-[var(--color-background)] rounded">
                        <span className="text-[var(--color-text-primary)]">{as.nombre} ({as.fecha_inicio ? as.fecha_inicio.split('T')[0] : ''} - {as.fecha_fin ? as.fecha_fin.split('T')[0] : ''})</span>
                        <button onClick={() => handleRemoveAssignment(as.cod)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-[var(--color-border)] flex justify-end">
              <button onClick={() => setIsAssignModalOpen(false)} className="px-4 py-2 border border-[var(--color-border)] rounded hover:bg-[var(--color-background)] text-[var(--color-text-primary)]">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
