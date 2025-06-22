
-- Create biometric_templates table for storing fingerprint data
CREATE TABLE public.biometric_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_data JSONB NOT NULL,
  template_type TEXT NOT NULL DEFAULT 'fingerprint',
  quality_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.biometric_templates ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view their own biometric templates" 
  ON public.biometric_templates 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own biometric templates" 
  ON public.biometric_templates 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own biometric templates" 
  ON public.biometric_templates 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own biometric templates" 
  ON public.biometric_templates 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_biometric_templates_user_id ON public.biometric_templates(user_id);
CREATE INDEX idx_biometric_templates_type ON public.biometric_templates(template_type);
