'use client';

import { Battle, COUNTRY_CONFIG, CountryId } from '@/lib/types';
import { Target, Clock, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';

interface BattleHUDProps {
    battle: Battle;
}

export function BattleHUD({ battle }: BattleHUDProps) {
    const attacker = COUNTRY_CONFIG[battle.attacker as CountryId] || COUNTRY_CONFIG['US'];
    const defender = COUNTRY_CONFIG[battle.defender as CountryId] || COUNTRY_CONFIG['TR'];

    // Use roundEndTime for current round, fallback to endTime for total battle
    const displayTime = battle.roundEndTime || battle.endTime;

    // Live countdown timer
    const [timeDisplay, setTimeDisplay] = useState('--:--:--');

    useEffect(() => {
        const updateTimer = () => {
            if (!displayTime || isNaN(displayTime) || displayTime <= 0) {
                setTimeDisplay('--:--:--');
                return;
            }
            const seconds = Math.max(0, Math.floor((displayTime - Date.now()) / 1000));
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = seconds % 60;
            setTimeDisplay(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [displayTime]);

    return (
        <div className="bg-slate-900/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between z-30">
            <div className="flex items-center gap-6">
                {/* Attacker Brief */}
                <div className="flex items-center gap-3">
                    <img src={attacker.flag} className="w-10 h-6 object-cover rounded border border-white/10" alt="" />
                    <div>
                        <div className="text-[10px] font-black text-red-500 uppercase tracking-tighter">{attacker.name}</div>
                        <div className="text-xs font-bold text-slate-300">Invading Forces</div>
                    </div>
                </div>

                <div className="h-8 w-px bg-slate-800" />

                {/* Target Region */}
                <div className="flex items-center gap-3 text-white">
                    <Target size={18} className="text-orange-500" />
                    <div>
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sector_Target</div>
                        <div className="text-lg font-black uppercase italic tracking-wider">{battle.region}</div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-8">
                {/* Timer - Now shows ROUND end time with live countdown */}
                <div className="flex flex-col items-end">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Clock size={12} className="text-amber-500" />
                        Round {battle.currentRound || 1} Ends
                    </div>
                    <div className="text-2xl font-black font-mono text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                        {timeDisplay}
                    </div>
                </div>

                {/* Points */}
                <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/5">
                    <div className="text-center">
                        <div className="text-[8px] font-black text-red-500 uppercase">A_PTS</div>
                        <div className="text-xl font-black">{battle.attackerPoints || 0}</div>
                    </div>
                    <div className="text-slate-700 font-bold">:</div>
                    <div className="text-center">
                        <div className="text-[8px] font-black text-blue-500 uppercase">D_PTS</div>
                        <div className="text-xl font-black">{battle.defenderPoints || 0}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
