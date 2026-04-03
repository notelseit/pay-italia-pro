
-- Rename column
ALTER TABLE public.user_sessions RENAME COLUMN session_token TO session_token_hash;

-- Revoke all existing sessions since they had plaintext tokens
UPDATE public.user_sessions SET is_active = false, revoked_at = now(), revoked_reason = 'Security migration: session token hashing';

-- Update the update_session_activity function to use new column name
CREATE OR REPLACE FUNCTION public.update_session_activity(p_session_token text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.user_sessions
  SET last_activity_at = now()
  WHERE session_token_hash = p_session_token
  AND is_active = true
  AND expires_at > now();
  
  RETURN FOUND;
END;
$function$;
