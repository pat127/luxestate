-- Fix reference number prefixes: LUX- → CS- (For Sale / Off-Plan) or CR- (For Rent)
-- This migration updates all existing properties that have the old LUX- prefix

DO $$
BEGIN
  -- Update For Rent listings: LUX- → CR-
  UPDATE public.properties
  SET reference_number = 'CR-' || SUBSTRING(reference_number FROM 5)
  WHERE reference_number LIKE 'LUX-%'
    AND listing_type = 'For Rent';

  -- Update For Sale listings: LUX- → CS-
  UPDATE public.properties
  SET reference_number = 'CS-' || SUBSTRING(reference_number FROM 5)
  WHERE reference_number LIKE 'LUX-%'
    AND listing_type = 'For Sale';

  -- Update Off-Plan listings: LUX- → CS-
  UPDATE public.properties
  SET reference_number = 'CS-' || SUBSTRING(reference_number FROM 5)
  WHERE reference_number LIKE 'LUX-%'
    AND listing_type = 'Off-Plan';

  -- Catch-all: any remaining LUX- prefixed records default to CS-
  UPDATE public.properties
  SET reference_number = 'CS-' || SUBSTRING(reference_number FROM 5)
  WHERE reference_number LIKE 'LUX-%';

  RAISE NOTICE 'Reference number prefixes updated: LUX- → CS- (sales/off-plan) or CR- (leasing)';
END $$;
