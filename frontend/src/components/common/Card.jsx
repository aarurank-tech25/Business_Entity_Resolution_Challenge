import React from 'react';

export const Card = ({
  children,
  title,
  subtitle,
  icon: Icon,
  actions,
  className = '',
  bodyClassName = 'p-6',
  headerClassName = 'px-6 py-4 border-b border-purple-100/70',
  footer,
  footerClassName = 'px-6 py-3 bg-purple-50/20 border-t border-purple-100/60 rounded-b-xl',
  loading = false,
  badge,
}) => {
  return (
    <div className={`bg-white rounded-xl border border-purple-100 shadow-card transition-all relative overflow-hidden ${className}`}>
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-purple-600 font-medium text-sm">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
            Loading data...
          </div>
        </div>
      )}

      {(title || subtitle || actions || Icon || badge) && (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${headerClassName}`}>
          <div className="flex items-start gap-3">
            {Icon && (
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0 mt-0.5 sm:mt-0 border border-purple-100">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                {title && <h3 className="text-base font-semibold text-slate-900 leading-snug">{title}</h3>}
                {badge}
              </div>
              {subtitle && <p className="text-xs text-slate-500 mt-0.5 leading-normal">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}

      <div className={bodyClassName}>{children}</div>

      {footer && <div className={footerClassName}>{footer}</div>}
    </div>
  );
};

export default Card;
