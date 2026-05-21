BEGIN;

DELETE FROM access_events
WHERE source = 'demo-seed';

DELETE FROM smartphones
WHERE device_identifier IN (
    'demo-android-ana-001',
    'demo-android-mihai-002',
    'demo-ios-elena-003',
    'demo-android-sorin-004'
);

DELETE FROM accounts
WHERE email IN (
    'hr.demo@parksecure.local',
    'manager.demo@parksecure.local',
    'operator.demo@parksecure.local',
    'viewer.demo@parksecure.local'
);

DELETE FROM employees
WHERE cnp IN (
    '2990101000001',
    '1990202000002',
    '2990303000003',
    '1990404000004'
);

DELETE FROM divisions d
WHERE d.name IN ('Demo Security', 'Demo Logistics')
  AND NOT EXISTS (
      SELECT 1
      FROM employees e
      WHERE e.division_id = d.division_id
  );

COMMIT;
