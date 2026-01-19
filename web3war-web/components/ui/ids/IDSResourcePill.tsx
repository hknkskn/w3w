import React from 'react';

interface IDSResourcePillProps {
    icon: React.ReactNode | string;
    value: string | number;
    color?: 'cyan' | 'emerald' | 'amber' | 'green' | 'red' | 'blue';
    label?: string;
    hasPlus?: boolean;
    isImage?: boolean;
    onClickPlus?: (e: React.MouseEvent) => void;
    className?: string;
}

/**
 * IDSResourcePill - Standardized currency and stat display pills.
 * Derived from the Dashboard resource display logic.
 */
export const IDSResourcePill: React.FC<IDSResourcePillProps> = ({
    icon,
    value,
    color = 'amber',
    label,
    hasPlus = false,
    isImage = false,
    onClickPlus,
    className = ''
}) => {
    const colorVariants = {
        cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400 ring-cyan-500/5',
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 ring-emerald-500/5',
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400 ring-amber-500/5',
        green: 'bg-green-500/10 border-green-500/20 text-green-400 ring-green-500/5',
        red: 'bg-red-500/10 border-red-500/20 text-red-400 ring-red-500/5',
        blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400 ring-blue-500/5',
    };

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ring-1 transition-all ${colorVariants[color]} ${className}`}>
            {isImage && typeof icon === 'string' ? (
                <img src={icon} alt={label || "resource"} className="w-5 h-5 object-contain drop-shadow-md" />
            ) : (
                <span className="flex items-center justify-center shrink-0">{icon}</span>
            )}

            <span className="font-bold text-sm text-white font-mono leading-none">
                {value}
            </span>

            {label && (
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">
                    {label}
                </span>
            )}

            {hasPlus && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClickPlus?.(e);
                    }}
                    className="w-5 h-5 bg-emerald-500/20 border border-emerald-500/40 rounded flex items-center justify-center text-emerald-400 text-xs font-bold hover:bg-emerald-400 hover:text-white transition-all ml-1 shadow-sm active:scale-90"
                >
                    +
                </button>
            )}
        </div>
    );
};
