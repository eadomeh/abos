-- S1 Business Profile: securely store public business-logo assets.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-logos',
  'business-logos',
  true,
  2097152,
  ARRAY['image/png','image/jpeg','image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS business_logos_owner_insert ON storage.objects;
CREATE POLICY business_logos_owner_insert
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-logos'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id::text = (storage.foldername(name))[1]
      AND b.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS business_logos_owner_update ON storage.objects;
CREATE POLICY business_logos_owner_update
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'business-logos'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id::text = (storage.foldername(name))[1]
      AND b.owner_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  bucket_id = 'business-logos'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id::text = (storage.foldername(name))[1]
      AND b.owner_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS business_logos_owner_delete ON storage.objects;
CREATE POLICY business_logos_owner_delete
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-logos'
  AND (storage.foldername(name))[1] IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id::text = (storage.foldername(name))[1]
      AND b.owner_id = (SELECT auth.uid())
  )
);