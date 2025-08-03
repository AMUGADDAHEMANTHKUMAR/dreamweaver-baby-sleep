-- Add missing custom_activity_name column to activity_logs table
ALTER TABLE public.activity_logs ADD COLUMN custom_activity_name text;

-- Make start_time nullable since not all activity types need it (feeding, diaper changes, custom activities typically happen instantly)
ALTER TABLE public.activity_logs ALTER COLUMN start_time DROP NOT NULL;