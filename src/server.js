const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const { getMissingDbEnvVars } = require('./config/db');

const PORT = Number(process.env.PORT) || 3000;

const startServer = () => {
    if (!process.env.JWT_SECRET) {
        console.error('Missing required environment variable: JWT_SECRET');
        process.exit(1);
    }

    const missingDbEnvVars = getMissingDbEnvVars();

    if (missingDbEnvVars.length > 0) {
        console.warn(`Missing DB environment variables: ${missingDbEnvVars.join(', ')}`);
        console.warn('Set these values in .env, then call GET /api/db-test to verify PostgreSQL connectivity.');
    }

    if (!process.env.GATE_API_KEY) {
        console.warn('Missing optional environment variable: GATE_API_KEY. Gate access events will require JWT authentication.');
    }

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();
