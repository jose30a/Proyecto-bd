/**
 * Privilege Management Service
 * Handles all API calls related to privileges and role-privilege assignments
 */

const API_BASE_URL = 'http://localhost:3001';

export interface Privilege {
    p_cod: number;
    p_descripcion_priv: string;
}

/**
 * Get all available privileges
 */
export async function getAllPrivileges(): Promise<Privilege[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/privileges`, {
            credentials: 'include',
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch privileges');
        }

        return data.data || [];
    } catch (error) {
        console.error('Error fetching privileges:', error);
        throw error;
    }
}

/**
 * Get privileges assigned to a specific role
 */
export async function getRolePrivileges(roleId: number): Promise<Privilege[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/roles/${roleId}/privileges`, {
            credentials: 'include',
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch role privileges');
        }

        return data.data || [];
    } catch (error) {
        console.error(`Error fetching privileges for role ${roleId}:`, error);
        throw error;
    }
}

/**
 * Assign a privilege to a role
 */
export async function assignPrivilegeToRole(roleId: number, privilegeId: number): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/roles/${roleId}/privileges`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ privilegeId }),
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to assign privilege');
        }
    } catch (error) {
        console.error(`Error assigning privilege ${privilegeId} to role ${roleId}:`, error);
        throw error;
    }
}

/**
 * Remove a privilege from a role
 */
export async function removePrivilegeFromRole(roleId: number, privilegeId: number): Promise<void> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/roles/${roleId}/privileges/${privilegeId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to remove privilege');
        }
    } catch (error) {
        console.error(`Error removing privilege ${privilegeId} from role ${roleId}:`, error);
        throw error;
    }
}
