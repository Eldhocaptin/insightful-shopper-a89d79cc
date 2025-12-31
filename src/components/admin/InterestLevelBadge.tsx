import { Badge } from '@/components/ui/badge';
import { Flame, Thermometer, Snowflake, IceCream } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InterestLevelBadgeProps {
  level: 'hot' | 'warm' | 'cool' | 'cold';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const levelConfig = {
  hot: {
    label: 'Hot',
    emoji: '🔥',
    icon: Flame,
    className: 'bg-red-500/20 text-red-600 border-red-500/30 hover:bg-red-500/30',
    description: 'Ready to buy',
  },
  warm: {
    label: 'Warm',
    emoji: '🌡️',
    icon: Thermometer,
    className: 'bg-orange-500/20 text-orange-600 border-orange-500/30 hover:bg-orange-500/30',
    description: 'High interest',
  },
  cool: {
    label: 'Cool',
    emoji: '❄️',
    icon: Snowflake,
    className: 'bg-blue-500/20 text-blue-600 border-blue-500/30 hover:bg-blue-500/30',
    description: 'Needs convincing',
  },
  cold: {
    label: 'Cold',
    emoji: '🧊',
    icon: IceCream,
    className: 'bg-slate-500/20 text-slate-600 border-slate-500/30 hover:bg-slate-500/30',
    description: 'Low interest',
  },
};

const InterestLevelBadge = ({ level, showIcon = true, size = 'md' }: InterestLevelBadgeProps) => {
  const config = levelConfig[level];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium border gap-1.5',
        config.className,
        sizeClasses[size]
      )}
    >
      {showIcon && <span>{config.emoji}</span>}
      {config.label}
    </Badge>
  );
};

export const InterestLevelDescription = ({ level }: { level: 'hot' | 'warm' | 'cool' | 'cold' }) => {
  return (
    <span className="text-muted-foreground text-sm">
      {levelConfig[level].description}
    </span>
  );
};

export default InterestLevelBadge;
