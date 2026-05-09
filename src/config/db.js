const { Pool } = require('pg');

const getMissingDbEnvVars = () => {
    const requiredVars = ['DATABASE_URL'];

    return requiredVars.filter((envVar) => !process.env[envVar]);
};

const getDbConfig = () => {
    const missingVars = getMissingDbEnvVars();

    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
    }

    const connectionString = process.env.DATABASE_URL;
    const isLocalDatabase = connectionString.includes('localhost')
        || connectionString.includes('127.0.0.1')
        || connectionString.includes('parksecure-db');
    const shouldUseSsl = process.env.DATABASE_SSL === 'true'
        || (process.env.NODE_ENV === 'production' && !isLocalDatabase);

    return {
        connectionString,
        ssl: shouldUseSsl
            ? { rejectUnauthorized: false }
            : false
    };
};

let pool;

const connectToDatabase = async () => {
    if (!pool) {
        pool = new Pool(getDbConfig());
    }

    return pool;
};

const runDbTestQuery = async () => {
    const pool = await connectToDatabase();
    const result = await pool.query('SELECT 1 AS "testValue"');

    return result.rows[0];
};

const query = async (text, params = []) => {
    const pool = await connectToDatabase();

    return pool.query(text, params);
};

module.exports = {
    getDbConfig,
    getMissingDbEnvVars,
    connectToDatabase,
    runDbTestQuery,
    query
};
