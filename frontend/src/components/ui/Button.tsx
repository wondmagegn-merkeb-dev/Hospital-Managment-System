import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: ReactNode;
}

const buttonVariants = {
  variant: {
    default: 'bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200',
    destructive: 'bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground hover:from-destructive/90 hover:to-destructive shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200',
    outline: 'border-2 border-input bg-background/50 backdrop-blur-sm hover:bg-accent hover:border-primary/50 hover:text-primary transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200',
    secondary: 'bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground hover:from-secondary/90 hover:to-secondary shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200',
    ghost: 'hover:bg-accent/50 hover:text-accent-foreground transform hover:scale-[1.05] active:scale-[0.95] transition-all duration-200',
    link: 'text-primary underline-offset-4 hover:underline hover:text-primary/80 transition-colors',
  },
  size: {
    default: 'h-11 px-6 py-2.5',
    sm: 'h-9 rounded-lg px-4 text-sm',
    lg: 'h-12 rounded-xl px-10 text-base',
    icon: 'h-11 w-11',
  },
};

export default function Button({
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
        buttonVariants.variant[variant],
        buttonVariants.size[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
