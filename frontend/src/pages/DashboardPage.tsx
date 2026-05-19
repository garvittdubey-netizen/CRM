import { useState, useEffect } from 'react';
import { CalendarCheck2, CalendarClock, AlertOctagon, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UpcomingFollowUpsWidget } from '@/components/followups/UpcomingFollowUpsWidget';
import { ActivityWidget } from '@/components/activities/ActivityWidget';
import { followUpsApi } from '@/services/followups';
import { useAuth } from '@/hooks/useAuth';
import type { FollowUpDashboardStats } from '@/types';

interface StatCardConfig {
  testIdKey: string;
  title: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  description: string;
  getValue: (s: FollowUpDashboardStats | null) => string;
}

const STAT_CARDS: StatCardConfig[] = [
  {
    testIdKey: 'todays-followups',
    title: "Today's Follow-ups",
    icon: CalendarCheck2,
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    description: 'Scheduled for today',
    getValue: (s) => (s ? String(s.today) : '—'),
  },
  {
    testIdKey: 'overdue-followups',
    title: 'Overdue',
    icon: AlertOctagon,
    iconColor: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-50 dark:bg-red-950/50',
    description: 'Pending past their date',
    getValue: (s) => (s ? String(s.overdue) : '—'),
  },
  {
    testIdKey: 'upcoming-followups',
    title: 'Upcoming',
    icon: CalendarClock,
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    description: 'Pending and on schedule',
    getValue: (s) => (s ? String(s.upcoming) : '—'),
  },
  {
    testIdKey: 'leads',
    title: 'Leads',
    icon: Users,
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-50 dark:bg-purple-950/50',
    description: 'In your pipeline',
    getValue: () => '—',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<FollowUpDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    followUpsApi
      .stats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in" data-testid="dashboard-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold tracking-tight">
            Good morning, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Here's an overview of your real estate portfolio
          </p>
        </div>
        <Badge variant="outline" className="hidden sm:flex" data-testid="user-role-badge">
          {user?.role}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" data-testid="stats-grid">
        {STAT_CARDS.map((card) => (
          <StatCard key={card.testIdKey} card={card} stats={stats} loading={loading} />
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <UpcomingFollowUpsWidget />
        </div>
        <ActivityWidget />
      </div>
    </div>
  );
}

function StatCard({
  card, stats, loading,
}: {
  card: StatCardConfig;
  stats: FollowUpDashboardStats | null;
  loading: boolean;
}) {
  const Icon = card.icon;
  return (
    <Card
      className="hover:shadow-md transition-shadow duration-200"
      data-testid={`stat-card-${card.testIdKey}`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
        <div className={`rounded-md p-2 ${card.iconBg}`}>
          <Icon size={16} className={card.iconColor} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-heading font-bold">
          {loading ? <Skeleton className="h-7 w-12" /> : card.getValue(stats)}
        </div>
        <span className="text-xs text-muted-foreground mt-1 block">{card.description}</span>
      </CardContent>
    </Card>
  );
}
