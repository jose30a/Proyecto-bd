// Helper to check if an ID parameter is present/valid
function isIdPresent(param) {
    if (param === null || param === undefined) return false;
    if (typeof param === 'object' && 'value' in param) {
        return param.value !== null && param.value !== undefined && param.value !== 0;
    }
    return !!param;
}

// Privilege verification helper function
async function checkProcedurePrivilege(procedureName, params, userId, pool) {
    // Map procedures to required privileges
    const privilegeMap = {
        // Packages
        'upsert_package': isIdPresent(params[0]) ? 'edit_package' : 'create_package',
        'delete_package': 'delete_package',

        // Airlines  
        'upsert_airline': isIdPresent(params[0]) ? 'edit_airline' : 'create_airline',
        'delete_airline': 'delete_airline',

        // Users
        'register_user': 'create_user',
        'update_user_role': 'edit_user',
        'update_user_details': 'edit_user',

        // Promotions
        'upsert_promotion': isIdPresent(params[0]) ? 'edit_promotion' : 'create_promotion',
        'delete_promotion': 'delete_promotion',
    };

    const requiredPrivilege = privilegeMap[procedureName];

    // If no privilege required for this procedure, allow it
    if (!requiredPrivilege) {
        return { allowed: true };
    }

    try {
        const result = await pool.query(
            'SELECT user_has_privilege($1, $2) as has_privilege',
            [userId, requiredPrivilege]
        );

        const hasPrivilege = result.rows[0]?.has_privilege;

        if (!hasPrivilege) {
            console.log(`[PERMISSION DENIED] User ${userId} attempted ${procedureName} without ${requiredPrivilege}`);
            return {
                allowed: false,
                error: `Acceso denegado. Se requiere el privilegio: ${requiredPrivilege}`,
                requiredPrivilege: requiredPrivilege
            };
        }

        console.log(`[PERMISSION GRANTED] User ${userId} has ${requiredPrivilege} for ${procedureName}`);
        return { allowed: true };
    } catch (error) {
        console.error('Error checking privilege:', error);
        return {
            allowed: false,
            error: 'Error verificando permisos'
        };
    }
}

module.exports = { checkProcedurePrivilege };
