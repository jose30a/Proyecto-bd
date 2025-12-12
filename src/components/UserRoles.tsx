import { useState } from 'react';
import { Shield, Lock, Save, AlertCircle } from 'lucide-react';

type Permission = {
  id: string;
  category: string;
  name: string;
  description: string;
};

type Role = 'Administrator' | 'Agent' | 'Client';

type RolePermissions = {
  [key in Role]: string[];
};

export function UserRoles() {
  const [selectedRole, setSelectedRole] = useState<Role>('Administrator');
  const [hasChanges, setHasChanges] = useState(false);

  // Define all available permissions organized by category
  const permissions: Permission[] = [
    // Airline Management
    { id: 'airline_create', category: 'Airline Management', name: 'Create Airline', description: 'Add new airlines to the system' },
    { id: 'airline_edit', category: 'Airline Management', name: 'Edit Airline', description: 'Modify existing airline information' },
    { id: 'airline_delete', category: 'Airline Management', name: 'Delete Airline', description: 'Remove airlines from the system' },
    { id: 'airline_view', category: 'Airline Management', name: 'View Airlines', description: 'Access airline information' },
    
    // Package Management
    { id: 'package_create', category: 'Package Management', name: 'Create Package', description: 'Create new tour packages' },
    { id: 'package_edit', category: 'Package Management', name: 'Edit Package', description: 'Modify existing packages' },
    { id: 'package_delete', category: 'Package Management', name: 'Delete Package', description: 'Remove packages from the system' },
    { id: 'package_view', category: 'Package Management', name: 'View Packages', description: 'Access package information' },
    
    // Booking Management
    { id: 'booking_create', category: 'Booking Management', name: 'Create Booking', description: 'Make new bookings for clients' },
    { id: 'booking_edit', category: 'Booking Management', name: 'Edit Booking', description: 'Modify existing bookings' },
    { id: 'booking_cancel', category: 'Booking Management', name: 'Cancel Booking', description: 'Cancel client bookings' },
    { id: 'booking_view', category: 'Booking Management', name: 'View Bookings', description: 'Access booking information' },
    
    // User Management
    { id: 'user_create', category: 'User Management', name: 'Create User', description: 'Add new users to the system' },
    { id: 'user_edit', category: 'User Management', name: 'Edit User', description: 'Modify user information' },
    { id: 'user_delete', category: 'User Management', name: 'Delete User', description: 'Remove users from the system' },
    { id: 'user_view', category: 'User Management', name: 'View Users', description: 'Access user information' },
    
    // Reports & Analytics
    { id: 'reports_view', category: 'Reports & Analytics', name: 'View Reports', description: 'Access all system reports' },
    { id: 'reports_export', category: 'Reports & Analytics', name: 'Export Reports', description: 'Export report data' },
    { id: 'analytics_view', category: 'Reports & Analytics', name: 'View Analytics', description: 'Access analytics dashboard' },
    
    // Promotions Management
    { id: 'promo_create', category: 'Promotions', name: 'Create Promotion', description: 'Create new promotional offers' },
    { id: 'promo_edit', category: 'Promotions', name: 'Edit Promotion', description: 'Modify existing promotions' },
    { id: 'promo_delete', category: 'Promotions', name: 'Delete Promotion', description: 'Remove promotions' },
    { id: 'promo_view', category: 'Promotions', name: 'View Promotions', description: 'Access promotion information' },
    
    // System Administration
    { id: 'system_settings', category: 'System Administration', name: 'Manage Settings', description: 'Configure system settings' },
    { id: 'role_manage', category: 'System Administration', name: 'Manage Roles', description: 'Configure role permissions' },
    { id: 'audit_view', category: 'System Administration', name: 'View Audit Logs', description: 'Access system audit logs' },
  ];

  // Default permissions for each role
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({
    'Administrator': [
      'airline_create', 'airline_edit', 'airline_delete', 'airline_view',
      'package_create', 'package_edit', 'package_delete', 'package_view',
      'booking_create', 'booking_edit', 'booking_cancel', 'booking_view',
      'user_create', 'user_edit', 'user_delete', 'user_view',
      'reports_view', 'reports_export', 'analytics_view',
      'promo_create', 'promo_edit', 'promo_delete', 'promo_view',
      'system_settings', 'role_manage', 'audit_view',
    ],
    'Agent': [
      'airline_view',
      'package_view',
      'booking_create', 'booking_edit', 'booking_view',
      'user_view',
      'reports_view',
      'promo_view',
    ],
    'Client': [
      'package_view',
      'booking_view',
      'promo_view',
    ],
  });

  // Get unique categories
  const categories = Array.from(new Set(permissions.map(p => p.category)));

  const handleRoleSelect = (role: Role) => {
    if (hasChanges) {
      if (!confirm('You have unsaved changes. Do you want to discard them?')) {
        return;
      }
      setHasChanges(false);
    }
    setSelectedRole(role);
  };

  const handlePermissionToggle = (permissionId: string) => {
    setRolePermissions(prev => {
      const currentPermissions = prev[selectedRole];
      const newPermissions = currentPermissions.includes(permissionId)
        ? currentPermissions.filter(id => id !== permissionId)
        : [...currentPermissions, permissionId];
      
      return {
        ...prev,
        [selectedRole]: newPermissions,
      };
    });
    setHasChanges(true);
  };

  const handleSelectAll = (category: string) => {
    const categoryPermissions = permissions
      .filter(p => p.category === category)
      .map(p => p.id);
    
    const allSelected = categoryPermissions.every(id => 
      rolePermissions[selectedRole].includes(id)
    );

    setRolePermissions(prev => {
      const currentPermissions = prev[selectedRole];
      const newPermissions = allSelected
        ? currentPermissions.filter(id => !categoryPermissions.includes(id))
        : Array.from(new Set([...currentPermissions, ...categoryPermissions]));
      
      return {
        ...prev,
        [selectedRole]: newPermissions,
      };
    });
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    // Simulate save operation
    alert('Changes saved successfully!\n\nRole: ' + selectedRole + '\nPermissions: ' + rolePermissions[selectedRole].length);
    setHasChanges(false);
  };

  const getRoleDescription = (role: Role): string => {
    switch (role) {
      case 'Administrator':
        return 'Full system access with all privileges. Can manage users, roles, and system configuration.';
      case 'Agent':
        return 'Customer service representative. Can create bookings, view packages, and assist clients.';
      case 'Client':
        return 'End customer with limited access. Can view packages, promotions, and their own bookings.';
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'Administrator':
        return '👑';
      case 'Agent':
        return '👤';
      case 'Client':
        return '🧑';
    }
  };

  const isPermissionChecked = (permissionId: string): boolean => {
    return rolePermissions[selectedRole].includes(permissionId);
  };

  const isCategoryFullySelected = (category: string): boolean => {
    const categoryPermissions = permissions
      .filter(p => p.category === category)
      .map(p => p.id);
    return categoryPermissions.every(id => isPermissionChecked(id));
  };

  const isCategoryPartiallySelected = (category: string): boolean => {
    const categoryPermissions = permissions
      .filter(p => p.category === category)
      .map(p => p.id);
    const selectedCount = categoryPermissions.filter(id => isPermissionChecked(id)).length;
    return selectedCount > 0 && selectedCount < categoryPermissions.length;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[var(--color-text-primary)] mb-2">
          Security & Access Control
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Manage role-based permissions and access privileges
        </p>
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-yellow-800 text-sm">
              You have unsaved changes. Click "Save Changes" to apply your modifications.
            </p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[600px]">
          {/* Left Side - Roles List */}
          <div className="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-[var(--color-border)]">
            <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-background)]">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--color-primary-blue)]" />
                <h2 className="text-[var(--color-text-primary)]">System Roles</h2>
              </div>
            </div>

            <div className="p-4 space-y-2">
              {(['Administrator', 'Agent', 'Client'] as Role[]).map(role => {
                const isSelected = selectedRole === role;
                const permCount = rolePermissions[role].length;
                
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-[var(--color-primary-blue)] bg-blue-50'
                        : 'border-[var(--color-border)] hover:border-[var(--color-primary-blue)] hover:bg-[var(--color-background)]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getRoleIcon(role)}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`${
                            isSelected
                              ? 'text-[var(--color-primary-blue)]'
                              : 'text-[var(--color-text-primary)]'
                          }`}>
                            {role}
                          </h3>
                          {isSelected && (
                            <div className="w-2 h-2 bg-[var(--color-primary-blue)] rounded-full"></div>
                          )}
                        </div>
                        <p className="text-xs text-[var(--color-text-secondary)] mb-2">
                          {getRoleDescription(role)}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-[var(--color-background)] rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-[var(--color-primary-blue)] h-full transition-all"
                              style={{ width: `${(permCount / permissions.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-[var(--color-text-secondary)]">
                            {permCount}/{permissions.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Role Statistics */}
            <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-background)]">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">Selected Role:</span>
                  <span className="text-[var(--color-text-primary)]">{selectedRole}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">Active Permissions:</span>
                  <span className="text-[var(--color-primary-blue)]">
                    {rolePermissions[selectedRole].length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--color-text-secondary)]">Total Available:</span>
                  <span className="text-[var(--color-text-primary)]">{permissions.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Permissions Matrix */}
          <div className="lg:col-span-2">
            <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[var(--color-primary-blue)]" />
                <h2 className="text-[var(--color-text-primary)]">Permissions Matrix</h2>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  ({selectedRole})
                </span>
              </div>
            </div>

            {/* Permissions by Category */}
            <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
              {categories.map(category => {
                const categoryPerms = permissions.filter(p => p.category === category);
                const isFullySelected = isCategoryFullySelected(category);
                const isPartiallySelected = isCategoryPartiallySelected(category);
                
                return (
                  <div key={category} className="border border-[var(--color-border)] rounded-lg overflow-hidden">
                    {/* Category Header */}
                    <div className="px-4 py-3 bg-[var(--color-background)] border-b border-[var(--color-border)] flex items-center justify-between">
                      <h3 className="text-[var(--color-text-primary)]">{category}</h3>
                      <button
                        onClick={() => handleSelectAll(category)}
                        className="text-sm text-[var(--color-primary-blue)] hover:underline"
                      >
                        {isFullySelected ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    {/* Category Permissions */}
                    <div className="divide-y divide-[var(--color-border)]">
                      {categoryPerms.map(permission => {
                        const isChecked = isPermissionChecked(permission.id);
                        
                        return (
                          <label
                            key={permission.id}
                            className="flex items-start gap-4 p-4 hover:bg-[var(--color-background)] cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handlePermissionToggle(permission.id)}
                              className="mt-1 w-4 h-4 text-[var(--color-primary-blue)] border-[var(--color-border)] rounded focus:ring-2 focus:ring-[var(--color-primary-blue)] cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className={`mb-1 ${
                                isChecked
                                  ? 'text-[var(--color-text-primary)]'
                                  : 'text-[var(--color-text-secondary)]'
                              }`}>
                                {permission.name}
                              </div>
                              <div className="text-xs text-[var(--color-text-secondary)]">
                                {permission.description}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save Button Footer */}
            <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-between">
              <div className="text-sm text-[var(--color-text-secondary)]">
                {hasChanges ? (
                  <span className="text-yellow-600">• Unsaved changes</span>
                ) : (
                  <span className="text-green-600">✓ All changes saved</span>
                )}
              </div>
              <button
                onClick={handleSaveChanges}
                disabled={!hasChanges}
                className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue-hover)] text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-blue-900 mb-1">Role-Based Access Control</h4>
            <p className="text-sm text-blue-800">
              Select a role from the left panel to view and modify its permissions. Changes are not applied until you click "Save Changes". Each permission controls access to specific system features and operations. Administrator role has full system access by default.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
