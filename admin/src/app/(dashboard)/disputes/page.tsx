'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
import { Dispute, DisputeStatus } from '@/types';
import { formatDateTime, truncate } from '@/lib/utils';

const DISPUTE_STATUSES: Array<{ value: DisputeStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const columns: Column<Dispute>[] = [
  {
    key: 'id',
    header: 'ID',
    cell: (d) => (
      <span className="text-xs font-mono text-muted-foreground">{d.id.slice(0, 8)}</span>
    ),
  },
  {
    key: 'openedBy',
    header: 'Opened By',
    cell: (d) => (
      <div className="flex items-center gap-2">
        <UserAvatar
          name={d.openedByUser?.name || null}
          avatarUrl={d.openedByUser?.avatarUrl || null}
          size="sm"
        />
        <div>
          <p className="text-sm font-medium">{d.openedByUser?.name || 'Unknown'}</p>
          <p className="text-xs text-muted-foreground">{d.openedByUser?.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'booking',
    header: 'Booking',
    cell: (d) => (
      <span className="text-sm font-medium">
        {d.booking?.activity || <span className="text-muted-foreground italic">N/A</span>}
      </span>
    ),
  },
  {
    key: 'reason',
    header: 'Reason',
    cell: (d) => (
      <span className="text-sm text-muted-foreground">{truncate(d.reason, 60)}</span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    cell: (d) => <StatusBadge status={d.status} />,
  },
  {
    key: 'createdAt',
    header: 'Opened',
    cell: (d) => (
      <span className="text-sm text-muted-foreground">{formatDateTime(d.createdAt)}</span>
    ),
  },
];

export default function DisputesPage() {
  const router = useRouter();
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<DisputeStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchDisputes = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await api.getDisputes({ page, limit: 20, status });
      setDisputes(result.data);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to fetch disputes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  useEffect(() => {
    setPage(1);
  }, [status]);

  return (
    <div className="space-y-6">
      <PageHeader title="Disputes" description={`${total} total disputes`} />

      <div className="flex gap-3">
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as DisputeStatus | 'ALL')}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {DISPUTE_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={disputes}
        isLoading={isLoading}
        emptyMessage="No disputes found."
        onRowClick={(d) => router.push(`/disputes/${d.id}`)}
        pagination={{ page, totalPages, onPageChange: setPage }}
      />
    </div>
  );
}
