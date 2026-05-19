import { useEffect, useState } from 'react';
import { MessageSquareText, Search, Inbox } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatPanel } from '@/components/communications/ChatPanel';
import { communicationsApi } from '@/services/communications';
import type { ConversationSummary } from '@/types';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

/**
 * Full-page chat UX:
 *  - Left: scrollable inbox of leads with at least one communication (RBAC scoped).
 *  - Right: ChatPanel for the selected conversation.
 *
 * Poll-driven; the ChatPanel polls every 10s for new messages, this page polls
 * every 15s for inbox previews.
 */
export default function CommunicationsPage() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchConversations = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const items = await communicationsApi.conversations();
      setConversations(items);
      if (!selected && items.length > 0) setSelected(items[0].leadId);
    } catch {
      setConversations([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    const id = setInterval(() => fetchConversations(true), 15_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = search.trim()
    ? conversations.filter((c) =>
        c.leadName.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search.trim()),
      )
    : conversations;

  const active = conversations.find((c) => c.leadId === selected) ?? null;

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col animate-fade-in" data-testid="communications-page">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-2xl font-heading font-semibold tracking-tight flex items-center gap-2">
            <MessageSquareText size={22} className="text-primary" />
            Communications
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Live WhatsApp chats and call history, in one place.
          </p>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full grid grid-cols-1 md:grid-cols-[320px_1fr]">
          {/* Inbox */}
          <div className="border-r bg-muted/10 flex flex-col" data-testid="conversation-inbox">
            <div className="p-3 border-b">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or phone"
                  className="pl-8 h-9"
                  data-testid="conversation-search"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-3 space-y-2">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center" data-testid="conversation-empty">
                  <Inbox size={28} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No conversations yet. Send a WhatsApp message from a lead to start one.
                  </p>
                </div>
              ) : (
                <ul>
                  {filtered.map((c) => {
                    const active = selected === c.leadId;
                    const preview = c.lastMessage?.message
                      ? c.lastMessage.message
                      : c.lastMessage?.type === 'CALL'
                        ? `Call · ${c.lastMessage.status}`
                        : 'No messages yet';
                    return (
                      <li key={c.leadId}>
                        <button
                          onClick={() => setSelected(c.leadId)}
                          className={`w-full text-left p-3 border-b flex gap-3 transition-colors ${
                            active ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-muted/40'
                          }`}
                          data-testid={`conversation-item-${c.leadId}`}
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold shrink-0">
                            {c.leadName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-sm truncate">{c.leadName}</span>
                              {c.lastMessage && (
                                <span className="text-[10px] text-muted-foreground shrink-0">
                                  {timeAgo(c.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">{preview}</p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Chat */}
          <div>
            {active ? (
              <ChatPanel
                key={active.leadId}
                conversation={active}
                onAfterAction={() => fetchConversations(true)}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm" data-testid="conversation-placeholder">
                {loading ? 'Loading…' : 'Select a conversation to view messages.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
