ALTER TABLE smartphones
ADD COLUMN IF NOT EXISTS access_seed VARCHAR(64);

UPDATE smartphones
SET access_seed = UPPER(
    md5(random()::text || clock_timestamp()::text || smartphone_id::text)
    || md5(clock_timestamp()::text || random()::text || smartphone_id::text)
)
WHERE access_seed IS NULL;

ALTER TABLE smartphones
ALTER COLUMN access_seed SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_smartphones_access_seed
ON smartphones(access_seed);
