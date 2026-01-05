ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS permissions_manage_home_banners boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS permissions_manage_page_heroes boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS permissions_manage_history_sections boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS permissions_manage_officials boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS permissions_manage_delegates boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS permissions_manage_sectors boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS permissions_manage_council_reports boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS permissions_manage_page_contents boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS permissions_manage_page_texts boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS permissions_manage_school_menus boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS permissions_manage_files boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS permissions_manage_media boolean DEFAULT false;
