import { cn } from '@/lib/utils';

interface ViabilityScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ViabilityScoreRing = ({ score, size = 'md', className }: ViabilityScoreRingProps) => {
  const sizes = {
    sm: { width: 48, strokeWidth: 4, fontSize: 'text-sm' },
    md: { width: 80, strokeWidth: 6, fontSize: 'text-xl' },
    lg: { width: 120, strokeWidth: 8, fontSize: 'text-3xl' },
  };

  const { width, strokeWidth, fontSize } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 65) return 'hsl(var(--score-scale))';
    if (score >= 35) return 'hsl(var(--score-test))';
    return 'hsl(var(--score-kill))';
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={width} height={width} className="-rotate-90">
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className={cn('absolute font-bold', fontSize)}>{score}</span>
    </div>
  );
};

export default ViabilityScoreRing;
