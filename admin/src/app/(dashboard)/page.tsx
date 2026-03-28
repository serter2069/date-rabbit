'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Calendar, DollarSign, ShieldCheck, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/admin/stat-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { UserAvatar } from '@/components/admin/user-avatar';
import { PageHeader } from '@/components/admin/page-header';
import { api } from '@/lib/api';
import { DashboardStats, Booking } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, bookingsData] = await Promise.all([
          api.getDashboardStats().catch(() => null),
          api.getBookings({ page: 1, limit: 10 }).catch(() => ({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 })),
        ]);
        setStats(statsData);
        setRecentBookings(bookingsData.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Overview of platform activity" />
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of platform activity" />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers ?? '--'}
          description={`${stats?.totalSeekers ?? 0} seekers, ${stats?.totalCompanions ?? 0} companions`}
          icon={Users}
        />
        <StatCard
          title="Total Bookings"
          value={stats?.totalBookings ?? '--'}
          description={`${stats?.completedBookings ?? 0} completed`}
          icon={Calendar}
        />
        <StatCard
          title="Revenue This Month"
          value={stats?.revenueThisMonth != null ? formatCurrency(stats.revenueThisMonth) : '--'}
          description={`Total: ${stats?.revenueTotal != null ? formatCurrency(stats.revenueTotal) : '--'}`}
          icon={DollarSign}
        />
        <StatCard
          title="Pending Verifications"
          value={stats?.pendingVerifications ?? '--'}
          description="Awaiting review"
          icon={ShieldCheck}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid gap-4 grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeBookings ?? '--'}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently in progress or confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalBookings
                ? `${Math.round((stats.completedBookings / stats.totalBookings) * 100)}%`
                : '--'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Bookings completed successfully</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No bookings yet</p>
          ) : (
            <div className="space-y-1">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/bookings/${booking.id}`)}
                >
                  <UserAvatar
                    name={booking.seeker?.name || null}
                    avatarUrl={booking.seeker?.avatarUrl || null}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {booking.seeker?.name || 'Unknown'} with {booking.companion?.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.activity} &middot; {formatDateTime(booking.scheduledAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={booking.status} />
                    <span className="text-sm font-medium text-muted-foreground">
                      {formatCurrency(booking.totalPrice)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
