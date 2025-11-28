
import React from 'react';

// --- ICONS ---
// A collection of SVG icons used throughout the application.
export const Icon = ({ name, className = 'w-6 h-6' }: { name: string, className?: string }) => {
  const icons: { [key: string]: React.ReactNode } = {
    dashboard: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />,
    tasks: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C6.095 4.01 5.25 4.973 5.25 6.108V18.75c0 1.28.98 2.348 2.25 2.45a48.423 48.423 0 001.123.08m5.801 0c.065-.21.1-.433.1-.664 0-.414-.336-.75-.75-.75h-4.5a.75.75 0 00-.75.75 2.25 2.25 0 00.1.664m5.8 0A2.251 2.251 0 0013.5 22.5H12c-1.012 0-1.867-.668-2.15-1.586m-5.8 0c.376-.023.75-.05 1.124-.08C9.905 20.99 10.75 20.027 10.75 18.9V6.108c0-1.28-.98-2.348-2.25-2.45a48.423 48.423 0 00-1.123-.08" />,
    workflow: <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 12h9.75M10.5 18h9.75M3.75 6.75h1.5v-1.5h-1.5v1.5zm0 5.25h1.5v-1.5h-1.5v1.5zm0 5.25h1.5v-1.5h-1.5v1.5z" />,
    reports: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
    management: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-1.063 3 3 0 10-5.545-2.296 3 3 0 00-3.182 3.182 9.337 9.337 0 001.063 4.121 9.38 9.38 0 00.372 2.625M12 15a3 3 0 100-6 3 3 0 000 6z" />,
    profile: <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />,
    settings: <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.003 1.11-1.226.554-.223 1.197-.223 1.75 0 .554.223 1.02.684 1.11 1.226M10.162 12a.375.375 0 01.375.375v1.875c0 .207.168.375.375.375h1.125c.207 0 .375-.168.375-.375v-1.875a.375.375 0 01.375-.375h.375a.375.375 0 01.375.375v5.25a.375.375 0 01-.375.375h-2.25a.375.375 0 01-.375-.375v-5.25a.375.375 0 01.375-.375h.375zM12 12.375a.375.375 0 01.375-.375h.375a.375.375 0 01.375.375v.375a.375.375 0 01-.375.375h-.375a.375.375 0 01-.375-.375v-.375zM4.5 3.75a.375.375 0 01.375.375v14.25a.375.375 0 01-.375.375h-2.25a.375.375 0 01-.375-.375V4.125a.375.375 0 01.375-.375h2.25zM19.5 3.75a.375.375 0 01.375.375v14.25a.375.375 0 01-.375.375h-2.25a.375.375 0 01-.375-.375V4.125a.375.375 0 01.375-.375h2.25z" />,
    logout: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />,
    notification: <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />,
    menu: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />,
    close: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
    add: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
    user: <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />,
    chevronDown: <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />,
    search: <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />,
    xmark: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
    arrowPath: <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-11.667 0a8.25 8.25 0 0111.667 0l3.181 3.183M2.985 19.644l3.181-3.182m0 0a8.25 8.25 0 0111.667 0l3.181 3.182M10.5 16.5a.75.75 0 001.5 0v-6a.75.75 0 00-1.5 0v6zM12 9h.008v.008H12V9z" />,
    upload: <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />,
    paperclip: <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.735l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l7.693-7.693a3 3 0 014.243 4.242l-6.147 6.147a1.5 1.5 0 11-2.121-2.121l6.147-6.147m-3.929 1.414l-4.242 4.243" />,
    clock: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />,
    rightArrow: <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />,
    sun: <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.263l-1.591 1.591M3 12h2.25m-.386-6.364l1.591-1.591M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />,
    moon: <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />,
    sparkles: <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />,
    robot: <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12h1.5m12 0h1.5m-1.5 3.75h1.5m-1.5-1.5H18m-13.5 1.5h1.5m-1.5-1.5H3m15.75 6H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10V4.5a1.5 1.5 0 013 0V6h4.75A2.25 2.25 0 0120 8.25v10.5A2.25 2.25 0 0117.75 21zM6 13.5h.008v.008H6V13.5zm3 0h.008v.008H9V13.5zm3 0h.008v.008H12V13.5zm3 0h.008v.008H15V13.5z" />
  };
  
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {icons[name] || <path />}
    </svg>
  );
};

// --- CARD ---
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export const Card: React.FC<CardProps> = ({ children, className, onClick, style }) => {
  return (
    <div
      style={style}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700 transition-all duration-300 ${onClick ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// --- STAT CARD ---
interface StatCardProps {
    index: number;
    title: string;
    value: string | number;
    icon: string;
    color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ index, title, value, icon, color }) => {
    return (
        <Card className="p-6 flex items-center justify-between animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-full ${color} text-white shadow-lg`}>
                <Icon name={icon} className="w-6 h-6" />
            </div>
        </Card>
    );
};


// --- BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'ai';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', children, className, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ease-in-out active:scale-95';

    const variantClasses = {
      primary: 'bg-primary text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 focus:ring-gray-400',
      danger: 'bg-danger text-white hover:bg-red-700 focus:ring-red-500',
      ghost: 'bg-transparent text-primary hover:bg-primary-50 dark:hover:bg-gray-700/50 focus:ring-primary-500',
      ai: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

// --- MODAL ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg' | 'xl';
}
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'xl' }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-2xl',
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 dark:bg-opacity-80 z-50 flex justify-center items-center backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full m-4 transform transition-all duration-300 ease-in-out ${isOpen ? 'animate-scale-in' : 'scale-95 opacity-0'} ${sizeClasses[size]}`} onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <Icon name="close" className="w-5 h-5"/>
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto text-gray-700 dark:text-gray-300">
          {children}
        </div>
        {footer && (
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700 rounded-b-lg flex justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// --- FORM ELEMENTS ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
      <input
        ref={ref}
        id={id}
        className={`block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition duration-200 ease-in-out ${className}`}
        {...props}
      />
    </div>
  )
);

export const DateInput = React.forwardRef<HTMLInputElement, InputProps>(
    ({ label, id, className, ...props }, ref) => (
      <div className="w-full">
        {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name="calendar" className="h-5 w-5 text-gray-400" />
            </div>
            <input
            ref={ref}
            id={id}
            type="date"
            className={`block w-full pl-10 rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition duration-200 ease-in-out ${className}`}
            {...props}
            />
        </div>
      </div>
    )
  );

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  children: React.ReactNode;
}
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, id, children, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
      <select
        ref={ref}
        id={id}
        className={`block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition duration-200 ease-in-out ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
);

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, id, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
      <textarea
        ref={ref}
        id={id}
        rows={4}
        className={`block w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:border-primary focus:ring-primary sm:text-sm transition duration-200 ease-in-out ${className}`}
        {...props}
      />
    </div>
  )
);