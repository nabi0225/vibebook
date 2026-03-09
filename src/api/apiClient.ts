/// <reference types="vite/client" />

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(errorData.error || `HTTP error! status: ${response.status}`, response.status);
  }

  return response.json();
}

export const api = {
  auth: {
    register: (data: any) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: any) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    activateMerchant: (userId: string) => request<{ roles: string[] }>('/api/auth/activate-merchant', { method: 'POST', body: JSON.stringify({ userId }) }),
    updateProfile: (data: any) => request('/api/auth/update-profile', { method: 'POST', body: JSON.stringify(data) }),
  },
  merchant: {
    getServices: (id: string) => request(`/api/merchants/${id}/services`),
    createService: (data: any) => request('/api/services', { method: 'POST', body: JSON.stringify(data) }),
    updateService: (id: string, data: any) => request(`/api/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteService: (id: string) => request(`/api/services/${id}`, { method: 'DELETE' }),
    getSlots: (id: string) => request(`/api/merchants/${id}/slots`),
    createSlot: (data: any) => request('/api/slots', { method: 'POST', body: JSON.stringify(data) }),
    deleteSlot: (id: string) => request(`/api/slots/${id}`, { method: 'DELETE' }),
    getBookings: (id: string) => request(`/api/merchants/${id}/bookings`),
    updateNote: (id: string, note: string) => request(`/api/bookings/${id}/note`, { method: 'PATCH', body: JSON.stringify({ note }) }),
  },
  customer: {
    getMerchants: () => request('/api/merchants'),
    getServices: (merchantId: string) => request(`/api/merchants/${merchantId}/available-services`),
    getSlots: (merchantId: string) => request(`/api/merchants/${merchantId}/available-slots`),
    createBooking: (data: any) => request('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),
    getMyBookings: (id: string) => request(`/api/customers/${id}/bookings`),
  }
};
