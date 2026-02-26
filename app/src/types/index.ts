export type UserRole = 'seeker' | 'companion';

export type VerificationStatus = 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected';
export type VerificationType = 'seeker' | 'companion';

export interface VerificationReference {
  name: string;
  phone: string;
  relationship: string;
}

export interface Verification {
  id: string;
  userId: string;
  type: VerificationType;
  status: VerificationStatus;
  ssnLast4?: string;
  idPhotoUrl?: string;
  selfieUrl?: string;
  videoUrl?: string;
  consentGiven: boolean;
  consentDate?: string;
  rejectionReason?: string;
  references?: VerificationReference[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  age?: number;
  location?: string;
  bio?: string;
  photos?: { id: string; url: string; order: number; isPrimary: boolean }[];
  hourlyRate?: number; // Only for companions
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  verificationStatus?: VerificationStatus;
  stripeOnboardingComplete?: boolean;
  expoPushToken?: string;
  notificationsEnabled?: boolean;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  status: 'pending' | 'accepted' | 'declined' | 'confirmed' | 'cancelled' | 'completed';
  activity: string;
  date: string;
  duration: number;
  location?: string;
  message?: string;
  hourlyRate: number;
  subtotal: number;
  platformFee: number;
  total: number;
  companionEarnings: number;
  isPaid: boolean;
  seeker: {
    id: string;
    name: string;
    photo?: string;
  };
  companion: {
    id: string;
    name: string;
    photo?: string;
    rating: number;
  };
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Earnings {
  totalEarnings: number;
  pendingPayouts: number;
  completedBookings: number;
}

export interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Chat {
  bookingId: string;
  otherUser: {
    id: string;
    name: string;
    photo?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: number;
}
