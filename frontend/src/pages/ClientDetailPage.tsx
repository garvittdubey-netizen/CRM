import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Link2,
  UserCircle,
  Wallet,
  MessageSquare,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/leads/StatusBadge';
import { ClientFormModal } from '@/components/clients/ClientFormModal';
import { ClientActivityTimeline } from '@/components/clients/ClientActivityTimeline';
import { clientsApi } from '@/services/clients';
import { extractApiError } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import type { Client, ClientTimelineItem } from '@/types';

function formatBudget(value: number | null): string {
  if (value == null) return '—';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString('en-IN')}`;
}

export default function ClientDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [client, setClient] = useState<Client | null>(null);
  const [timeline, setTimeline] = useState<ClientTimelineItem[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'ADMIN';
  const canManage = isAdmin || (client?.assignedAgentId && client.assignedAgentId === user?.id);

  const fetchClient = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setClient(await clientsApi.get(id));
    } catch (e) {
      setError(extractApiError(e, 'Client not found'));
      setClient(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchTimeline = useCallback(async () => {
    setTimelineLoading(true);
    try {
      setTimeline(await clientsApi.timeline(id));
    } catch {
      setTimeline([]);
    } finally {
      setTimelineLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClient();
    fetchTimeline();
  }, [fetchClient, fetchTimeline]);

  const handleDelete = async () => {
    if (!client) return;
    if (!window.confirm(`Delete client "${client.fullName}"? This cannot be undone.`)) return;
    try {
      await clientsApi.delete(client.id);
      navigate('/clients');
    } catch (e) {
      window.alert(extractApiError(e, 'Failed to delete client.'));
    }
  };

  if (loading) return <DetailSkeleton />;

  if (error || !client) {
    return (
      <div className="space-y-4" data-testid="client-detail-error">
        <Button variant="ghost" size="sm" onClick={() => navigate('/clients')}>
          <ArrowLeft size={14} className="mr-1.5" /> Back to clients
        </Button>
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">{error || 'Client not found.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in" data-testid="client-detail-page">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/clients')}
          data-testid="back-to-clients-button"
        >
          <ArrowLeft size={14} className="mr-1.5" /> Back
        </Button>
        {canManage && (
          <div className="flex gap-2">
            {client.phone && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  client.linkedLeadId
                    ? navigate(`/communications?leadId=${client.linkedLeadId}`)
                    : window.alert('Link a lead first to start a conversation.')
                }
                data-testid="client-message-button"
              >
                <MessageSquare size={13} className="mr-1.5" /> Message
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
              data-testid="edit-client-button"
            >
              <Pencil size={13} className="mr-1.5" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="text-destructive hover:text-destructive"
              data-testid="delete-client-button"
            >
              <Trash2 size={13} className="mr-1.5" /> Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        {/* Left column: profile + timeline */}
        <div className="space-y-5 min-w-0">
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 shrink-0 rounded-full bg-primary/10 text-primary grid place-items-center text-2xl font-semibold">
                  {client.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h1
                    className="text-2xl font-heading font-semibold tracking-tight"
                    data-testid="client-detail-name"
                  >
                    {client.fullName}
                  </h1>
                  {client.preferredLocation && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {client.preferredLocation}
                    </p>
                  )}
                </div>
                <span
                  className="text-2xl font-bold text-primary whitespace-nowrap"
                  data-testid="client-detail-budget"
                >
                  {formatBudget(client.budget)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t">
                <Field icon={<Phone size={13} />} label="Phone" value={client.phone || '—'} />
                <Field icon={<Mail size={13} />} label="Email" value={client.email || '—'} />
                <Field
                  icon={<Wallet size={13} />}
                  label="Budget"
                  value={formatBudget(client.budget)}
                />
                <Field
                  icon={<UserCircle size={13} />}
                  label="Agent"
                  value={client.assignedAgent?.name ?? <span className="italic">Unassigned</span>}
                />
                <Field
                  icon={<Link2 size={13} />}
                  label="Linked Lead"
                  value={
                    client.linkedLead ? (
                      <Link
                        to={`/leads/${client.linkedLead.id}`}
                        className="text-primary hover:underline inline-flex items-center gap-1.5"
                        data-testid="client-linked-lead-link"
                      >
                        {client.linkedLead.fullName}
                        <StatusBadge status={client.linkedLead.status} />
                      </Link>
                    ) : (
                      <span className="italic">Not linked</span>
                    )
                  }
                />
                <Field
                  icon={<MapPin size={13} />}
                  label="Created"
                  value={new Date(client.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                />
              </div>

              {client.notes && (
                <div className="pt-3 border-t">
                  <h3 className="font-semibold text-sm mb-2">Notes</h3>
                  <p
                    className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap"
                    data-testid="client-detail-notes"
                  >
                    {client.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <ClientActivityTimeline
            items={timeline}
            loading={timelineLoading}
            hasLinkedLead={!!client.linkedLeadId}
          />
        </div>

        {/* Right column: meta + actions */}
        <aside className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-sm">Quick info</h3>
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">Updated:</span>{' '}
                {new Date(client.updatedAt).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-muted-foreground font-mono break-all">
                <span className="font-medium text-foreground font-sans">ID:</span> {client.id}
              </p>
            </CardContent>
          </Card>

          {client.linkedLead && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-1.5">
                  <Link2 size={13} /> Linked Lead
                </h3>
                <p className="text-sm">{client.linkedLead.fullName}</p>
                <StatusBadge status={client.linkedLead.status} />
                {client.linkedLead.phone && (
                  <p className="text-xs text-muted-foreground">{client.linkedLead.phone}</p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => navigate(`/leads/${client.linkedLead!.id}`)}
                  data-testid="open-linked-lead-button"
                >
                  Open lead
                </Button>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>

      <ClientFormModal
        open={editOpen}
        client={client}
        onClose={() => setEditOpen(false)}
        onSuccess={() => {
          fetchClient();
          fetchTimeline();
          setEditOpen(false);
        }}
      />
    </div>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] text-muted-foreground flex items-center gap-1 uppercase tracking-wide">
        {icon} {label}
      </p>
      <p className="text-sm font-medium break-words">{value}</p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-32" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        <div className="space-y-4">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
        <Skeleton className="h-44 w-full" />
      </div>
    </div>
  );
}
