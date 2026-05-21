const mobileService = require('../services/mobileService');
const { sendControllerError } = require('../utils/apiErrors');

const loginSecure = async (req, res) => {
    const { email, password, platform, deviceIdentifier } = req.body;

    if (!email || !password || !deviceIdentifier) {
        return res.status(400).json({
            success: false,
            message: 'email, password and deviceIdentifier are required'
        });
    }

    try {
        const result = await mobileService.loginSecure({
            email,
            password,
            platform,
            deviceIdentifier
        });

        if (!result) {
            return res.status(401).json({
                success: false,
                message: 'E-mailul sau parola este incorecta.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Autentificare reusita si sesiune unica activata.',
            accessSeed: result.accessSeed,
            user: result.user
        });
    } catch (error) {
        return sendControllerError(res, error, 'Mobile login failed');
    }
};

const validateAccess = async (req, res) => {
    const { accessSeed } = req.body;

    if (!accessSeed) {
        return res.status(400).json({
            authorized: false,
            message: 'Lipseste accessSeed.'
        });
    }

    try {
        const result = await mobileService.validateAccess({ accessSeed });
        const statusCode = result.authorized ? 200 : 403;

        return res.status(statusCode).json(result);
    } catch (error) {
        return sendControllerError(res, error, 'Could not validate mobile access');
    }
};

module.exports = {
    loginSecure,
    validateAccess
};
