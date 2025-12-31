import { Card, CardContent } from '@/components/ui/card';
import { Flame, Thermometer, Snowflake, IceCream } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InterestOverviewCardsProps {
  counts: {
    hot: number;
    warm: number;
    cool: number;
    cold: number;
  };
}

const cardConfig = [
  {
    key: 'hot' as const,
    label: 'Hot',
    emoji: '🔥',
    icon: Flame,
    gradient: 'from-red-500/10 to-orange-500/10',
    border: 'border-red-500/20',
    iconColor: 'text-red-500',
    description: 'Ready to buy',
  },
  {
    key: 'warm' as const,
    label: 'Warm',
    emoji: '🌡️',
    icon: Thermometer,
    gradient: 'from-orange-500/10 to-amber-500/10',
    border: 'border-orange-500/20',
    iconColor: 'text-orange-500',
    description: 'High interest',
  },
  {
    key: 'cool' as const,
    label: 'Cool',
    emoji: '❄️',
    icon: Snowflake,
    gradient: 'from-blue-500/10 to-cyan-500/10',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-500',
    description: 'Needs convincing',
  },
  {
    key: 'cold' as const,
    label: 'Cold',
    emoji: '🧊',
    icon: IceCream,
    gradient: 'from-slate-500/10 to-gray-500/10',
    border: 'border-slate-500/20',
    iconColor: 'text-slate-500',
    description: 'Low interest',
  },
];

const InterestOverviewCards = ({ counts }: InterestOverviewCardsProps) => {
  const total = counts.hot + counts.warm + counts.cool + counts.cold;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cardConfig.map((config) => {
        const count = counts[config.key];
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
        
        return (
          <Card 
            key={config.key}
            className={cn(
              'relative overflow-hidden border',
              config.border
            )}
          >
            <div className={cn(
              'absolute inset-0 bg-gradient-to-br opacity-50',
              config.gradient
            )} />
            <CardContent className="relative p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{config.emoji}</span>
                <config.icon className={cn('h-5 w-5', config.iconColor)} />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{count}</p>
                <p className="text-sm font-medium">{config.label} Products</p>
                <p className="text-xs text-muted-foreground">
                  {percentage}% of catalog • {config.description}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default InterestOverviewCards;
