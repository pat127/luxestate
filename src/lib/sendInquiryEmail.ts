import { createClient } from '@/lib/supabase/client';

export interface InquiryEmailPayload {
  name: string;
  email?: string;
  phone?: string;
  budget?: string;
  propertyType?: string;
  message?: string;
  formType: 'contact' | 'property_inquiry' | 'project_inquiry' | 'landing_page';
  projectName?: string;
  reference?: string;
}

export async function sendInquiryEmail(payload: InquiryEmailPayload): Promise<void> {
  try {
    const supabase = createClient();
    const { error } = await supabase.functions.invoke('send-inquiry-email', { body: payload });
    if (error) {
      console.error('[sendInquiryEmail] Lead notification failed:', error);
    }
  } catch (err) {
    // email is best-effort, form submission already succeeded — but surface the failure
    console.error('[sendInquiryEmail] Unexpected error:', err);
  }
}
