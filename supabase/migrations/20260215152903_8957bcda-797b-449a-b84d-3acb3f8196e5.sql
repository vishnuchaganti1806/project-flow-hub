
-- Fix: Only allow system/triggers to create notifications, not arbitrary users
DROP POLICY "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'guide'));

-- Fix: Only students/admins can create teams
DROP POLICY "Authenticated can create teams" ON public.teams;
CREATE POLICY "Students and admins can create teams" ON public.teams FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'student') OR public.has_role(auth.uid(), 'admin'));
