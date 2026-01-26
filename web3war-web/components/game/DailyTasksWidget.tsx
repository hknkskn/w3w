'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Dumbbell, Swords, Cookie, Briefcase, CheckCircle2, Circle,
    Zap, ChevronRight, Trophy, Star, Gift
} from 'lucide-react';
import { Button } from '@/components/Button';
import { CountryId, COUNTRY_CONFIG } from '@/lib/types';
import { useTranslation } from '@/lib/i18n';

interface DailyTask {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    reward: string;
    rewardType: 'xp' | 'credits' | 'energy' | 'strength';
    completed: boolean;
    energyCost?: number;
}

const INITIAL_TASKS: DailyTask[] = [
    {
        id: 'train',
        icon: <img src="/icons/strength.png" alt="Strength" className="w-6 h-6 object-contain" />,
        title: 'Train',
        description: 'Daily training to increase strength',
        reward: '+0.5 STR',
        rewardType: 'strength',
        completed: false,
        energyCost: 0
    },
    {
        id: 'fight',
        icon: <img src="/icons/ammo.png" alt="Fight" className="w-6 h-6 object-contain" />,
        title: 'Fight for Country',
        description: 'Join a battle and deal damage',
        reward: '+5 XP',
        rewardType: 'xp',
        completed: false,
        energyCost: 10
    },
    {
        id: 'eat',
        icon: <img src="/icons/bread.png" alt="Food" className="w-6 h-6 object-contain" />,
        title: 'Eat Food',
        description: 'Restore your energy with food',
        reward: '+100 Energy',
        rewardType: 'energy',
        completed: false,
        energyCost: 0
    },
    {
        id: 'work',
        icon: <img src="/icons/oil.png" alt="Work" className="w-6 h-6 object-contain" />,
        title: 'Work',
        description: 'Work at your company for salary',
        reward: '+150 CRED',
        rewardType: 'credits',
        completed: false,
        energyCost: 10
    },
];

interface Campaign {
    id: number;
    region: string;
    attacker: { country: string, flag: string };
    defender: { country: string, flag: string };
    timeLeft: string;
}

const MOCK_CAMPAIGNS: Campaign[] = [
    { id: 1, region: 'Marmara', attacker: { country: 'TR', flag: '' }, defender: { country: 'FR', flag: '' }, timeLeft: '01:23:45' },
    { id: 2, region: 'Maharashtra', attacker: { country: 'IN', flag: '' }, defender: { country: 'PL', flag: '' }, timeLeft: '02:15:30' },
    { id: 3, region: 'Little Poland', attacker: { country: 'UA', flag: '' }, defender: { country: 'RU', flag: '' }, timeLeft: '03:45:12' },
];

import { useGameStore } from '@/lib/store';
import { toast } from 'sonner';

// ... (keep DailyTask interface and INITIAL_TASKS if they are static config)

export function DailyTasksWidget() {
    // We can keep local state for "completed" status for now, or move it to store if we want persistence.
    // For Phase 1, let's keep it simple: Tasks reset on page load (or we add dailies to store later).
    // Actually, let's just make the buttons functional first.

    const [tasks, setTasks] = useState(INITIAL_TASKS);
    const { user, consumeEnergy, restoreEnergy, addDamage } = useGameStore();
    const { t } = useTranslation();

    const completedCount = tasks.filter(t => t.completed).length;

    const handleCompleteTask = (task: DailyTask) => {
        if (!user) return;

        // Check requirements
        if (task.energyCost && user.energy < task.energyCost) {
            const { idsAlert } = useGameStore.getState();
            idsAlert(t('errors.insufficient_funds'), t('errors.error'), "warning");
            return;
        }

        // Execute Action
        let success = true;

        if (task.id === 'train') {
            // Train cost logic? Let's say free for now or costs energy
            // update store
        } else if (task.id === 'fight') {
            if (!consumeEnergy(10)) success = false;
            else addDamage(100);
        } else if (task.id === 'eat') {
            if (user.energy >= user.maxEnergy) {
                const { idsAlert } = useGameStore.getState();
                idsAlert("Energy full!", "Metabolism Limit", "info");
                return;
            }
            restoreEnergy(10); // Bread restores 10
        } else if (task.id === 'work') {
            if (!consumeEnergy(10)) success = false;
            else {
                // Add credits logic needed or simple console log for now
                // We need addCredits action in store
            }
        }

        if (success) {
            setTasks(prev => prev.map(t =>
                t.id === task.id ? { ...t, completed: true } : t
            ));
        }
    };

    return (
        <div className="space-y-4">
            {/* Daily Tasks */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border-2 border-slate-700/50 overflow-hidden shadow-lg">
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-cyan-400" />
                        <h3 className="font-bold text-white text-sm">{t('dashboard.daily_challenge')}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{completedCount}/{tasks.length} {t('daily_tasks.completed')}</span>
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                                style={{ width: `${(completedCount / tasks.length) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Tasks Grid */}
                <div className="grid grid-cols-2 gap-2 p-3">
                    {tasks.map((task, index) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative rounded-xl p-3 border-2 transition-all cursor-pointer ${task.completed
                                ? 'bg-emerald-500/10 border-emerald-500/30'
                                : 'bg-slate-900/50 border-slate-700/50 hover:border-cyan-500/30 hover:bg-cyan-500/5'
                                }`}
                            onClick={() => !task.completed && handleCompleteTask(task)}
                        >
                            {/* Completed Overlay */}
                            {task.completed && (
                                <div className="absolute top-2 right-2">
                                    <CheckCircle2 className="text-emerald-400" size={18} />
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${task.completed
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-slate-800 text-slate-400'
                                    }`}>
                                    {task.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`text-sm font-bold ${task.completed ? 'text-emerald-400 line-through' : 'text-white'}`}>
                                        {t(`daily_tasks.${task.id}`)}
                                    </div>
                                    <div className="text-[10px] text-slate-500 truncate">{t(`daily_tasks.${task.id}_desc`)}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-2">
                                <span className={`text-xs font-bold ${task.rewardType === 'credits' ? 'text-amber-400' :
                                    task.rewardType === 'xp' ? 'text-cyan-400' :
                                        task.rewardType === 'strength' ? 'text-red-400' :
                                            'text-emerald-400'
                                    }`}>
                                    {task.reward}
                                </span>
                                {task.energyCost ? (
                                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                        <Zap size={10} className="text-cyan-400" />
                                        -{task.energyCost}
                                    </span>
                                ) : (
                                    <span className="text-[10px] text-emerald-400">FREE</span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bonus Reward */}
                {completedCount === tasks.length && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-3 mb-3 p-3 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-lg border border-cyan-500/30 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <Gift className="text-cyan-400" size={18} />
                            <span className="text-sm font-bold text-cyan-400">{t('dashboard.daily_bonus_unlocked')}</span>
                        </div>
                        <Button size="sm" className="bg-gradient-to-r from-cyan-600 to-emerald-600 text-white border border-cyan-400/20">
                            {t('dashboard.claim_bonus')}
                        </Button>
                    </motion.div>
                )}
            </div>

            {/* Campaign of the Day */}
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border-2 border-slate-700/50 overflow-hidden shadow-lg">
                <div className="px-4 py-3 border-b border-slate-700/50">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                        <Swords size={14} className="text-red-400" /> {t('dashboard.campaign_of_day')}
                    </h3>
                </div>

                <div className="p-3 space-y-2">
                    {MOCK_CAMPAIGNS.map((campaign) => (
                        <div
                            key={campaign.id}
                            className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-red-500/30 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                {COUNTRY_CONFIG[campaign.attacker.country as CountryId] ? (
                                    <img src={COUNTRY_CONFIG[campaign.attacker.country as CountryId].flag} className="w-10 h-6 object-cover rounded shadow-sm border border-white/10" alt="" />
                                ) : (
                                    <span className="text-xl font-bold text-slate-500">{campaign.attacker.country}</span>
                                )}
                                <span className="text-[10px] text-slate-500 font-black px-1 opacity-50 italic">vs</span>
                                {COUNTRY_CONFIG[campaign.defender.country as CountryId] ? (
                                    <img src={COUNTRY_CONFIG[campaign.defender.country as CountryId].flag} className="w-10 h-6 object-cover rounded shadow-sm border border-white/10" alt="" />
                                ) : (
                                    <span className="text-xl font-bold text-slate-500">{campaign.defender.country}</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-bold text-white">{campaign.region}</div>
                                <div className="text-[10px] text-slate-500">{campaign.timeLeft} {t('daily_tasks.remaining')}</div>
                            </div>
                            <Button size="sm" className="bg-gradient-to-r from-red-500 to-orange-500">
                                {t('battle.fight')}
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="px-4 py-2 border-t border-slate-700/50 text-center">
                    <button className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 mx-auto">
                        {t('dashboard.military_campaigns')} <ChevronRight size={12} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DailyTasksWidget;
