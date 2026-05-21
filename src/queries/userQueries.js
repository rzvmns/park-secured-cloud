const userQueries = {
    getByEmail: `
    SELECT account_id, email, password_hash, role, is_active, created_at
    FROM accounts
    WHERE email = $1;
  `,
    create: `
    INSERT INTO accounts (email, password_hash, role, is_active)
    VALUES ($1, $2, $3, $4)
    RETURNING account_id;
  `
};

module.exports = userQueries;
