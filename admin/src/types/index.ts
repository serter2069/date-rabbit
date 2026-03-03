// User types
export type UserRole = 'SEEKER' | 'COMPANION' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'PENDING';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  status: UserStatus;
  verificationStatus: VerificationStatus;
  avatarUrl: string | null;
  rating: number | null;
  reviewCount: number;
  bio: string | null;
  age: number | null;
  location: string | null;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  stripeConnectedAccountId: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
}

// Booking types
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PAID'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface Booking {
  id: string;
  seekerId: string;
  companionId: string;
  seeker: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
  companion: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
  activity: string;
  scheduledAt: string;
  durationHours: number;
  status: BookingStatus;
  totalPrice: number;
  platformFee: number;
  companionEarnings: number;
  notes: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// Payment / Transaction types
export type TransactionType = 'BOOKING_PAYMENT' | 'PLATFORM_FEE' | 'COMPANION_PAYOUT' | 'REFUND';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface Transaction {
  id: string;
  bookingId: string;
  booking?: Pick<Booking, 'id' | 'activity' | 'scheduledAt'>;
  userId: string;
  user?: Pick<User, 'id' | 'name' | 'email'>;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  stripePaymentIntentId: string | null;
  createdAt: string;
}

// Verification types
export interface VerificationSubmission {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
  status: VerificationStatus;
  idDocumentUrl: string | null;
  selfieUrl: string | null;
  additionalInfo: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

// Review types
export interface Review {
  id: string;
  bookingId: string;
  authorId: string;
  author: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
  targetId: string;
  target: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
  rating: number;
  comment: string | null;
  createdAt: string;
}

// Settings types
export interface PlatformSettings {
  platformFeePercent: number;
  minBookingHours: number;
  maxBookingHours: number;
  companionMinAge: number;
  seekerMinAge: number;
  supportEmail: string;
}

// API response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Stats types
export interface DashboardStats {
  totalUsers: number;
  totalSeekers: number;
  totalCompanions: number;
  totalBookings: number;
  completedBookings: number;
  pendingVerifications: number;
  revenueThisMonth: number;
  revenueTotal: number;
  activeBookings: number;
}
