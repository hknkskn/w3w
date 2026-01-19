import React from 'react';
import Link from 'next/link';

interface IDSQuickLinkProps {
    icon: React.ReactNode;
    label: string;
    badge?: string;
    hasArrow?: boolean;
    isAction?: boolean;
    disabled?: boolean;
    href?: string;
    className?: string;
}

/**
 * IDSQuickLink - Standard navigation/action link component.
 * Derived from the Dashboard's Sidebar links.
 */
export const IDSQuickLink: React.FC<IDSQuickLinkProps> = ({
    icon,
    label,
    badge,
    hasArrow = false,
    isAction = false,
    disabled = false,
    href,
    className = ''
}) => {
    const baseStyles = `flex items-center gap-3 px-4 py-3 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-700/30'
        }`;

    const labelStyles = `flex-1 text-sm ${isAction ? 'text-amber-400' : disabled ? 'text-slate-500' : 'text-slate-300 font-medium'
        }`;

    const content = (
        <div className={`${baseStyles} ${className}`}>
            <span className="text-slate-400 shrink-0">{icon}</span>
            <span className={labelStyles}>
                {label}
            </span>
            {badge && (
                <span className="text-xs font-black text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-800">
                    {badge}
                </span>
            )}
            {hasArrow && <span className="text-slate-600 ml-1">›</span>}
        </div>
    );

    if (href && !disabled) {
        return (
            <Link href={href} className="block">
                {content}
            </Link>
        );
    }

    return content;
};
