-- Documents Module Migration
-- Creates document_templates and filled_documents tables

-- ── 1. Tables ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Custom',
  description TEXT,
  content TEXT NOT NULL DEFAULT '',
  form_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  requires_approval BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.filled_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.document_templates(id) ON DELETE SET NULL,
  template_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Custom',
  title TEXT NOT NULL,
  field_values JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  doc_status TEXT NOT NULL DEFAULT 'Draft',
  ceo_signature TEXT,
  approved_at TIMESTAMPTZ,
  submitted_by TEXT NOT NULL DEFAULT 'Admin',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_document_templates_category ON public.document_templates(category);
CREATE INDEX IF NOT EXISTS idx_filled_documents_template_id ON public.filled_documents(template_id);
CREATE INDEX IF NOT EXISTS idx_filled_documents_status ON public.filled_documents(doc_status);

-- ── 3. RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filled_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "open_access_document_templates" ON public.document_templates;
CREATE POLICY "open_access_document_templates"
ON public.document_templates FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "open_access_filled_documents" ON public.filled_documents;
CREATE POLICY "open_access_filled_documents"
ON public.filled_documents FOR ALL TO public USING (true) WITH CHECK (true);

-- ── 4. Seed: Pre-built Templates ──────────────────────────────────────────────

DO $$
BEGIN

-- NCNDA
INSERT INTO public.document_templates (name, category, description, content, form_fields, requires_approval)
VALUES (
  'CONFIDENTIALITY, NON-DISCLOSURE & NON-CIRCUMVENTION AGREEMENT',
  'NDA',
  'NCNDA with a broker representing seller and Cove representing buyer',
  E'This Agreement is made on {{date}} (the "Effective Date").\n\nBY AND BETWEEN\n\nCove Estatez Real Estate, a company incorporated in Dubai, United Arab Emirates with license no. {{party1_license}}, ORN {{party1_orn}} and office at {{party1_address}} ("First Party")\n\nand\n\n{{party2_company}} a company incorporated in Dubai, United Arab Emirates with Trade License no. {{party2_license}}, ORN {{party2_orn}} and office at {{party2_address}} ("Second Party")\n\nhereinafter collectively referred to as the "Parties".\n\n1. CONFIDENTIALITY\nEach Party agrees to keep confidential all information disclosed by the other Party in connection with the Property described as: {{property_description}}.\n\n2. NON-CIRCUMVENTION\nNeither Party shall circumvent, avoid, bypass or obviate the other Party in any transaction related to the above-mentioned property or any other property introduced by either Party during the term of this Agreement.\n\n3. DURATION\nThis Agreement shall remain in force for a period of {{duration}} from the Effective Date.\n\n4. GOVERNING LAW\nThis Agreement shall be governed by and construed in accordance with {{governing_law}}.\n\nIN WITNESS WHEREOF, the Parties have executed this Agreement as of the date first written above.\n\nFIRST PARTY\nAuthorised Signatory: {{party1_signatory}}\nInitials: {{party1_initials}}\n\nSECOND PARTY\nAuthorised Signatory: {{party2_signatory}}',
  '[
    {"fieldId":"{{date}}","label":"Agreement Date","fieldType":"Date","required":true},
    {"fieldId":"{{party1_license}}","label":"First Party License No.","fieldType":"Text","required":true},
    {"fieldId":"{{party1_orn}}","label":"First Party ORN","fieldType":"Text","required":true},
    {"fieldId":"{{party1_address}}","label":"First Party Office Address","fieldType":"Text","required":true},
    {"fieldId":"{{party1_signatory}}","label":"First Party Authorised Signatory","fieldType":"Text","required":true},
    {"fieldId":"{{party1_initials}}","label":"First Party Initials","fieldType":"Text","required":true},
    {"fieldId":"{{party2_company}}","label":"Second Party Company Name","fieldType":"Text","required":true},
    {"fieldId":"{{party2_license}}","label":"Second Party Trade License","fieldType":"Text","required":true},
    {"fieldId":"{{party2_orn}}","label":"Second Party ORN","fieldType":"Text","required":false},
    {"fieldId":"{{party2_address}}","label":"Second Party Office Address","fieldType":"Text","required":true},
    {"fieldId":"{{party2_signatory}}","label":"Second Party Authorised Signatory","fieldType":"Text","required":true},
    {"fieldId":"{{property_description}}","label":"Property / Plot Description","fieldType":"Long Text","required":true},
    {"fieldId":"{{duration}}","label":"Agreement Duration","fieldType":"Text","required":true},
    {"fieldId":"{{governing_law}}","label":"Governing Law","fieldType":"Text","required":true}
  ]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

-- MOU
INSERT INTO public.document_templates (name, category, description, content, form_fields, requires_approval)
VALUES (
  'MEMORANDUM OF UNDERSTANDING',
  'Sales Contract',
  'Standard MOU for property transactions between buyer and seller',
  E'MEMORANDUM OF UNDERSTANDING\n\nDate: {{date}}\n\nThis Memorandum of Understanding ("MOU") is entered into between:\n\nBUYER: {{buyer_name}}\nPassport / Emirates ID: {{buyer_passport}}\nNationality: {{buyer_nationality}}\n\nSELLER: {{seller_name}}\nPassport / Emirates ID: {{seller_passport}}\n\nPROPERTY DETAILS\nReference No.: {{property_ref}}\nAddress: {{property_address}}\nType: {{property_type}}\n\nFINANCIAL TERMS\nAgreed Sale Price: AED {{agreed_price}}\nDeposit Amount: AED {{deposit_amount}}\nPayment Method: {{payment_method}}\n\nKEY DATES\nCompletion Date: {{completion_date}}\nTransfer Date: {{transfer_date}}\n\nAGENT\n{{agent_name}}\n\nSPECIAL CONDITIONS\n{{special_conditions}}\n\nThis MOU is subject to the execution of a formal Sale and Purchase Agreement. Both parties agree to proceed in good faith towards the completion of this transaction.',
  '[
    {"fieldId":"{{date}}","label":"MOU Date","fieldType":"Date","required":true},
    {"fieldId":"{{buyer_name}}","label":"Buyer Full Name","fieldType":"Text","required":true},
    {"fieldId":"{{buyer_passport}}","label":"Buyer Passport / Emirates ID","fieldType":"Text","required":true},
    {"fieldId":"{{buyer_nationality}}","label":"Buyer Nationality","fieldType":"Text","required":true},
    {"fieldId":"{{seller_name}}","label":"Seller Full Name","fieldType":"Text","required":true},
    {"fieldId":"{{seller_passport}}","label":"Seller Passport / Emirates ID","fieldType":"Text","required":true},
    {"fieldId":"{{property_ref}}","label":"Property Reference No.","fieldType":"Text","required":true},
    {"fieldId":"{{property_address}}","label":"Property Address","fieldType":"Long Text","required":true},
    {"fieldId":"{{property_type}}","label":"Property Type","fieldType":"Text","required":true},
    {"fieldId":"{{agreed_price}}","label":"Agreed Sale Price (AED)","fieldType":"Number","required":true},
    {"fieldId":"{{deposit_amount}}","label":"Deposit Amount (AED)","fieldType":"Number","required":true},
    {"fieldId":"{{payment_method}}","label":"Payment Method","fieldType":"Text","required":true},
    {"fieldId":"{{completion_date}}","label":"Completion Date","fieldType":"Date","required":true},
    {"fieldId":"{{transfer_date}}","label":"Transfer Date","fieldType":"Date","required":true},
    {"fieldId":"{{agent_name}}","label":"Agent Name","fieldType":"Text","required":false},
    {"fieldId":"{{special_conditions}}","label":"Special Conditions","fieldType":"Long Text","required":false}
  ]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

-- LOI
INSERT INTO public.document_templates (name, category, description, content, form_fields, requires_approval)
VALUES (
  'LETTER OF INTENT',
  'Sales Contract',
  'Formal letter of intent to purchase a property',
  E'LETTER OF INTENT\n\nDate: {{date}}\n\nTo Whom It May Concern,\n\nI / We, {{buyer_name}}{{buyer_company}}, hereby express our formal intent to purchase the property described below:\n\nPROPERTY DETAILS\nReference: {{property_ref}}\nAddress: {{property_address}}\n\nOFFER TERMS\nOffer Price: AED {{offer_price}}\nValidity Period: {{validity_period}}\nDue Diligence Period: {{due_diligence_period}} days\n\nPROPOSED PAYMENT TERMS\n{{payment_terms}}\n\nThis Letter of Intent is non-binding and is subject to the execution of a formal agreement. We look forward to proceeding with this transaction.\n\nAgent: {{agent_name}}\n\nYours sincerely,\n{{buyer_name}}',
  '[
    {"fieldId":"{{date}}","label":"Date","fieldType":"Date","required":true},
    {"fieldId":"{{buyer_name}}","label":"Buyer / Investor Name","fieldType":"Text","required":true},
    {"fieldId":"{{buyer_company}}","label":"Buyer Company (if applicable)","fieldType":"Text","required":false},
    {"fieldId":"{{property_ref}}","label":"Property Reference","fieldType":"Text","required":true},
    {"fieldId":"{{property_address}}","label":"Property Address","fieldType":"Long Text","required":true},
    {"fieldId":"{{offer_price}}","label":"Offer Price (AED)","fieldType":"Number","required":true},
    {"fieldId":"{{validity_period}}","label":"LOI Validity Period","fieldType":"Text","required":true},
    {"fieldId":"{{payment_terms}}","label":"Proposed Payment Terms","fieldType":"Long Text","required":true},
    {"fieldId":"{{due_diligence_period}}","label":"Due Diligence Period (days)","fieldType":"Number","required":false},
    {"fieldId":"{{agent_name}}","label":"Agent Name","fieldType":"Text","required":false}
  ]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

-- SPA
INSERT INTO public.document_templates (name, category, description, content, form_fields, requires_approval)
VALUES (
  'SALE & PURCHASE AGREEMENT',
  'Sales Contract',
  'Comprehensive sale and purchase agreement for property transactions',
  E'SALE & PURCHASE AGREEMENT\n\nThis Agreement is made on {{date}}.\n\nBETWEEN\n\nBUYER\nName: {{buyer_name}}\nPassport / Emirates ID: {{buyer_passport}}\nAddress: {{buyer_address}}\n\nAND\n\nSELLER\nName: {{seller_name}}\nPassport / Emirates ID: {{seller_passport}}\nAddress: {{seller_address}}\n\nPROPERTY\nReference: {{property_ref}}\nAddress: {{property_address}}\nPlot / Unit No.: {{plot_no}}\nArea: {{area_sqft}} sq.ft\n\nFINANCIAL TERMS\nSale Price: AED {{sale_price}}\nDLD Transfer Fee: AED {{dld_fee}}\nAgency Fee: AED {{agency_fee}}\n\nKEY DATES\nCompletion Date: {{completion_date}}\nHandover Date: {{handover_date}}\n\nPAYMENT SCHEDULE\n{{payment_schedule}}\n\nSPECIAL CONDITIONS\n{{special_conditions}}\n\nBoth parties agree to the terms set out in this Agreement and shall execute the same in good faith.',
  '[
    {"fieldId":"{{date}}","label":"Agreement Date","fieldType":"Date","required":true},
    {"fieldId":"{{buyer_name}}","label":"Buyer Full Name","fieldType":"Text","required":true},
    {"fieldId":"{{buyer_passport}}","label":"Buyer Passport / Emirates ID","fieldType":"Text","required":true},
    {"fieldId":"{{buyer_address}}","label":"Buyer Address","fieldType":"Long Text","required":true},
    {"fieldId":"{{seller_name}}","label":"Seller Full Name","fieldType":"Text","required":true},
    {"fieldId":"{{seller_passport}}","label":"Seller Passport / Emirates ID","fieldType":"Text","required":true},
    {"fieldId":"{{seller_address}}","label":"Seller Address","fieldType":"Long Text","required":true},
    {"fieldId":"{{property_ref}}","label":"Property Reference","fieldType":"Text","required":true},
    {"fieldId":"{{property_address}}","label":"Property Address","fieldType":"Long Text","required":true},
    {"fieldId":"{{plot_no}}","label":"Plot / Unit No.","fieldType":"Text","required":true},
    {"fieldId":"{{area_sqft}}","label":"Area (sq.ft)","fieldType":"Number","required":true},
    {"fieldId":"{{sale_price}}","label":"Sale Price (AED)","fieldType":"Number","required":true},
    {"fieldId":"{{dld_fee}}","label":"DLD Transfer Fee (AED)","fieldType":"Number","required":true},
    {"fieldId":"{{agency_fee}}","label":"Agency Fee (AED)","fieldType":"Number","required":false},
    {"fieldId":"{{completion_date}}","label":"Completion Date","fieldType":"Date","required":true},
    {"fieldId":"{{handover_date}}","label":"Handover Date","fieldType":"Date","required":true},
    {"fieldId":"{{payment_schedule}}","label":"Payment Schedule","fieldType":"Long Text","required":true},
    {"fieldId":"{{special_conditions}}","label":"Special Conditions","fieldType":"Long Text","required":false}
  ]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

-- Tenancy / Ejari
INSERT INTO public.document_templates (name, category, description, content, form_fields, requires_approval)
VALUES (
  'TENANCY CONTRACT (EJARI)',
  'Rental Agreement',
  'Standard tenancy contract for rental properties in Dubai, compliant with Ejari requirements',
  E'TENANCY CONTRACT\n\nThis Tenancy Contract is made on {{date}}.\n\nLANDLORD\nName: {{landlord_name}}\nPassport / Emirates ID: {{landlord_id}}\nPhone: {{landlord_phone}}\n\nTENANT\nName: {{tenant_name}}\nPassport / Emirates ID: {{tenant_id}}\nNationality: {{tenant_nationality}}\nPhone: {{tenant_phone}}\n\nPROPERTY DETAILS\nAddress: {{property_address}}\nUnit No.: {{unit_no}}\nType: {{property_type}}\nArea: {{area_sqft}} sq.ft\n\nTENANCY TERMS\nCommencement Date: {{start_date}}\nExpiry Date: {{end_date}}\nAnnual Rent: AED {{annual_rent}}\nSecurity Deposit: AED {{security_deposit}}\nNumber of Cheques: {{num_cheques}}\n\nADDITIONAL TERMS\n{{additional_terms}}\n\nBoth parties agree to abide by the terms of this contract and the applicable laws of the UAE and the Emirate of Dubai.',
  '[
    {"fieldId":"{{date}}","label":"Contract Date","fieldType":"Date","required":true},
    {"fieldId":"{{landlord_name}}","label":"Landlord Full Name","fieldType":"Text","required":true},
    {"fieldId":"{{landlord_id}}","label":"Landlord Passport / Emirates ID","fieldType":"Text","required":true},
    {"fieldId":"{{landlord_phone}}","label":"Landlord Phone","fieldType":"Text","required":true},
    {"fieldId":"{{tenant_name}}","label":"Tenant Full Name","fieldType":"Text","required":true},
    {"fieldId":"{{tenant_id}}","label":"Tenant Passport / Emirates ID","fieldType":"Text","required":true},
    {"fieldId":"{{tenant_nationality}}","label":"Tenant Nationality","fieldType":"Text","required":true},
    {"fieldId":"{{tenant_phone}}","label":"Tenant Phone","fieldType":"Text","required":true},
    {"fieldId":"{{property_address}}","label":"Property Address","fieldType":"Long Text","required":true},
    {"fieldId":"{{unit_no}}","label":"Unit No.","fieldType":"Text","required":true},
    {"fieldId":"{{property_type}}","label":"Property Type","fieldType":"Text","required":true},
    {"fieldId":"{{area_sqft}}","label":"Area (sq.ft)","fieldType":"Number","required":false},
    {"fieldId":"{{start_date}}","label":"Commencement Date","fieldType":"Date","required":true},
    {"fieldId":"{{end_date}}","label":"Expiry Date","fieldType":"Date","required":true},
    {"fieldId":"{{annual_rent}}","label":"Annual Rent (AED)","fieldType":"Number","required":true},
    {"fieldId":"{{security_deposit}}","label":"Security Deposit (AED)","fieldType":"Number","required":true},
    {"fieldId":"{{num_cheques}}","label":"Number of Cheques","fieldType":"Number","required":true},
    {"fieldId":"{{additional_terms}}","label":"Additional Terms","fieldType":"Long Text","required":false}
  ]'::jsonb,
  true
)
ON CONFLICT DO NOTHING;

END $$;
