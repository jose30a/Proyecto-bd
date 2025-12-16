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
        'get_all_promotions': 'view_promotions',
        'assign_promotion_to_service': 'edit_promotion',
        'remove_promotion_from_service': 'edit_promotion',

        // View Lists (Read Access)
        'get_all_users': 'view_users',
        'get_all_packages': 'view_packages',
        'get_package_details': 'view_packages',
        'get_all_airlines': 'view_airlines',
        'get_airline_by_id': 'view_airlines',

        // Package Editing
        'add_item_to_package': 'edit_package',
        'remove_item_from_package': 'edit_package',

        // Reports & Analytics
        'get_dashboard_stats': 'view_analytics',
        'get_negative_reviews': 'view_reports',
        'get_exchange_rates_history': 'view_reports',
        'get_operator_performance': 'view_reports',
        'get_refunds_audit': 'view_reports',
        'get_customer_age_distribution': 'view_reports',
        'get_customer_average_age': 'view_reports',

        // System Administration
        'assign_privilege_to_role': 'manage_roles',
        'remove_privilege_from_role': 'manage_roles',
        // 'upsert_airline' and 'delete_airline' are already defined above with specific privileges
    };

    const requiredPrivilege = privilegeMap[procedureName];

    // If no privilege required for this procedure, allow it
    if (!requiredPrivilege) {
        console.log(`[PRIV_CHECK] ALLOWED: No privilege required for ${procedureName}`);
        return { allowed: true };
    }

    try {
        console.log(`[PRIV_CHECK] Checking ${procedureName} (requires ${requiredPrivilege}) for User ${userId}`);
        const result = await pool.query(
            'SELECT user_has_privilege($1, $2) as has_privilege',
            [userId, requiredPrivilege]
        );

        const hasPrivilege = result.rows[0]?.has_privilege;
        console.log(`[PRIV_CHECK] DB Result for User ${userId} / Privilege ${requiredPrivilege}: ${hasPrivilege}`);

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

// Check if a procedure is public (no auth required)
function isPublicProcedure(procedureName) {
    const publicProcedures = [
        'authenticate_user',
        'register_user',
        'email_exists',
        'get_all_roles' // Needed for registration UI
    ];
    return publicProcedures.includes(procedureName);
}

module.exports = { checkProcedurePrivilege, isPublicProcedure };
