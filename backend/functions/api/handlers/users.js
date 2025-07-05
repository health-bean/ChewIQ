const { getCurrentUser } = require("../middleware/auth");

const handleGetUser = async (queryParams, event, user = null) => {
    const currentUser = user || await getCurrentUser(event);
    if (!currentUser) {
        return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }
    return { statusCode: 200, body: JSON.stringify({ user: currentUser }) };
};

const handleUpdateUser = async (body, event, user = null) => {
    const currentUser = user || await getCurrentUser(event);
    if (!currentUser) {
        return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }
    return { statusCode: 200, body: JSON.stringify({ message: "Update not implemented" }) };
};

const handleGetUserProtocols = async (queryParams, event, user = null) => {
    const currentUser = user || await getCurrentUser(event);
    if (!currentUser) {
        return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }
    return { statusCode: 200, body: JSON.stringify({ protocols: [] }) };
};

const handleGetUserPreferences = async (queryParams, event, user = null) => {
    const currentUser = user || await getCurrentUser(event);
    if (!currentUser) {
        return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }
    return { statusCode: 200, body: JSON.stringify({ preferences: {} }) };
};

const handleUpdateUserPreferences = async (body, event, user = null) => {
    const currentUser = user || await getCurrentUser(event);
    if (!currentUser) {
        return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }
    return { statusCode: 200, body: JSON.stringify({ message: "Preferences updated" }) };
};

module.exports = {
    handleGetUser,
    handleUpdateUser,
    handleGetUserProtocols,
    handleGetUserPreferences,
    handleUpdateUserPreferences
};
