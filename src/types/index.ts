export interface Product {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  category: string;
  sizes: (string | number)[];
  stockStatus: 'in_stock' | 'limited' | 'out_of_stock';
  stockQuantity: number;
  images: string[];
  description: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  inRunningBanner: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  selectedSize: string | number;
  quantity: number;
}

export type OrderStatus =
  | 'In Processed'
  | 'Dispatch'
  | 'Arrived'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'New'
  | 'Printed'
  | 'Booked'
  | 'Dispatched'
  | 'Pending'
  | 'Confirmed'
  | 'Shipped';

export interface Order {
  id: string;
  customerName: string;
  contactNumber: string;
  whatsappNumber: string;
  address: string;
  city: string;
  postalCode?: string;
  specialInstructions?: string;
  items: CartItem[];
  paymentMethod: 'cod' | 'advance';
  subtotal: number;
  discount: number;
  shippingFee: number;
  finalAmount: number;
  paymentScreenshot?: string;
  status: OrderStatus;
  createdAt: string;
  printedAt?: string;
  // Courier Tracking Details (Requirement 9 & 10)
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  dispatchDate?: string;
  adminNotes?: string;
  statusUpdatedAt?: string;
  // MNP Courier Integration Fields
  courierCompany?: string;
  courierBookingStatus?: 'Not Booked' | 'Ready for Dispatch' | 'Booked' | 'In Transit';
  courierBookedAt?: string;
  parcelWeightKg?: number;
  parcelPieces?: number;
  mnpShipment?: MNPShipmentBooking;
}

export interface MNPConfig {
  isConnected: boolean;
  courierName?: string;
  accountNumber: string;
  username: string;
  password: string;
  apiKey: string;
  originCity: string;
  pickupAddress?: string;
  defaultServiceType: string;
  environment: 'production' | 'staging' | 'custom';
  apiBaseUrl?: string;
  autoAssignTracking?: boolean;
  lastConnectedAt?: string;
}

export type MNPCourierConfig = MNPConfig;

export interface MNPShipmentBooking {
  consignmentNumber: string;
  bookedAt: string;
  weightKg: number;
  pieces: number;
  serviceType: string;
  codAmount: number;
  originCity?: string;
  destinationCity: string;
  consigneeName?: string;
  consigneeAddress?: string;
  consigneeContact?: string;
  remarks?: string;
  pickupLocation?: string;
}

export interface BannerConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  enableRunningBanner: boolean;
  announcementText: string;
}
