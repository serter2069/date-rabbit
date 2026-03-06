import { Badge } from '@/components/ui/badge';
import { BookingStatus, UserStatus, VerificationStatus, TransactionStatus } from '@/types';

interface StatusBadgeProps {
  status: BookingStatus | UserStatus | VerificationStatus | TransactionStatus | string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | null }> = {
  // Booking statuses
  PENDING: { label: 'Pending', variant: 'secondary' },
  CONFIRMED: { label: 'Confirmed', variant: 'default' },
  PAID: { label: 'Paid', variant: 'default' },
  IN_PROGRESS: { label: 'In Progress', variant: 'default' },
  COMPLETED: { label: 'Completed', variant: 'outline' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  REFUNDED: { label: 'Refunded', variant: 'secondary' },

  // User statuses
  ACTIVE: { label: 'Active', variant: 'default' },
  INACTIVE: { label: 'Inactive', variant: 'secondary' },
  BANNED: { label: 'Banned', variant: 'destructive' },

  // Verification statuses
  UNVERIFIED: { label: 'Unverified', variant: 'secondary' },
  PENDING_REVIEW: { label: 'Pending Review', variant: 'outline' },
  VERIFIED: { label: 'Verified', variant: 'default' },
  REJECTED: { label: 'Rejected', variant: 'destructive' },

  // Transaction statuses
  FAILED: { label: 'Failed', variant: 'destructive' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' as const };

  const variantClasses: Record<string, string> = {
    default: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    destructive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    outline: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  };

  const className = variantClasses[config.variant || 'secondary'];

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {config.label}
    </span>
  );
}
