'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { Zap } from 'lucide-react';

interface ActiveCombatant {
    addr: string;
    side: 'attacker' | 'defender';
    influence: number;
}

interface BattleAnimatorProps {
    battleId: string;
    attackerDamage: number;
    defenderDamage: number;
}

export function BattleAnimator({ battleId }: BattleAnimatorProps) {
    const { roundHistory } = useGameStore();
    const history = roundHistory[battleId] || [];

    // Get unique attackers from history (limit to 5)
    const combatants = useMemo(() => {
        const unique = new Map<string, ActiveCombatant>();

        if (Array.isArray(history) && history.length > 0) {
            [...history].reverse().forEach(h => {
                if (h.attackerTopAddr && h.attackerTopAddr !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                    if (!unique.has(h.attackerTopAddr)) {
                        unique.set(h.attackerTopAddr, { addr: h.attackerTopAddr, side: 'attacker', influence: h.attackerTopInfluence || 500 });
                    }
                }
                if (h.defenderTopAddr && h.defenderTopAddr !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                    if (!unique.has(h.defenderTopAddr)) {
                        unique.set(h.defenderTopAddr, { addr: h.defenderTopAddr, side: 'defender', influence: h.defenderTopInfluence || 500 });
                    }
                }
            });
        }

        // Add mock combatants if history is empty
        if (unique.size < 2) {
            unique.set('0xGARRISON_A', { addr: '0x1A2B...C3D4', side: 'attacker', influence: 1250 });
            unique.set('0xGARRISON_B', { addr: '0x9E8F...G7H6', side: 'defender', influence: 1000 });
        }

        return Array.from(unique.values()).slice(0, 5);
    }, [history]);

    return (
        <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
            {combatants.map((c, index) => (
                <CyclingSoldier
                    key={c.addr}
                    combatant={c}
                    index={index}
                />
            ))}
        </div>
    );
}

function CyclingSoldier({ combatant, index }: { combatant: ActiveCombatant, index: number }) {
    const [isVisible, setIsVisible] = useState(false);
    const [toasts, setToasts] = useState<{ id: string, val: number }[]>([]);
    const cycleRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const startCycle = () => {
            setIsVisible(true);

            const toastInterval = setInterval(() => {
                const id = Math.random().toString(36).substr(2, 9);
                setToasts(prev => [...prev, { id, val: combatant.influence }]);
                setTimeout(() => {
                    setToasts(prev => prev.filter(t => t.id !== id));
                }, 1500);
            }, 4500);

            cycleRef.current = setTimeout(() => {
                setIsVisible(false);
                clearInterval(toastInterval);
                cycleRef.current = setTimeout(startCycle, 6000);
            }, 12000);
        };

        const initialDelay = index * 4000;
        const initialTimeout = setTimeout(startCycle, initialDelay);

        return () => {
            clearTimeout(initialTimeout);
            if (cycleRef.current) clearTimeout(cycleRef.current);
        };
    }, [index, combatant.influence]);

    const displayAddr = combatant.addr.length > 10 ? `${combatant.addr.slice(0, 6)}...${combatant.addr.slice(-4)}` : combatant.addr;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`absolute bottom-[22%] flex flex-col items-center ${combatant.side === 'attacker' ? 'left-[25%]' : 'right-[25%]'
                        }`}
                    style={{
                        marginLeft: `${(index - 2) * 110}px`,
                        bottom: `${18 + (index % 3) * 5}%`,
                        zIndex: 30 + index
                    }}
                >
                    <div className="unit-id-overlay">
                        <span className="id-address">{displayAddr}</span>
                        <div className="id-bar-container">
                            <div className="id-energy-bar">
                                <motion.div
                                    className="id-energy-fill"
                                    animate={{ width: ['70%', '40%', '70%'] }}
                                    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                                />
                            </div>
                            <div className="id-battery-container">
                                <Zap size={10} fill="currentColor" />
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <AnimatePresence>
                            {toasts.map(t => (
                                <div key={t.id} className="unit-damage-toast animate-unit-damage">
                                    +{t.val.toLocaleString()}
                                </div>
                            ))}
                        </AnimatePresence>

                        {/* Muzzle flash moved inside animated container for weapon synchronization */}
                        <div className={`relative ${combatant.side === 'attacker' ? 'strike-right-loop' : 'strike-left-loop'}`}>
                            {/* Weapon Muzzle Flash - Absolute position relative to animated parent */}
                            <div
                                className="muzzle-flash animate-flash"
                                style={{ opacity: 1 }}
                            />

                            <img
                                src="/icons/army.png"
                                className="soldier small"
                                alt=""
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
