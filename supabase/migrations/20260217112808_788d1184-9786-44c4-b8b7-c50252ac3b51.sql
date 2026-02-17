
-- Add login_id column to profiles
ALTER TABLE public.profiles ADD COLUMN login_id text UNIQUE;

-- Create index for fast lookup
CREATE INDEX idx_profiles_login_id ON public.profiles (login_id);
