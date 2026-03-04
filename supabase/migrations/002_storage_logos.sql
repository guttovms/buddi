-- Criar bucket público para logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: usuários autenticados podem fazer upload na própria pasta
CREATE POLICY "Users can upload their own logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: usuários autenticados podem atualizar sua própria logo
CREATE POLICY "Users can update their own logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: usuários autenticados podem deletar sua própria logo
CREATE POLICY "Users can delete their own logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: qualquer pessoa pode ver logos (bucket é público)
CREATE POLICY "Anyone can view logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'logos');
