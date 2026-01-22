'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useGameStore } from '@/lib/store';
import { BattleHUD } from '@/components/game/wars/BattleHUD';
import { motion } from 'framer-motion';

export function BattleDetailClient() {
    return (
        <Suspense fallback={<div>Loading Arena...</div>}>
            <BattleDetailContent />
        </Suspense>
    );
}

function BattleDetailContent() {
    const searchParams = useSearchParams();
    const battleId = searchParams.get('id');
    const { activeBattles, fetchBattles, fetchRoundHistory } = useGameStore();

    const battle = activeBattles.find(b => b.id.toString() === battleId?.toString());

    useEffect(() => {
        if (battleId) {
            fetchBattles();
            fetchRoundHistory(battleId as string);
        }
    }, [battleId, fetchBattles, fetchRoundHistory]);

    if (!battle) {
        return (
            <div className="flex flex-col items-center justify-center p-20 min-h-[600px]">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-500 font-black uppercase italic tracking-[0.3em] animate-pulse"
                >
                    Locating Battle Zone...
                </motion.div>
            </div>
        );
    }

    return (
        <div className="relative w-full flex flex-col bg-slate-950/20 rounded-3xl overflow-hidden shadow-2xl border border-white/5">
            {/* 
               The new BattleHUD is now a self-contained Arena UI 
               that bypasses the old battlefield/sidebar layout.
            */}
            <BattleHUD battle={battle} />
        </div>
    );
}
