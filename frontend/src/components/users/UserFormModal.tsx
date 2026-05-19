import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usersApi, type ManagedUser, type CreateUserPayload } from '@/services/users';
import { extractApiError } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: ManagedUser | null;
}

interface FormState {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'AGENT';
  isActive: boolean;
}

const EMPTY: FormState = {
  name: '',
  email: '',
  password: '',
  role: 'AGENT',
  isActive: true,
};

export function UserFormModal({ open, onClose, onSuccess, user }: Props) {
  const isEdit = !!user;
  const { user: currentUser } = useAuth();
  const isSelf = !!user && user.id === currentUser?.id;

  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      setForm(EMPTY);
    }
  }, [open, user]);

  const set = <K extends keyof FormState>(key: K) =>
    (value: FormState[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    // Client-side validation mirrors backend rules so users see fast feedback.
    if (!form.name.trim()) return setError('Name is required');
    if (!form.email.trim()) return setError('Email is required');
    if (!isEdit && form.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }
    if (isEdit && form.password && form.password.length < 8) {
      return setError('Password must be at least 8 characters (leave blank to keep current)');
    }

    setLoading(true);
    setError('');
    try {
      if (isEdit) {
        await usersApi.update(user!.id, {
          name: form.name.trim(),
          role: form.role,
          isActive: form.isActive,
          password: form.password || undefined,
        });
      } else {
        const payload: CreateUserPayload = {
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: form.role,
          isActive: form.isActive,
        };
        await usersApi.create(payload);
      }
      onSuccess();
      onClose();
    } catch (e) {
      setError(extractApiError(e, 'Failed to save user'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg" data-testid="user-form-modal">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Add New User'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {error && (
            <div
              className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md"
              data-testid="user-form-error"
            >
              <AlertCircle size={15} className="shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="uf-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="uf-name"
              value={form.name}
              onChange={(e) => set('name')(e.target.value)}
              placeholder="Priya Sharma"
              data-testid="user-name-input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="uf-email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="uf-email"
              type="email"
              value={form.email}
              onChange={(e) => set('email')(e.target.value)}
              placeholder="priya@example.com"
              disabled={isEdit}
              data-testid="user-email-input"
            />
            {isEdit && (
              <p className="text-xs text-muted-foreground">
                Email cannot be changed after creation.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="uf-password">
              {isEdit ? 'New Password' : (<>Password <span className="text-destructive">*</span></>)}
            </Label>
            <Input
              id="uf-password"
              type="password"
              value={form.password}
              onChange={(e) => set('password')(e.target.value)}
              placeholder={isEdit ? 'Leave blank to keep current' : 'At least 8 characters'}
              data-testid="user-password-input"
              autoComplete="new-password"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select
                value={form.role}
                onValueChange={(v) => set('role')(v as 'ADMIN' | 'AGENT')}
                disabled={isSelf}
              >
                <SelectTrigger data-testid="user-role-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="AGENT">Agent</SelectItem>
                </SelectContent>
              </Select>
              {isSelf && (
                <p className="text-xs text-muted-foreground">You cannot change your own role.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.isActive ? 'active' : 'disabled'}
                onValueChange={(v) => set('isActive')(v === 'active')}
                disabled={isSelf}
              >
                <SelectTrigger data-testid="user-active-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
              {isSelf && (
                <p className="text-xs text-muted-foreground">You cannot disable yourself.</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} data-testid="user-form-submit">
            {loading ? 'Saving...' : isEdit ? 'Update User' : 'Add User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
