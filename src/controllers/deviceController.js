const deviceService = require('../services/deviceService');

const registerDevice = async (req, res) => {
    const { employeeId, platform, deviceIdentifier } = req.body;

    if (!employeeId || !platform || !deviceIdentifier) {
        return res.status(400).json({
            success: false,
            message: 'employeeId, platform and deviceIdentifier are required'
        });
    }

    try {
        const device = await deviceService.registerDevice(req.body, req.user);

        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }

        return res.status(201).json({
            success: true,
            data: device
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Could not register device',
            error: error.message
        });
    }
};

const getDeviceByEmployeeId = async (req, res) => {
    try {
        const device = await deviceService.getDeviceByEmployeeId(Number(req.params.employeeId), req.user);

        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: device
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Could not fetch device',
            error: error.message
        });
    }
};

module.exports = {
    registerDevice,
    getDeviceByEmployeeId
};
