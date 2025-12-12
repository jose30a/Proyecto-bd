import { useState } from 'react';
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

  // Mock data
  const [promotions, setPromotions] = useState<Promotion[]>([
    { id: 1, name: 'Summer Sale 2024', code: 'SUMMER24', discount: 25, validFrom: '2024-06-01', validTo: '2024-08-31', status: 'Active' },
    { id: 2, name: 'Early Bird Special', code: 'EARLYBIRD', discount: 15, validFrom: '2024-01-01', validTo: '2024-12-31', status: 'Active' },
    { id: 3, name: 'Holiday Package', code: 'HOLIDAY23', discount: 30, validFrom: '2023-12-01', validTo: '2023-12-31', status: 'Expired' },
    { id: 4, name: 'Couples Getaway', code: 'COUPLES20', discount: 20, validFrom: '2024-02-01', validTo: '2024-02-14', status: 'Expired' },
    { id: 5, name: 'Family Adventure', code: 'FAMILY10', discount: 10, validFrom: '2024-03-01', validTo: '2024-12-31', status: 'Active' },
    { id: 6, name: 'Weekend Escape', code: 'WEEKEND15', discount: 15, validFrom: '2024-01-01', validTo: '2024-12-31', status: 'Active' },
    { id: 7, name: 'Senior Citizen Discount', code: 'SENIOR30', discount: 30, validFrom: '2024-01-01', validTo: '2024-12-31', status: 'Active' },
    { id: 8, name: 'Student Special', code: 'STUDENT20', discount: 20, validFrom: '2024-01-01', validTo: '2024-06-30', status: 'Inactive' },
  ]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(promotions.length / itemsPerPage);

  // Filtered and paginated data
  const filteredPromotions = promotions.filter(promo => {
    const matchesSearch = promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promo.code.toLowerCase().includes(searchTerm.toLowerCase());
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

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      setPromotions(promotions.filter(promo => promo.id !== id));
    }
  };

  const handleSave = () => {
    if (editingPromotion) {
      // Update existing
      setPromotions(promotions.map(promo =>
        promo.id === editingPromotion.id
          ? { ...promo, ...formData }
          : promo
      ));
    } else {
      // Add new
      const newPromotion: Promotion = {
        id: Math.max(...promotions.map(p => p.id), 0) + 1,
        ...formData,
      };
      setPromotions([...promotions, newPromotion]);
    }
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
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
                <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Code</th>
                <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Discount</th>
                <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Valid Period</th>
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
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[var(--color-primary-blue)]">
                        <Tag className="w-4 h-4" />
                        <span className="font-mono">{promo.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[var(--color-text-primary)]">{promo.discount}%</td>
                    <td className="px-6 py-4 text-[var(--color-text-secondary)] text-sm">
                      {promo.validFrom} to {promo.validTo}
                    </td>
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
                  Promo Code
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all font-mono"
                  placeholder="PROMOCODE"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--color-text-primary)] mb-2">
                    Valid From
                  </label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-text-primary)] mb-2">
                    Valid To
                  </label>
                  <input
                    type="date"
                    value={formData.validTo}
                    onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
                  />
                </div>
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
    </div>
  );
}
