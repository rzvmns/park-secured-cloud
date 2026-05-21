DO $$
DECLARE
    target_table TEXT;
BEGIN
    SELECT CASE
        WHEN to_regclass('public.accounts') IS NOT NULL THEN 'accounts'
        ELSE 'users'
    END
    INTO target_table;

    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS employee_id INTEGER', target_table);
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS users_employee_id_fkey', target_table);
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS fk_accounts_employees', target_table);
    EXECUTE format(
        'ALTER TABLE %I ADD CONSTRAINT fk_accounts_employees FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL',
        target_table
    );
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I(employee_id)', 'idx_' || target_table || '_employee_id', target_table);
END $$;
