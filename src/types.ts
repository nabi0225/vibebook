
export interface User {
  id: string;
  username: string; // This will now be the phone number
  roles: ('merchant' | 'customer')[];
  role: 'merchant' | 'customer'; // Current active role
  phone: string;
  name?: string;
  nickname?: string;
  gender?: 'male' | 'female' | 'other';
  countryCode?: string;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string;
}

export interface Slot {
  id: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  isBooked: boolean;
}

export interface Booking {
  id: string;
  serviceId: string;
  slotId: string;
  customerName: string;
  customerPhone: string;
  merchantNote: string;
  serviceName?: string;
  merchantName?: string;
  startTime?: string;
  endTime?: string;
}
