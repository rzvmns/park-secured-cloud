const userService = require('../services/userService');
const { sendControllerError } = require('../utils/apiErrors');
const { ROLES } = require('../utils/roles');

const getUsers = async (req, res) => {
    try {
        const users = await userService.getUsers();

        return res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Could not fetch users',
            error: error.message
        });
    }
};

const createUser = async (req, res) => {
    const { email, password, role, divisionId, isActive } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({
            success: false,
            message: 'email, password and role are required'
        });
    }

    if (!Object.values(ROLES).includes(role)) {
        return res.status(400).json({
            success: false,
            message: 'role must be one of: admin, division_manager, operator, viewer'
        });
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
        return res.status(400).json({
            success: false,
            message: 'isActive must be a boolean'
        });
    }

    try {
        const user = await userService.createUser({ email, password, role, divisionId, isActive });

        return res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        return sendControllerError(res, error, 'Could not create user');
    }
};

module.exports = {
    getUsers,
    createUser
};
