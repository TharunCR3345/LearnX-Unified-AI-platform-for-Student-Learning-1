-- Create table for storing generated images
CREATE TABLE public.generated_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public access for now since no auth)
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view images
CREATE POLICY "Anyone can view generated images" 
ON public.generated_images 
FOR SELECT 
USING (true);

-- Allow anyone to insert images
CREATE POLICY "Anyone can insert generated images" 
ON public.generated_images 
FOR INSERT 
WITH CHECK (true);

-- Allow anyone to delete their images
CREATE POLICY "Anyone can delete generated images" 
ON public.generated_images 
FOR DELETE 
USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.generated_images;