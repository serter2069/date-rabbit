'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
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
import { Dispute } from '@/types';
import { formatDateTime, formatCurrency } from '@/lib/utils';

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const disputeId = params.id as string;

  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolveAction, setResolveAction] = useState<'resolved' | 'closed'>('resolved');
  const [adminNote, setAdminNote] = useState('');
  const [isActioning, setIsActioning] = useState(false);

  useEffect(() => {
    api.getDisputeById(disputeId)
      .then(setDispute)
      .catch(() => setError('Failed to load dispute'))
      .finally(() => setIsLoading(false));
  }, [disputeId]);

  const openResolveDialog = (action: 'resolved' | 'closed') => {
    setResolveAction(action);
    setAdminNote('');
    setResolveDialogOpen(true);
  };

  const handleResolve = async () => {
    if (!dispute) return;
    setIsActioning(true);
    try {
      const updated = await api.resolveDispute(dispute.id, {
        status: resolveAction,
        adminNote: adminNote.trim() || undefined,
      });
      setDispute(updated);
      setResolveDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update dispute');
    } finally {
      setIsActioning(false);
    }
  };

  if (isLoading) {
    return <div className="h-64 bg-muted animate-pulse rounded-lg" />;
  }

  if (!dispute) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <p className="text-muted-foreground">Dispute not found.</p>
      </div>
    );
  }

  const isActionable = dispute.status === 'open' || dispute.status === 'under_review';

  return (
    <div className="space-y-6">
      <PageHeader title={`Dispute #${dispute.id.slice(0, 8)}`}>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        {isActionable && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
              onClick={() => openResolveDialog('resolved')}
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              Resolve
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-slate-600 border-slate-300 hover:bg-slate-50"
              onClick={() => openResolveDialog('closed')}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Close
            </Button>
          </>
        )}
      </PageHeader>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Dispute details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dispute Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge status={dispute.status} />
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Reason</p>
              <p className="text-sm">{dispute.reason}</p>
            </div>
            {dispute.adminNote && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Admin Note</p>
                  <p className="text-sm">{dispute.adminNote}</p>
                </div>
              </>
            )}
            <Separator />
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Opened</span>
              <span className="text-sm">{formatDateTime(dispute.createdAt)}</span>
            </div>
            {dispute.resolvedAt && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Resolved</span>
                <span className="text-sm">{formatDateTime(dispute.resolvedAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Related booking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Related Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dispute.booking ? (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Activity</span>
                  <span className="text-sm font-medium">{dispute.booking.activity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Scheduled</span>
                  <span className="text-sm">{formatDateTime(dispute.booking.scheduledAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Price</span>
                  <span className="text-sm font-bold">{formatCurrency(dispute.booking.totalPrice)}</span>
                </div>
                <Separator />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => router.push(`/bookings/${dispute.bookingId}`)}
                >
                  View Full Booking
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Booking data unavailable.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Participants */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Opened by */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Opened By</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
              onClick={() => router.push(`/users/${dispute.openedByUserId}`)}
            >
              <UserAvatar
                name={dispute.openedByUser?.name || null}
                avatarUrl={dispute.openedByUser?.avatarUrl || null}
                size="md"
              />
              <div>
                <p className="font-medium text-sm">{dispute.openedByUser?.name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{dispute.openedByUser?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seeker */}
        {dispute.booking?.seeker && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Seeker</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
                onClick={() => router.push(`/users/${dispute.booking.seekerId}`)}
              >
                <UserAvatar
                  name={dispute.booking.seeker?.name || null}
                  avatarUrl={dispute.booking.seeker?.avatarUrl || null}
                  size="md"
                />
                <div>
                  <p className="font-medium text-sm">{dispute.booking.seeker?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{dispute.booking.seeker?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Companion */}
        {dispute.booking?.companion && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Companion</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors"
                onClick={() => router.push(`/users/${dispute.booking.companionId}`)}
              >
                <UserAvatar
                  name={dispute.booking.companion?.name || null}
                  avatarUrl={dispute.booking.companion?.avatarUrl || null}
                  size="md"
                />
                <div>
                  <p className="font-medium text-sm">{dispute.booking.companion?.name || 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{dispute.booking.companion?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Resolve/Close dialog */}
      <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {resolveAction === 'resolved' ? 'Resolve Dispute' : 'Close Dispute'}
            </DialogTitle>
            <DialogDescription>
              {resolveAction === 'resolved'
                ? 'Mark this dispute as resolved. Optionally add an admin note visible to the team.'
                : 'Close this dispute without a formal resolution. Optionally add an admin note.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="admin-note">Admin Note (optional)</Label>
            <Textarea
              id="admin-note"
              placeholder="Describe the outcome or reason for this decision..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={resolveAction === 'resolved' ? 'default' : 'secondary'}
              onClick={handleResolve}
              disabled={isActioning}
            >
              {isActioning
                ? 'Saving...'
                : resolveAction === 'resolved'
                ? 'Mark as Resolved'
                : 'Close Dispute'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
