'use client';

import { useEffect } from 'react';
import { TrainingCenter } from '@/components/game/TrainingCenter';
import { Target, TrendingUp, Shield } from 'lucide-react';
import { useGameStore } from '@/lib/store';

export default function TrainingPage() {
    const { user, fetchTraining } = useGameStore();

    useEffect(() => {
        fetchTraining();
    }, [fetchTraining]);

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Target className="text-red-500" size={32} />
                        TRAINING GROUNDS
                    </h1>
                    <p className="text-slate-400 mt-1">Develop your combat proficiency and physical strength.</p>
                </div>

                <div className="flex items-center gap-6 pr-4">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Global Status</div>
                        <div className="flex items-center gap-2 text-white font-black">
                            <Shield size={14} className="text-cyan-400" />
                            <span>RANK #4,291</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Training Component */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <TrainingCenter />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                    <div className="text-[10px] text-slate-500 font-black uppercase mb-2">Total Strength</div>
                    <div className="text-3xl font-black text-white">{user?.strength?.toFixed(2) || '0.00'}</div>
                    <div className="text-xs text-emerald-400 font-bold mt-1">▲ Top 15% in your country</div>
                </div>

                <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                    <div className="text-[10px] text-slate-500 font-black uppercase mb-2">Training Level</div>
                    <div className="text-3xl font-black text-cyan-400">Level {Math.floor((user?.strength || 0) / 10) + 1}</div>
                    <div className="text-xs text-slate-400 font-bold mt-1">Unlocks Elite facilities at Lvl 5</div>
                </div>

                <div className="p-6 bg-slate-800/40 rounded-2xl border border-slate-700/50">
                    <div className="text-[10px] text-slate-500 font-black uppercase mb-2">Battle Proficiency</div>
                    <div className="text-3xl font-black text-red-500">{(user?.level || 1) * 2.5}%</div>
                    <div className="text-xs text-slate-400 font-bold mt-1">Direct bonus to weapon damage</div>
                </div>
            </div>
        </div>
    );
}
