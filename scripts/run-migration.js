const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const migrationFile = process.argv[2];

if (!migrationFile) {
    console.error('Usage: node scripts/run-migration.js <migration-file>');
    process.exit(1);
}

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required');
    process.exit(1);
}

const migrationPath = path.resolve(process.cwd(), migrationFile);
const sql = fs.readFileSync(migrationPath, 'utf8');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('sslmode=')
        ? undefined
        : { rejectUnauthorized: false }
});

client.on('error', (error) => {
    console.error(error.message);
});

const run = async () => {
    await client.connect();
    await client.query(sql);

    const result = await client.query(`
        SELECT account_id, email, role, division_id, employee_id, is_active
        FROM accounts
        ORDER BY account_id
    `);

    console.table(result.rows);
};

run()
    .catch((error) => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        await client.end().catch(() => {});
    });
