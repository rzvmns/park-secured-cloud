const userService = require('../services/userService');
const { sendControllerError } = require('../utils/apiErrors');
const { ROLES, HR_MANAGED_USER_ROLES } = require('../utils/roles');

const getAllowedRolesMessage = () => `role must be one of: ${Object.values(ROLES).join(', ')}`;

const isPrivilegedRole = (role) => role === ROLES.ADMIN || role === ROLES.HR;
const roleRequiresDivision = (role) => HR_MANAGED_USER_ROLES.includes(role);

const validateUserPayload = (payload, actor, isUpdate = false) => {
    const { email, password, role, divisionId, employeeId, isActive } = payload;

    if (!isUpdate && (!email || !password || !role)) {
        return 'email, password and role are required';
    }

    if (role !== undefined && !Object.values(ROLES).includes(role)) {
        return getAllowedRolesMessage();
    }

    if (actor.role === ROLES.HR && role !== undefined && !HR_MANAGED_USER_ROLES.includes(role)) {
        return 'hr can create or modify only division_manager, operator or viewer accounts';
    }

    if (role !== undefined && roleRequiresDivision(role) && !divisionId && !isUpdate) {
        return 'divisionId is required for division_manager, operator and viewer accounts';
    }

    if (isActive !== undefined && typeof isActive !== 'boolean') {
        return 'isActive must be a boolean';
    }

    if (employeeId !== undefined && employeeId !== null && (!Number.isInteger(Number(employeeId)) || Number(employeeId) <= 0)) {
        return 'employeeId must be a valid employee id';
    }

    return null;
};

const getUsers = async (req, res) => {
    try {
        const accounts = await userService.getUsers(req.user);

        return res.status(200).json({
            success: true,
            data: accounts
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Could not fetch accounts',
            error: error.message
        });
    }
};

const createUser = async (req, res) => {
    const validationError = validateUserPayload(req.body, req.user);

    if (validationError) {
        return res.status(400).json({
            success: false,
            message: validationError
        });
    }

    try {
        const account = await userService.createUser(req.body);

        return res.status(201).json({
            success: true,
            data: account
        });
    } catch (error) {
        return sendControllerError(res, error, 'Could not create user');
    }
};

const updateUser = async (req, res) => {
    const accountId = Number(req.params.id);

    if (!Number.isInteger(accountId) || accountId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Valid account id is required'
        });
    }

    const existingUser = await userService.getUserById(accountId);

    if (!existingUser) {
        return res.status(404).json({
            success: false,
            message: 'Account not found'
        });
    }

    if (req.user.role === ROLES.HR && isPrivilegedRole(existingUser.role)) {
        return res.status(403).json({
            success: false,
            message: 'hr cannot modify admin or hr accounts'
        });
    }

    const validationError = validateUserPayload(req.body, req.user, true);

    if (validationError) {
        return res.status(400).json({
            success: false,
            message: validationError
        });
    }

    const nextRole = req.body.role !== undefined ? req.body.role : existingUser.role;
    const nextDivisionId = req.body.divisionId !== undefined ? req.body.divisionId : existingUser.divisionId;

    if (roleRequiresDivision(nextRole) && !nextDivisionId) {
        return res.status(400).json({
            success: false,
            message: 'divisionId is required for division_manager, operator and viewer accounts'
        });
    }

    try {
        const account = await userService.updateUser(accountId, req.body);

        return res.status(200).json({
            success: true,
            data: account
        });
    } catch (error) {
        return sendControllerError(res, error, 'Could not update user');
    }
};

const deleteUser = async (req, res) => {
    const accountId = Number(req.params.id);

    if (!Number.isInteger(accountId) || accountId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Valid account id is required'
        });
    }

    if (req.user.accountId === accountId) {
        return res.status(400).json({
            success: false,
            message: 'Admin cannot delete the currently authenticated account'
        });
    }

    try {
        const account = await userService.deleteUser(accountId);

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: account
        });
    } catch (error) {
        return sendControllerError(res, error, 'Could not delete user');
    }
};

module.exports = {
    getUsers,
    createUser,
    updateUser,
    deleteUser
};
