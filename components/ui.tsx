import React from 'react';
import { Loader2 as LoaderIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', className, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variantClasses = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700/90',
      secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300/80 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600/80',
      ghost: 'hover:bg-gray-200 dark:hover:bg-gray-700',
      destructive: 'bg-red-600 text-white hover:bg-red-700/90',
    };

    const sizeClasses = {
      sm: 'h-9 px-3',
      md: 'h-10 px-4 py-2',
      lg: 'h-11 px-8 rounded-md',
      icon: 'h-10 w-10',
    };

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className || ''}`;

    return (
      <button className={combinedClasses} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={`rounded-xl border bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>{children}</div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>{children}</h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, children, ...props }) => (
  <p className={`text-sm text-gray-500 dark:text-gray-400 ${className}`} {...props}>{children}</p>
);

export const CardContent: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>
);


export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={`flex min-h-[80px] w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
                ref={ref}
                {...props}
            />
        );
    }
);
Textarea.displayName = 'Textarea';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'destructive';
}

export const Alert: React.FC<AlertProps> = ({ className, variant, ...props }) => {
    const variantClasses = variant === 'destructive'
        ? 'border-red-500/50 text-red-500 dark:border-red-500 [&>svg]:text-red-500'
        : 'border-gray-200 dark:border-gray-700';
    return <div role="alert" className={`relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${variantClasses} ${className}`} {...props} />
};

export const AlertTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({className, ...props}) => <h5 className={`mb-1 font-medium leading-none tracking-tight ${className}`} {...props} />

export const AlertDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({className, ...props}) => <div className={`text-sm [&_p]:leading-relaxed ${className}`} {...props} />

export const Separator: React.FC<{className?: string}> = ({ className }) => (
    <div className={`shrink-0 bg-gray-200 dark:bg-gray-700 h-[1px] w-full ${className}`} />
);

export const Loader: React.FC<{className?: string}> = ({ className }) => (
    <LoaderIcon className={`animate-spin ${className}`} />
);

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={`flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';

export const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    ({ className, ...props }, ref) => {
        return (
            <label
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
                ref={ref}
                {...props}
            />
        );
    }
);
Label.displayName = 'Label';