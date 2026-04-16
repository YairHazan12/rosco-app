/**
 * Native sharing utilities for PDFs
 * Uses browser download + mailto/WhatsApp links instead of API-based sending
 */

interface ShareEmailParams {
  recipientEmail: string;
  subject: string;
  body: string;
}

interface ShareWhatsAppParams {
  recipientPhone?: string;
  message: string;
  file?: File;
}

/**
 * Download a PDF from the generate-pdf endpoint
 */
export async function downloadPDF(docType: 'invoice' | 'quote', id: string): Promise<File> {
  const response = await fetch(`/api/billing/generate-pdf?docType=${docType}&id=${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to generate PDF');
  }
  
  const blob = await response.blob();
  const filename = response.headers.get('Content-Disposition')
    ?.split('filename=')[1]
    ?.replace(/"/g, '') || `${docType}.pdf`;
  
  return new File([blob], filename, { type: 'application/pdf' });
}

/**
 * Share via email using mailto: link
 * User manually attaches the downloaded PDF
 */
export function shareViaEmail({ recipientEmail, subject, body }: ShareEmailParams) {
  const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;
}

/**
 * Share via WhatsApp using Web Share API (preferred) or WhatsApp Web (fallback)
 */
export async function shareViaWhatsApp({ recipientPhone, message, file }: ShareWhatsAppParams): Promise<'web-share' | 'whatsapp-web'> {
  // Try Web Share API first (works great on mobile with files)
  if (navigator.share && file) {
    try {
      await navigator.share({
        files: [file],
        text: message,
      });
      return 'web-share';
    } catch (error) {
      // User cancelled or Web Share API failed, fall through to WhatsApp Web
      console.log('Web Share cancelled or failed:', error);
    }
  }
  
  // Fallback: Open WhatsApp Web with pre-filled message
  // Note: WhatsApp Web doesn't support file attachments via URL, 
  // so user will need to manually attach the downloaded PDF
  const phone = recipientPhone?.replace(/\D/g, '') || '';
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
  
  return 'whatsapp-web';
}

/**
 * Check if Web Share API is available and supports files
 */
export function canUseWebShare(): boolean {
  return typeof navigator !== 'undefined' && 
         'share' in navigator && 
         'canShare' in navigator;
}
