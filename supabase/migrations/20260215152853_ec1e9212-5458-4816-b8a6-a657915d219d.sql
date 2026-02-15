
-- 1. Role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('student', 'guide', 'admin');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  roll_number TEXT,
  branch TEXT,
  year TEXT,
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  guide_id UUID,
  team_id UUID,
  progress INT DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students viewable by authenticated" ON public.students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students can update own record" ON public.students FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Students can insert own record" ON public.students FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage students" ON public.students FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 4. Guides table
CREATE TABLE public.guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  specialization TEXT,
  department TEXT,
  assigned_teams UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guides viewable by authenticated" ON public.guides FOR SELECT TO authenticated USING (true);
CREATE POLICY "Guides can update own record" ON public.guides FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Guides can insert own record" ON public.guides FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 5. Teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  members UUID[] DEFAULT '{}',
  guide_id UUID,
  project_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teams viewable by authenticated" ON public.teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create teams" ON public.teams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can manage teams" ON public.teams FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Guides can update assigned teams" ON public.teams FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'guide'));
CREATE POLICY "Admins can delete teams" ON public.teams FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. Ideas table
CREATE TABLE public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  abstract TEXT,
  problem_statement TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  expected_outcome TEXT,
  attachments TEXT[] DEFAULT '{}',
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  team_id UUID,
  guide_id UUID,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','under-review','approved','rejected')),
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ideas viewable by authenticated" ON public.ideas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Students can create ideas" ON public.ideas FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Students can update own draft ideas" ON public.ideas FOR UPDATE TO authenticated USING (auth.uid() = student_id AND status = 'draft');
CREATE POLICY "Guides can update idea status" ON public.ideas FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'guide'));
CREATE POLICY "Students can delete own draft ideas" ON public.ideas FOR DELETE TO authenticated USING (auth.uid() = student_id AND status = 'draft');

-- 7. Doubts table
CREATE TABLE public.doubts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  project_id UUID,
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  guide_id UUID REFERENCES auth.users(id) NOT NULL,
  replies JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.doubts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doubts viewable by participants" ON public.doubts FOR SELECT TO authenticated
  USING (auth.uid() = student_id OR auth.uid() = guide_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Students can create doubts" ON public.doubts FOR INSERT TO authenticated WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Participants can update doubts" ON public.doubts FOR UPDATE TO authenticated
  USING (auth.uid() = student_id OR auth.uid() = guide_id);

-- 8. Deadlines table
CREATE TABLE public.deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  project_id UUID,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Deadlines viewable by authenticated" ON public.deadlines FOR SELECT TO authenticated USING (true);
CREATE POLICY "Guides/admins can create deadlines" ON public.deadlines FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'guide') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Creator can update deadlines" ON public.deadlines FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Creator can delete deadlines" ON public.deadlines FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- 9. Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  guide_id UUID REFERENCES auth.users(id) NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews viewable by authenticated" ON public.reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Guides can create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'guide') AND auth.uid() = guide_id);
CREATE POLICY "Guides can update own reviews" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = guide_id);

-- 10. Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info','success','warning','error')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON public.ideas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notification trigger functions
CREATE OR REPLACE FUNCTION public.notify_idea_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (
      NEW.student_id,
      'Idea ' || NEW.status,
      'Your idea "' || NEW.title || '" has been ' || NEW.status || '.',
      CASE WHEN NEW.status = 'approved' THEN 'success' WHEN NEW.status = 'rejected' THEN 'error' ELSE 'info' END
    );
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_idea_status_change AFTER UPDATE ON public.ideas FOR EACH ROW EXECUTE FUNCTION public.notify_idea_status_change();

CREATE OR REPLACE FUNCTION public.notify_review_submitted()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (NEW.student_id, 'New Review', 'You received a new review with rating ' || NEW.rating || '/5.', 'info');
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_review_submitted AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.notify_review_submitted();

CREATE OR REPLACE FUNCTION public.notify_deadline_created()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Notify all students (simplified; in production, filter by project)
  INSERT INTO public.notifications (user_id, title, message, type)
  SELECT ur.user_id, 'New Deadline', 'Deadline "' || NEW.title || '" set for ' || to_char(NEW.date, 'Mon DD, YYYY') || '.', 'warning'
  FROM public.user_roles ur WHERE ur.role = 'student';
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_deadline_created AFTER INSERT ON public.deadlines FOR EACH ROW EXECUTE FUNCTION public.notify_deadline_created();

-- File uploads storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('attachments', 'attachments', true);
CREATE POLICY "Authenticated can upload attachments" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'attachments');
CREATE POLICY "Anyone can view attachments" ON storage.objects FOR SELECT USING (bucket_id = 'attachments');
CREATE POLICY "Owner can delete attachments" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
