import { Property } from '../types/property';
import { EmailLog } from '../types/email';

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Office Space in Downtown',
    address: '123 Business Ave, New York, NY 10001',
    rent: '$4,500/month',
    status: 'Available',
    description: 'Premium office space with modern amenities in the heart of downtown.',
    imageSrc: 'https://images.pexels.com/photos/1170412/pexels-photo-1170412.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    broker: {
      name: 'John Smith',
      email: 'john.smith@realestate.com',
      phone: '(555) 123-4567'
    },
    emailSent: true
  },
  {
    id: '2',
    title: 'Retail Space in Shopping District',
    address: '456 Market St, San Francisco, CA 94103',
    rent: '$6,200/month',
    status: 'Available',
    description: 'High-traffic retail location perfect for boutique stores or restaurants.',
    imageSrc: 'https://images.pexels.com/photos/264507/pexels-photo-264507.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    broker: {
      name: 'Sarah Johnson',
      email: 'sarah.j@commercialre.com',
      phone: '(555) 987-6543'
    },
    emailSent: false
  },
  {
    id: '3',
    title: 'Warehouse Space with Loading Bays',
    address: '789 Industrial Pkwy, Chicago, IL 60607',
    rent: '$8,500/month',
    status: 'Pending',
    description: 'Spacious warehouse with multiple loading docks and high ceilings.',
    imageSrc: 'https://images.pexels.com/photos/236705/pexels-photo-236705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    broker: {
      name: 'Michael Brown',
      email: 'mbrown@industrialre.com',
      phone: '(555) 234-5678'
    },
    emailSent: false
  },
  {
    id: '4',
    title: 'Corner Office in Business Center',
    address: '321 Corporate Blvd, Austin, TX 78701',
    rent: '$3,800/month',
    status: 'Available',
    description: 'Premium corner office with panoramic city views and executive amenities.',
    imageSrc: 'https://images.pexels.com/photos/323705/pexels-photo-323705.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    broker: {
      name: 'Emily Wilson',
      email: 'ewilson@texasre.com',
      phone: '(555) 345-6789'
    },
    emailSent: false
  },
  {
    id: '5',
    title: 'Mixed-Use Property on Main Street',
    address: '555 Main St, Denver, CO 80202',
    rent: '$7,200/month',
    status: 'Leased',
    description: 'Versatile mixed-use property with retail space on the ground floor and office space above.',
    imageSrc: 'https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    broker: {
      name: 'David Clark',
      email: 'dclark@mountaire.com',
      phone: '(555) 456-7890'
    },
    emailSent: false
  },
  {
    id: '6',
    title: 'Tech Office with Open Floor Plan',
    address: '888 Innovation Dr, Seattle, WA 98101',
    rent: '$9,500/month',
    status: 'Available',
    description: 'Modern tech office featuring open layout, breakout spaces, and state-of-the-art amenities.',
    imageSrc: 'https://images.pexels.com/photos/380768/pexels-photo-380768.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    broker: {
      name: 'Jessica Lee',
      email: 'jlee@techspacere.com',
      phone: '(555) 567-8901'
    },
    emailSent: false
  }
];

export const mockEmailLogs: EmailLog[] = [
  {
    id: 'e1',
    to: 'john.smith@realestate.com',
    from: 'you@company.com',
    subject: 'Interest in Modern Office Space (Ref: #1)',
    status: 'sent',
    timestamp: '2023-08-15T10:23:45Z',
    propertyId: '1',
    propertyTitle: 'Modern Office Space in Downtown'
  },
  {
    id: 'e2',
    to: 'sarah.j@commercialre.com',
    from: 'you@company.com',
    subject: 'Question about Retail Space on Market St',
    status: 'failed',
    timestamp: '2023-08-14T14:15:30Z',
    propertyId: '2',
    propertyTitle: 'Retail Space in Shopping District'
  },
  {
    id: 'e3',
    to: 'david.clark@mountaire.com',
    from: 'you@company.com',
    subject: 'Availability of Mixed-Use Property',
    status: 'sent',
    timestamp: '2023-08-12T09:45:12Z',
    propertyId: '5',
    propertyTitle: 'Mixed-Use Property on Main Street'
  },
  {
    id: 'e4',
    to: 'mbrown@industrialre.com',
    from: 'you@company.com',
    subject: 'Tour Request for Warehouse Space',
    status: 'pending',
    timestamp: '2023-08-16T16:05:23Z',
    propertyId: '3',
    propertyTitle: 'Warehouse Space with Loading Bays'
  }
];