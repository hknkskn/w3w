import React from 'react';

interface IDSLabelProps {
    children: React.ReactNode;
    className?: string;
    color?: 'default' | 'dim' | 'bright' | 'accent';
    size?: 'xs' | 'sm';
}

/**
 * Standard IDS Label
 * Derived from Dashboard: text-[10px] font-black uppercase tracking-widest
 */
export const IDSLabel: React.FC<IDSLabelProps> = ({
    children,
    className = '',
    color = 'default',
    size = 'xs'
}) => {
    const sizes = {
        xs: "text-[10px]",
        sm: "text-xs"
    };

    const colors = {
        default: "text-slate-500",
        dim: "text-slate-600",
        bright: "text-white",
        accent: "text-amber-500"
    };

    return (
        <div className={`${sizes[size]} ${colors[color]} font-black uppercase tracking-widest leading-none ${className}`}>
            {children}
        </div>
    );
};
