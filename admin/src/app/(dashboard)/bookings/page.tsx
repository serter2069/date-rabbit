'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/admin/page-header';
import { DataTable, Column } from '@/components/admin/data-table';
import { StatusBadge } from '@/components/admin/status-badge';
import { UserAvatar } from '@/components/admin/user-avatar';
import { api } from '@/lib/api';
import { Booking, BookingStatus } from '@/types';
import { formatDateTime, formatCurrency } from '@/lib/utils';

const columns: Column<Booking>[] = [
  {
    key: 'id',
    header: 'ID',
    cell: (b) => <span className="text-xs font-mono text-muted-foreground">{b.id.slice(0, 8)}</span>,
  },
  {
    key: 'seeker',
    header: 'Seeker',
    cell: (b) => (
      <div className="flex items-center gap-2">
        <UserAvatar name={b.seeker?.name || null} avatarUrl={b.seeker?.avatarUrl || null} size="sm" />
        <span className="text-sm">{b.seeker?.name || 'Unknown'}</span>
      </div>
    ),
  },
  {
    key: 'companion',
    header: 'Companion',
    cell: (b) => (
      <div className="flex items-center gap-2">
        <UserAvatar name={b.companion?.name || null} avatarUrl={b.companion?.avatarUrl || null} size="sm" />
        <span className="text-sm">{b.companion?.name || 'Unknown'}</span>
      </div>
    ),
  },
  {
    key: 'activity',
    header: 'Activity',
    cell: (b) => <span className="text-sm font-medium">{b.activity}</span>,
  },
  {
    key: 'date',
    header: 'Scheduled',
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

const BOOKING_STATUSES: BookingStatus[] = [
  'PENDING', 'CONFIRMED', 'PAID', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REFUNDED'
];

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await api.getBookings({
        page,
        limit: 20,
        status: status as any,
        search: search || undefined,
      });
      setBookings(result.data);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timeout = setTimeout(fetchBookings, search ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [fetchBookings]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        description={`${total} total bookings`}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            {BOOKING_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={bookings}
        isLoading={isLoading}
        emptyMessage="No bookings found."
        onRowClick={(b) => router.push(`/bookings/${b.id}`)}
        pagination={{ page, totalPages, onPageChange: setPage }}
      />
    </div>
  );
}
