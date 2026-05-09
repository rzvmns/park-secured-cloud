const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const { getMissingDbEnvVars } = require('./config/db');

const PORT = Number(process.env.PORT) || 3000;

const startServer = () => {
    const missingDbEnvVars = getMissingDbEnvVars();

    if (missingDbEnvVars.length > 0) {
        console.warn(`Missing DB environment variables: ${missingDbEnvVars.join(', ')}`);
        console.warn('Set these values in .env, then call GET /api/db-test to verify PostgreSQL connectivity.');
    }

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();
