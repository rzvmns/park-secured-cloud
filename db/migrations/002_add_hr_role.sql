DO $$
DECLARE
    constraint_name TEXT;
    target_table TEXT;
BEGIN
    SELECT CASE
        WHEN to_regclass('public.accounts') IS NOT NULL THEN 'accounts'
        ELSE 'users'
    END
    INTO target_table;

    SELECT con.conname
    INTO constraint_name
    FROM pg_constraint con
    INNER JOIN pg_class rel ON rel.oid = con.conrelid
    INNER JOIN pg_namespace nsp ON nsp.oid = con.connamespace
    WHERE rel.relname = target_table
      AND nsp.nspname = 'public'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%role%';

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE %I DROP CONSTRAINT %I', target_table, constraint_name);
    END IF;

    EXECUTE format(
        'ALTER TABLE %I ADD CONSTRAINT %I CHECK (role IN (''admin'', ''hr'', ''division_manager'', ''operator'', ''viewer''))',
        target_table,
        target_table || '_role_check'
    );
END $$;
