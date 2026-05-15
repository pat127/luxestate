import { createClient } from '@/lib/supabase/client';

export interface InquiryEmailPayload {
  name: string;
  email: string;
  phone?: string;
  budget?: string;
  propertyType?: string;
  message?: string;
  formType: 'contact' | 'property_inquiry' | 'project_inquiry';
  projectName?: string;
  reference?: string;
}

export async function sendInquiryEmail(payload: InquiryEmailPayload): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.functions.invoke('send-inquiry-email', { body: payload });
  } catch {
    // silent fail — email is best-effort, form submission already succeeded
  }
}
