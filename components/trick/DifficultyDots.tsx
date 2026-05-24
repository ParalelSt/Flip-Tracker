import { cn } from '@/lib/utils';
import type { Difficulty } from '@/types';

interface Props {
  value: Difficulty;
  className?: string;
}

const ALL: Difficulty[] = [1, 2, 3, 4, 5];

/** 5-dot inline difficulty meter. Filled dots = level. Filled dots use the
 *  blade accent for ≥3 (intermediate-and-up), neutral otherwise. */
export function DifficultyDots({ value, className }: Props) {
  const accent = value >= 3;
  return (
    <span className={cn('inline-flex items-center gap-1', className)} aria-label={`Difficulty ${value} of 5`}>
      {ALL.map((d) => (
        <span
          key={d}
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            d <= value
              ? accent ? 'bg-blade' : 'bg-foreground/70'
              : 'bg-foreground/15',
          )}
        />
      ))}
    </span>
  );
}
