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

module.exports = {
    getGateAccessList
};
