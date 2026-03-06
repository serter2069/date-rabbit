'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { UserAvatar } from '@/components/admin/user-avatar';
import { DataTable, Column } from '@/components/admin/data-table';
import { api } from '@/lib/api';
import { VerificationSubmission } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function VerificationsPage() {
  const [verifications, setVerifications] = useState<VerificationSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING_REVIEW');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedItem, setSelectedItem] = useState<VerificationSubmission | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [error, setError] = useState('');

  const fetchVerifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await api.getVerifications({
        page,
        limit: 20,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });
      setVerifications(result.data);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to fetch verifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const handleApprove = async (item: VerificationSubmission) => {
    setIsActioning(true);
    try {
      await api.approveVerification(item.id);
      await fetchVerifications();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve');
    } finally {
      setIsActioning(false);
    }
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    setIsActioning(true);
    try {
      await api.rejectVerification(selectedItem.id, rejectReason);
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedItem(null);
      await fetchVerifications();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reject');
    } finally {
      setIsActioning(false);
    }
  };

  const columns: Column<VerificationSubmission>[] = [
    {
      key: 'user',
      header: 'User',
      cell: (v) => (
        <div className="flex items-center gap-2">
          <UserAvatar name={v.user?.name || null} avatarUrl={v.user?.avatarUrl || null} size="sm" />
          <div>
            <p className="font-medium text-sm">{v.user?.name || 'No name'}</p>
            <p className="text-xs text-muted-foreground">{v.user?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (v) => <StatusBadge status={v.status} />,
    },
    {
      key: 'submitted',
      header: 'Submitted',
      cell: (v) => <span className="text-sm text-muted-foreground">{formatDateTime(v.createdAt)}</span>,
    },
    {
      key: 'docs',
      header: 'Documents',
      cell: (v) => (
        <div className="flex gap-2">
          {v.idDocumentUrl && (
            <a
              href={v.idDocumentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="h-3 w-3" /> ID Doc
            </a>
          )}
          {v.selfieUrl && (
            <a
              href={v.selfieUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="h-3 w-3" /> Selfie
            </a>
          )}
          {!v.idDocumentUrl && !v.selfieUrl && (
            <span className="text-xs text-muted-foreground">No docs</span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (v) => v.status === 'PENDING_REVIEW' ? (
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            size="sm"
            variant="outline"
            className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 h-7 text-xs"
            onClick={() => handleApprove(v)}
            disabled={isActioning}
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50 h-7 text-xs"
            onClick={() => { setSelectedItem(v); setRejectDialogOpen(true); }}
            disabled={isActioning}
          >
            <XCircle className="mr-1 h-3 w-3" />
            Reject
          </Button>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">
          {v.reviewedAt ? `Reviewed ${formatDateTime(v.reviewedAt)}` : 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Verifications" description={`${total} submissions`} />

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PENDING_REVIEW">Pending Review</SelectItem>
            <SelectItem value="VERIFIED">Verified</SelectItem>
            <SelectItem value="REJECTED">Rejected</SelectItem>
            <SelectItem value="UNVERIFIED">Unverified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={verifications}
        isLoading={isLoading}
        emptyMessage="No verification submissions found."
        pagination={{ page, totalPages, onPageChange: setPage }}
      />

      {/* Reject dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting{' '}
              {selectedItem?.user?.name || selectedItem?.user?.email}&apos;s verification.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason</Label>
            <Textarea
              id="reject-reason"
              placeholder="The documents provided are not clear / valid..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isActioning || !rejectReason.trim()}
            >
              {isActioning ? 'Rejecting...' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
