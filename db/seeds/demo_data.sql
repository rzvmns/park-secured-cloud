BEGIN;

DELETE FROM access_events
WHERE source = 'demo-seed';

WITH inserted_divisions AS (
    INSERT INTO divisions (name)
    VALUES
        ('Demo Security'),
        ('Demo Logistics')
    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
    RETURNING division_id, name
),
demo_divisions AS (
    SELECT division_id, name FROM inserted_divisions
    UNION
    SELECT division_id, name
    FROM divisions
    WHERE name IN ('Demo Security', 'Demo Logistics')
),
demo_accounts AS (
    SELECT account_id, email
    FROM accounts
    WHERE email IN ('admin@parksecure.local', 'hr.demo@parksecure.local')
),
insert_hr AS (
    INSERT INTO accounts (email, password_hash, role, division_id, employee_id, is_active)
    VALUES (
        'hr.demo@parksecure.local',
        '$2b$10$2rQU5Drt6QyImytbWglMQ.opIMPH36dK7bpRSO5g87dWzRHLtJB.m',
        'hr',
        NULL,
        NULL,
        TRUE
    )
    ON CONFLICT (email) DO UPDATE SET
        role = EXCLUDED.role,
        division_id = NULL,
        employee_id = NULL,
        is_active = TRUE
    RETURNING account_id, email
),
admin_account AS (
    SELECT account_id
    FROM accounts
    WHERE email = 'admin@parksecure.local'
),
upsert_employees AS (
    INSERT INTO employees (
        first_name, last_name, cnp, photo_url, badge_code, division_id,
        bluetooth_code, car_number, access_start_time, access_end_time,
        is_active, granted_by_account_id
    )
    VALUES
        (
            'Ana',
            'Popescu',
            '2990101000001',
            'https://example.com/demo/ana-popescu.jpg',
            'DEMO-BADGE-001',
            (SELECT division_id FROM demo_divisions WHERE name = 'Demo Security'),
            'BT-DEMO-ANA-001',
            'TM01ANA',
            '08:00',
            '18:00',
            TRUE,
            (SELECT account_id FROM admin_account)
        ),
        (
            'Mihai',
            'Ionescu',
            '1990202000002',
            'https://example.com/demo/mihai-ionescu.jpg',
            'DEMO-BADGE-002',
            (SELECT division_id FROM demo_divisions WHERE name = 'Demo Security'),
            'BT-DEMO-MIHAI-002',
            'TM02MIH',
            '09:00',
            '17:00',
            TRUE,
            (SELECT account_id FROM admin_account)
        ),
        (
            'Elena',
            'Dumitru',
            '2990303000003',
            'https://example.com/demo/elena-dumitru.jpg',
            'DEMO-BADGE-003',
            (SELECT division_id FROM demo_divisions WHERE name = 'Demo Logistics'),
            'BT-DEMO-ELENA-003',
            'TM03ELE',
            NULL,
            NULL,
            TRUE,
            (SELECT account_id FROM admin_account)
        ),
        (
            'Sorin',
            'Marin',
            '1990404000004',
            'https://example.com/demo/sorin-marin.jpg',
            'DEMO-BADGE-004',
            (SELECT division_id FROM demo_divisions WHERE name = 'Demo Logistics'),
            'BT-DEMO-SORIN-004',
            'TM04SOR',
            '07:00',
            '19:00',
            FALSE,
            (SELECT account_id FROM admin_account)
        )
    ON CONFLICT (cnp) DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        photo_url = EXCLUDED.photo_url,
        badge_code = EXCLUDED.badge_code,
        division_id = EXCLUDED.division_id,
        bluetooth_code = EXCLUDED.bluetooth_code,
        car_number = EXCLUDED.car_number,
        access_start_time = EXCLUDED.access_start_time,
        access_end_time = EXCLUDED.access_end_time,
        is_active = EXCLUDED.is_active,
        granted_by_account_id = EXCLUDED.granted_by_account_id,
        updated_at = NOW()
    RETURNING employee_id, cnp, division_id
),
demo_employees AS (
    SELECT employee_id, cnp, division_id FROM upsert_employees
    UNION
    SELECT employee_id, cnp, division_id
    FROM employees
    WHERE cnp IN ('2990101000001', '1990202000002', '2990303000003', '1990404000004')
),
upsert_manager AS (
    INSERT INTO accounts (email, password_hash, role, division_id, employee_id, is_active)
    VALUES (
        'manager.demo@parksecure.local',
        '$2b$10$2rQU5Drt6QyImytbWglMQ.opIMPH36dK7bpRSO5g87dWzRHLtJB.m',
        'division_manager',
        (SELECT division_id FROM demo_divisions WHERE name = 'Demo Security'),
        (SELECT employee_id FROM demo_employees WHERE cnp = '2990101000001'),
        TRUE
    )
    ON CONFLICT (email) DO UPDATE SET
        role = EXCLUDED.role,
        division_id = EXCLUDED.division_id,
        employee_id = EXCLUDED.employee_id,
        is_active = TRUE
    RETURNING account_id
),
upsert_operator AS (
    INSERT INTO accounts (email, password_hash, role, division_id, employee_id, is_active)
    VALUES (
        'operator.demo@parksecure.local',
        '$2b$10$2rQU5Drt6QyImytbWglMQ.opIMPH36dK7bpRSO5g87dWzRHLtJB.m',
        'operator',
        (SELECT division_id FROM demo_divisions WHERE name = 'Demo Security'),
        (SELECT employee_id FROM demo_employees WHERE cnp = '1990202000002'),
        TRUE
    )
    ON CONFLICT (email) DO UPDATE SET
        role = EXCLUDED.role,
        division_id = EXCLUDED.division_id,
        employee_id = EXCLUDED.employee_id,
        is_active = TRUE
    RETURNING account_id
),
upsert_viewer AS (
    INSERT INTO accounts (email, password_hash, role, division_id, employee_id, is_active)
    VALUES (
        'viewer.demo@parksecure.local',
        '$2b$10$2rQU5Drt6QyImytbWglMQ.opIMPH36dK7bpRSO5g87dWzRHLtJB.m',
        'viewer',
        (SELECT division_id FROM demo_divisions WHERE name = 'Demo Logistics'),
        (SELECT employee_id FROM demo_employees WHERE cnp = '2990303000003'),
        TRUE
    )
    ON CONFLICT (email) DO UPDATE SET
        role = EXCLUDED.role,
        division_id = EXCLUDED.division_id,
        employee_id = EXCLUDED.employee_id,
        is_active = TRUE
    RETURNING account_id
),
upsert_smartphones AS (
    INSERT INTO smartphones (employee_id, platform, device_identifier, access_seed, is_trusted)
    VALUES
        (
            (SELECT employee_id FROM demo_employees WHERE cnp = '2990101000001'),
            'android',
            'demo-android-ana-001',
            'DEMOSEEDANA000000000000000000000000000000000000000000000000001',
            TRUE
        ),
        (
            (SELECT employee_id FROM demo_employees WHERE cnp = '1990202000002'),
            'android',
            'demo-android-mihai-002',
            'DEMOSEEDMIHAI000000000000000000000000000000000000000000000002',
            TRUE
        ),
        (
            (SELECT employee_id FROM demo_employees WHERE cnp = '2990303000003'),
            'ios',
            'demo-ios-elena-003',
            'DEMOSEEDELENA000000000000000000000000000000000000000000000003',
            FALSE
        ),
        (
            (SELECT employee_id FROM demo_employees WHERE cnp = '1990404000004'),
            'android',
            'demo-android-sorin-004',
            'DEMOSEEDSORIN000000000000000000000000000000000000000000000004',
            TRUE
        )
    ON CONFLICT (employee_id) DO UPDATE SET
        platform = EXCLUDED.platform,
        device_identifier = EXCLUDED.device_identifier,
        access_seed = EXCLUDED.access_seed,
        is_trusted = EXCLUDED.is_trusted,
        registered_at = NOW()
    RETURNING smartphone_id, employee_id
),
demo_smartphones AS (
    SELECT smartphone_id, employee_id FROM upsert_smartphones
    UNION
    SELECT smartphone_id, employee_id
    FROM smartphones
    WHERE device_identifier IN (
        'demo-android-ana-001',
        'demo-android-mihai-002',
        'demo-ios-elena-003',
        'demo-android-sorin-004'
    )
)
INSERT INTO access_events (
    employee_id, smartphone_id, event_type, event_status, event_time,
    gate_code, source, notes
)
VALUES
    (
        (SELECT employee_id FROM demo_employees WHERE cnp = '2990101000001'),
        (SELECT smartphone_id FROM demo_smartphones WHERE employee_id = (SELECT employee_id FROM demo_employees WHERE cnp = '2990101000001')),
        'ENTRY',
        'ALLOWED',
        NOW() - INTERVAL '3 hours',
        'GATE-DEMO-01',
        'demo-seed',
        'Demo allowed entry'
    ),
    (
        (SELECT employee_id FROM demo_employees WHERE cnp = '2990101000001'),
        (SELECT smartphone_id FROM demo_smartphones WHERE employee_id = (SELECT employee_id FROM demo_employees WHERE cnp = '2990101000001')),
        'EXIT',
        'ALLOWED',
        NOW() - INTERVAL '2 hours',
        'GATE-DEMO-01',
        'demo-seed',
        'Demo allowed exit'
    ),
    (
        (SELECT employee_id FROM demo_employees WHERE cnp = '2990303000003'),
        (SELECT smartphone_id FROM demo_smartphones WHERE employee_id = (SELECT employee_id FROM demo_employees WHERE cnp = '2990303000003')),
        'ENTRY',
        'DENIED',
        NOW() - INTERVAL '1 hour',
        'GATE-DEMO-02',
        'demo-seed',
        'Demo denied untrusted smartphone'
    ),
    (
        (SELECT employee_id FROM demo_employees WHERE cnp = '1990404000004'),
        (SELECT smartphone_id FROM demo_smartphones WHERE employee_id = (SELECT employee_id FROM demo_employees WHERE cnp = '1990404000004')),
        'ENTRY',
        'DENIED',
        NOW() - INTERVAL '30 minutes',
        'GATE-DEMO-02',
        'demo-seed',
        'Demo denied inactive employee'
    );

COMMIT;
