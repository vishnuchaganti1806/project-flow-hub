-- Allow participants to delete their own doubts
CREATE POLICY "Students can delete own doubts"
ON public.doubts
FOR DELETE
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Guides can delete doubts assigned to them"
ON public.doubts
FOR DELETE
TO authenticated
USING (auth.uid() = guide_id);

-- Allow guides to create doubts too
DROP POLICY IF EXISTS "Students can create doubts" ON public.doubts;
CREATE POLICY "Participants can create doubts"
ON public.doubts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = student_id OR auth.uid() = guide_id);