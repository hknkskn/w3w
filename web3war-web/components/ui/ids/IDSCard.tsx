import React from 'react';

interface IDSCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'filled' | 'outline';
    noPadding?: boolean;
}

/**
 * Base Industrial Design System Card
 * Matches Dashboard's gold standard: bg-slate-800/60 + backdrop-blur + border-2 slate-700/50
 */
export const IDSCard: React.FC<IDSCardProps> = ({
    children,
    className = '',
    variant = 'default',
    noPadding = false
}) => {
    const baseStyles = "relative rounded-xl shadow-lg transition-all duration-300";

    const variants = {
        default: "bg-slate-800/60 backdrop-blur-sm border-2 border-slate-700/50",
        filled: "bg-slate-900/80 border-2 border-slate-800",
        outline: "bg-transparent border-2 border-slate-800"
    };

    return (
        <div className={`${baseStyles} ${variants[variant]} ${noPadding ? '' : 'p-4'} ${className}`}>
            {children}
        </div>
    );
};
