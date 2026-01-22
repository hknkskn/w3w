'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { Button } from '@/components/Button';
import {
    X,
    Zap,
    ChevronRight,
    Shield,
    Swords,
    Flame,
    TrendingUp,
    Clock
} from 'lucide-react';

interface DeployModalProps {
    battleId: number;
    onClose: () => void;
}

export function DeployModal({ battleId, onClose }: DeployModalProps) {
    const { user, inventory, fight, fetchDashboardData } = useGameStore();
    const [energySelection, setEnergySelection] = useState(10);
    const [attackType, setAttackType] = useState<'BARE' | 'WEAPON' | 'MISSILE'>('BARE');
    const [isDeploying, setIsDeploying] = useState(false);

    // Filter items
    const weapons = inventory.filter(i => i.id === 202 && i.quantity > 0).sort((a, b) => b.quality - a.quality);
    const missiles = inventory.filter(i => i.id === 204 && i.quantity > 0).sort((a, b) => b.quality - a.quality);

    const bestWeapon = weapons[0];
    const bestMissile = missiles[0];

    // Damage Calculation Logic (Matching contract multipliers)
    const stats = useMemo(() => {
        if (!user) return { perHit: 0, total: 0 };

        let multiplier = 1.0;
        if (attackType === 'WEAPON' && bestWeapon) {
            multiplier = 1.0 + (bestWeapon.quality * 0.2);
        } else if (attackType === 'MISSILE' && bestMissile) {
            multiplier = 1.0 + (bestMissile.quality * 2.0);
        }

        const basePerHit = (user.strength / 10 + user.rankPoints / 500 + 10);
        const perHit = Math.floor(basePerHit * 10 * multiplier); // Contract uses 10 energy per hit
        const hits = Math.floor(energySelection / 10);

        return { perHit, total: perHit * hits };
    }, [user, energySelection, attackType, bestWeapon, bestMissile]);

    const handleStartDeploy = async () => {
        if (!user || user.energy < energySelection) return;

        setIsDeploying(true);
        try {
            let itemId = 0;
            let quality = 0;

            if (attackType === 'WEAPON' && bestWeapon) {
                itemId = 202;
                quality = bestWeapon.quality;
            } else if (attackType === 'MISSILE' && bestMissile) {
                itemId = 204;
                quality = bestMissile.quality;
            }

            const hitCount = Math.floor(energySelection / 10);

            // Loop for now, but contract multi-fight is better
            for (let i = 0; i < hitCount; i++) {
                await fight(battleId.toString(), itemId, quality);
            }

            await fetchDashboardData();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeploying(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-xl bg-slate-900 border border-slate-700/50 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] relative"
            >
                {/* Header Backdrop */}
                <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-slate-800/50 to-transparent pointer-events-none" />

                {/* Header */}
                <div className="p-8 relative flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center border border-red-500/30">
                            <Swords size={24} className="text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-wider">Prepare Deployment</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Advanced Tactical Link</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="px-8 pb-8 space-y-10 relative">

                    {/* Unit Preview & Ammo */}
                    <div className="flex items-center justify-around py-4">
                        <div className="relative group">
                            <div className="absolute -inset-8 bg-cyan-500/5 rounded-full blur-3xl" />
                            <div className="w-40 h-40 bg-slate-950/50 rounded-full border border-white/5 flex items-center justify-center relative">
                                <img src="/image/units/unit_lvl1.png" className="w-32 h-32 object-contain" />
                            </div>
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 px-4 py-1 rounded-xl text-[10px] font-black text-white uppercase tracking-widest whitespace-nowrap">
                                {user?.username}
                            </div>
                        </div>

                        <div className="h-20 w-px bg-slate-800" />

                        {/* Ammo Selector */}
                        <div className="grid grid-cols-2 gap-3">
                            <AmmoButton
                                icon="🤜"
                                active={attackType === 'BARE'}
                                onClick={() => setAttackType('BARE')}
                                label="Bare"
                            />
                            <AmmoButton
                                icon="⚔️"
                                active={attackType === 'WEAPON'}
                                onClick={() => setAttackType('WEAPON')}
                                stock={(bestWeapon?.quantity || 0)}
                                label="Weapon"
                            />
                        </div>
                    </div>

                    {/* Energy Slider */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <Zap size={14} className="text-yellow-400" /> Energy Allocation
                            </div>
                            <div className="text-2xl font-black text-white italic">
                                {energySelection} <span className="text-xs text-slate-500">/ {user?.energy}</span>
                            </div>
                        </div>

                        <div className="relative h-12 flex items-center group">
                            <input
                                type="range"
                                min="10"
                                max={Math.min(user?.energy || 540, 540)}
                                step="10"
                                value={energySelection}
                                onChange={(e) => setEnergySelection(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-red-600 active:accent-red-500"
                            />
                            {/* Track Visual */}
                            <div className="absolute top-1/2 -translate-y-1/2 left-0 h-2 bg-gradient-to-r from-red-600 to-orange-500 rounded-full pointer-events-none" style={{ width: `${(energySelection / (user?.energy || 540)) * 100}%` }} />
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            <button onClick={() => setEnergySelection(10)} className="bg-slate-800/50 py-2 rounded-xl text-[10px] font-black text-slate-400 border border-white/5 hover:bg-slate-800">10+</button>
                            <button onClick={() => setEnergySelection(50)} className="bg-slate-800/50 py-2 rounded-xl text-[10px] font-black text-slate-400 border border-white/5 hover:bg-slate-800">50+</button>
                            <button onClick={() => setEnergySelection(100)} className="bg-slate-800/50 py-2 rounded-xl text-[10px] font-black text-slate-400 border border-white/5 hover:bg-slate-800">100+</button>
                            <button onClick={() => setEnergySelection(user?.energy || 540)} className="bg-red-950/20 py-2 rounded-xl text-[10px] font-black text-red-500 border border-red-500/20 hover:bg-red-500/10 uppercase">Max</button>
                        </div>
                    </div>

                    {/* Stats Footer */}
                    <div className="p-6 bg-black/40 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                                <TrendingUp size={14} className="text-cyan-500" /> Influence Forecast
                            </div>
                            <div className="text-3xl font-black text-cyan-400 italic">
                                +{stats.total.toLocaleString()}
                            </div>
                        </div>

                        <div className="h-px bg-white/5" />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-slate-600 uppercase">Est. XP</span>
                                    <span className="text-xs font-black text-white">+{Math.floor(energySelection * 0.1)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-slate-600 uppercase">Rank Pts</span>
                                    <span className="text-xs font-black text-white">+{energySelection}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleStartDeploy}
                                disabled={isDeploying || (user?.energy || 0) < energySelection}
                                className="px-8 h-12 bg-gradient-to-r from-red-600 to-orange-600 text-sm font-black italic tracking-widest uppercase shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                            >
                                {isDeploying ? 'Deploying...' : 'Start Deploy'}
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function AmmoButton({ icon, active, onClick, stock, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-24 h-24 rounded-3xl border flex flex-col items-center justify-center gap-1 transition-all ${active ? 'bg-red-600/20 border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.2)]' : 'bg-slate-950/50 border-white/5 text-slate-600 hover:bg-slate-900'}`}
        >
            <span className="text-3xl">{icon}</span>
            <span className="text-[9px] font-black uppercase">{label}</span>
            {stock !== undefined && (
                <span className={`text-[8px] font-bold ${stock > 0 ? 'text-cyan-500' : 'text-red-500'}`}>Q: {stock}</span>
            )}
        </button>
    );
}
