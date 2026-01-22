'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { BattleHUD } from '@/components/game/wars/BattleHUD';
import { Battlefield } from '@/components/game/wars/Battlefield';
import { HeroSidebar } from '@/components/game/wars/HeroSidebar';
import { DamageBar } from '@/components/game/wars/DamageBar';
import { Button } from '@/components/Button';
import { DeployModal } from '@/components/game/wars/DeployModal';
import { AnimatePresence, motion } from 'framer-motion';

export function BattleDetailClient() {
    const { battleId } = useParams();
    const { activeBattles, fetchBattles, fetchRoundHistory, lastHit } = useGameStore();
    const [showDeploy, setShowDeploy] = useState(false);
    const [isShaking, setIsShaking] = useState(false);

    const battle = activeBattles.find(b => b.id.toString() === battleId?.toString());

    useEffect(() => {
        if (battleId) {
            fetchBattles();
            fetchRoundHistory(battleId as string);
        }
    }, [battleId, fetchBattles, fetchRoundHistory]);

    // Handle hit effects
    useEffect(() => {
        if (lastHit) {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
        }
    }, [lastHit]);

    if (!battle) {
        return (
            <div className="flex flex-col items-center justify-center p-20">
                <p className="text-slate-500 font-black uppercase italic animate-pulse">Locating Battle Zone...</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-[calc(100vh-100px)] flex flex-col bg-slate-950/20 rounded-3xl overflow-hidden border border-slate-800">
            {/* HUD Header */}
            <BattleHUD battle={battle} />

            <div className="flex-1 grid grid-cols-12 gap-0 relative">
                {/* Main Content Area */}
                <div className="col-span-12 lg:col-span-9 flex flex-col relative overflow-hidden">
                    {/* Damage Indicator Bar */}
                    <DamageBar
                        wall={battle.wall || 50}
                        attackerPoints={battle.attackerPoints}
                        defenderPoints={battle.defenderPoints}
                        attackerDamage={battle.attackerDamage}
                        defenderDamage={battle.defenderDamage}
                    />

                    {/* Battlefield 2D Scene */}
                    <motion.div
                        animate={isShaking ? { x: [-10, 10, -10, 10, 0], y: [-5, 5, -5, 5, 0] } : {}}
                        transition={{ duration: 0.2 }}
                        className="flex-1 flex flex-col"
                    >
                        <Battlefield battle={battle} />
                    </motion.div>

                    {/* Action Bar */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-md px-4">
                        <Button
                            onClick={() => setShowDeploy(true)}
                            className="w-full h-16 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 shadow-[0_0_40px_rgba(220,38,38,0.4)] hover:shadow-[0_0_60px_rgba(220,38,38,0.6)] text-2xl font-black italic tracking-[0.2em] transform hover:scale-105 active:scale-95 transition-all rounded-2xl"
                        >
                            DEPLOY
                        </Button>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="hidden lg:block lg:col-span-3 border-l border-slate-800 bg-slate-900/30 backdrop-blur-sm">
                    <HeroSidebar battle={battle} />
                </div>
            </div>

            {/* Deploy Modal */}
            <AnimatePresence>
                {showDeploy && (
                    <DeployModal
                        battleId={Number(battle.id)}
                        onClose={() => setShowDeploy(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
