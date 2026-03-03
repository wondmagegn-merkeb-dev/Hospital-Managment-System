import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

const badgeVariants = {
  variant: {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-600',
    outline: 'border border-gray-300 text-gray-700',
    destructive: 'bg-red-100 text-red-800',
  },
};

export default function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-1 text-xs font-medium rounded-full',
        badgeVariants.variant[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
