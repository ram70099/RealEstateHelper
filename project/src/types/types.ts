// types.ts

export type Broker = {
  name: string;
  phone: string;
  email: string; // Required everywhere, no undefined allowed
};

export type Property = {
  id: string;
  title: string;
  notes?: string;           // Can be missing or empty, so optional
  image_url: string;
  address: string;
  rent?: string | null;     // rent can be withheld, so optional or null
  status: string;
  property_type: string;    // added from your usage (office, retail, etc)
  submarket: string;        // also used in the component
  brokers?: Broker[];       // optional since you handle empty or missing brokers
  available_sf?: number | null; // used for available space (number)
  size_sf?: number | null;       // total size (number)
  built_year?: number | null;    // year built as number
  email_sent?: boolean;     // optional, used in original
  email_error?: string | null;  // optional error string or null
  
};

export type EmailLog = {
  id: string;
  propertyId: string;
  subject: string;
  to: string;
  from: string;
  status: 'sent' | 'pending' | 'failed';
  timestamp: string;
};
export type RealEstateProperty = {
  id: string;
  title: string;
  notes?: string;
  image_url: string;
  address: string;
  rent?: string | null;
  status: string;
  property_type: string;
  submarket: string;
  brokers?: Broker[];
  available_sf?: number | null;
  size_sf?: number | null;
  built_year?: number | null;
  email_sent?: boolean;
  email_error?: string | null;
};
