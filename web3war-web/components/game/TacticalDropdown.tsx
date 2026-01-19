'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, LucideIcon } from 'lucide-react';

interface DropdownItem {
    label: string;
    href?: string;
    onClick?: () => void;
    icon: LucideIcon;
    badge?: number;
    description?: string;
    color?: string;
}

interface TacticalDropdownProps {
    label: string;
    icon: LucideIcon;
    items: DropdownItem[];
    badge?: number;
    active?: boolean;
}

export function TacticalDropdown({ label, icon: Icon, items, badge, active }: TacticalDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    return (
        <div
            className="relative h-full flex items-center"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isOpen || active
                    ? 'bg-slate-700 text-cyan-400 border border-slate-600'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
            >
                <div className="relative">
                    <Icon size={18} />
                    {badge && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full border border-slate-900" />
                    )}
                </div>
                <span className="hidden sm:inline">{label}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-[100%] pt-2 w-60 z-[200]"
                    >
                        <div className="bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
                            {/* Items List */}
                            <div className="py-1">
                                {items.map((item) => {
                                    const content = (
                                        <>
                                            <div className={`flex items-center justify-center transition-transform group-hover:scale-110`}>
                                                <item.icon size={16} className={`${item.color || 'text-slate-400'} group-hover:text-cyan-400 transition-colors`} />
                                            </div>
                                            <div className="flex-1 flex items-center justify-between overflow-hidden text-left">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-slate-300 group-hover:text-white truncate">
                                                        {item.label}
                                                    </span>
                                                    {item.description && (
                                                        <span className="text-[9px] text-slate-500 group-hover:text-cyan-500/50">
                                                            {item.description}
                                                        </span>
                                                    )}
                                                </div>
                                                {item.badge && (
                                                    <span className="bg-red-600 text-[10px] font-black px-1.5 rounded flex items-center justify-center shadow-[0_0_10px_rgba(220,38,38,0.4)]">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </div>
                                        </>
                                    );

                                    const className = "group flex items-center gap-3 px-4 py-3 hover:bg-cyan-500/10 transition-all border-l-2 border-transparent hover:border-cyan-500 w-full";

                                    if (item.onClick) {
                                        return (
                                            <button
                                                key={item.label}
                                                onClick={() => {
                                                    item.onClick?.();
                                                    setIsOpen(false);
                                                }}
                                                className={className}
                                            >
                                                {content}
                                            </button>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={item.label}
                                            href={item.href || '#'}
                                            onClick={() => setIsOpen(false)}
                                            className={className}
                                        >
                                            {content}
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Tactical Footer */}
                            <div className="px-4 py-1.5 bg-black/40 border-t border-white/5">
                                <div className="flex items-center justify-between text-[7px] font-mono text-slate-600 uppercase tracking-widest">
                                    <span>Access: SEC_B</span>
                                    <span>Verified</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
