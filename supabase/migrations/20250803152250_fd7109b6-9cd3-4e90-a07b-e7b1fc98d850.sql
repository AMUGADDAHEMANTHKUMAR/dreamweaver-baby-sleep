-- Create table for sleep schedules
CREATE TABLE public.sleep_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  baby_age_months INTEGER NOT NULL,
  current_bedtime TIME NOT NULL,
  current_wake_time TIME NOT NULL,
  nap_habits TEXT NOT NULL,
  sleep_challenges TEXT,
  schedule_data JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sleep_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own sleep schedules" 
ON public.sleep_schedules 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sleep schedules" 
ON public.sleep_schedules 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sleep schedules" 
ON public.sleep_schedules 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sleep schedules" 
ON public.sleep_schedules 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create table for schedule change notifications
CREATE TABLE public.schedule_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  sleep_schedule_id UUID NOT NULL REFERENCES public.sleep_schedules(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('age_milestone', 'pattern_adjustment')),
  message TEXT NOT NULL,
  suggested_changes JSONB NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.schedule_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.schedule_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications" 
ON public.schedule_notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.schedule_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for timestamps
CREATE TRIGGER update_sleep_schedules_updated_at
BEFORE UPDATE ON public.sleep_schedules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_schedule_notifications_updated_at
BEFORE UPDATE ON public.schedule_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();