ALTER TABLE home_banners
  ADD COLUMN IF NOT EXISTS posted_at timestamptz;

ALTER TABLE home_banners
  ADD COLUMN IF NOT EXISTS link text;

UPDATE home_banners
SET posted_at = created_at
WHERE posted_at IS NULL;
