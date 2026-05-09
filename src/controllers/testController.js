const { runDbTestQuery } = require('../config/db');

const testDatabaseConnection = async (req, res) => {
    try {
        const queryResult = await runDbTestQuery();

        return res.status(200).json({
            success: true,
            message: 'PostgreSQL connection successful.',
            result: queryResult
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Could not connect to PostgreSQL database.',
            error: error.message
        });
    }
};

module.exports = {
    testDatabaseConnection
};
