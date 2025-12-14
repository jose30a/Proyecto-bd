import { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole } from '../services/database';
import { Search, Edit2, Save, ChevronLeft, ChevronRight, Users, Shield, AlertTriangle, X } from 'lucide-react';

interface User {
  id: number;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  ci: string;
  email: string;
  avatar: string;
  role: 'Administrator' | 'Agent' | 'Client';
  status: 'Active' | 'Inactive';
}

type Role = 'Administrator' | 'Agent' | 'Client';

export function UserRoleManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalSelectedRole, setModalSelectedRole] = useState<Role>('Client');
  
  // Track inline edits (user ID -> new role)
  const [inlineEdits, setInlineEdits] = useState<Record<number, Role>>({});

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const fetched = await getAllUsers();
        if (!mounted) return;
        setUsers(fetched.map(u => ({
          id: u.id,
          primerNombre: u.primerNombre,
          segundoNombre: u.segundoNombre,
          primerApellido: u.primerApellido,
          segundoApellido: u.segundoApellido,
          ci: u.ci,
          email: u.email,
          avatar: u.avatar || ((u.primerNombre ? u.primerNombre.charAt(0) : 'U') + (u.primerApellido ? u.primerApellido.charAt(0) : '')),
          role: (u.role === 'Administrator' || u.role === 'Agent') ? u.role as any : 'Client',
          status: 'Active',
        })));
      } catch (err) {
        // Keep empty list on error; server logs provide details
        console.error('Failed to fetch users', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const itemsPerPage = 8;
  
  const getFullName = (user: User): string => {
    return `${user.primerNombre} ${user.primerApellido}`;
  };

  // Filtered data (defensive: avoid calling toLowerCase on undefined)
  const filteredUsers = users.filter(user => {
    const s = (searchTerm || '').toLowerCase();
    const fullName = (getFullName(user) || '').toLowerCase();
    const ci = (user.ci || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const matchesSearch = 
      fullName.includes(s) ||
      ci.includes(s) ||
      email.includes(s);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleInlineRoleChange = (userId: number, newRole: Role) => {
    setInlineEdits(prev => ({
      ...prev,
      [userId]: newRole,
    }));
  };

  const handleSaveInlineChange = (userId: number) => {
    const newRole = inlineEdits[userId];
    if (!newRole) return;

    // Optimistic update + persist to DB
    setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
    updateUserRole(userId, newRole).catch(err => {
      console.error('Failed to update role', err);
    });

    // Remove from pending edits
    setInlineEdits(prev => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setModalSelectedRole(user.role);
    setIsModalOpen(true);
  };

  const handleModalSave = () => {
    if (!editingUser) return;

    // Persist change via procedure and update local state
    setUsers(users.map(user => user.id === editingUser.id ? { ...user, role: modalSelectedRole } : user));
    updateUserRole(editingUser.id, modalSelectedRole).catch(err => {
      console.error('Failed to update role', err);
    });
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const getCurrentRole = (userId: number): Role => {
    return inlineEdits[userId] || users.find(u => u.id === userId)?.role || 'Client';
  };

  const hasInlineEdit = (userId: number): boolean => {
    return userId in inlineEdits;
  };

  const getRoleBadgeColor = (role: Role): string => {
    switch (role) {
      case 'Administrator':
        return 'bg-purple-100 text-purple-700';
      case 'Agent':
        return 'bg-blue-100 text-blue-700';
      case 'Client':
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleDescription = (role: Role): string => {
    switch (role) {
      case 'Administrator':
        return 'Full system access and management capabilities';
      case 'Agent':
        return 'Can manage bookings and assist clients';
      case 'Client':
        return 'Limited access to view packages and bookings';
    }
  };

  // Statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const adminCount = users.filter(u => u.role === 'Administrator').length;
  const agentCount = users.filter(u => u.role === 'Agent').length;
  const clientCount = users.filter(u => u.role === 'Client').length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[var(--color-text-primary)] mb-2">
          User Role Management
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Assign and manage user roles and access levels
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-1">Total Users</p>
              <p className="text-2xl text-[var(--color-text-primary)]">{totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-[var(--color-primary-blue)] opacity-50" />
          </div>
        </div>

        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-1">Administrators</p>
              <p className="text-2xl text-purple-600">{adminCount}</p>
            </div>
            <Shield className="w-8 h-8 text-purple-600 opacity-50" />
          </div>
        </div>

        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-1">Agents</p>
              <p className="text-2xl text-blue-600">{agentCount}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600 opacity-50" />
          </div>
        </div>

        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-text-secondary)] mb-1">Clients</p>
              <p className="text-2xl text-gray-600">{clientCount}</p>
            </div>
            <Users className="w-8 h-8 text-gray-600 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
            <input
              type="text"
              placeholder="Search by name, CI, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="min-w-[160px]">
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

          {/* Role Filter */}
          <div className="min-w-[160px]">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] focus:border-transparent transition-all"
            >
              <option value="all">All Roles</option>
              <option value="Administrator">Administrator</option>
              <option value="Agent">Agent</option>
              <option value="Client">Client</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Grid */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-background)] border-b border-[var(--color-border)]">
              <tr>
                <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">User Info</th>
                <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">ID Document</th>
                <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Email</th>
                <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Status</th>
                <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Assigned Role</th>
                <th className="px-6 py-4 text-left text-[var(--color-text-primary)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => {
                  const currentRole = getCurrentRole(user.id);
                  const hasPendingEdit = hasInlineEdit(user.id);
                  
                  return (
                    <tr key={user.id} className="hover:bg-[var(--color-background)] transition-colors">
                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--color-primary-blue)] text-white flex items-center justify-center flex-shrink-0">
                            {user.avatar}
                          </div>
                          <div>
                            <div className="text-[var(--color-text-primary)]">
                              {getFullName(user)}
                            </div>
                            <div className="text-xs text-[var(--color-text-secondary)]">
                              ID: USR-{String(user.id).padStart(4, '0')}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ID Document */}
                      <td className="px-6 py-4">
                        <span className="text-[var(--color-text-primary)]">{user.ci}</span>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <span className="text-[var(--color-text-secondary)] text-sm">{user.email}</span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                            user.status === 'Active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>

                      {/* Assigned Role - Dropdown */}
                      <td className="px-6 py-4">
                        <select
                          value={currentRole}
                          onChange={(e) => handleInlineRoleChange(user.id, e.target.value as Role)}
                          className={`px-3 py-2 bg-[var(--color-input-bg)] border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all text-sm ${
                            hasPendingEdit
                              ? 'border-yellow-500 ring-2 ring-yellow-200'
                              : 'border-[var(--color-border)]'
                          }`}
                        >
                          <option value="Administrator">Administrator</option>
                          <option value="Agent">Agent</option>
                          <option value="Client">Client</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {hasPendingEdit ? (
                            <button
                              onClick={() => handleSaveInlineChange(user.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm"
                              title="Save changes"
                            >
                              <Save className="w-4 h-4" />
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEditClick(user)}
                              className="p-2 text-[var(--color-primary-blue)] hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit role"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[var(--color-text-secondary)]">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-between">
            <div className="text-[var(--color-text-secondary)] text-sm">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-[var(--color-border)] rounded-md hover:bg-[var(--color-background)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                const pageNum = index + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[var(--color-primary-blue)] text-white'
                        : 'border border-[var(--color-border)] hover:bg-[var(--color-background)] text-[var(--color-text-primary)]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

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

      {/* Edit Role Modal */}
      {isModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--color-card)] rounded-lg shadow-xl max-w-lg w-full">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="text-[var(--color-text-primary)] flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--color-primary-blue)]" />
                Assign Role
              </h2>
              <button
                onClick={handleModalCancel}
                className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-[var(--color-background)] rounded-lg">
                <div className="w-12 h-12 rounded-full bg-[var(--color-primary-blue)] text-white flex items-center justify-center text-lg">
                  {editingUser.avatar}
                </div>
                <div>
                  <div className="text-[var(--color-text-primary)]">
                    {getFullName(editingUser)}
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)]">
                    {editingUser.ci} • {editingUser.email}
                  </div>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-[var(--color-text-primary)] mb-3">
                  Select New Role
                </label>
                <select
                  value={modalSelectedRole}
                  onChange={(e) => setModalSelectedRole(e.target.value as Role)}
                  className="w-full px-4 py-3 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all text-lg"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Agent">Agent</option>
                  <option value="Client">Client</option>
                </select>
              </div>

              {/* Role Description */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-blue-900 mb-1">
                      <strong>{modalSelectedRole}</strong>
                    </p>
                    <p className="text-sm text-blue-800">
                      {getRoleDescription(modalSelectedRole)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-900 mb-1">
                      <strong>Warning</strong>
                    </p>
                    <p className="text-sm text-yellow-800">
                      Changing role modifies user permissions. This action will take effect immediately after saving.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[var(--color-border)] flex items-center justify-end gap-3">
              <button
                onClick={handleModalCancel}
                className="px-4 py-2.5 bg-[var(--color-background)] hover:bg-[var(--color-border)] text-[var(--color-text-primary)] rounded-md transition-colors border border-[var(--color-border)]"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSave}
                className="px-6 py-2.5 bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue-hover)] text-white rounded-md transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
