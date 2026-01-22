'use client';

import { motion } from 'framer-motion';

interface DamageBarProps {
    wall: number;
    attackerPoints?: number;
    defenderPoints?: number;
    attackerDamage?: number;
    defenderDamage?: number;
}

export function DamageBar({ wall, attackerPoints = 0, defenderPoints = 0, attackerDamage = 0, defenderDamage = 0 }: DamageBarProps) {
    // Calculate actual progress based on damage
    // If both are 0, use wall. Otherwise, calculate from damage.
    const totalDamage = attackerDamage + defenderDamage;
    const attackerPercent = totalDamage > 0
        ? Math.round((attackerDamage / totalDamage) * 100)
        : wall;
    const defenderPercent = 100 - attackerPercent;

    return (
        <div className="w-full relative px-10 py-6 bg-slate-900/50 backdrop-blur-sm z-20">
            <div className="flex justify-between items-end mb-2">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-red-500 uppercase italic tracking-widest">Invasion Progress</span>
                    <span className="text-2xl font-black text-white">{attackerPercent}%</span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-[10px] font-black text-blue-500 uppercase italic tracking-widest">Defense Level</span>
                    <span className="text-2xl font-black text-white">{defenderPercent}%</span>
                </div>
            </div>

            <div className="h-6 bg-black/60 rounded-full border-2 border-white/5 overflow-hidden flex relative">
                {/* Attacker Bar */}
                <motion.div
                    className="h-full bg-gradient-to-r from-red-800 to-red-500 relative"
                    initial={{ width: '50%' }}
                    animate={{ width: `${attackerPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <motion.div
                        className="absolute top-0 right-0 bottom-0 w-8 bg-white/20 blur-md"
                        animate={{ x: [-20, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                    />
                </motion.div>

                {/* Defender Bar */}
                <motion.div
                    className="h-full bg-gradient-to-l from-blue-800 to-blue-500 relative flex-1"
                    initial={{ width: '50%' }}
                    animate={{ width: `${defenderPercent}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                </motion.div>

                {/* Center Pulse */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-12 bg-white blur-xl z-20 opacity-30"
                    style={{ left: `${attackerPercent}%` }}
                    animate={{ scaleY: [1, 1.5, 1], opacity: [0.1, 0.4, 0.1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                />
            </div>

            {/* Scale Markers */}
            <div className="flex justify-between mt-2 px-1">
                {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(m => (
                    <div key={m} className={`w-0.5 h-1 ${m === 50 ? 'h-3 bg-white/40' : 'bg-white/10'}`} />
                ))}
            </div>
        </div>
    );
}
