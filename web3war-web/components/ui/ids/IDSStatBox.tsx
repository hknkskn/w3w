import React from 'react';

interface IDSStatBoxProps {
    label: string;
    value: string | number;
    unit?: string;
    icon?: React.ReactNode;
    subValue?: string;
    color?: string;
    className?: string;
}

import { IDSCard } from './IDSCard';
import { IDSLabel } from './IDSLabel';

/**
 * StatBox component for displaying key metrics with an optional icon and sub-value.
 */
export const IDSStatBox: React.FC<IDSStatBoxProps> = ({
    label,
    value,
    unit,
    icon,
    subValue,
    color = 'text-white',
    className = ''
}) => {
    return (
        <IDSCard className={`group hover:border-slate-600 transition-colors ${className}`}>
            <div className="flex items-center gap-2 mb-2">
                {icon && <span className="flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">{icon}</span>}
                <IDSLabel>{label}</IDSLabel>
            </div>

            <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-black font-mono tracking-tighter ${color}`}>
                    {value}
                </span>
                {unit && <span className="text-[10px] text-slate-600 font-bold uppercase">{unit}</span>}
            </div>

            {subValue && (
                <div className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-wide">
                    {subValue}
                </div>
            )}
        </IDSCard>
    );
};
