
CREATE TABLE public.timeline_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  year TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  era TEXT NOT NULL DEFAULT 'modern',
  tag TEXT,
  image_url TEXT,
  image_alt TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.timeline_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timeline_events TO authenticated;
GRANT ALL ON public.timeline_events TO service_role;

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view timeline events"
  ON public.timeline_events FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert timeline events"
  ON public.timeline_events FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update timeline events"
  ON public.timeline_events FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete timeline events"
  ON public.timeline_events FOR DELETE TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_timeline_events_updated_at
BEFORE UPDATE ON public.timeline_events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX timeline_events_sort_idx ON public.timeline_events (sort_order);
