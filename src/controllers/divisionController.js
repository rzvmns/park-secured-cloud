const divisionService = require('../services/divisionService');
const { sendControllerError } = require('../utils/apiErrors');

const getDivisions = async (req, res) => {
    try {
        const divisions = await divisionService.getDivisions();

        return res.status(200).json({
            success: true,
            data: divisions
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Could not fetch divisions',
            error: error.message
        });
    }
};

const createDivision = async (req, res) => {
    if (!req.body.name) {
        return res.status(400).json({
            success: false,
            message: 'name is required'
        });
    }

    try {
        const division = await divisionService.createDivision(req.body);

        return res.status(201).json({
            success: true,
            data: division
        });
    } catch (error) {
        return sendControllerError(res, error, 'Could not create division');
    }
};

module.exports = {
    getDivisions,
    createDivision
};
