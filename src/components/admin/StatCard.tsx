import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  className?: string;
}

const StatCard = ({ title, value, change, changeType = 'neutral', icon: Icon, className }: StatCardProps) => {
  const changeColors = {
    positive: 'text-score-scale',
    negative: 'text-score-kill',
    neutral: 'text-muted-foreground',
  };

  return (
    <div className={cn('p-5 rounded-xl bg-card border border-border', className)}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      {change && (
        <p className={cn('text-xs', changeColors[changeType])}>
          {change}
        </p>
      )}
    </div>
  );
};

export default StatCard;
