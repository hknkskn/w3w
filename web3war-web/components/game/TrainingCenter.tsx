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
    const { user, train, trainingInfo, trainingPricing, fetchTrainingPricing, upgradeTrainingGrounds } = useGameStore();
    const [selectedIds, setSelectedIds] = useState<number[]>([0]);
    const [isTraining, setIsTraining] = useState(false);

    useEffect(() => {
        fetchTrainingPricing();
    }, [fetchTrainingPricing]);

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

    const totalCost = selectedIds.reduce((sum, id) => sum + getRegimenCost(id), 0);

    const totalEnergy = selectedIds.reduce((sum, id) => {
        const item = REGIMEN_DATA.find(r => r.id === id);
        return sum + (item?.baseEnergy || 0);
    }, 0);

    const getRegimenStrength = (id: number) => {
        const item = REGIMEN_DATA.find(r => r.id === id);
        const quality = trainingInfo?.qualities[id] || 1;
        return (item?.baseStrength || 0) * quality;
    };

    const totalStrength = selectedIds.reduce((sum, id) => sum + getRegimenStrength(id), 0);

    const handleTrain = async () => {
        if (selectedIds.length === 0) return;

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
            {/* Top Progress / Global Info */}
            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <Flame size={28} />
                    </div>
                    <div>
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Global Rank Progress</div>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-black text-white">{user?.strength?.toFixed(2)}</span>
                            <div className="w-48 h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700/50 p-0.5">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                />
                            </div>
                            <span className="text-xs font-bold text-slate-500">{strengthFloor + 1}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 px-6 py-2 bg-slate-900/50 rounded-2xl border border-slate-700/30">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-black uppercase">Daily Training</div>
                        <div className="text-sm font-bold text-cyan-400">Available Now</div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                        <Clock size={20} />
                    </div>
                </div>
            </div>

            {/* Regimens Table */}
            <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
                <div className="grid grid-cols-12 bg-slate-900/50 p-4 border-b border-slate-700/50 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">
                    <div className="col-span-4 text-left pl-10">Facility</div>
                    <div className="col-span-2">Regimen</div>
                    <div className="col-span-3">Cost per day</div>
                    <div className="col-span-3">Strength gain</div>
                </div>

                <div className="divide-y divide-slate-700/30">
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
                                            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-5xl">
                                                {regimen.image}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="text-sm font-black text-white uppercase tracking-tight truncate">{regimen.name}</div>
                                            {quality < 5 && (
                                                <button
                                                    onClick={(e) => handleUpgrade(e, regimen.id)}
                                                    className="shrink-0 flex items-center gap-1.5 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-[9px] font-black text-white rounded-md border border-emerald-400/30 transition-all hover:scale-105 active:scale-95 shadow-lg group/upg"
                                                >
                                                    <ArrowUpCircle size={10} fill="currentColor" className="text-emerald-950" />
                                                    <span>UPGRADE ({((trainingPricing?.upgradeCosts[quality - 1] || 250000000000) / 100000000).toLocaleString()} S)</span>
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-0.5 mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={12}
                                                    className={i < quality ? "text-amber-400 fill-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3)]" : "text-slate-700"}
                                                />
                                            ))}
                                            <span className="ml-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest whitespace-nowrap">Efficiency: {quality * 20}%</span>
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
                                    {cost > 0 ? (
                                        <div className="flex items-center gap-1.5">
                                            <Coins size={14} className="text-amber-500" />
                                            <span className="text-lg font-mono text-amber-400 font-bold">{cost.toFixed(2)} CRED</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm font-black text-emerald-400 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-lg">Free</span>
                                    )}
                                </div>

                                <div className="col-span-3 flex justify-center">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 rounded-xl border border-red-500/20 group-hover:border-red-500/40 transition-all">
                                        <Sword size={14} className="text-red-400" />
                                        <span className="text-lg font-black text-red-400">+{strength.toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Controls */}
                <div className="p-6 bg-slate-900/80 border-t border-slate-700/50 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-12">
                        <div className="text-center">
                            <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Energy Required</div>
                            <div className="flex items-center justify-center gap-2">
                                <div className={`p-1.5 rounded-lg ${user && user.energy >= totalEnergy ? 'bg-cyan-500/10 text-cyan-400' : 'bg-red-500/10 text-red-500'}`}>
                                    <Zap size={16} />
                                </div>
                                <span className={`text-xl font-bold ${user && user.energy >= totalEnergy ? 'text-white' : 'text-red-500'}`}>{totalEnergy}</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Total CRED Cost</div>
                            <div className="flex items-center justify-center gap-2">
                                <div className={`p-1.5 rounded-lg ${user && user.credits >= totalCost ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                                    <Coins size={16} />
                                </div>
                                <span className={`text-xl font-bold ${user && user.credits >= totalCost ? 'text-white' : 'text-red-500'}`}>{totalCost.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Total Gain</div>
                            <div className="flex items-center justify-center gap-2">
                                <div className="p-1.5 bg-red-500/10 rounded-lg text-red-400">
                                    <TrendingUp size={16} />
                                </div>
                                <span className="text-xl font-black text-red-400">+{totalStrength.toFixed(1)} STR</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleTrain}
                        disabled={selectedIds.length === 0 || isTraining}
                        className={`min-w-[200px] h-14 text-lg font-black tracking-widest uppercase transition-all shadow-glow ${isTraining ? 'bg-slate-700 animate-pulse' : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500'
                            }`}
                    >
                        {isTraining ? 'Developing Muscle...' : 'Start Training'}
                    </Button>
                </div>
            </div>

            {/* Tip Box */}
            <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex gap-4 items-start">
                <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
                    <Trophy size={18} />
                </div>
                <div>
                    <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-1">Commander's Tip</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Training is vital for your success on the battlefield. Higher strength increases your influence in wars and maximizes damage per energy hit.
                        Invest in multiple regimens to fast-track your progression to the Top 100 global leaderboard.
                    </p>
                </div>
            </div>
        </div>
    );
}
