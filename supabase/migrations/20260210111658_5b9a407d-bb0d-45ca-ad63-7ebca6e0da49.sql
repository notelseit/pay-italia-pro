
CREATE OR REPLACE FUNCTION public.get_medical_timeline(p_employee_id uuid, p_company_id uuid)
RETURNS TABLE (
  id uuid,
  event_type text,
  event_date timestamptz,
  title text,
  description text,
  status text,
  metadata jsonb,
  is_future boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY

  -- Medical records: opened
  SELECT
    mr.id,
    'record_opened'::text AS event_type,
    COALESCE(mr.opened_at::timestamptz, mr.created_at) AS event_date,
    'Apertura cartella sanitaria'::text AS title,
    COALESCE(mr.notes, '')::text AS description,
    mr.status::text,
    jsonb_build_object(
      'protocol_id', mr.protocol_id,
      'risk_profile', mr.risk_profile
    ) AS metadata,
    false AS is_future
  FROM medical_records mr
  WHERE mr.employee_id = p_employee_id AND mr.company_id = p_company_id

  UNION ALL

  -- Medical records: closed
  SELECT
    mr.id,
    'record_closed'::text,
    mr.closed_at::timestamptz,
    'Chiusura cartella sanitaria'::text,
    COALESCE(mr.notes, '')::text,
    'closed'::text,
    jsonb_build_object('protocol_id', mr.protocol_id) AS metadata,
    false
  FROM medical_records mr
  WHERE mr.employee_id = p_employee_id AND mr.company_id = p_company_id AND mr.closed_at IS NOT NULL

  UNION ALL

  -- Medical visits
  SELECT
    mv.id,
    CASE WHEN mv.status = 'completed' THEN 'visit_completed'::text ELSE 'visit_scheduled'::text END,
    CASE WHEN mv.status = 'completed' THEN COALESCE(mv.completed_date::timestamptz, mv.scheduled_date::timestamptz) ELSE mv.scheduled_date::timestamptz END,
    ('Visita medica: ' || CASE mv.visit_type
      WHEN 'preventiva' THEN 'Preventiva'
      WHEN 'periodica' THEN 'Periodica'
      WHEN 'cambio_mansione' THEN 'Cambio Mansione'
      WHEN 'richiesta_lavoratore' THEN 'Su Richiesta'
      WHEN 'fine_rapporto' THEN 'Fine Rapporto'
      ELSE mv.visit_type
    END)::text,
    COALESCE(mv.notes, '')::text,
    mv.status::text,
    jsonb_build_object(
      'visit_type', mv.visit_type,
      'doctor_name', mv.doctor_name,
      'objective_examination', mv.objective_examination,
      'target_organs', mv.target_organs
    ),
    (mv.scheduled_date > CURRENT_DATE)
  FROM medical_visits mv
  WHERE mv.employee_id = p_employee_id AND mv.company_id = p_company_id

  UNION ALL

  -- Fitness judgments
  SELECT
    fj.id,
    'judgment'::text,
    fj.judgment_date::timestamptz,
    ('Giudizio: ' || CASE fj.judgment_type
      WHEN 'idoneo' THEN 'Idoneo'
      WHEN 'idoneo_con_prescrizioni' THEN 'Idoneo con prescrizioni'
      WHEN 'idoneo_con_limitazioni' THEN 'Idoneo con limitazioni'
      WHEN 'temporaneamente_non_idoneo' THEN 'Temporaneamente non idoneo'
      WHEN 'non_idoneo' THEN 'Non idoneo'
      ELSE fj.judgment_type
    END)::text,
    COALESCE(fj.prescriptions, fj.limitations, fj.notes, '')::text,
    fj.judgment_type::text,
    jsonb_build_object(
      'prescriptions', fj.prescriptions,
      'limitations', fj.limitations,
      'document_url', fj.document_url,
      'expiry_date', fj.expiry_date
    ),
    false
  FROM fitness_judgments fj
  WHERE fj.employee_id = p_employee_id AND fj.company_id = p_company_id

  UNION ALL

  -- Fitness judgment expiries (future events)
  SELECT
    fj.id,
    'expiry'::text,
    fj.expiry_date::timestamptz,
    'Scadenza giudizio di idoneità'::text,
    ('Giudizio del ' || to_char(fj.judgment_date, 'DD/MM/YYYY'))::text,
    fj.judgment_type::text,
    jsonb_build_object('judgment_type', fj.judgment_type),
    (fj.expiry_date >= CURRENT_DATE)
  FROM fitness_judgments fj
  WHERE fj.employee_id = p_employee_id AND fj.company_id = p_company_id AND fj.expiry_date IS NOT NULL

  UNION ALL

  -- Medical documents
  SELECT
    md.id,
    'document'::text,
    COALESCE(md.created_at, now()),
    ('Documento: ' || md.document_type)::text,
    md.file_name::text,
    'uploaded'::text,
    jsonb_build_object(
      'file_name', md.file_name,
      'file_path', md.file_path,
      'document_type', md.document_type,
      'mime_type', md.mime_type,
      'file_size', md.file_size,
      'notes', md.notes
    ),
    false
  FROM medical_documents md
  WHERE md.employee_id = p_employee_id AND md.company_id = p_company_id

  ORDER BY event_date DESC;
END;
$$;
