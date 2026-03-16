
-- Allow students (team members) to send team messages
CREATE POLICY "Students can send team messages"
ON public.team_messages FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.teams WHERE id = team_id AND auth.uid() = ANY(members)
  )
);

-- Allow sender to update own messages
CREATE POLICY "Sender can update own messages"
ON public.team_messages FOR UPDATE TO authenticated
USING (auth.uid() = sender_id);
