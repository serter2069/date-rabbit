'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Star, Mail, MapPin, Calendar, Ban, CheckCircle, Edit } from 'lucide-react';
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
import { DataTable, Column } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { api } from '@/lib/api';
import { User, Booking } from '@/types';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [userData, bookingsData] = await Promise.all([
          api.getUserById(userId),
          api.getUserBookings(userId, { page: 1, limit: 10 }),
        ]);
        setUser(userData);
        setBookings(bookingsData.data);
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  const handleBan = async () => {
    if (!user) return;
    setIsActioning(true);
    try {
      const updated = await api.banUser(user.id, banReason);
      setUser(updated);
      setIsBanDialogOpen(false);
      setBanReason('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to ban user');
    } finally {
      setIsActioning(false);
    }
  };

  const handleUnban = async () => {
    if (!user) return;
    setIsActioning(true);
    try {
      const updated = await api.unbanUser(user.id);
      setUser(updated);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to unban user');
    } finally {
      setIsActioning(false);
    }
  };

  const bookingColumns: Column<Booking>[] = [
    {
      key: 'activity',
      header: 'Activity',
      cell: (b) => <span className="font-medium text-sm">{b.activity}</span>,
    },
    {
      key: 'partner',
      header: user?.role === 'SEEKER' ? 'Companion' : 'Seeker',
      cell: (b) => (
        <span className="text-sm">
          {user?.role === 'SEEKER' ? (b.companion?.name || 'Unknown') : (b.seeker?.name || 'Unknown')}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      cell: (b) => <span className="text-sm text-muted-foreground">{formatDateTime(b.scheduledAt)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (b) => <StatusBadge status={b.status} />,
    },
    {
      key: 'price',
      header: 'Price',
      cell: (b) => <span className="text-sm font-medium">{formatCurrency(b.totalPrice)}</span>,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-48 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <p className="text-muted-foreground">User not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="User Detail">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </PageHeader>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Profile card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="lg" />

            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold">{user.name || 'No name'}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      user.role === 'COMPANION'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                    <StatusBadge status={user.status} />
                    <StatusBadge status={user.verificationStatus} />
                  </div>
                </div>

                <div className="flex gap-2">
                  {user.status === 'BANNED' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUnban}
                      disabled={isActioning}
                      className="text-emerald-600 border-emerald-300 hover:bg-emerald-50"
                    >
                      <CheckCircle className="mr-1 h-4 w-4" />
                      Unban
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsBanDialogOpen(true)}
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Ban className="mr-1 h-4 w-4" />
                      Ban
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{user.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
                {user.rating != null && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Star className="h-4 w-4 flex-shrink-0 fill-yellow-400 text-yellow-400" />
                    <span>{user.rating.toFixed(1)} ({user.reviewCount} reviews)</span>
                  </div>
                )}
              </div>

              {user.bio && (
                <p className="text-sm text-muted-foreground border-t pt-2">{user.bio}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Age</p>
            <p className="text-lg font-bold">{user.age ?? 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Reviews</p>
            <p className="text-lg font-bold">{user.reviewCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Rating</p>
            <p className="text-lg font-bold">{user.rating?.toFixed(1) ?? 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Last Active</p>
            <p className="text-lg font-bold text-sm">
              {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Booking History</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={bookingColumns}
            data={bookings}
            emptyMessage="No bookings yet"
            onRowClick={(b) => router.push(`/bookings/${b.id}`)}
          />
        </CardContent>
      </Card>

      {/* Ban dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              This will prevent {user.name || user.email} from accessing the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="ban-reason">Reason (optional)</Label>
            <Textarea
              id="ban-reason"
              placeholder="Explain why this user is being banned..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBan}
              disabled={isActioning}
            >
              {isActioning ? 'Banning...' : 'Ban User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
