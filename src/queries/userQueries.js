const userQueries = {
    getByEmail: `
    SELECT userId, email, passwordHash, role, isActive, createdAt
    FROM Users
    WHERE email = $1;
  `,
    create: `
    INSERT INTO Users (email, passwordHash, role, isActive)
    VALUES ($1, $2, $3, $4)
    RETURNING userId;
  `
};

module.exports = userQueries;
