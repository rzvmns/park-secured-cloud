const ROLES = {
    ADMIN: 'admin',
    DIVISION_MANAGER: 'division_manager',
    OPERATOR: 'operator',
    VIEWER: 'viewer'
};

const WRITE_ROLES = [ROLES.ADMIN, ROLES.DIVISION_MANAGER, ROLES.OPERATOR];

module.exports = {
    ROLES,
    WRITE_ROLES
};
