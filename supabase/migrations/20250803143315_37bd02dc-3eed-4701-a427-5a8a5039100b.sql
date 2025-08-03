-- Create activity_logs table for tracking baby activities
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('sleep', 'feeding', 'diaper', 'custom')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- Duration in minutes
  
  -- Sleep specific fields
  sleep_type TEXT CHECK (sleep_type IN ('nap', 'nighttime')),
  sleep_location TEXT,
  
  -- Feeding specific fields
  feeding_type TEXT CHECK (feeding_type IN ('nursing', 'formula', 'solid')),
  feeding_amount INTEGER, -- Amount in ml
  
  -- Diaper specific fields
  diaper_type TEXT CHECK (diaper_type IN ('wet', 'dirty', 'both')),
  
  -- General notes
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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