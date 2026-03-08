
-- Add team_id to deadlines for team-specific deadlines
ALTER TABLE public.deadlines ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL;

-- Create team_messages table for team communication
CREATE TABLE public.team_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view messages for teams they belong to
CREATE POLICY "Team members and guides can view messages"
  ON public.team_messages FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Guides and admins can send team messages"
  ON public.team_messages FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'guide'::app_role) OR has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Sender can delete own messages"
  ON public.team_messages FOR DELETE TO authenticated
  USING (auth.uid() = sender_id);
