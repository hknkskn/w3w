'use client';

import { Battle, COUNTRY_CONFIG, CountryId } from '@/lib/types';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Swords, Shield, Clock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface BattleCardProps {
    battle: Battle;
}

export function BattleCard({ battle }: BattleCardProps) {
    const attacker = COUNTRY_CONFIG[battle.attacker as CountryId] || COUNTRY_CONFIG['US'];
    const defender = COUNTRY_CONFIG[battle.defender as CountryId] || COUNTRY_CONFIG['TR'];

    // Use roundEndTime for current round, fallback to endTime
    const displayTime = battle.roundEndTime || battle.endTime;

    // Live countdown
    const [timeLeft, setTimeLeft] = useState('--:--');

    useEffect(() => {
        const updateTimer = () => {
            if (!displayTime || isNaN(displayTime) || displayTime <= 0) {
                setTimeLeft('--:--');
                return;
            }
            const seconds = Math.max(0, Math.floor((displayTime - Date.now()) / 1000));
            if (seconds === 0) {
                setTimeLeft('ENDED');
                return;
            }
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            setTimeLeft(`${h}h:${m}m`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000); // Update every minute for card view
        return () => clearInterval(interval);
    }, [displayTime]);

    return (
        <Card noPadding className="group overflow-hidden bg-slate-900/40 border-slate-800 hover:border-slate-600 transition-all duration-300">
            {/* Region Header */}
            <div className="p-3 bg-slate-800/50 border-b border-slate-700/50 flex items-center justify-between">
                <h3 className="text-xs font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                    <Swords size={14} className="text-red-500" />
                    {battle.region || 'Unknown Sector'}
                </h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-black/30 px-2 py-0.5 rounded">
                    Active Campaign
                </span>
            </div>

            {/* Flags & Visuals */}
            <div className="relative h-32 flex overflow-hidden">
                {/* Attacker Side */}
                <div className="relative flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-900/20 to-transparent overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-500 to-transparent" />
                    <img src={attacker.flag} alt={attacker.name} className="w-20 h-12 object-cover rounded shadow-2xl relative z-10 border border-white/10" />
                    <div className="mt-2 text-[10px] font-black text-red-500 uppercase tracking-tighter">{attacker.name}</div>
                    <div className="text-xl font-black text-white italic">{(Number(battle.attackerDamage) / 1000).toFixed(1)}K</div>
                </div>

                {/* VS Marker */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border-2 border-slate-800 flex items-center justify-center shadow-2xl">
                        <span className="text-xs font-black italic text-slate-500">VS</span>
                    </div>
                </div>

                {/* Defender Side */}
                <div className="relative flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-bl from-blue-900/20 to-transparent overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 to-transparent" />
                    <img src={defender.flag} alt={defender.name} className="w-20 h-12 object-cover rounded shadow-2xl relative z-10 border border-white/10" />
                    <div className="mt-2 text-[10px] font-black text-blue-500 uppercase tracking-tighter">{defender.name}</div>
                    <div className="text-xl font-black text-white italic">{(Number(battle.defenderDamage) / 1000).toFixed(1)}K</div>
                </div>
            </div>

            {/* Footer / Action */}
            <div className="p-4 bg-slate-950/50 border-t border-slate-800/50 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                        <Clock size={12} className="text-amber-500" />
                        <span className="uppercase tracking-widest">{timeLeft} left</span>
                    </div>
                </div>

                <Link href={`/wars/${battle.id}`} className="w-1/2">
                    <Button className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-[10px] font-black uppercase italic tracking-widest h-9 shadow-lg shadow-red-900/20">
                        Campaign
                    </Button>
                </Link>
            </div>
        </Card>
    );
}
