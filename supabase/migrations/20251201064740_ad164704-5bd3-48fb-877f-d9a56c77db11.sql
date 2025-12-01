-- Create user_sessions table for enhanced session management
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_token text NOT NULL UNIQUE,
  refresh_token_hash text,
  device_info jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  user_agent text,
  location_info jsonb,
  is_active boolean DEFAULT true,
  last_activity_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  revoked_at timestamp with time zone,
  revoked_reason text,
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(user_id, is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions(last_activity_at);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.user_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all sessions"
  ON public.user_sessions FOR ALL
  USING (auth.role() = 'service_role');

-- Function to clean up expired sessions (runs daily)
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete sessions that expired more than 7 days ago
  DELETE FROM public.user_sessions
  WHERE expires_at < now() - interval '7 days'
  OR (is_active = false AND revoked_at < now() - interval '7 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

-- Function to revoke old sessions when limit exceeded
CREATE OR REPLACE FUNCTION public.enforce_concurrent_session_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_sessions integer := 5; -- Maximum 5 concurrent sessions per user
  session_count integer;
BEGIN
  -- Count active sessions for this user
  SELECT COUNT(*) INTO session_count
  FROM public.user_sessions
  WHERE user_id = NEW.user_id 
  AND is_active = true 
  AND expires_at > now();
  
  -- If limit exceeded, revoke oldest session
  IF session_count >= max_sessions THEN
    UPDATE public.user_sessions
    SET 
      is_active = false,
      revoked_at = now(),
      revoked_reason = 'Concurrent session limit exceeded'
    WHERE id IN (
      SELECT id 
      FROM public.user_sessions
      WHERE user_id = NEW.user_id 
      AND is_active = true
      ORDER BY last_activity_at ASC
      LIMIT 1
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger to enforce session limits
CREATE TRIGGER enforce_session_limit_trigger
  AFTER INSERT ON public.user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_concurrent_session_limit();

-- Function to update last activity
CREATE OR REPLACE FUNCTION public.update_session_activity(p_session_token text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_sessions
  SET last_activity_at = now()
  WHERE session_token = p_session_token
  AND is_active = true
  AND expires_at > now();
  
  RETURN FOUND;
END;
$$;

-- Add updated_at trigger
CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON public.user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();