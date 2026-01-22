'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { Button } from '@/components/Button';
import {
    X,
    Zap,
    Shield,
    Swords,
    TrendingUp,
    Crosshair,
    Target,
    Activity,
    User
} from 'lucide-react';

interface DeployModalProps {
    battleId: number;
    onClose: () => void;
}

export function DeployModal({ battleId, onClose }: DeployModalProps) {
    const { user, inventory, fightMulti } = useGameStore();
    const [energySelection, setEnergySelection] = useState(10);
    const [attackType, setAttackType] = useState<'BARE' | 'WEAPON' | 'MISSILE'>('BARE');
    const [isDeploying, setIsDeploying] = useState(false);

    // Filter items
    const weapons = inventory.filter(i => i.id === 202 && i.quantity > 0).sort((a, b) => b.quality - a.quality);
    const missiles = inventory.filter(i => i.id === 204 && i.quantity > 0).sort((a, b) => b.quality - a.quality);

    const bestWeapon = weapons[0];
    const bestMissile = missiles[0];

    // Damage Calculation Logic
    const stats = useMemo(() => {
        if (!user) return { perHit: 0, total: 0 };

        let multiplier = 1.0;
        if (attackType === 'WEAPON' && bestWeapon) {
            multiplier = 1.0 + (bestWeapon.quality * 0.2);
        } else if (attackType === 'MISSILE' && bestMissile) {
            multiplier = 1.0 + (bestMissile.quality * 2.0);
        }

        const basePerHit = (user.strength / 10 + user.rankPoints / 500 + 10);
        const perHit = Math.floor(basePerHit * 10 * multiplier);
        const hits = Math.floor(energySelection / 10);

        return { perHit, total: perHit * hits };
    }, [user, energySelection, attackType, bestWeapon, bestMissile]);

    const handleStartDeploy = async () => {
        if (!user || user.energy < energySelection) return;

        setIsDeploying(true);
        const { triggerExplosion } = useGameStore.getState();

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
            await fightMulti(battleId.toString(), itemId, quality, hitCount);

            // Trigger explosion effect immediately after success
            triggerExplosion();

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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                className="w-full max-w-[680px] deploy-modal-container border border-white/10 rounded-[24px] overflow-hidden relative"
            >
                {/* Tactical Backdrop */}
                <img src="/image/Deployscreen.png" className="deploy-modal-backdrop-img" alt="" />

                {/* Header Section */}
                <div className="p-6 pb-3 relative flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-red-600/20 rounded-xl flex items-center justify-center border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                            <Crosshair size={22} className="text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase italic tracking-wider leading-none">Prepare Deployment</h2>
                            <div className="tactical-header-pill" />
                            <p className="text-[9px] text-cyan-500/70 font-black uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                                <Activity size={9} /> Advanced Tactical Link
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/10 group">
                        <X size={18} className="text-slate-400 group-hover:text-white transition-colors" />
                    </button>
                </div>

                {/* Main Content Area (Scrollable for HD) */}
                <div className="hd-scroll-area p-6 pt-5 space-y-6">

                    {/* Unit & Weapon Selector */}
                    <div className="flex items-stretch gap-6">
                        {/* Profile/Soldier Preview */}
                        <div className="flex-1 bg-gradient-to-tr from-slate-900/80 to-slate-800/40 rounded-2xl border border-white/5 p-4 flex flex-col items-center justify-center relative group">
                            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity blur-2xl" />
                            <div className="relative mb-3">
                                <div className="w-20 h-20 bg-slate-950/80 rounded-full border border-cyan-500/20 flex items-center justify-center overflow-hidden">
                                    {/* Temporary Soldier Image as requested */}
                                    <img src="/icons/army.png" className="w-16 h-16 object-contain filter drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]" alt="Soldier" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-900 border border-cyan-500/50 rounded-lg flex items-center justify-center text-cyan-400 shadow-lg">
                                    <User size={12} />
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-white uppercase tracking-widest bg-slate-950/60 px-3 py-1 rounded-md border border-white/10">
                                {user?.username}
                            </span>
                        </div>

                        {/* Tactical Weapon Selection */}
                        <div className="flex flex-col gap-3">
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-1">Combat Stance</div>
                            <div className="grid grid-cols-3 gap-3">
                                <TacticalAmmoCard
                                    icon={<img src="/icons/strength.png" className="w-6 h-6 object-contain" alt="" />}
                                    label="Bare"
                                    active={attackType === 'BARE'}
                                    onClick={() => setAttackType('BARE')}
                                />
                                <TacticalAmmoCard
                                    icon={<img src="/icons/weapon.webp" className="w-6 h-6 object-contain" alt="" />}
                                    label="Weapon"
                                    active={attackType === 'WEAPON'}
                                    onClick={() => setAttackType('WEAPON')}
                                    stock={bestWeapon?.quantity}
                                />
                                <TacticalAmmoCard
                                    icon={<img src="/icons/missle.png" className="w-6 h-6 object-contain" alt="" />}
                                    label="Missile"
                                    active={attackType === 'MISSILE'}
                                    onClick={() => setAttackType('MISSILE')}
                                    stock={bestMissile?.quantity}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Energy Deployment Area */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 mb-1">
                                    <Zap size={12} className="text-yellow-400 fill-yellow-400" /> Energy Allocation
                                </span>
                                <div className="text-3xl font-black text-white italic leading-none tracking-tighter">
                                    {energySelection} <span className="text-sm font-bold text-slate-500 tracking-normal ml-1">/ {user?.energy}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {[10, 50, 100].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setEnergySelection(val)}
                                        className="px-3 py-1 bg-slate-800/40 hover:bg-slate-700/60 border border-white/5 rounded text-[10px] font-black text-slate-300 transition-all active:scale-95"
                                    >
                                        +{val}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setEnergySelection(user?.energy || 540)}
                                    className="px-3 py-1 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 rounded text-[10px] font-black text-red-500 uppercase transition-all active:scale-95"
                                >
                                    Max
                                </button>
                            </div>
                        </div>

                        {/* Custom Perspective Slider */}
                        <div className="space-y-2">
                            <div className="perspective-bar-container">
                                <div
                                    className="perspective-bar-fill"
                                    style={{ width: `${(energySelection / (user?.energy || 540)) * 100}%` }}
                                />
                            </div>
                            <input
                                type="range"
                                min="10"
                                max={user?.energy || 540} // Removed cap
                                step="10"
                                value={energySelection}
                                onChange={(e) => setEnergySelection(Number(e.target.value))}
                                className="tactical-input-range"
                            />
                        </div>
                    </div>

                    {/* Impact Statistics */}
                    <div className="tactical-stat-box flex items-center justify-between shadow-inner">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <TrendingUp size={12} /> Influence Forecast
                                </span>
                                <div className="text-2xl font-black text-white italic tracking-tighter drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                                    +{stats.total.toLocaleString()}
                                </div>
                            </div>
                            <div className="flex gap-6 border-t border-white/5 pt-4">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-500 uppercase">Training XP</span>
                                    <span className="text-sm font-black text-white">+{Math.floor(energySelection * 0.1)}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-500 uppercase">Rank Points</span>
                                    <span className="text-sm font-black text-white">+{energySelection}</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleStartDeploy}
                            disabled={isDeploying || (user?.energy || 0) < energySelection}
                            className="war-button-primary"
                        >
                            {isDeploying ? 'Linking...' : 'Start Deploy'}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function TacticalAmmoCard({ icon, label, active, onClick, stock }: { icon: any, label: string, active: boolean, onClick: () => void, stock?: number }) {
    return (
        <div
            onClick={onClick}
            className={`ammo-card ${active ? 'active' : ''}`}
        >
            <div className={`text-2xl transition-transform duration-300 ${active ? 'scale-110 text-red-500' : 'text-slate-400 opacity-60'}`}>
                {icon}
            </div>
            <div className={`text-[10px] font-black uppercase tracking-wider ${active ? 'text-white' : 'text-slate-500'}`}>
                {label}
            </div>
            {stock !== undefined && (
                <div className={`text-[8px] font-black px-2 py-0.5 rounded bg-black/40 border border-white/5 ${stock > 0 ? 'text-cyan-400' : 'text-red-500'}`}>
                    STOCK: {stock}
                </div>
            )}
            {active && (
                <motion.div
                    layoutId="ammo-glow"
                    className="absolute inset-0 bg-red-600/5 blur-xl pointer-events-none"
                />
            )}
        </div>
    );
}

