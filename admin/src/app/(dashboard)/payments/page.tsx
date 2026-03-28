'use client';

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { StatCard } from '@/components/admin/stat-card';
import { api } from '@/lib/api';
import { Transaction } from '@/types';
import { formatDateTime, formatCurrency } from '@/lib/utils';

const columns: Column<Transaction>[] = [
  {
    key: 'id',
    header: 'ID',
    cell: (t) => <span className="text-xs font-mono text-muted-foreground">{t.id.slice(0, 8)}</span>,
  },
  {
    key: 'type',
    header: 'Type',
    cell: (t) => (
      <span className="text-xs font-medium">
        {t.type.replace('_', ' ')}
      </span>
    ),
  },
  {
    key: 'user',
    header: 'User',
    cell: (t) => (
      <div>
        <p className="text-sm">{t.user?.name || 'Unknown'}</p>
        <p className="text-xs text-muted-foreground">{t.user?.email}</p>
      </div>
    ),
  },
  {
    key: 'booking',
    header: 'Booking',
    cell: (t) => t.booking ? (
      <span className="text-xs font-mono text-muted-foreground">
        {t.booking.id.slice(0, 8)}
      </span>
    ) : (
      <span className="text-xs text-muted-foreground">N/A</span>
    ),
  },
  {
    key: 'amount',
    header: 'Amount',
    cell: (t) => (
      <span className={`text-sm font-medium ${
        t.type === 'REFUND' ? 'text-red-600' : 'text-emerald-600'
      }`}>
        {t.type === 'REFUND' ? '-' : '+'}{formatCurrency(t.amount)}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    cell: (t) => <StatusBadge status={t.status} />,
  },
  {
    key: 'date',
    header: 'Date',
    cell: (t) => <span className="text-sm text-muted-foreground">{formatDateTime(t.createdAt)}</span>,
  },
];

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [revenueStats, setRevenueStats] = useState<{
    thisMonth: number;
    lastMonth: number;
    total: number;
  } | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [txData, revenue] = await Promise.all([
        api.getTransactions({
          page,
          limit: 20,
          type: typeFilter !== 'ALL' ? typeFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined,
        }),
        api.getRevenueStats().catch(() => null),
      ]);
      setTransactions(txData.data);
      setTotalPages(txData.totalPages);
      setTotal(txData.total);
      setRevenueStats(revenue);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, typeFilter, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [typeFilter, statusFilter]);

  const monthChange = revenueStats?.lastMonth
    ? ((revenueStats.thisMonth - revenueStats.lastMonth) / revenueStats.lastMonth) * 100
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description={`${total} total transactions`} />

      {/* Revenue stats */}
      {revenueStats && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          <StatCard
            title="Revenue This Month"
            value={formatCurrency(revenueStats.thisMonth)}
            icon={DollarSign}
            trend={monthChange !== 0 ? {
              value: Math.round(monthChange),
              label: 'vs last month',
            } : undefined}
          />
          <StatCard
            title="Revenue Last Month"
            value={formatCurrency(revenueStats.lastMonth)}
            icon={BarChart3}
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(revenueStats.total)}
            icon={TrendingUp}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="Transaction type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            <SelectItem value="BOOKING_PAYMENT">Booking Payment</SelectItem>
            <SelectItem value="PLATFORM_FEE">Platform Fee</SelectItem>
            <SelectItem value="COMPANION_PAYOUT">Companion Payout</SelectItem>
            <SelectItem value="REFUND">Refund</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={transactions}
        isLoading={isLoading}
        emptyMessage="No transactions found."
        pagination={{ page, totalPages, onPageChange: setPage }}
      />
    </div>
  );
}
