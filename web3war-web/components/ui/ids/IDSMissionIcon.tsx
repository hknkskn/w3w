import React from 'react';
import Link from 'next/link';
import { IDSCard } from './IDSCard';

interface IDSMissionIconProps {
    icon: React.ReactNode | string;
    progress?: number;
    max?: number;
    done?: boolean;
    href: string;
    className?: string;
}

/**
 * IDSMissionIcon - Square grid-based progress/mission icon.
 * Derived from the Dashboard missions grid.
 */
export const IDSMissionIcon: React.FC<IDSMissionIconProps> = ({
    icon,
    progress,
    max,
    done,
    href,
    className = ''
}) => {
    return (
        <Link href={href}>
            <IDSCard
                noPadding
                className={`aspect-square flex items-center justify-center hover:bg-slate-700/30 cursor-pointer overflow-hidden ${className}`}
            >
                <span className="text-2xl">{icon}</span>

                {progress !== undefined && max !== undefined && (
                    <div className="absolute bottom-1 right-1 text-[8px] font-black text-amber-500 bg-slate-950/90 px-1 rounded border border-slate-800 tabular-nums">
                        {progress}/{max}
                    </div>
                )}

                {done && (
                    <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-[8px] text-white shadow-lg border border-white/10 ring-1 ring-emerald-500/20">
                        ✓
                    </div>
                )}
            </IDSCard>
        </Link>
    );
};
