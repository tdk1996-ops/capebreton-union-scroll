
CREATE POLICY "Anyone can view timeline images"
ON storage.objects FOR SELECT
USING (bucket_id = 'timeline-images');

CREATE POLICY "Admins can upload timeline images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'timeline-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update timeline images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'timeline-images' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete timeline images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'timeline-images' AND has_role(auth.uid(), 'admin'));
