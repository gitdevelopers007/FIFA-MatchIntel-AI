import React from 'react';

// GLASS CARD COMPONENT
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, hoverEffect = false }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-xl p-5 shadow-lg border border-[rgba(255,255,255,0.08)] transition-all duration-300 ${
        hoverEffect ? 'glass-panel-hover cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

// CUSTOM BUTTON COMPONENT
interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  ...props
}) => {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b0f19] disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  
  const variants = {
    primary: "bg-[#00df89] hover:bg-[#00c577] text-[#0b0f19] focus:ring-[#00df89] shadow-[0_0_15px_rgba(0,223,137,0.3)] hover:shadow-[0_0_25px_rgba(0,223,137,0.5)]",
    secondary: "bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.15)] text-white border border-[rgba(255,255,255,0.1)] focus:ring-gray-500",
    danger: "bg-[#ef4444] hover:bg-[#dc2626] text-white focus:ring-[#ef4444] shadow-[0_0_15px_rgba(239,68,68,0.3)]",
    warning: "bg-[#f8c21b] hover:bg-[#e0ad10] text-[#0b0f19] focus:ring-[#f8c21b] shadow-[0_0_15px_rgba(248,194,27,0.3)]",
    ghost: "bg-transparent hover:bg-[rgba(255,255,255,0.05)] text-gray-300 focus:ring-gray-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <button
      type={props.type ?? 'button'}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon ? (
        <span className="mr-2">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

// STATUS BADGE COMPONENT
interface StatusBadgeProps {
  status: string;
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const normStatus = status.toLowerCase();
  
  let styles = "bg-gray-800 text-gray-300";
  let dotColor = "bg-gray-400";

  if (["open", "normal", "operational", "active", "resolved", "low"].includes(normStatus)) {
    styles = "bg-[rgba(0,223,137,0.1)] text-[#00df89] border border-[rgba(0,223,137,0.2)]";
    dotColor = "bg-[#00df89] animate-pulse";
  } else if (["busy", "delayed", "medium", "reported"].includes(normStatus)) {
    styles = "bg-[rgba(248,194,27,0.1)] text-[#f8c21b] border border-[rgba(248,194,27,0.2)]";
    dotColor = "bg-[#f8c21b]";
  } else if (["closed", "suspended", "critical", "high", "congested"].includes(normStatus)) {
    styles = "bg-[rgba(239,68,68,0.1)] text-[#ef4444] border border-[rgba(239,68,68,0.2)]";
    dotColor = "bg-[#ef4444] animate-ping";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor}`} />
      {label || status}
    </span>
  );
};

// INPUT FIELD COMPONENT
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const InputField: React.FC<InputFieldProps> = ({ label, error, className = '', ...props }) => {
  const generatedId = React.useId();
  const inputId = props.id || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      <label htmlFor={inputId} className="text-sm font-medium text-gray-300 tracking-wide">{label}</label>
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : props['aria-describedby']}
        className={`bg-[rgba(17,24,39,0.5)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2.5 text-white transition-all duration-300 outline-none focus:border-[#00df89] focus:ring-1 focus:ring-[#00df89] ${
          error ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#ef4444]' : ''
        }`}
        {...props}
      />
      {error && <span id={errorId} role="alert" className="text-xs text-[#ef4444] font-medium mt-0.5">{error}</span>}
    </div>
  );
};

// SKELETON LOADER
export const SkeletonLoader: React.FC<{ rows?: number; className?: string }> = ({ rows = 3, className = '' }) => {
  return (
    <div className={`animate-pulse flex flex-col gap-3 ${className}`}>
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-5 bg-gray-800 rounded-md w-full" />
      ))}
    </div>
  );
};

// SPINNER
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4"
  };
  return (
    <div className="flex justify-center items-center py-4">
      <div className={`animate-spin rounded-full border-t-transparent border-r-transparent border-[#00df89] ${sizes[size]}`} role="status" aria-label="Loading" />
    </div>
  );
};
