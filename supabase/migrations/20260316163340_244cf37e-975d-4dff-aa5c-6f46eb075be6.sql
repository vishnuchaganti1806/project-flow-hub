
DROP POLICY "Creator can delete deadlines" ON public.deadlines;

CREATE POLICY "Guides and admins can delete deadlines"
ON public.deadlines FOR DELETE TO authenticated
USING (
  auth.uid() = created_by
  OR has_role(auth.uid(), 'guide'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);
