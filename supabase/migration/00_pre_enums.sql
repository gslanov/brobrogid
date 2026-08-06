-- Enum extensions required by JSON data. PG16 forbids using a value added by
-- ALTER TYPE ... ADD VALUE inside the same transaction, so these run autocommit
-- BEFORE the single-transaction merge. Additive + idempotent.
ALTER TYPE poi_category   ADD VALUE IF NOT EXISTS 'museums';
ALTER TYPE poi_category   ADD VALUE IF NOT EXISTS 'tours';
ALTER TYPE transport_type ADD VALUE IF NOT EXISTS 'tram';
ALTER TYPE cuisine_type   ADD VALUE IF NOT EXISTS 'italian';
