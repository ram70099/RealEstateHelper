export interface EmailLog {
  id: string;
  to?: string;                 // optional now
  from: string;
  subject: string;
  status: 'sent' | 'failed' | 'pending';
  timestamp: string;
  propertyId?: string;
  propertyTitle?: string;
}
