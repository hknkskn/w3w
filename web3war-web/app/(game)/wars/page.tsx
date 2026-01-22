'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { BattleCard } from '@/components/game/wars/BattleCard';

export default function WarsPage() {
    const { activeBattles, fetchBattles } = useGameStore();

    useEffect(() => {
        fetchBattles();
        const interval = setInterval(fetchBattles, 10000);
        return () => clearInterval(interval);
    }, [fetchBattles]);

    return (
        <div className="space-y-6 p-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-white uppercase italic tracking-wider">Wars & Campaigns</h1>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Global Conflict Monitor</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeBattles.map((battle) => (
                    <BattleCard key={battle.id} battle={battle} />
                ))}
                {activeBattles.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                        <p className="text-slate-500 font-bold uppercase tracking-widest italic">No Active Campaigns at this Time</p>
                    </div>
                )}
            </div>
        </div>
    );
}
