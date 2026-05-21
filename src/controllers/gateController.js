const gateService = require('../services/gateService');

const getGateAccessList = async (req, res) => {
    try {
        const accessList = await gateService.getGateAccessList();

        return res.status(200).json({
            success: true,
            data: accessList
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Could not fetch gate access list',
            error: error.message
        });
    }
};

const getGateStatus = async (req, res) => {
    try {
        const status = await gateService.getGateStatus();

        return res.status(200).json({
            success: true,
            data: status
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Could not fetch gate status',
            error: error.message
        });
    }
};

module.exports = {
    getGateAccessList,
    getGateStatus
};
