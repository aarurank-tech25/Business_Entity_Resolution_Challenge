import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const variants = {
    default: 'bg-purple-50/80 text-purple-800 border-purple-200/70',
    match: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    nomatch: 'bg-slate-100 text-slate-600 border-slate-300',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-purple-100 text-purple-800 border-purple-200',
    running: 'bg-purple-100 text-purple-800 border-purple-300 animate-pulse',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    lavender: 'bg-purple-50 text-purple-700 border-purple-200 font-medium',
  };

  const dotColors = {
    default: 'bg-purple-400',
    match: 'bg-emerald-500',
    nomatch: 'bg-slate-400',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-purple-500',
    running: 'bg-purple-500',
    purple: 'bg-purple-500',
    lavender: 'bg-purple-500',
  };

  const sizes = {
    sm: 'text-[11px] px-1.5 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || 'bg-purple-400'}`} />}
      {children}
    </span>
  );
};

export default Badge;
