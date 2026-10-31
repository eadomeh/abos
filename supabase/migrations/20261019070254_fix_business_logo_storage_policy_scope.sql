DROP POLICY IF EXISTS business_logos_owner_insert ON storage.objects;
CREATE POLICY business_logos_owner_insert
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-logos'
  AND (storage.foldername(objects.name))[1] IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id::text = (storage.foldername(objects.name))[1]
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
  AND (storage.foldername(objects.name))[1] IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id::text = (storage.foldername(objects.name))[1]
      AND b.owner_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  bucket_id = 'business-logos'
  AND (storage.foldername(objects.name))[1] IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id::text = (storage.foldername(objects.name))[1]
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
  AND (storage.foldername(objects.name))[1] IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM public.businesses b
    WHERE b.id::text = (storage.foldername(objects.name))[1]
      AND b.owner_id = (SELECT auth.uid())
  )
);