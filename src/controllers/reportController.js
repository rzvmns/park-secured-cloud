const reportService = require('../services/reportService');

const getIndividualReport = async (req, res) => {
    try {
        const report = await reportService.getIndividualReport(Number(req.params.employeeId), req.user);

        return res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Could not generate individual report',
            error: error.message
        });
    }
};

const getDivisionReport = async (req, res) => {
    try {
        const report = await reportService.getDivisionReport(Number(req.params.divisionId), req.user);

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Division report not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Could not generate division report',
            error: error.message
        });
    }
};

const getGlobalReport = async (req, res) => {
    try {
        const report = await reportService.getGlobalReport(req.user);

        return res.status(200).json({
            success: true,
            data: report
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Could not generate global report',
            error: error.message
        });
    }
};

module.exports = {
    getIndividualReport,
    getDivisionReport,
    getGlobalReport
};
