'use client';

import { useEffect } from 'react';
import { TrainingCenter } from '@/components/game/TrainingCenter';
import { Target, Shield, Flame, TrendingUp, Sword } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { IDSCard, IDSStatBox, IDSLabel } from '@/components/ui/ids';

export default function TrainingPage() {
    const { user, fetchTraining } = useGameStore();

    useEffect(() => {
        fetchTraining();
    }, [fetchTraining]);

    return (
        <div className="space-y-6">
            {/* Header Area - Using IDSCard */}
            <IDSCard className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
                        <Target className="text-red-500" size={32} />
                        TRAINING GROUNDS
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Develop your combat proficiency and physical strength.</p>
                </div>

                <div className="flex items-center gap-6 pr-4">
                    <div className="text-right">
                        <IDSLabel color="dim">Global Status</IDSLabel>
                        <div className="flex items-center gap-2 text-white font-black">
                            <Shield size={14} className="text-amber-400" />
                            <span>RANK #4,291</span>
                        </div>
                    </div>
                </div>
            </IDSCard>

            {/* Main Training Component */}
            <div className="animate-in fade-in duration-500">
                <TrainingCenter />
            </div>

            {/* Stats Overview - Using IDSStatBox */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <IDSStatBox
                    label="Total Strength"
                    value={(user?.strength || 0).toFixed(2)}
                    unit="STR"
                    icon={<Flame size={14} className="text-red-500" />}
                    subValue="▲ Top 15% in your country"
                    color="text-white"
                />

                <IDSStatBox
                    label="Training Level"
                    value={Math.floor((user?.strength || 0) / 10) + 1}
                    unit="LVL"
                    icon={<TrendingUp size={14} className="text-amber-400" />}
                    subValue="Unlocks Elite at Lvl 5"
                    color="text-white"
                />

                <IDSStatBox
                    label="Battle Proficiency"
                    value={`${((user?.level || 1) * 2.5).toFixed(1)}%`}
                    icon={<Sword size={14} className="text-red-500" />}
                    subValue="Weapon damage bonus"
                    color="text-white"
                />
            </div>
        </div>
    );
}
