'use client';

import { useTraining } from '@/lib/hooks/useTraining';
import { useGameStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
    Zap,
    Coins,
    Sword,
    CheckCircle2,
    ArrowUpCircle,
    Star
} from 'lucide-react';
import { Button } from '@/components/Button';
import { useTranslation } from '@/lib/i18n';

export function TrainingCenter() {
    const {
        user,
        facilities,
        selectedIds,
        isTraining,
        cooldownActive,
        timeRemaining,
        totals,
        methods
    } = useTraining();
    const { t } = useTranslation();

    const handleTrain = async () => {
        try {
            await methods.handleTrainAction();
        } catch (e: any) {
            const { idsAlert } = useGameStore.getState();
            await idsAlert(e.message, "Training Bureau", "error");
        }
    };

    const handleUpgrade = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        const { idsConfirm } = useGameStore.getState();
        const facility = facilities.find(f => f.id === id);
        if (!facility) return;

        const confirmed = await idsConfirm(t('training_center.initiate_upgrade', { quality: (facility.quality + 1).toString(), cost: (facility.upgradeCostSupra || 0).toLocaleString() }), t('training_center.infrastructure_upgrade'));
        if (confirmed) await methods.handleUpgradeAction(id);
    };

    const hoursRemaining = timeRemaining.h;
    const minutesRemaining = timeRemaining.m;

    return (
        <div className="space-y-6">
            {/* Regimens Table - Restored Legacy Design */}
            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
                <div className="grid grid-cols-12 bg-slate-900/50 p-4 border-b border-slate-700/50 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                    <div className="col-span-4 text-left pl-10">{t('training_center.facility')}</div>
                    <div className="col-span-2">{t('training_center.regimen')}</div>
                    <div className="col-span-3">{t('training_center.cost_per_day')}</div>
                    <div className="col-span-3">{t('training_center.strength_gain')}</div>
                </div>

                <div className="divide-y divide-slate-700/30 min-h-[100px] flex flex-col items-stretch">
                    {facilities.length === 0 ? (
                        <div className="py-20 text-center">
                            <div className="text-slate-500 font-bold uppercase tracking-[0.2em] mb-2 scale-150 opacity-20">{t('training_center.no_infrastructure')}</div>
                            <p className="text-slate-600 text-[10px] font-medium uppercase tracking-widest">{t('training_center.empty_registry')}</p>
                        </div>
                    ) : (
                        facilities.map((f) => {
                            const isSelected = selectedIds.includes(f.id);
                            const cost = f.dailyCostCred;
                            const strength = f.currentStrengthGain;
                            const quality = f.quality;

                            return (
                                <div
                                    key={f.id}
                                    onClick={() => methods.toggleRegimen(f.id)}
                                    className={`grid grid-cols-12 items-center p-4 transition-all cursor-pointer group ${isSelected
                                        ? 'bg-cyan-500/5'
                                        : 'hover:bg-slate-700/20'
                                        }`}
                                >
                                    <div className="col-span-4 flex items-center gap-6">
                                        <div className="relative">
                                            <div className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${isSelected
                                                ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                                : 'border-slate-700 group-hover:border-slate-600'
                                                }`}>
                                                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={`/image/training/${f.id}/${f.quality}.png`}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        alt={f.name}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="text-sm font-black text-white uppercase tracking-tight truncate">{f.name}</div>
                                                {!f.isMaxLevel && (
                                                    <button
                                                        onClick={(e) => handleUpgrade(e, f.id)}
                                                        className="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-[9px] font-black uppercase rounded-full border border-red-500/30 transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                                                    >
                                                        <img src="/icons/supralogo.webp" className="w-2.5 h-2.5 object-contain" alt="" />
                                                        <span>{t('training_center.upgrade')} ({user?.isAdmin ? 'FREE' : `${f.upgradeCostSupra?.toLocaleString()} S`})</span>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                <div className="flex items-center gap-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={10}
                                                            className={i < quality ? "text-amber-400 fill-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]" : "text-slate-700"}
                                                        />
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 bg-slate-900/50 rounded-md border border-slate-800">
                                                    <img src="/icons/efficiency.webp" className="w-3 h-3 object-contain" alt="" />
                                                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest whitespace-nowrap">{f.efficiency}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-2 flex justify-center">
                                        <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-all ${isSelected
                                            ? 'bg-cyan-500 border-cyan-500 text-slate-900 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                                            : 'bg-slate-900 border-slate-700 group-hover:border-slate-600'
                                            }`}>
                                            {isSelected && <CheckCircle2 size={16} />}
                                        </div>
                                    </div>

                                    <div className="col-span-3 flex flex-col items-center">
                                        {user?.isAdmin ? (
                                            <span className="text-sm font-black text-emerald-400 uppercase tracking-widest px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                                {t('common.admin_free', {}, 'ADMIN FREE')}
                                            </span>
                                        ) : cost > 0 ? (
                                            <div className="flex items-center gap-1.5">
                                                <img src="/icons/money.png" className="w-5 h-5 object-contain" alt="" />
                                                <span className="text-lg font-mono text-amber-400 font-bold">{cost.toFixed(2)} CRED</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm font-black text-emerald-400 uppercase tracking-widest px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                                {t('common.free', {}, 'FREE')}
                                            </span>
                                        )}
                                    </div>

                                    <div className="col-span-3 flex justify-center">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-xl border border-red-500/20 group-hover:border-red-500/40 transition-all">
                                            <img src="/icons/strength.png" className="w-4 h-4 object-contain" alt="" />
                                            <span className="text-lg font-black text-red-400">+{strength.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Controls - Restored Legacy Design */}
                <div className="p-6 bg-slate-900/80 border-t border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-12">
                        <div className="text-center">
                            <div className="text-[10px] text-slate-500 font-black uppercase mb-1">{t('training_center.energy_required')}</div>
                            <div className="flex items-center justify-center gap-2">
                                <div className={`p-1.5 rounded-lg ${user && user.energy >= totals.energy ? 'bg-cyan-500/10 text-cyan-400' : 'bg-red-500/10 text-red-500'}`}>
                                    <img src="/icons/energie.webp" className="w-4 h-4 object-contain" alt="" />
                                </div>
                                <span className={`text-xl font-bold ${user && user.energy >= totals.energy ? 'text-white' : 'text-red-500'}`}>{totals.energy}</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-[10px] text-slate-500 font-black uppercase mb-1">{t('training_center.total_cred_cost')}</div>
                            <div className="flex items-center justify-center gap-2">
                                <div className={`p-1.5 rounded-lg ${user && user.credits >= totals.cost ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                                    <img src="/icons/money.png" className="w-4 h-4 object-contain" alt="" />
                                </div>
                                <span className={`text-xl font-bold ${user && user.credits >= totals.cost ? 'text-white' : 'text-red-500'}`}>{totals.cost.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-[10px] text-slate-500 font-black uppercase mb-1 flex items-center gap-1">
                                <Sword size={12} className="text-red-500" />
                                {t('training_center.total_gain')}
                            </div>
                            <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-red-500/10 rounded-lg border border-red-500/20">
                                <img src="/icons/strength.png" className="w-5 h-5 object-contain" alt="" />
                                <span className="text-xl font-black text-red-400">+{totals.strength.toFixed(1)} STR</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleTrain}
                        disabled={selectedIds.length === 0 || isTraining || cooldownActive}
                        className={`min-w-[200px] h-14 text-lg font-black tracking-widest uppercase transition-all shadow-xl font-mono ${isTraining || cooldownActive ? 'bg-slate-700 text-slate-500 border-slate-600' : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-red-500/20'
                            } ${isTraining ? 'animate-pulse' : ''}`}
                    >
                        {isTraining ? t('training_center.developing_muscle') : (cooldownActive ? `${t('training_center.cooldown')}: ${hoursRemaining}h ${minutesRemaining}m` : t('training_center.start_training'))}
                    </Button>
                </div>
            </div>
        </div>
    );
}
