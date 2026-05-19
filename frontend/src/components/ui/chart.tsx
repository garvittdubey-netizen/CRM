/**
 * Thin wrapper around Recharts' ResponsiveContainer that gives every chart
 * a consistent size + tooltip theme tied to our Tailwind/Shadcn tokens.
 *
 * This is intentionally minimal — we don't ship the full shadcn/chart.tsx
 * registry component because we only need a responsive shell.
 */
import * as React from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: number;
}

export function ChartContainer({
  className,
  children,
  height = 260,
  ...rest
}: ChartContainerProps) {
  return (
    <div className={cn('w-full', className)} style={{ height }} {...rest}>
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Tooltip styling shared across every chart. Recharts merges these into its
 * default tooltip without forcing us to ship a custom component each time.
 */
export const tooltipStyle: React.CSSProperties = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '6px',
  color: 'hsl(var(--popover-foreground))',
  fontSize: '12px',
  padding: '8px 10px',
};

export const tooltipItemStyle: React.CSSProperties = {
  color: 'hsl(var(--popover-foreground))',
};

export const tooltipLabelStyle: React.CSSProperties = {
  color: 'hsl(var(--muted-foreground))',
  fontSize: '11px',
  marginBottom: '4px',
};

/** Palette used for categorical series (status, source, agents...). */
export const CHART_COLORS = [
  '#1e3a5f', // navy-500
  '#5880ba', // navy-400
  '#82a0cb', // navy-300
  '#0ea5e9', // sky-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
];
