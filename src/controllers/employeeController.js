const employeeService = require('../services/employeeService');
const { sendControllerError } = require('../utils/apiErrors');

const getEmployees = async (req, res) => {
    try {
        const employees = await employeeService.getEmployees(req.user);

        return res.status(200).json({
            success: true,
            data: employees
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Could not fetch employees',
            error: error.message
        });
    }
};

const getEmployeeById = async (req, res) => {
    try {
        const employee = await employeeService.getEmployeeById(Number(req.params.id), req.user);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Could not fetch employee',
            error: error.message
        });
    }
};

const createEmployee = async (req, res) => {
    const { firstName, lastName, cnp, divisionId } = req.body;

    if (!firstName || !lastName || !cnp || (!divisionId && req.user.role === 'admin')) {
        return res.status(400).json({
            success: false,
            message: 'firstName, lastName, cnp and divisionId are required'
        });
    }

    try {
        const employee = await employeeService.createEmployee(req.body, req.user);

        return res.status(201).json({
            success: true,
            data: employee
        });
    } catch (error) {
        return sendControllerError(res, error, 'Could not create employee');
    }
};

const updateEmployee = async (req, res) => {
    try {
        const employee = await employeeService.updateEmployee(Number(req.params.id), req.body, req.user);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        return sendControllerError(res, error, 'Could not update employee');
    }
};

const toggleEmployeeAccess = async (req, res) => {
    if (typeof req.body.isActive !== 'boolean') {
        return res.status(400).json({
            success: false,
            message: 'isActive boolean is required'
        });
    }

    try {
        const employee = await employeeService.toggleEmployeeAccess(Number(req.params.id), req.body.isActive, req.user);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Could not toggle employee access',
            error: error.message
        });
    }
};

module.exports = {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    toggleEmployeeAccess
};
