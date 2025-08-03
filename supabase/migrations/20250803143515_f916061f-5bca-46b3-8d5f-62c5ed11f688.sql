-- Create activity_logs table for baby activities
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('sleep', 'feeding', 'diaper', 'custom')),
  
  -- Sleep tracking fields
  sleep_type TEXT CHECK (sleep_type IN ('nap', 'nighttime') OR sleep_type IS NULL),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  
  -- Feeding tracking fields
  feeding_type TEXT CHECK (feeding_type IN ('nursing', 'formula') OR feeding_type IS NULL),
  amount_ml INTEGER,
  
  -- Diaper tracking fields
  diaper_type TEXT CHECK (diaper_type IN ('wet', 'dirty', 'both') OR diaper_type IS NULL),
  
  -- Custom activity fields
  custom_activity_name TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own activity logs" 
ON public.activity_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity logs" 
ON public.activity_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity logs" 
ON public.activity_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity logs" 
ON public.activity_logs 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_activity_logs_updated_at
BEFORE UPDATE ON public.activity_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();