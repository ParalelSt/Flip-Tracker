import { cn } from '@/lib/utils';
import type { TrickStatus } from '@/types';

const LABELS: Record<TrickStatus, string> = {
  not_started: 'Not started',
  learning: 'Learning',
  clean: 'Clean',
  mastered: 'Mastered',
};

// Color via inline style so the dynamic OKLCH tokens work even when Tailwind
// can't statically parse the class name.
const COLOR: Record<TrickStatus, string> = {
  not_started: 'var(--status-idle)',
  learning: 'var(--status-learning)',
  clean: 'var(--status-clean)',
  mastered: 'var(--status-mastered)',
};

interface Props {
  status: TrickStatus;
  size?: 'sm' | 'md';
  /** Selected state — renders a tighter, brand-colored ring rendered as an
   *  inset box-shadow on the pill itself (avoids the misaligned outer
   *  `ring-offset` problem from wrapping the pill in another element). */
  active?: boolean;
  className?: string;
}

export function StatusPill({ status, size = 'sm', active, className }: Props) {
  const color = COLOR[status];
  const baseRing = `inset 0 0 0 1px color-mix(in oklab, ${color} 35%, transparent)`;
  const activeRing = `inset 0 0 0 2px ${color}`;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium tracking-tight transition-shadow',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className,
      )}
      style={{
        color,
        backgroundColor: `color-mix(in oklab, ${color} ${active ? 28 : 18}%, transparent)`,
        boxShadow: active ? activeRing : baseRing,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {LABELS[status]}
    </span>
  );
}
