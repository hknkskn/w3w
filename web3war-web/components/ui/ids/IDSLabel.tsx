import React from 'react';
import { IDS_THEME } from './theme';

interface IDSLabelProps {
    children: React.ReactNode;
    className?: string;
    color?: 'default' | 'dim' | 'bright' | 'accent' | 'danger' | 'success';
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
        xs: IDS_THEME.typography.label.base,
        sm: IDS_THEME.typography.label.sm
    };

    const colors = {
        default: IDS_THEME.colors.label.dim,
        dim: 'text-slate-600',
        bright: IDS_THEME.colors.label.bright,
        accent: IDS_THEME.colors.label.accent,
        danger: IDS_THEME.colors.label.danger,
        success: IDS_THEME.colors.label.success
    };

    return (
        <div className={`${sizes[size]} ${colors[color]} leading-none ${className}`}>
            {children}
        </div>
    );
};
