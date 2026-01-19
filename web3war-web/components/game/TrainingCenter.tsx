'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { motion } from 'framer-motion';
import {
    Zap,
    Coins,
    Sword,
    Shield,
    Trophy,
    ChevronRight,
    CheckCircle2,
    Clock,
    Flame,
    TrendingUp,
    Dumbbell,
    ArrowUpCircle,
    Star
} from 'lucide-react';
import { Button } from '@/components/Button';
import { CountryId, COUNTRY_CONFIG } from '@/lib/types';
import { IDSCard, IDSLabel } from '@/components/ui/ids';

const REGIMEN_DATA = [
    {
        id: 0,
        name: 'Basic Training',
        image: '⛺',
        baseStrength: 1.0,
        baseEnergy: 5,
    },
    {
        id: 1,
        name: 'Military Academy',
        image: '🏫',
        baseStrength: 2.5,
        baseEnergy: 1,
    },
    {
        id: 2,
        name: 'Special Forces',
        image: '🏰',
        baseStrength: 5.0,
        baseEnergy: 1,
    },
    {
        id: 3,
        name: 'Top Secret Program',
        image: '💎',
        baseStrength: 10.0,
        baseEnergy: 1,
    }
];

export function TrainingCenter() {
    const { user, train, trainingInfo, trainingPricing, fetchTraining, fetchTrainingPricing, upgradeTrainingGrounds } = useGameStore();
    const [selectedIds, setSelectedIds] = useState<number[]>([0]);
    const [isTraining, setIsTraining] = useState(false);

    useEffect(() => {
        fetchTraining();
        fetchTrainingPricing();
    }, [fetchTraining, fetchTrainingPricing]);

    const toggleRegimen = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(prev => prev.filter(i => i !== id));
        } else {
            setSelectedIds(prev => [...prev, id]);
        }
    };

    const getRegimenCost = (id: number) => {
        if (id === 0) return 0;
        if (!trainingPricing) return 0;
        return trainingPricing.regimenCosts[id - 1] / 100;
    };

    const totalCost = user?.isAdmin ? 0 : selectedIds.reduce((sum, id) => sum + getRegimenCost(id), 0);

    const totalEnergy = user?.isAdmin ? 0 : selectedIds.reduce((sum, id) => {
        const item = REGIMEN_DATA.find(r => r.id === id);
        return sum + (item?.baseEnergy || 0);
    }, 0);

    const getRegimenStrength = (id: number) => {
        const item = REGIMEN_DATA.find(r => r.id === id);
        const quality = Number(trainingInfo?.qualities[id] || 1);
        if (isNaN(quality)) return item?.baseStrength || 1.0;
        return (item?.baseStrength || 0) * quality;
    };

    const totalStrength = selectedIds.reduce((sum, id) => {
        const val = getRegimenStrength(id);
        return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const lastTrain = Number(trainingInfo?.lastTrainTime || 0);
    const now = Math.floor(Date.now() / 1000);
    const cooldownActive = !user?.isAdmin && lastTrain > 0 && now < lastTrain + 86400;
    const timeRemaining = Math.max(0, (lastTrain + 86400) - now);
    const hoursRemaining = Math.floor(timeRemaining / 3600);
    const minutesRemaining = Math.floor((timeRemaining % 3600) / 60);

    const handleTrain = async () => {
        if (selectedIds.length === 0) return;
        if (cooldownActive) return;

        const regimensToProcess = selectedIds.map(id => {
            const data = REGIMEN_DATA.find(r => r.id === id)!;
            return {
                id,
                cost: getRegimenCost(id),
                strengthBonus: getRegimenStrength(id),
                energyCost: id === 0 ? (5 + (user?.level || 0)) : 1
            };
        });

        if (user && user.energy < totalEnergy) {
            alert("Not enough energy!");
            return;
        }
        if (user && user.credits < totalCost) {
            alert("Not enough CRED!");
            return;
        }

        setIsTraining(true);
        try {
            await train(regimensToProcess);
            setTimeout(() => setIsTraining(false), 1500);
        } catch (e) {
            setIsTraining(false);
        }
    };

    const handleUpgrade = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        const quality = trainingInfo?.qualities[id] || 1;
        if (quality >= 5) return;
        const upgradeCost = trainingPricing?.upgradeCosts[quality - 1] || 250000000000;

        if (confirm(`Upgrade this facility to Q${quality + 1} for ${(upgradeCost / 100000000).toLocaleString()} SUPRA?`)) {
            upgradeTrainingGrounds(id);
        }
    };

    // Strength Progress Bar Logic
    const strengthFloor = Math.floor(user?.strength || 0);
    const progress = ((user?.strength || 0) % 1) * 100;

    return (
        <div className="space-y-6">
            {/* Top Progress / Global Info - Using IDSCard */}
            <IDSCard className="flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20">
                        <Flame size={24} />
                    </div>
                    <div>
                        <IDSLabel color="dim">Global Rank Progress</IDSLabel>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-2xl font-black text-white font-mono">{user?.strength?.toFixed(2)}</span>
                            <div className="w-40 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                            <span className="text-xs font-bold text-slate-600">{strengthFloor + 1}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 px-5 py-3 bg-slate-950/50 rounded-xl border border-slate-800">
                    <div className="text-right">
                        <IDSLabel color="dim">Daily Training</IDSLabel>
                        <div className="text-sm font-bold text-amber-400">{cooldownActive ? `${hoursRemaining}h ${minutesRemaining}m` : 'Available Now'}</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
                        <Clock size={18} />
                    </div>
                </div>
            </IDSCard>

            {/* Regimens Table - Modular Table Header */}
            <div className="bg-slate-800/40 rounded-xl border border-slate-800 overflow-hidden shadow-lg">
                <div className="grid grid-cols-12 bg-slate-900/50 p-4 border-b border-slate-800 text-center">
                    <div className="col-span-4 text-left pl-6"><IDSLabel color="dim">Facility</IDSLabel></div>
                    <div className="col-span-2"><IDSLabel color="dim">Regimen</IDSLabel></div>
                    <div className="col-span-3"><IDSLabel color="dim">Cost per day</IDSLabel></div>
                    <div className="col-span-3"><IDSLabel color="dim">Strength gain</IDSLabel></div>
                </div>

                <div className="divide-y divide-slate-800/30">
                    {REGIMEN_DATA.map((regimen) => {
                        const quality = trainingInfo?.qualities[regimen.id] || 1;
                        const isSelected = selectedIds.includes(regimen.id);
                        const cost = getRegimenCost(regimen.id);
                        const strength = getRegimenStrength(regimen.id);

                        return (
                            <div
                                key={regimen.id}
                                onClick={() => toggleRegimen(regimen.id)}
                                className={`grid grid-cols-12 items-center p-4 transition-all cursor-pointer group ${isSelected
                                    ? 'bg-amber-500/5 border-l-2 border-amber-500'
                                    : 'hover:bg-slate-800/30 border-l-2 border-transparent'
                                    }`}
                            >
                                <div className="col-span-4 flex items-center gap-4">
                                    <div className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center text-4xl bg-slate-900 ${isSelected
                                        ? 'border-amber-500/50 shadow-lg'
                                        : 'border-slate-800 group-hover:border-slate-700'
                                        }`}>
                                        {regimen.image}
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <div className="text-sm font-black text-white uppercase tracking-tight truncate group-hover:text-amber-400 transition-colors">{regimen.name}</div>
                                            {quality < 5 && (
                                                <button
                                                    onClick={(e) => handleUpgrade(e, regimen.id)}
                                                    className="shrink-0 flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-[9px] font-black text-white rounded-md transition-all active:scale-95 shadow-md"
                                                >
                                                    <ArrowUpCircle size={10} />
                                                    <span>UPGRADE</span>
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={12}
                                                    className={i < quality ? "text-amber-400 fill-amber-400" : "text-slate-700"}
                                                />
                                            ))}
                                            <span className="ml-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">Efficiency: {quality * 20}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-2 flex justify-center">
                                    <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-all ${isSelected
                                        ? 'bg-amber-500 border-amber-400 text-slate-900 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                        : 'bg-slate-900 border-slate-700 group-hover:border-slate-600'
                                        }`}>
                                        {isSelected && <CheckCircle2 size={14} />}
                                    </div>
                                </div>

                                <div className="col-span-3 flex flex-col items-center">
                                    {user?.isAdmin ? (
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">Admin Free</span>
                                    ) : cost > 0 ? (
                                        <div className="flex items-center gap-1.5">
                                            <Coins size={14} className="text-amber-500" />
                                            <span className="text-lg font-mono text-amber-400 font-bold">{cost.toFixed(2)}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/20">Free Session</span>
                                    )}
                                </div>

                                <div className="col-span-3 flex justify-center">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-xl border border-red-500/20 group-hover:border-red-500/40 transition-all shadow-sm">
                                        <Sword size={14} className="text-red-400" />
                                        <span className="text-lg font-black text-red-500 font-mono">+{strength.toFixed(1)}</span>
                                        <span className="text-[9px] text-red-900/50 font-black">STR</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Controls - Cleaned Up */}
                <div className="p-6 bg-slate-900/50 shadow-inner border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-10">
                        <div className="text-center">
                            <IDSLabel color="dim" className="mb-1">Energy Req</IDSLabel>
                            <div className="flex items-center justify-center gap-2">
                                <div className={`p-1.5 rounded-lg ${user && user.energy >= totalEnergy ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-500'}`}>
                                    <Zap size={16} />
                                </div>
                                <span className={`text-xl font-bold font-mono ${user && user.energy >= totalEnergy ? 'text-white' : 'text-red-500'}`}>{totalEnergy}</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <IDSLabel color="dim" className="mb-1">Cred Cost</IDSLabel>
                            <div className="flex items-center justify-center gap-2">
                                <div className={`p-1.5 rounded-lg ${user && user.credits >= totalCost ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                                    <Coins size={16} />
                                </div>
                                <span className={`text-xl font-bold font-mono ${user && user.credits >= totalCost ? 'text-white' : 'text-red-500'}`}>{totalCost.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <IDSLabel color="dim" className="mb-1">Net Gain</IDSLabel>
                            <div className="flex items-center justify-center gap-2">
                                <div className="p-1.5 bg-red-500/10 rounded-lg text-red-400">
                                    <TrendingUp size={16} />
                                </div>
                                <span className="text-xl font-black text-red-500 font-mono">+{totalStrength.toFixed(1)} <span className="text-[10px]">STR</span></span>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleTrain}
                        disabled={selectedIds.length === 0 || isTraining || cooldownActive}
                        className={`min-w-[200px] h-14 text-lg font-black tracking-widest uppercase transition-all shadow-xl ${isTraining || cooldownActive ? 'bg-slate-700 text-slate-500' : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-red-500/20'
                            }`}
                    >
                        {isTraining ? 'DEVELOPING...' : (cooldownActive ? `${hoursRemaining}H ${minutesRemaining}M` : 'START TRAINING')}
                    </Button>
                </div>
            </div>

            {/* Tip Box - Using IDSCard */}
            <IDSCard className="flex gap-4 items-start bg-amber-500/5 border-amber-500/10">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <Trophy size={18} />
                </div>
                <div>
                    <IDSLabel color="accent" className="mb-1">Commander's Tip</IDSLabel>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Training is vital for your success on the battlefield. Higher strength increases your influence in wars and maximizes damage per energy hit.
                        Invest in multiple regimens to fast-track your progression to the Top 100 global leaderboard.
                    </p>
                </div>
            </IDSCard>
        </div>
    );
}
