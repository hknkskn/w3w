'use client';

import { useGameStore } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Shield, Zap } from 'lucide-react';

export function BattleLog() {
    // In a real app, this would be an event stream from the blockchain.
    // For this prototype, we'll simulate some hits.
    const activeBattles = useGameStore(state => state.activeBattles);

    if (activeBattles.length === 0) return null;

    return (
        <div className="bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Zap size={12} className="text-amber-400" /> Live Battle Log
                </h3>
                <span className="text-[10px] text-cyan-500 font-mono animate-pulse">STREAMING LIVE</span>
            </div>

            <div className="p-2 h-48 overflow-y-auto space-y-1 custom-scrollbar">
                <AnimatePresence initial={false}>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between text-[11px] p-2 rounded bg-slate-800/30 border border-slate-700/50"
                    >
                        <div className="flex items-center gap-2">
                            <Swords size={10} className="text-red-400" />
                            <span className="text-white font-bold">Haknsken</span>
                            <span className="text-slate-500">dealt</span>
                            <span className="text-amber-400 font-black">1.2k dmg</span>
                        </div>
                        <span className="text-slate-600 text-[9px]">Just now</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between text-[11px] p-2 rounded bg-slate-800/30 border border-slate-700/50"
                    >
                        <div className="flex items-center gap-2">
                            <Shield size={10} className="text-emerald-400" />
                            <span className="text-white font-bold">Defender_NPC</span>
                            <span className="text-slate-500">blocked</span>
                            <span className="text-emerald-400 font-black">500 dmg</span>
                        </div>
                        <span className="text-slate-600 text-[9px]">2s ago</span>
                    </motion.div>
                </AnimatePresence>

                <div className="text-center py-4">
                    <p className="text-[10px] text-slate-500 italic">Listening for blockchain events...</p>
                </div>
            </div>
        </div>
    );
}
