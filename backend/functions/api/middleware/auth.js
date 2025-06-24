const getCurrentUser = (event) => {
    return {
        id: '123e4567-e89b-12d3-a456-426614174000',
        tenantId: '123e4567-e89b-12d3-a456-426614174001',
        email: 'patient@example.com',
        role: 'patient'
    };
};

const getTenantContext = (event) => {
    const user = getCurrentUser(event);
    return {
        tenantId: user.tenantId,
        userId: user.id
    };
};

module.exports = {
    getCurrentUser,
    getTenantContext
};
