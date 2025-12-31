import { cn } from '@/lib/utils';

interface ViabilityBadgeProps {
  recommendation: 'kill' | 'test' | 'scale';
  className?: string;
}

const ViabilityBadge = ({ recommendation, className }: ViabilityBadgeProps) => {
  const styles = {
    kill: 'bg-score-kill/10 text-score-kill border-score-kill/20',
    test: 'bg-score-test/10 text-score-test border-score-test/20',
    scale: 'bg-score-scale/10 text-score-scale border-score-scale/20',
  };

  const labels = {
    kill: 'Kill',
    test: 'Test More',
    scale: 'Scale',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border',
        styles[recommendation],
        className
      )}
    >
      {labels[recommendation]}
    </span>
  );
};

export default ViabilityBadge;
