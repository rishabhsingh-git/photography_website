export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
  visible?: boolean;
}

export interface ServiceItem {
  id: string;
  title: string;
  slogan?: string;
  description?: string;
  highlights?: string[];
  price: number;
  discountedPrice?: number;
  isActive?: boolean;
  imageUrl?: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Asset {
  id: string;
  url: string;
  title?: string;
  tags?: string[];
  categoryId?: string;
  serviceId?: string;
  service?: {
    id: string;
    title: string;
    icon?: string;
  } | null;
  featured?: boolean;
}

export interface CartItem {
  id: string;
  serviceId: string;
  quantity: number;
  service?: ServiceItem;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  orderId?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  roles?: string[];
  createdAt?: string;
  paymentCount?: number;
  paidPaymentCount?: number;
  totalPaidAmount?: number;
  payments?: Payment[];
}

export interface NotificationItem {
  id: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface BookingKpi {
  totalBookings: number;
  revenue: number;
  pendingInquiries: number;
}


