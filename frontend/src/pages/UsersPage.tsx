import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pencil, UserCog, Shield, ShieldOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserFormModal } from '@/components/users/UserFormModal';
import { usersApi, type ManagedUser } from '@/services/users';
import { extractApiError } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

/**
 * User management page — ADMIN only. The route is already gated by
 * `<ProtectedRoute roles={['ADMIN']}>` in App.tsx; we still hide destructive
 * controls for self-rows to prevent footguns at the UI level.
 */
export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<'ALL' | 'ADMIN' | 'AGENT'>('ALL');
  const [isActive, setIsActive] = useState<'ALL' | 'true' | 'false'>('ALL');
  const [users, setUsers] = useState<ManagedUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<ManagedUser | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersApi.list({ search, role, isActive });
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [search, role, isActive]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const toggleActive = async (target: ManagedUser) => {
    try {
      await usersApi.update(target.id, { isActive: !target.isActive });
      fetchUsers();
    } catch (e) {
      window.alert(extractApiError(e, 'Failed to update status'));
    }
  };

  return (
    <div className="space-y-5 animate-fade-in" data-testid="users-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {users ? `${users.length} user${users.length !== 1 ? 's' : ''}` : 'Manage agents and admins'}
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} data-testid="add-user-button">
          <Plus size={16} className="mr-1.5" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card data-testid="users-filters">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                className="pl-9"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-testid="users-search-input"
              />
            </div>

            <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
              <SelectTrigger className="w-[150px]" data-testid="users-role-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="AGENT">Agent</SelectItem>
              </SelectContent>
            </Select>

            <Select value={isActive} onValueChange={(v) => setIsActive(v as typeof isActive)}>
              <SelectTrigger className="w-[150px]" data-testid="users-status-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Disabled</SelectItem>
              </SelectContent>
            </Select>

            {(search || role !== 'ALL' || isActive !== 'ALL') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setSearch(''); setRole('ALL'); setIsActive('ALL'); }}
                data-testid="users-clear-filters"
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : !users || users.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center"
              data-testid="users-empty"
            >
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <UserCog size={22} className="text-muted-foreground" />
              </div>
              <p className="font-medium mb-1">No users match your filters</p>
              <p className="text-sm text-muted-foreground">
                Adjust the search or add a new user.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="users-table">
                <thead>
                  <tr className="border-b bg-muted/40">
                    {['Name', 'Email', 'Role', 'Status', 'Added', ''].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <UserRow
                      key={u.id}
                      user={u}
                      isSelf={u.id === currentUser?.id}
                      onEdit={() => setEditUser(u)}
                      onToggleActive={() => toggleActive(u)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <UserFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={fetchUsers}
      />
      <UserFormModal
        open={!!editUser}
        user={editUser}
        onClose={() => setEditUser(null)}
        onSuccess={() => { fetchUsers(); setEditUser(null); }}
      />
    </div>
  );
}

interface UserRowProps {
  user: ManagedUser;
  isSelf: boolean;
  onEdit: () => void;
  onToggleActive: () => void;
}

function UserRow({ user, isSelf, onEdit, onToggleActive }: UserRowProps) {
  return (
    <tr
      className="border-b last:border-0 hover:bg-muted/30 transition-colors group"
      data-testid={`user-row-${user.id}`}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium leading-tight">
              {user.name}
              {isSelf && <span className="ml-2 text-[10px] text-muted-foreground">(you)</span>}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
      <td className="px-4 py-3">
        <Badge variant={user.role === 'ADMIN' ? 'default' : 'outline'}>
          {user.role}
        </Badge>
      </td>
      <td className="px-4 py-3">
        <Badge
          variant={user.isActive ? 'outline' : 'destructive'}
          data-testid={`user-status-${user.id}`}
        >
          {user.isActive ? 'Active' : 'Disabled'}
        </Badge>
      </td>
      <td className="px-4 py-3 text-muted-foreground text-xs">
        {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onEdit}
            data-testid={`edit-user-${user.id}`}
            title="Edit user"
          >
            <Pencil size={13} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 ${user.isActive ? 'hover:text-destructive' : 'hover:text-emerald-600'}`}
            onClick={onToggleActive}
            disabled={isSelf}
            data-testid={`toggle-user-${user.id}`}
            title={isSelf ? 'You cannot disable yourself' : user.isActive ? 'Disable user' : 'Enable user'}
          >
            {user.isActive ? <ShieldOff size={13} /> : <Shield size={13} />}
          </Button>
        </div>
      </td>
    </tr>
  );
}
