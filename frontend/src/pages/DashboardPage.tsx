import { Building2, Users, TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';

interface StatCard {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend?: string;
}

const STAT_CARDS: StatCard[] = [
  {
    title: 'Total Properties',
    value: '—',
    description: 'Properties in portfolio',
    icon: Building2,
    iconColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    trend: 'No data yet',
  },
  {
    title: 'Active Listings',
    value: '—',
    description: 'Currently on market',
    icon: TrendingUp,
    iconColor: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-50 dark:bg-green-950/50',
    trend: 'No data yet',
  },
  {
    title: 'Total Clients',
    value: '—',
    description: 'Registered clients',
    icon: Users,
    iconColor: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-50 dark:bg-purple-950/50',
    trend: 'No data yet',
  },
  {
    title: 'Pending Deals',
    value: '—',
    description: 'Awaiting closure',
    icon: DollarSign,
    iconColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-50 dark:bg-amber-950/50',
    trend: 'No data yet',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();

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
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        data-testid="stats-grid"
      >
        {STAT_CARDS.map((card) => (
          <StatCardComponent key={card.title} card={card} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <Card className="lg:col-span-2" data-testid="recent-activity-card">
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState message="Activity feed will appear here once you start adding properties and clients." />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card data-testid="quick-stats-card">
          <CardHeader>
            <CardTitle className="text-base">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState message="Statistics will populate as you add data to the CRM." />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCardComponent({ card }: { card: StatCard }) {
  const Icon = card.icon;

  return (
    <Card
      className="hover:shadow-md transition-shadow duration-200"
      data-testid={`stat-card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
        <div className={`rounded-md p-2 ${card.iconBg}`}>
          <Icon size={16} className={card.iconColor} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-heading font-bold">{card.value}</div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xs text-muted-foreground">{card.description}</span>
          {card.trend && (
            <span className="text-xs text-muted-foreground ml-auto flex items-center gap-0.5">
              <ArrowUpRight size={12} />
              {card.trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
        <Building2 size={18} className="text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground max-w-[200px]">{message}</p>
    </div>
  );
}

export { Skeleton };
