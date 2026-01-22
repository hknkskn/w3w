import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    icon?: ReactNode;
    footer?: ReactNode;
    onClick?: () => void;
    noPadding?: boolean;
}

export const Card = ({ children, className = '', title, icon, footer, onClick, noPadding = false }: CardProps) => {
    return (
        <div
            onClick={onClick}
            className={`glass-panel ${noPadding ? 'p-0' : 'p-6'} ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
        >
            {(title || icon) && (
                <div className="flex items-center gap-3 mb-4">
                    {icon && <div className="text-[var(--accent-primary)]">{icon}</div>}
                    {title && <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>}
                </div>
            )}

            <div className="text-[var(--text-secondary)]">
                {children}
            </div>

            {footer && (
                <div className="mt-6 pt-4 border-t border-white/5">
                    {footer}
                </div>
            )}
        </div>
    );
};
