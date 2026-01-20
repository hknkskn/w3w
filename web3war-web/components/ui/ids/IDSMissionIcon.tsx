import React from 'react';
import Link from 'next/link';

interface IDSMissionIconProps {
    icon: React.ReactNode;
    done?: boolean;
    progress?: number;
    max?: number;
    href?: string;
}

export function IDSMissionIcon({ icon, done, progress, max, href }: IDSMissionIconProps) {
    const content = (
        <div className={`relative group cursor-pointer`}>
            <div className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all border-2 ${done || (progress && progress >= (max || 0))
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-900/50 border-slate-800 text-slate-500 group-hover:border-cyan-500/30'}`}>
                {icon}
            </div>
            {progress && max && (
                <div className="absolute -bottom-1 left-2 right-2 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-cyan-500" style={{ width: `${(progress / max) * 100}%` }} />
                </div>
            )}
        </div>
    );

    if (href) return <Link href={href}>{content}</Link>;
    return content;
}
