'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HoverTooltipProps {
    countryName: string | null;
    isActive: boolean;
    visible: boolean;
}

function HoverTooltipBase({ countryName, isActive, visible }: HoverTooltipProps) {
    if (!visible || !countryName) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-md rounded-xl p-3 z-20 border border-cyan-500/30 shadow-xl"
            >
                <div className="text-sm font-bold text-white">{countryName}</div>
                {isActive && (
                    <div className="text-xs text-cyan-400">Click for details</div>
                )}
                {!isActive && (
                    <div className="text-xs text-slate-500">Inactive region</div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

export const HoverTooltip = memo(HoverTooltipBase);
export default HoverTooltip;
