'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/admin/page-header';
import { UserAvatar } from '@/components/admin/user-avatar';
import { DataTable, Column } from '@/components/admin/data-table';
import { api } from '@/lib/api';
import { Review } from '@/types';
import { formatDateTime, truncate } from '@/lib/utils';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating}/5</span>
    </div>
  );
}

export default function ReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await api.getReviews({ page, limit: 20 });
      setReviews(result.data);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.deleteReview(deleteTarget.id);
      setDeleteTarget(null);
      await fetchReviews();
    } catch (err) {
      console.error('Failed to delete review:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Review>[] = [
    {
      key: 'author',
      header: 'Author',
      cell: (r) => (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); router.push(`/users/${r.authorId}`); }}
        >
          <UserAvatar name={r.author?.name || null} avatarUrl={r.author?.avatarUrl || null} size="sm" />
          <div>
            <p className="text-sm font-medium">{r.author?.name || 'Unknown'}</p>
            <p className="text-xs text-muted-foreground">{r.author?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'target',
      header: 'Reviewed',
      cell: (r) => (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); router.push(`/users/${r.targetId}`); }}
        >
          <UserAvatar name={r.target?.name || null} avatarUrl={r.target?.avatarUrl || null} size="sm" />
          <span className="text-sm">{r.target?.name || 'Unknown'}</span>
        </div>
      ),
    },
    {
      key: 'rating',
      header: 'Rating',
      cell: (r) => <StarRating rating={r.rating} />,
    },
    {
      key: 'comment',
      header: 'Comment',
      cell: (r) => r.comment ? (
        <span className="text-sm text-muted-foreground">{truncate(r.comment, 80)}</span>
      ) : (
        <span className="text-xs text-muted-foreground italic">No comment</span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      cell: (r) => <span className="text-sm text-muted-foreground">{formatDateTime(r.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      cell: (r) => (
        <Button
          size="sm"
          variant="ghost"
          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-7"
          onClick={(e) => { e.stopPropagation(); setDeleteTarget(r); }}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reviews" description={`${total} total reviews`} />

      <DataTable
        columns={columns}
        data={reviews}
        isLoading={isLoading}
        emptyMessage="No reviews found."
        pagination={{ page, totalPages, onPageChange: setPage }}
      />

      {/* Delete dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Review</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this review from{' '}
              {deleteTarget?.author?.name || deleteTarget?.author?.email}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deleteTarget?.comment && (
            <div className="rounded-lg bg-muted p-3 text-sm italic">
              &ldquo;{deleteTarget.comment}&rdquo;
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
