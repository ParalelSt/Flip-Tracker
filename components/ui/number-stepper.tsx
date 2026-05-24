'use client';

import { useId, type ReactNode } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  /** Required label for a11y. Visually hidden — caller renders its own <Label>. */
  label: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Optional unit tag rendered on the right ("min", "reps"…). */
  suffix?: string;
  id?: string;
  className?: string;
}

/** Minimal -/+ stepper. Native arrows hidden via globals.css; this replaces them
 *  with on-brand buttons that fit the Linear/Stripe feel from DESIGN.md. */
export function NumberStepper({
  label, value, onChange, min = -Infinity, max = Infinity, step = 1, suffix, id, className,
}: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const dec = () => onChange(clamp(value - step));
  const inc = () => onChange(clamp(value + step));

  return (
    <div
      className={cn(
        'inline-flex h-9 items-stretch overflow-hidden rounded-lg bg-transparent ring-1 ring-border',
        'focus-within:ring-2 focus-within:ring-ring/50',
        className,
      )}
    >
      <StepperButton onClick={dec} disabled={value <= min} label={`Decrease ${label}`}>
        <Minus className="h-3.5 w-3.5" strokeWidth={2.25} />
      </StepperButton>
      <div className="relative flex items-center">
        <input
          id={inputId}
          type="number"
          inputMode="numeric"
          aria-label={label}
          value={Number.isFinite(value) ? value : ''}
          min={min === -Infinity ? undefined : min}
          max={max === Infinity ? undefined : max}
          step={step}
          onChange={(e) => {
            const n = e.target.value === '' ? 0 : Number(e.target.value);
            if (!Number.isNaN(n)) onChange(clamp(n));
          }}
          className={cn(
            'w-16 h-full bg-transparent text-center text-sm font-medium tabular-nums outline-none',
            suffix && 'pr-8',
          )}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-2 text-[11px] text-muted-foreground">{suffix}</span>
        )}
      </div>
      <StepperButton onClick={inc} disabled={value >= max} label={`Increase ${label}`}>
        <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
      </StepperButton>
    </div>
  );
}

interface BtnProps {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: ReactNode;
}

function StepperButton({ onClick, disabled, label, children }: BtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'grid w-8 place-items-center text-sm text-muted-foreground transition-colors',
        'hover:text-foreground hover:bg-muted',
        'active:bg-muted/60',
        'disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground disabled:cursor-not-allowed',
      )}
    >
      {children}
    </button>
  );
}
