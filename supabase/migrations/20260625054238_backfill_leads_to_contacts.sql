-- Backfill all existing leads into contacts
-- Every lead must have a corresponding contact record
-- Match by email first; if no email, match by name + phone

DO $$
DECLARE
  lead_rec RECORD;
  existing_contact_id UUID;
BEGIN
  FOR lead_rec IN
    SELECT * FROM public.leads ORDER BY created_at ASC
  LOOP
    existing_contact_id := NULL;

    -- Try to find existing contact by email
    IF lead_rec.email IS NOT NULL AND lead_rec.email <> '' THEN
      SELECT id INTO existing_contact_id
      FROM public.contacts
      WHERE email = lead_rec.email
      LIMIT 1;
    END IF;

    -- If no email match, try name + phone
    IF existing_contact_id IS NULL AND lead_rec.phone IS NOT NULL AND lead_rec.phone <> '' THEN
      SELECT id INTO existing_contact_id
      FROM public.contacts
      WHERE name = lead_rec.name
        AND phone = lead_rec.phone
      LIMIT 1;
    END IF;

    IF existing_contact_id IS NOT NULL THEN
      -- Update existing contact to sync lead data
      UPDATE public.contacts SET
        phone        = COALESCE(NULLIF(lead_rec.phone, ''), phone),
        source       = COALESCE(NULLIF(lead_rec.source, ''), source),
        nationality  = COALESCE(NULLIF(lead_rec.nationality, ''), nationality),
        assigned_agent = COALESCE(NULLIF(lead_rec.assigned_agent, ''), assigned_agent),
        budget       = COALESCE(NULLIF(lead_rec.budget, ''), budget),
        notes        = COALESCE(NULLIF(lead_rec.notes, ''), notes),
        updated_at   = now()
      WHERE id = existing_contact_id;
    ELSE
      -- Insert new contact from lead
      INSERT INTO public.contacts (
        id,
        name,
        email,
        phone,
        whatsapp,
        type,
        status,
        source,
        nationality,
        assigned_agent,
        budget,
        notes,
        last_contact,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        lead_rec.name,
        NULLIF(lead_rec.email, ''),
        NULLIF(lead_rec.phone, ''),
        NULLIF(lead_rec.whatsapp, ''),
        'Buyer',
        'Active',
        COALESCE(NULLIF(lead_rec.source, ''), 'Website'),
        NULLIF(lead_rec.nationality, ''),
        NULLIF(lead_rec.assigned_agent, ''),
        NULLIF(lead_rec.budget, ''),
        NULLIF(lead_rec.notes, ''),
        to_char(lead_rec.created_at, 'YYYY-MM-DD'),
        lead_rec.created_at,
        now()
      );
    END IF;
  END LOOP;

  RAISE NOTICE 'Leads-to-contacts backfill complete.';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Backfill failed: %', SQLERRM;
END $$;
