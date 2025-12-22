import { clsx } from 'clsx';
import * as React from 'react';

export function cn(...inputs: any[]) {
  return clsx(...inputs);
}

export function Card(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        'rounded-2xl border border-border bg-card/80 backdrop-blur-sm shadow-soft',
        props.className
      )}
    />
  );
}

export function Button({
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

  const variants: Record<string, string> = {
    primary: 'bg-accent text-black hover:brightness-95',
    secondary: 'bg-card text-fg border border-border hover:bg-card/70',
    ghost: 'bg-transparent text-fg hover:bg-card/60'
  };

  return <button {...props} className={cn(base, variants[variant], props.className)} />;
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={cn(
          'w-full rounded-xl border border-border bg-card/70 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/40',
          className
        )}
      />
    );
  }
);
Input.displayName = 'Input';

export function Pill(props: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs font-semibold text-muted',
        props.className
      )}
    />
  );
}
