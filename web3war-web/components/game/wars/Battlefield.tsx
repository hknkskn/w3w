import { Battle } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';

interface BattlefieldProps {
    battle: Battle;
}

export function Battlefield({ battle }: BattlefieldProps) {
    const { lastHit } = useGameStore();

    return (
        <div className="relative flex-1 bg-slate-900 overflow-hidden">
            {/* Grid Arkaplan */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* Atmospheric Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50 z-10 pointer-events-none" />

            {/* Scanning Line */}
            <motion.div
                className="absolute inset-x-0 h-[2px] bg-red-500/30 z-10 pointer-events-none"
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />

            {/* Units Container */}
            <div className="absolute inset-0 flex items-center justify-around px-20 z-10">
                {/* Attacker Unit */}
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="relative">
                        <div className="absolute -inset-4 bg-red-500/10 rounded-full blur-2xl animate-pulse" />
                        <div className="w-48 h-48 bg-slate-800 rounded-3xl border border-red-500/30 flex items-center justify-center relative z-10">
                            <img src="/image/units/unit_lvl1.png" className="w-40 h-40 object-contain drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]" />
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 px-4 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest z-20">Attacker</div>
                    </div>
                </motion.div>

                {/* VS Effect */}
                <div className="hidden md:flex flex-col items-center gap-2">
                    <div className="text-4xl font-black italic text-slate-800 opacity-50">STRIKE_ZONE</div>
                </div>

                {/* Defender Unit */}
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className="relative">
                        <div className="absolute -inset-4 bg-blue-500/10 rounded-full blur-2xl animate-pulse" />
                        <div className="w-48 h-48 bg-slate-800 rounded-3xl border border-blue-500/30 flex items-center justify-center relative z-10">
                            <img src="/image/units/unit_lvl2.png" className="w-40 h-40 object-contain drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]" />
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 px-4 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest z-20">Defender</div>

                        {/* Hit Effect Overlay */}
                        <AnimatePresence>
                            {lastHit && (
                                <motion.div
                                    key="hit-effect"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 0] }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
                                >
                                    <div className="w-full h-full bg-white/20 rounded-3xl blur-md shadow-[0_0_40px_rgba(255,255,255,0.4)]" />
                                    <div className="absolute text-4xl font-black text-white italic drop-shadow-[0_0_15px_rgba(255,255,255,0.9)] scale-125">
                                        -{lastHit.damage.toLocaleString()}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
