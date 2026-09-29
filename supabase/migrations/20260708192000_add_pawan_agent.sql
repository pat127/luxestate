-- Add Pawan to agents table and update any existing CEO Pawan references in leads

DO $$
BEGIN
  -- Insert Pawan only if not already present
  IF NOT EXISTS (SELECT 1 FROM public.agents WHERE name = 'Pawan') THEN
    INSERT INTO public.agents (name, email, phone, role, agent_status, leads, deals, commission, joined)
    VALUES ('Pawan', 'pawan@coveestate.com', '', 'CEO / Senior Agent', 'Active', 0, 0, 'AED 0', 'Jan 2006');
  END IF;

  -- Update any existing leads that were assigned to "CEO Pawan" to use "Pawan"
  UPDATE public.leads SET assigned_agent = 'Pawan' WHERE assigned_agent = 'CEO Pawan';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Migration failed: %', SQLERRM;
END $$;
