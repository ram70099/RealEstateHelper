export interface Broker {
  name: string;
  email: string;
  phone: string;
}



export interface Property {
  id: string;
  title: string;
  address: string;
  rent?: string;    // <-- make this optional
  status?: 'Available' | 'Pending' | 'Leased';
  description?: string;
  image_url?: string;
  brokers: Broker[];
  emailSent: boolean;
}
