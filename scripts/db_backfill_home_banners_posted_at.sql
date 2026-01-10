ALTER TABLE home_banners
  ADD COLUMN IF NOT EXISTS posted_at timestamptz;

ALTER TABLE home_banners
  ADD COLUMN IF NOT EXISTS link text;

ALTER TABLE home_banners
  ADD COLUMN IF NOT EXISTS show_in_carousel boolean;

ALTER TABLE home_banners
  ADD COLUMN IF NOT EXISTS image_url text;

UPDATE home_banners
SET posted_at = created_at
WHERE posted_at IS NULL;

UPDATE home_banners
SET show_in_carousel = true
WHERE show_in_carousel IS NULL;
