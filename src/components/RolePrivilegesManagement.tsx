import { useState, useEffect } from 'react';
import { getAllRoles } from '../services/database';
import {
    getAllPrivileges,
    getRolePrivileges,
    assignPrivilegeToRole,
    removePrivilegeFromRole,
    Privilege,
} from '../services/privileges';
import { Shield, Check, Save, AlertCircle } from 'lucide-react';

interface RoleOption {
    cod: number;
    nombre_rol: string;
}

export function RolePrivilegesManagement() {
    const [roles, setRoles] = useState<RoleOption[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
    const [allPrivileges, setAllPrivileges] = useState<Privilege[]>([]);
    const [assignedPrivileges, setAssignedPrivileges] = useState<Set<number>>(new Set());
    const [pendingChanges, setPendingChanges] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Load roles and all privileges on mount
    useEffect(() => {
        loadRoles();
        loadAllPrivileges();
    }, []);

    // Load assigned privileges when role changes
    useEffect(() => {
        if (selectedRoleId !== null) {
            loadRolePrivileges(selectedRoleId);
        }
    }, [selectedRoleId]);

    const loadRoles = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/function/get_all_roles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ params: [] }),
            });

            const data = await response.json();
            if (data.success && data.data) {
                const rolesData = data.data.map((r: any) => ({
                    cod: r.p_cod,
                    nombre_rol: r.p_nombre_rol,
                }));
                setRoles(rolesData);

                // Auto-select first role
                if (rolesData.length > 0) {
                    setSelectedRoleId(rolesData[0].cod);
                }
            }
        } catch (error) {
            console.error('Error loading roles:', error);
        }
    };

    const loadAllPrivileges = async () => {
        setIsLoading(true);
        try {
            const privileges = await getAllPrivileges();
            setAllPrivileges(privileges);
        } catch (error) {
            console.error('Error loading privileges:', error);
            showMessage('error', 'Error al cargar privilegios');
        } finally {
            setIsLoading(false);
        }
    };

    const loadRolePrivileges = async (roleId: number) => {
        setIsLoading(true);
        try {
            const privileges = await getRolePrivileges(roleId);
            const privilegeIds = new Set(privileges.map(p => p.p_cod));
            setAssignedPrivileges(privilegeIds);
            setPendingChanges(new Set()); // Clear pending changes when switching roles
        } catch (error) {
            console.error('Error loading role privileges:', error);
            showMessage('error', 'Error al cargar privilegios del rol');
        } finally {
            setIsLoading(false);
        }
    };

    const togglePrivilege = (privilegeId: number) => {
        const newAssigned = new Set(assignedPrivileges);
        const newPending = new Set(pendingChanges);

        if (newAssigned.has(privilegeId)) {
            newAssigned.delete(privilegeId);
        } else {
            newAssigned.add(privilegeId);
        }

        newPending.add(privilegeId);

        setAssignedPrivileges(newAssigned);
        setPendingChanges(newPending);
    };

    const handleSaveChanges = async () => {
        if (selectedRoleId === null || pendingChanges.size === 0) return;

        setIsSaving(true);
        try {
            const originalPrivileges = await getRolePrivileges(selectedRoleId);
            const originalIds = new Set(originalPrivileges.map(p => p.p_cod));

            // Process each changed privilege
            for (const privilegeId of pendingChanges) {
                const isCurrentlyAssigned = assignedPrivileges.has(privilegeId);
                const wasOriginallyAssigned = originalIds.has(privilegeId);

                if (isCurrentlyAssigned && !wasOriginallyAssigned) {
                    // Assign privilege
                    await assignPrivilegeToRole(selectedRoleId, privilegeId);
                } else if (!isCurrentlyAssigned && wasOriginallyAssigned) {
                    // Remove privilege
                    await removePrivilegeFromRole(selectedRoleId, privilegeId);
                }
            }

            setPendingChanges(new Set());
            showMessage('success', 'Privilegios actualizados exitosamente');
        } catch (error: any) {
            console.error('Error saving privileges:', error);
            // Display a more meaningful error message
            const errorMessage = error.message || 'Error al guardar privilegios. Es posible que no tengas los permisos necesarios.';
            showMessage('error', errorMessage);
            // Reload the privileges to reset the UI to the actual state
            if (selectedRoleId !== null) {
                loadRolePrivileges(selectedRoleId);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const selectedRole = roles.find(r => r.cod === selectedRoleId);

    // Group privileges by category
    const privilegesByCategory = {
        'Airline Management': allPrivileges.filter(p => p.p_descripcion_priv.includes('airline')),
        'Package Management': allPrivileges.filter(p => p.p_descripcion_priv.includes('package')),
        'Booking Management': allPrivileges.filter(p => p.p_descripcion_priv.includes('booking')),
        'User Management': allPrivileges.filter(p => p.p_descripcion_priv.includes('user')),
        'Reports & Analytics': allPrivileges.filter(p =>
            p.p_descripcion_priv.includes('report') ||
            p.p_descripcion_priv.includes('analytics') ||
            p.p_descripcion_priv.includes('export')
        ),
        'Promotions': allPrivileges.filter(p => p.p_descripcion_priv.includes('promotion')),
        'System Administration': allPrivileges.filter(p =>
            p.p_descripcion_priv.includes('settings') ||
            p.p_descripcion_priv.includes('roles') ||
            p.p_descripcion_priv.includes('audit')
        ),
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
                    <Shield className="w-7 h-7 text-[var(--color-primary-blue)]" />
                    Gestión de Privilegios por Rol
                </h1>
                <p className="text-[var(--color-text-secondary)]">
                    Asigna privilegios específicos a cada rol del sistema
                </p>
            </div>

            {/* Message Banner */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                    }`}>
                    <AlertCircle className="w-5 h-5" />
                    <span>{message.text}</span>
                </div>
            )}

            {/* Role Selector */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-6 mb-6">
                <label className="block text-[var(--color-text-primary)] mb-3 font-medium">
                    Seleccionar Rol
                </label>
                <select
                    value={selectedRoleId || ''}
                    onChange={(e) => setSelectedRoleId(Number(e.target.value))}
                    className="w-full max-w-md px-4 py-3 bg-[var(--color-input-bg)] border border-[var(--color-border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-blue)] transition-all text-lg"
                >
                    {roles.map(role => (
                        <option key={role.cod} value={role.cod}>
                            {role.nombre_rol}
                        </option>
                    ))}
                </select>
            </div>

            {/* Privileges List */}
            {selectedRoleId && (
                <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-background)]">
                        <h2 className="text-[var(--color-text-primary)] flex items-center gap-2">
                            <Shield className="w-5 h-5 text-[var(--color-primary-blue)]" />
                            Privilegios del Rol: {selectedRole?.nombre_rol}
                        </h2>
                        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                            Selecciona los privilegios que deseas asignar a este rol
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="px-6 py-8 text-center text-[var(--color-text-secondary)]">
                            Cargando privilegios...
                        </div>
                    ) : (
                        <div className="p-6">
                            {Object.entries(privilegesByCategory).map(([category, privileges]) => {
                                if (privileges.length === 0) return null;

                                return (
                                    <div key={category} className="mb-6 last:mb-0">
                                        <h3 className="text-[var(--color-text-primary)] font-medium mb-3 pb-2 border-b border-[var(--color-border)]">
                                            {category}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {privileges.map(privilege => {
                                                const isAssigned = assignedPrivileges.has(privilege.p_cod);
                                                const isPending = pendingChanges.has(privilege.p_cod);

                                                return (
                                                    <label
                                                        key={privilege.p_cod}
                                                        className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${isAssigned
                                                            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                                                            : 'bg-[var(--color-background)] border-[var(--color-border)] hover:bg-gray-50'
                                                            } ${isPending ? 'ring-2 ring-yellow-300' : ''
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isAssigned}
                                                            onChange={() => togglePrivilege(privilege.p_cod)}
                                                            className="w-5 h-5 text-[var(--color-primary-blue)] rounded focus:ring-2 focus:ring-[var(--color-primary-blue)]"
                                                        />
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-sm ${isAssigned
                                                                    ? 'text-blue-800 font-medium'
                                                                    : 'text-[var(--color-text-primary)]'
                                                                    }`}>
                                                                    {privilege.p_descripcion_priv}
                                                                </span>
                                                                {isAssigned && (
                                                                    <Check className="w-4 h-4 text-blue-600" />
                                                                )}
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
                    )}

                    {/* Save Button */}
                    {pendingChanges.size > 0 && (
                        <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-background)] flex items-center justify-between">
                            <div className="text-sm text-[var(--color-text-secondary)]">
                                {pendingChanges.size} cambio(s) pendiente(s)
                            </div>
                            <button
                                onClick={handleSaveChanges}
                                disabled={isSaving}
                                className="px-6 py-2.5 bg-[var(--color-primary-blue)] hover:bg-[var(--color-primary-blue-hover)] text-white rounded-md transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="w-5 h-5" />
                                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
