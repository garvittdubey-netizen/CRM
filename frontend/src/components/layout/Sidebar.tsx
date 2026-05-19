import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  UserPlus,
  CalendarClock,
  TrendingUp,
  BarChart3,
  Settings,
  UserCog,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: UserPlus, label: 'Leads', href: '/leads' },
  { icon: CalendarClock, label: 'Follow-ups', href: '/followups' },
  { icon: Building2, label: 'Properties', href: '/properties' },
  { icon: Users, label: 'Clients', href: '/clients' },
  { icon: TrendingUp, label: 'Deals', href: '/deals' },
  { icon: BarChart3, label: 'Reports', href: '/reports', roles: ['ADMIN'] },
  { icon: UserCog, label: 'Users', href: '/users', roles: ['ADMIN'] },
];

const BOTTOM_NAV: NavItem[] = [
  { icon: Settings, label: 'Settings', href: '/settings' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        data-testid="sidebar"
        className={cn(
          'hidden md:flex flex-col h-full border-r border-border bg-card transition-all duration-300 ease-in-out shrink-0',
          collapsed ? 'w-[68px]' : 'w-[260px]',
        )}
      >
        {/* Logo */}
        <div className={cn('flex items-center h-16 px-4 border-b border-border', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed && (
            <div className="flex items-center gap-2" data-testid="sidebar-logo">
              <Building2 className="h-6 w-6 text-primary shrink-0" />
              <span className="font-heading font-semibold text-lg text-primary">EstateOS</span>
            </div>
          )}
          {collapsed && <Building2 className="h-6 w-6 text-primary" />}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn('h-8 w-8 text-muted-foreground hover:text-foreground', collapsed && 'mt-0')}
            data-testid="sidebar-toggle"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5" data-testid="sidebar-nav">
          {visibleItems.map((item) => (
            <NavItem
              key={item.href}
              item={item}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <Separator />

        {/* Bottom Nav */}
        <div className="py-3 px-2 space-y-0.5">
          {BOTTOM_NAV.map((item) => (
            <NavItem key={item.href} item={item} collapsed={collapsed} />
          ))}
        </div>

        {/* User info + Logout */}
        <div className={cn('p-3 border-t border-border')}>
          {!collapsed ? (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-semibold shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                data-testid="logout-button"
              >
                <LogOut size={15} />
              </Button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="w-full h-9 text-muted-foreground hover:text-destructive"
                  data-testid="logout-button-collapsed"
                >
                  <LogOut size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}

function NavItem({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const Icon = item.icon;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      isActive
        ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground'
        : 'text-muted-foreground',
      collapsed && 'justify-center px-0 w-10 mx-auto',
    );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <NavLink to={item.href} className={linkClass} data-testid={`nav-${item.label.toLowerCase()}`}>
              <Icon size={18} />
            </NavLink>
          </TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <NavLink to={item.href} className={linkClass} data-testid={`nav-${item.label.toLowerCase()}`}>
      <Icon size={18} className="shrink-0" />
      <span>{item.label}</span>
    </NavLink>
  );
}
