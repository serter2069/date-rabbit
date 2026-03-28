'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/admin/status-badge';
import { UserAvatar } from '@/components/admin/user-avatar';
import { PageHeader } from '@/components/admin/page-header';
import { api } from '@/lib/api';
import { Booking } from '@/types';
import { formatDateTime, formatCurrency } from '@/lib/utils';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getBookingById(bookingId)
      .then(setBooking)
      .catch(() => setError('Failed to load booking'))
      .finally(() => setIsLoading(false));
  }, [bookingId]);

  const handleCancel = async () => {
    if (!booking) return;
    setIsActioning(true);
    try {
      const updated = await api.cancelBooking(booking.id, cancelReason);
      setBooking(updated);
      setIsCancelDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setIsActioning(false);
    }
  };

  if (isLoading) {
    return <div className="h-64 bg-muted animate-pulse rounded-lg" />;
  }

  if (!booking) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <p className="text-muted-foreground">Booking not found.</p>
      </div>
    );
  }

  const canCancel = !['CANCELLED', 'COMPLETED', 'REFUNDED'].includes(booking.status);

  return (
    <div className="space-y-6">
      <PageHeader title={`Booking #${booking.id.slice(0, 8)}`}>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {canCancel && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsCancelDialogOpen(true)}
          >
            <XCircle className="mr-1 h-4 w-4" />
            Cancel Booking
          </Button>
        )}
      </PageHeader>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Booking details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={booking.status} />
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Activity</span>
              <span className="text-sm font-medium">{booking.activity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Scheduled</span>
              <span className="text-sm">{formatDateTime(booking.scheduledAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Duration</span>
              <span className="text-sm">{booking.durationHours}h</span>
            </div>
            {booking.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{booking.notes}</p>
                </div>
              </>
            )}
            {booking.cancelReason && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Cancel Reason</p>
                  <p className="text-sm text-red-600">{booking.cancelReason}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Financial details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financial Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Price</span>
              <span className="text-sm font-bold">{formatCurrency(booking.totalPrice)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Platform Fee</span>
              <span className="text-sm">{formatCurrency(booking.platformFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Companion Earnings</span>
              <span className="text-sm">{formatCurrency(booking.companionEarnings)}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Created</span>
              <span className="text-sm">{formatDateTime(booking.createdAt)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Participants */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Seeker</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
              onClick={() => router.push(`/users/${booking.seekerId}`)}
            >
              <UserAvatar name={booking.seeker?.name || null} avatarUrl={booking.seeker?.avatarUrl || null} size="md" />
              <div>
                <p className="font-medium text-sm">{booking.seeker?.name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{booking.seeker?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Companion</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
              onClick={() => router.push(`/users/${booking.companionId}`)}
            >
              <UserAvatar name={booking.companion?.name || null} avatarUrl={booking.companion?.avatarUrl || null} size="md" />
              <div>
                <p className="font-medium text-sm">{booking.companion?.name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{booking.companion?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              This will cancel the booking and may trigger a refund depending on policy.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="cancel-reason">Reason</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Explain why this booking is being cancelled..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={isActioning || !cancelReason.trim()}
            >
              {isActioning ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
