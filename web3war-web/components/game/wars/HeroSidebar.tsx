'use client';

import { Battle } from '@/lib/types';
import { Trophy, Swords, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeroSidebarProps {
    battle: Battle;
}

export function HeroSidebar({ battle }: HeroSidebarProps) {
    const attackerHero = battle.attackerTop;
    const defenderHero = battle.defenderTop;

    const formatInfluence = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return value.toString();
    };

    const shortenAddress = (addr: string) => {
        if (!addr || addr.length < 10) return addr || 'Unknown';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-8">
            <div>
                <h3 className="text-sm font-black text-white uppercase italic tracking-widest flex items-center gap-2 mb-4">
                    <Trophy size={16} className="text-amber-500" />
                    Hero Rankings
                </h3>

                <div className="space-y-6">
                    {/* Attacker Hero */}
                    <div className="space-y-3">
                        <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Swords size={12} /> Vanguard Lead
                        </div>
                        {attackerHero && attackerHero.addr ? (
                            <HeroCard
                                name={shortenAddress(attackerHero.addr)}
                                damage={formatInfluence(attackerHero.influence)}
                                side="attacker"
                            />
                        ) : (
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center text-slate-600 text-xs">
                                No attacker hero yet
                            </div>
                        )}
                    </div>

                    {/* Defender Hero */}
                    <div className="space-y-3">
                        <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Shield size={12} /> Iron Sentinel
                        </div>
                        {defenderHero && defenderHero.addr ? (
                            <HeroCard
                                name={shortenAddress(defenderHero.addr)}
                                damage={formatInfluence(defenderHero.influence)}
                                side="defender"
                            />
                        ) : (
                            <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-center text-slate-600 text-xs">
                                No defender hero yet
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Combat Stats */}
            <div className="pt-8 border-t border-white/5 space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Round_Stats</h4>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                        <div className="text-[8px] font-black text-slate-600 uppercase">Round</div>
                        <div className="text-sm font-black text-white">{battle.currentRound || 1}</div>
                    </div>
                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                        <div className="text-[8px] font-black text-slate-600 uppercase">Wall</div>
                        <div className="text-sm font-black text-amber-500">{battle.wallPercentage || 50}%</div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                        <div className="text-[8px] font-black text-red-500 uppercase">ATK_DMG</div>
                        <div className="text-sm font-black text-white">{formatInfluence(battle.attackerDamage || 0)}</div>
                    </div>
                    <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                        <div className="text-[8px] font-black text-blue-500 uppercase">DEF_DMG</div>
                        <div className="text-sm font-black text-white">{formatInfluence(battle.defenderDamage || 0)}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function HeroCard({ name, damage, side }: { name: string; damage: string; side: 'attacker' | 'defender' }) {
    return (
        <motion.div
            whileHover={{ x: 5 }}
            className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
        >
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${side === 'attacker' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {name[0]?.toUpperCase() || '?'}
                </div>
                <div>
                    <div className="text-[10px] font-bold text-white truncate w-24">{name}</div>
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">TOP_DMG</div>
                </div>
            </div>
            <div className="text-xs font-black text-slate-300 italic">{damage}</div>
        </motion.div>
    );
}
