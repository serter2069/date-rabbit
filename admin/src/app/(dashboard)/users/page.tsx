'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Star } from 'lucide-react';
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
import { User } from '@/types';
import { formatDate, formatRelativeTime } from '@/lib/utils';

const columns: Column<User>[] = [
  {
    key: 'user',
    header: 'User',
    cell: (user) => (
      <div className="flex items-center gap-2">
        <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
        <div>
          <p className="font-medium text-sm">{user.name || 'No name'}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: 'role',
    header: 'Role',
    cell: (user) => (
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
        user.role === 'COMPANION'
          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
          : user.role === 'ADMIN'
          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
          : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      }`}>
        {user.role}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    cell: (user) => <StatusBadge status={user.status} />,
  },
  {
    key: 'verification',
    header: 'Verified',
    cell: (user) => <StatusBadge status={user.verificationStatus} />,
  },
  {
    key: 'rating',
    header: 'Rating',
    cell: (user) => user.rating != null ? (
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        <span className="text-sm">{user.rating.toFixed(1)}</span>
        <span className="text-xs text-muted-foreground">({user.reviewCount})</span>
      </div>
    ) : (
      <span className="text-xs text-muted-foreground">No reviews</span>
    ),
  },
  {
    key: 'created',
    header: 'Joined',
    cell: (user) => (
      <span className="text-sm text-muted-foreground" title={formatDate(user.createdAt)}>
        {formatRelativeTime(user.createdAt)}
      </span>
    ),
  },
];

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await api.getUsers({
        page,
        limit: 20,
        search: search || undefined,
        role: role as any,
        status: status as any,
      });
      setUsers(result.data);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, role, status]);

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, search ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [search, role, status]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description={`${total} total users`}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All roles</SelectItem>
            <SelectItem value="SEEKER">Seeker</SelectItem>
            <SelectItem value="COMPANION">Companion</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="BANNED">Banned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        emptyMessage="No users found matching your criteria."
        onRowClick={(user) => router.push(`/users/${user.id}`)}
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}
