'use client';

import { Battle, COUNTRY_CONFIG, CountryId, COUNTRY_IDS } from '@/lib/types';
import { Trophy, Zap, TrendingUp, Shield, Swords, Users } from 'lucide-react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/Button';
import { DeployModal } from './DeployModal';
import { useGameStore } from '@/lib/store';
import { BattleAnimator } from './BattleAnimator';
import { ExplosionEffect } from './ExplosionEffect';
import { TacticalAvatar } from '@/components/game/TacticalAvatar';

interface BattleHUDProps {
    battle: Battle;
}

export function BattleHUD({ battle }: BattleHUDProps) {
    const attacker = COUNTRY_CONFIG[battle.attacker as CountryId] || COUNTRY_CONFIG['US'];
    const defender = COUNTRY_CONFIG[battle.defender as CountryId] || COUNTRY_CONFIG['TR'];
    const { user, lastHit, roundHistory } = useGameStore();
    const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
    const [isAttackerRankOpen, setIsAttackerRankOpen] = useState(false);
    const [isDefenderRankOpen, setIsDefenderRankOpen] = useState(false);

    // Side detection based on user country
    const userSide = useMemo(() => {
        const userCountryId = user?.countryId || 0;
        const defenderId = COUNTRY_IDS[battle.defender as CountryId] || 0;
        return userCountryId === defenderId ? 'defender' : 'attacker';
    }, [user, battle.defender]);

    const [isAttacking, setIsAttacking] = useState(false);
    const lastHitTimestamp = useRef(0);

    const displayTime = battle.roundEndTime || battle.endTime;
    const [timeDisplay, setTimeDisplay] = useState('--:--:--');

    const bgImage = useMemo(() => {
        const index = (battle.regionId % 7) + 1;
        return `/image/Wars-background/maps${index}.png`;
    }, [battle.regionId]);

    const wallPercentage = battle.wallPercentage || 50;

    // Get current top heroes - prioritize live data from the battle object
    const topAttacker = battle.attackerTop || null;
    const topDefender = battle.defenderTop || null;

    // Detect local player attack feedback
    useEffect(() => {
        if (lastHit && lastHit.timestamp > lastHitTimestamp.current) {
            setIsAttacking(true);
            setTimeout(() => setIsAttacking(false), 5000); // Extended duration
            lastHitTimestamp.current = lastHit.timestamp;
        }
    }, [lastHit]);

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
        <div
            className="arena-container"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="arena-overlay" />

            {/* Authentic eRep Hero Cards */}
            <HeroCardV2
                side="left"
                hero={topAttacker}
                isOpen={isAttackerRankOpen}
                toggleOpen={() => setIsAttackerRankOpen(!isAttackerRankOpen)}
                battleId={battle.id}
                onClose={() => setIsAttackerRankOpen(false)}
            />

            <HeroCardV2
                side="right"
                hero={topDefender}
                isOpen={isDefenderRankOpen}
                toggleOpen={() => setIsDefenderRankOpen(!isDefenderRankOpen)}
                battleId={battle.id}
                onClose={() => setIsDefenderRankOpen(false)}
            />

            {/* Dynamic Combat Animations Layer */}
            <BattleAnimator
                battleId={battle.id}
                attackerDamage={battle.attackerDamage}
                defenderDamage={battle.defenderDamage}
            />

            <ExplosionEffect />

            {/* Top Mini Info Bar */}
            <div className="battle-info-mini">
                <div className="flex items-center gap-2 text-[10px] font-black text-cyan-400 uppercase tracking-widest relative">
                    <Zap size={10} fill="currentColor" /> Round {battle.currentRound}
                </div>
                <div className="w-px h-3 bg-white/20 relative" />
                <div className="text-sm font-black font-mono text-white tracking-[0.2em] relative">
                    {timeDisplay}
                </div>
            </div>

            {/* Battle Score Header */}
            <div className="battle-score-header">
                {/* Attacker Info */}
                <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="relative">
                        <img src={attacker.flag} className="w-12 h-7 object-cover rounded shadow-lg border border-white/10" alt="" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                    </div>
                    <div className="flex flex-col relative text-red-500">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{attacker.name}</span>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-black leading-none tracking-tighter drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">{wallPercentage}%</span>
                            <span className="text-[10px] font-bold uppercase pb-0.5 opacity-50">Control</span>
                        </div>
                    </div>
                </div>

                {/* Central Row Progress Bar */}
                <div className="score-row">
                    <div className="wall-container">
                        <div className="wall-fill" style={{ width: `${wallPercentage}%` }} />
                        <div className="wall-marker" />
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <span className="text-[8px] font-black text-red-500/60 uppercase tracking-widest">Offensive Front</span>
                        <span className="text-[8px] font-black text-blue-500/60 uppercase tracking-widest">Defensive Line</span>
                    </div>
                </div>

                {/* Defender Info */}
                <div className="flex items-center gap-4 min-w-[200px] justify-end text-right">
                    <div className="flex flex-col items-end relative text-blue-500">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{defender.name}</span>
                        <div className="flex items-end gap-2">
                            <span className="text-[10px] font-bold uppercase pb-0.5 opacity-50">Integrity</span>
                            <span className="text-3xl font-black leading-none tracking-tighter drop-shadow-[0_0_10px_rgba(37,99,235,0.4)]">{100 - wallPercentage}%</span>
                        </div>
                    </div>
                    <div className="relative">
                        <img src={defender.flag} className="w-12 h-7 object-cover rounded shadow-lg border border-white/10" alt="" />
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                    </div>
                </div>
            </div>

            {/* Central Arena Area */}
            <div className="animation-area">
                <div className="soldier-wrapper">
                    <motion.div
                        className="relative"
                        animate={isAttacking && userSide === 'attacker' ? { x: [0, 50, 25, 60, 0], scale: [1, 1.1, 1.05, 1.15, 1] } : {}}
                        transition={{ duration: 5, times: [0, 0.25, 0.5, 0.75, 1] }}
                    >
                        <img src="/icons/army.png" className="soldier" alt="" />
                        {isAttacking && userSide === 'attacker' && (
                            <div className="muzzle-flash animate-flash" style={{ opacity: 1 }} />
                        )}
                    </motion.div>
                </div>

                <div className="flex flex-col items-center opacity-30">
                    <Swords className="text-white/20 mb-2" size={32} />
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">{battle.region}</div>
                </div>

                <div className="soldier-wrapper">
                    <motion.div
                        className="relative"
                        style={{ transformOrigin: 'center' }}
                        animate={isAttacking && userSide === 'defender' ? { x: [0, -50, -25, -60, 0], scale: [1, 1.1, 1.05, 1.15, 1], scaleX: -1 } : { scaleX: -1 }}
                        transition={{ duration: 5, times: [0, 0.25, 0.5, 0.75, 1] }}
                    >
                        <img src="/icons/army.png" className="soldier" alt="" />
                        {isAttacking && userSide === 'defender' && (
                            <div className="muzzle-flash animate-flash" style={{ opacity: 1 }} />
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Bottom Stats & Deploy */}
            <div className="absolute bottom-0 inset-x-0 p-8 flex items-end justify-between pointer-events-none">
                <div className="stat-box attacker pointer-events-auto">
                    <div className="text-[8px] font-black text-red-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <TrendingUp size={10} /> Attacker Influence
                    </div>
                    <div className="text-3xl font-black text-white italic tracking-tighter">
                        {battle.attackerDamage?.toLocaleString() || 0}
                    </div>
                </div>

                <div className="mb-2 pointer-events-auto">
                    <Button
                        onClick={() => setIsDeployModalOpen(true)}
                        className="w-[320px] py-4 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 bg-[length:200%_auto] animate-gradient-shift text-xl font-black italic tracking-[0.3em] uppercase shadow-[0_10px_30px_rgba(220,38,38,0.5)] border border-red-400/30 rounded-xl hover:scale-105 active:scale-95 transition-all text-white"
                    >
                        Deploy
                    </Button>
                </div>

                <div className="stat-box defender text-right pointer-events-auto">
                    <div className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1 flex items-center gap-1 justify-end">
                        Defender Influence <Shield size={10} />
                    </div>
                    <div className="text-3xl font-black text-white italic tracking-tighter">
                        {battle.defenderDamage?.toLocaleString() || 0}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isDeployModalOpen && (
                    <DeployModal battleId={Number(battle.id)} onClose={() => setIsDeployModalOpen(false)} />
                )}
            </AnimatePresence>
        </div>
    );
}

function HeroCardV2({ side, hero, isOpen, toggleOpen, battleId, onClose }: {
    side: 'left' | 'right',
    hero: any,
    isOpen: boolean,
    toggleOpen: () => void,
    battleId: string,
    onClose: () => void
}) {
    return (
        <div className={`hero-card-v2 ${side} relative`}>
            {/* Blue Rank Badge */}
            <div className="rank-badge-blue">I</div>

            {/* Avatar Container */}
            <div className="hero-avatar-container flex items-center justify-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                {hero ? (
                    <TacticalAvatar
                        seed={hero.addr}
                        size={48}
                        showBackground={false}
                    />
                ) : (
                    <div className="w-full h-full bg-slate-900/40 flex items-center justify-center">
                        <Users size={20} className="text-white/10" />
                    </div>
                )}
            </div>

            {/* Green Username Ribbon */}
            <div className="rank-ribbon">
                {hero ? hero.addr.slice(0, 10) : 'NO HERO'}
            </div>

            {/* Damage Strip */}
            <div className="hero-damage-strip">
                {hero ? hero.influence.toLocaleString() : '0'}
            </div>

            {/* Expand Dropdown Trigger Button */}
            <div
                className="hero-expand-btn"
                onClick={toggleOpen}
            >
                <div className={`arrow ${isOpen ? 'rotate-180' : ''} transition-transform`} />
            </div>

            {/* Dropdown Rankings */}
            <AnimatePresence>
                {isOpen && (
                    <RankingsDropdown
                        side={side}
                        title={side === 'left' ? "Offensive Heroes" : "Defensive Heroes"}
                        battleId={battleId}
                        onClose={onClose}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function RankingsDropdown({ side, title, battleId, onClose }: { side: 'left' | 'right', title: string, battleId: string, onClose: () => void }) {
    const { roundHistory } = useGameStore();
    const history = roundHistory[battleId] || [];
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const rankings = history
        .map((h: any) => ({
            addr: side === 'left' ? h.attackerTopAddr : h.defenderTopAddr,
            influence: side === 'left' ? h.attackerTopInfluence : h.defenderTopInfluence,
        }))
        .filter((r: any) => r.addr && r.addr !== '0x0000000000000000000000000000000000000000000000000000000000000000')
        .sort((a: any, b: any) => b.influence - a.influence)
        .slice(0, 3);

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={`rankings-dropdown ${side}`}
            style={{
                top: '105%',
                left: side === 'left' ? '0' : 'auto',
                right: side === 'right' ? '0' : 'auto',
                width: '180px'
            }}
        >
            <div className="rankings-header flex items-center justify-between">
                <span>{title}</span>
                <Trophy size={10} className="text-yellow-500/50" />
            </div>

            <div className="flex flex-col">
                {rankings.map((r, i) => (
                    <div key={i} className="rank-item">
                        <div className="rank-avatar relative bg-slate-900 border border-slate-700 flex items-center justify-center">
                            <TacticalAvatar
                                seed={r.addr}
                                size={32}
                                showBackground={false}
                            />
                            <div className="rank-number">{i + 1}</div>
                        </div>
                        <div className="rank-info">
                            <span className="rank-name">{r.addr.slice(0, 10)}...</span>
                            <span className="rank-damage">+{r.influence.toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
