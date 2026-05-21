const jwt = require('jsonwebtoken');

const getTokenFromHeader = (req) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    return authHeader.slice('Bearer '.length);
};

const authenticate = (req, res, next) => {
    const token = getTokenFromHeader(req);

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication token is required'
        });
    }

    try {
        req.account = jwt.verify(token, process.env.JWT_SECRET);
        if (!req.account.accountId && req.account.userId) {
            req.account.accountId = req.account.userId;
            delete req.account.userId;
        }
        req.user = req.account;
        return next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired authentication token'
        });
    }
};

const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        return next();
    };
};

const requireRole = authorize;

const authenticateGateOrUser = (req, res, next) => {
    const gateApiKey = req.headers['x-gate-api-key'];

    if (process.env.GATE_API_KEY && gateApiKey === process.env.GATE_API_KEY) {
        req.gate = true;
        return next();
    }

    return authenticate(req, res, next);
};

const authenticateGate = (req, res, next) => {
    const gateApiKey = req.headers['x-gate-api-key'];

    if (process.env.GATE_API_KEY && gateApiKey === process.env.GATE_API_KEY) {
        req.gate = true;
        return next();
    }

    return res.status(401).json({
        success: false,
        message: 'Valid gate API key is required'
    });
};

module.exports = {
    authenticate,
    authorize,
    requireRole,
    authenticateGateOrUser,
    authenticateGate
};
