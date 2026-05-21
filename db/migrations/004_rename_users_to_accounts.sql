DO $$
DECLARE
    role_constraint TEXT;
BEGIN
    IF to_regclass('public.users') IS NOT NULL AND to_regclass('public.accounts') IS NULL THEN
        ALTER TABLE users RENAME TO accounts;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'accounts'
          AND column_name = 'user_id'
    ) THEN
        ALTER TABLE accounts RENAME COLUMN user_id TO account_id;
    END IF;

    IF to_regclass('public.users_user_id_seq') IS NOT NULL AND to_regclass('public.accounts_account_id_seq') IS NULL THEN
        ALTER SEQUENCE users_user_id_seq RENAME TO accounts_account_id_seq;
    END IF;

    IF to_regclass('public.users_pkey') IS NOT NULL AND to_regclass('public.accounts_pkey') IS NULL THEN
        ALTER INDEX users_pkey RENAME TO accounts_pkey;
    END IF;

    IF to_regclass('public.accounts_account_id_seq') IS NOT NULL THEN
        ALTER TABLE accounts
        ALTER COLUMN account_id SET DEFAULT nextval('accounts_account_id_seq'::regclass);
        ALTER SEQUENCE accounts_account_id_seq OWNED BY accounts.account_id;
    END IF;

    ALTER TABLE accounts
    ADD COLUMN IF NOT EXISTS employee_id INTEGER;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'employees'
          AND column_name = 'granted_by_user_id'
    ) THEN
        ALTER TABLE employees RENAME COLUMN granted_by_user_id TO granted_by_account_id;
    END IF;

    ALTER TABLE accounts DROP CONSTRAINT IF EXISTS users_employee_id_fkey;
    ALTER TABLE accounts DROP CONSTRAINT IF EXISTS fk_accounts_employees;
    ALTER TABLE accounts
    ADD CONSTRAINT fk_accounts_employees
    FOREIGN KEY (employee_id)
    REFERENCES employees(employee_id)
    ON DELETE SET NULL;

    ALTER TABLE accounts DROP CONSTRAINT IF EXISTS uq_account_employee;
    ALTER TABLE accounts
    ADD CONSTRAINT uq_account_employee UNIQUE (employee_id);

    ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_granted_by_user_id_fkey;
    ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_granted_by_account_id_fkey;
    ALTER TABLE employees DROP CONSTRAINT IF EXISTS fk_employees_granted_by_account;
    ALTER TABLE employees
    ADD CONSTRAINT fk_employees_granted_by_account
    FOREIGN KEY (granted_by_account_id)
    REFERENCES accounts(account_id)
    ON DELETE SET NULL;

    SELECT con.conname
    INTO role_constraint
    FROM pg_constraint con
    INNER JOIN pg_class rel ON rel.oid = con.conrelid
    INNER JOIN pg_namespace nsp ON nsp.oid = con.connamespace
    WHERE rel.relname = 'accounts'
      AND nsp.nspname = 'public'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%role%'
    LIMIT 1;

    IF role_constraint IS NOT NULL THEN
        EXECUTE format('ALTER TABLE accounts DROP CONSTRAINT %I', role_constraint);
    END IF;

    ALTER TABLE accounts
    ADD CONSTRAINT accounts_role_check
    CHECK (role IN ('admin', 'hr', 'division_manager', 'operator', 'viewer'));

    CREATE INDEX IF NOT EXISTS idx_accounts_employee_id ON accounts(employee_id);
END $$;
