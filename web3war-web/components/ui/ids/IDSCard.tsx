import React from 'react';
import { IDS_CLASSES } from './theme';

interface IDSCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'outline' | 'flat';
    noPadding?: boolean;
}

/**
 * Base Industrial Design System Card
 * Matches Dashboard's gold standard: bg-slate-800/60 + backdrop-blur + border-2 slate-700/50
 */
export function IDSCard({ children, className = '', variant = 'default', noPadding = false }: IDSCardProps) {
    const variants = {
        default: IDS_CLASSES.CARD_BASE,
        outline: 'bg-transparent border-2 border-slate-800/50 rounded-xl',
        flat: 'bg-slate-900/40 border border-slate-800 rounded-xl'
    };

    return (
        <div className={`${noPadding ? '' : 'p-4'} ${variants[variant]} ${className}`}>
            {children}
        </div>
    );
}
