'use client';

import { useEffect } from 'react';
import { TrainingCenter } from '@/components/game/TrainingCenter';
import { Target, Shield, Flame, TrendingUp, Sword, Clock, Trophy } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { IDSCard, IDSStatBox, IDSLabel } from '@/components/ui/ids';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

export default function TrainingPage() {
    const { user, fetchTraining, facilities } = useGameStore();
    const { t } = useTranslation();

    useEffect(() => {
        fetchTraining();
    }, [fetchTraining]);

    // Strength Progress Bar Logic
    const strengthFloor = Math.floor(user?.strength || 0);
    const progress = ((user?.strength || 0) % 1) * 100;

    return (
        <div className="space-y-6 pb-20 animate-in fade-in duration-500 mt-2">

            {/* Bottom Strength Progress Card - Legacy Design */}
            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1 w-full">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <Flame size={28} />
                    </div>
                    <div className="flex-1">
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{t('training.global_rank_progress')}</div>
                        <div className="flex items-center gap-4">
                            <span className="text-2xl font-black text-white font-mono">{user?.strength?.toFixed(2)}</span>
                            <div className="flex-1 h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-700/50 relative shadow-inner">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                            <span className="text-xs font-bold text-slate-500 font-mono">{strengthFloor + 1}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 px-6 py-3 bg-slate-900/50 rounded-2xl border border-slate-700/30 min-w-[220px]">
                    <div className="text-right flex-1">
                        <div className="text-[10px] text-slate-500 font-black uppercase mb-1">{t('training.daily_training')}</div>
                        <div className="text-sm font-black text-cyan-400">{t('training.available_now')}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                        <Clock size={20} />
                    </div>
                </div>
            </div>

            {/* Main Training Component */}
            <div className="animate-in fade-in duration-500">
                <TrainingCenter />
            </div>

            {/* Tips Section */}
            <div className="p-5 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex gap-5 items-start">
                <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                    <Trophy size={20} />
                </div>
                <div>
                    <h4 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-1.5">{t('training.commanders_tip')}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        {t('training.tip_text')}
                    </p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <IDSStatBox
                    label={t('training.total_strength')}
                    value={(user?.strength || 0).toFixed(2)}
                    unit="STR"
                    icon={<Flame size={14} className="text-red-500" />}
                    subValue={t('training.top_percent')}
                    color="text-white font-black"
                    className="bg-slate-900/40 border-slate-700/30"
                />

                <IDSStatBox
                    label={t('training.training_level')}
                    value={Math.floor((user?.strength || 0) / 10) + 1}
                    unit="LVL"
                    icon={<TrendingUp size={14} className="text-amber-400" />}
                    subValue={t('training.unlocks_elite')}
                    color="text-white font-black"
                    className="bg-slate-900/40 border-slate-700/30"
                />

                <IDSStatBox
                    label={t('training.battle_proficiency')}
                    value={`${((user?.level || 1) * 2.5).toFixed(1)}%`}
                    icon={<Sword size={14} className="text-red-500" />}
                    subValue={t('training.passive_bonus')}
                    color="text-white font-black"
                    className="bg-slate-900/40 border-slate-700/30"
                />
            </div>
        </div>
    );
}
