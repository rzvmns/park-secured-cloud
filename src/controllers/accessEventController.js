const accessEventService = require('../services/accessEventService');

const createAccessEvent = async (req, res) => {
    const { employeeId } = req.body;

    if (!employeeId) {
        return res.status(400).json({
            success: false,
            message: 'employeeId is required'
        });
    }

    try {
        const event = await accessEventService.createAccessEvent(req.body);

        return res.status(201).json({
            success: true,
            data: event
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Could not create access event',
            error: error.message
        });
    }
};

const getAccessEvents = async (req, res) => {
    try {
        const events = await accessEventService.getAccessEvents(req.query, req.user);

        return res.status(200).json({
            success: true,
            data: events
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Could not fetch access events',
            error: error.message
        });
    }
};

module.exports = {
    createAccessEvent,
    getAccessEvents
};
