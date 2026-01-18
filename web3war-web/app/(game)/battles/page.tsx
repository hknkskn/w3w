'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Swords, Clock, Zap, Shield, Target, Users, Trophy,
    Flame, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/Button';

import MilitaryUnitManager from "@/components/game/MilitaryUnitManager";
import { useGameStore } from "@/lib/store";
import { Battle, Citizen, CountryId, COUNTRY_CONFIG } from "@/lib/types";
import { useParticles } from "@/lib/hooks/useParticles";

export default function BattlesPage() {
    const {
        user,
        activeBattles,
        roundHistory,
        fetchBattles,
        fetchRoundHistory,
        fight,
        declareWar,
        fetchDashboardData
    } = useGameStore();

    const [selectedBattleId, setSelectedBattleId] = useState<string | null>(null);
    const [isFighting, setIsFighting] = useState(false);
    const [activeTab, setActiveTab] = useState<'battle' | 'history'>('battle');
    const [lastHit, setLastHit] = useState<{ damage: number, side: string } | null>(null);
    const [attackType, setAttackType] = useState<'BARE' | 'WEAPON' | 'MISSILE'>('BARE');
    const [screenShake, setScreenShake] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [combatLog, setCombatLog] = useState<{ id: string, text: string, type: 'hit' | 'info' | 'critical' }[]>([]);
    const [warRegionId, setWarRegionId] = useState("");
    const [isTrainingWar, setIsTrainingWar] = useState(true);
    const { particles, spawnParticles } = useParticles();
    const { inventory } = useGameStore();

    const addLog = (text: string, type: 'hit' | 'info' | 'critical' = 'info') => {
        setCombatLog(prev => [{ id: Math.random().toString(), text, type }, ...prev].slice(0, 5));
    };

    useEffect(() => {
        fetchBattles();
        const interval = setInterval(fetchBattles, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (selectedBattleId) {
            fetchRoundHistory(selectedBattleId);
        }
    }, [selectedBattleId]);

    const activeUser = (user || (isDemoMode ? {
        id: 'demo-u1',
        username: 'ProPlayer_99',
        strength: 1500,
        rankPoints: 50000,
        energy: 100,
        maxEnergy: 200,
        level: 4,
        xp: 1200,
        nextLevelXp: 5000,
        credits: 1000,
        walletAddress: '0xdemo_123456789'
    } : null)) as Citizen;

    const activeBattle = (isDemoMode ? {
        id: 'demo-1',
        region: 'Testing Grounds',
        regionId: 999,
        attacker: 'Alliance',
        defender: 'Empire',
        startTime: Date.now(),
        endTime: Date.now() + 7200000,
        attackerDamage: 150000,
        defenderDamage: 120000,
        wallPercentage: 55,
        currentRound: 3,
        attackerPoints: 1,
        defenderPoints: 1,
        roundEndTime: Date.now() + 3600000
    } : activeBattles.find((b: Battle) => b.id === selectedBattleId) || activeBattles[0]);

    if (!activeUser || !activeBattle) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-800/50 rounded-xl border border-slate-700">
                <Swords className="w-12 h-12 text-slate-500 mb-4 animate-pulse" />
                <p className="text-slate-400 font-medium mb-6">No active battles found. Check World Map.</p>
                <Button onClick={() => setIsDemoMode(true)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold">
                    PREVIEW NEW VFX (DEMO MODE)
                </Button>
            </div>
        );
    }

    // Logic to pick best item from inventory
    const weapons = inventory.filter(i => i.id === '202' && i.quantity > 0).sort((a, b) => b.quality - a.quality);
    const missiles = inventory.filter(i => i.id === '204' && i.quantity > 0).sort((a, b) => b.quality - a.quality);

    const bestWeapon = weapons[0];
    const bestMissile = missiles[0];

    const weaponStock = weapons.reduce((acc, curr) => acc + curr.quantity, 0);
    const missileStock = missiles.reduce((acc, curr) => acc + curr.quantity, 0);

    const getDamageMultiplier = () => {
        if (attackType === 'WEAPON' && bestWeapon) return 1 + bestWeapon.quality * 0.2;
        if (attackType === 'MISSILE' && bestMissile) return 1 + bestMissile.quality * 2.0;
        return 1.0;
    };

    const previewDamage = Math.floor((activeUser.strength / 10 + activeUser.rankPoints / 500 + 10) * getDamageMultiplier() * 10);

    const handleFight = async () => {
        if (activeUser.energy < 10 && !isDemoMode) return;

        let itemId = 0;
        let quality = 0;

        if (attackType === 'WEAPON') {
            if (!bestWeapon && !isDemoMode) { addLog("NO_WEAPONS_AVAILABLE", "info"); return; }
            itemId = 202;
            quality = bestWeapon?.quality || 1;
        } else if (attackType === 'MISSILE') {
            if (!bestMissile && !isDemoMode) { addLog("NO_MISSILES_AVAILABLE", "info"); return; }
            itemId = 204;
            quality = bestMissile?.quality || 1;
        }

        setIsFighting(true);
        setScreenShake(true);
        setTimeout(() => setScreenShake(false), 300);

        try {
            spawnParticles(500, 100, attackType === 'MISSILE' ? '#06b6d4' : attackType === 'WEAPON' ? '#ef4444' : '#94a3b8');

            if (!isDemoMode) {
                await fight(activeBattle.id, itemId, quality);
                fetchDashboardData();
            } else {
                await new Promise(r => setTimeout(r, 800));
            }

            setLastHit({ damage: previewDamage, side: 'attacker' });
            addLog(`STRIKE_CONFIRMED: ${previewDamage.toLocaleString()} damage delivered`, attackType === 'MISSILE' ? 'critical' : 'hit');
            setTimeout(() => setLastHit(null), 1500);
        } catch (e) {
            console.error(e);
        } finally {
            setIsFighting(false);
        }
    };

    const getUnitVisual = (level: number) => {
        if (level === 1) return { image: '/image/units/unit_lvl1.png', name: 'Infantry' };
        if (level === 2) return { image: '/image/units/unit_lvl2.png', name: 'Armored APC' };
        if (level === 3) return { icon: '🚜', name: 'Light Tank' };
        return { icon: '🛩️', name: 'Fighter Jet' };
    };

    const formatTime = (secondsLeft: number) => {
        const totalSeconds = Math.max(0, Math.floor((secondsLeft - Date.now()) / 1000));
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
            {/* HUD Header */}
            <div className="flex items-center justify-between px-6 py-2 border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-500/70">Terminal Active</span>
                    </div>
                    <div className="h-4 w-px bg-slate-800" />
                    <div className="flex items-center gap-3 text-cyan-400">
                        <Target size={14} />
                        <span className="text-xs font-bold text-slate-300 uppercase">SEC_ZONE: {activeBattle.region}</span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="bg-slate-900/50 px-4 py-1 rounded border border-cyan-500/10 flex items-center gap-3">
                        <Clock size={14} className="text-cyan-400" />
                        <span className="text-sm font-mono font-bold text-cyan-100">{formatTime(activeBattle.roundEndTime || activeBattle.endTime)}</span>
                    </div>
                    <Button onClick={() => setIsDemoMode(!isDemoMode)} variant="outline" size="sm" className="h-7 text-[10px] border-cyan-500/30 text-cyan-400 uppercase">
                        {isDemoMode ? "Exit Sim" : "Boot Sim"}
                    </Button>
                </div>
            </div>

            <main className="p-4 max-w-7xl mx-auto space-y-4">
                <div className="grid grid-cols-12 gap-4">
                    {/* Log Panel */}
                    <div className="col-span-3 flex flex-col gap-4">
                        <div className="h-[400px] bg-slate-950/40 backdrop-blur-md border border-cyan-500/10 rounded-xl p-4 flex flex-col shadow-2xl relative overflow-hidden">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/50 mb-4 flex items-center gap-2">
                                <TrendingUp size={12} /> Strike_Feed
                            </h3>
                            <div className="flex-1 space-y-3 overflow-y-auto font-mono text-[10px] scrollbar-hide">
                                <AnimatePresence mode="popLayout">
                                    {combatLog.map((log) => (
                                        <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={`border-l-2 pl-3 py-1 ${log.type === 'critical' ? 'border-cyan-400 text-cyan-300' : log.type === 'hit' ? 'border-red-500 text-red-100' : 'border-slate-800 text-slate-500'}`}>
                                            {log.text}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {combatLog.length === 0 && <div className="text-slate-700 animate-pulse">Waiting for engagement...</div>}
                            </div>
                        </div>

                        <div className="bg-slate-900/60 backdrop-blur-md border border-cyan-500/20 rounded-xl p-4 shadow-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-black text-cyan-400 overflow-hidden relative group/flag">
                                    {COUNTRY_CONFIG[activeUser.citizenship] ? (
                                        <img src={COUNTRY_CONFIG[activeUser.citizenship].flag} className="w-full h-full object-cover transition-transform group-hover/flag:scale-125" alt={activeUser.citizenship} />
                                    ) : (
                                        "OP"
                                    )}
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase flex items-center gap-2">
                                        {activeUser.username}
                                        {COUNTRY_CONFIG[activeUser.citizenship] && <span className="text-[8px] text-cyan-500/60">({COUNTRY_CONFIG[activeUser.citizenship].name})</span>}
                                    </div>
                                    <div className="text-[9px] text-cyan-500/60 font-mono">Lvl_{activeUser.level} Operative</div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <StatusItem label="Strength" value={activeUser.strength.toLocaleString()} color="cyan" />
                                <StatusItem label="Rank Exp" value={activeUser.rankPoints.toLocaleString()} color="amber" />
                                <StatusItem label="Strike DMG" value={previewDamage.toLocaleString()} color="cyan" />
                            </div>
                        </div>
                    </div>

                    {/* Battle Arena */}
                    <div className="col-span-6 flex flex-col gap-4">
                        <motion.div className="h-[400px] bg-slate-950 rounded-2xl border-2 border-cyan-500/10 relative overflow-hidden shadow-2xl" animate={screenShake ? { x: [-2, 2, -2, 2, 0] } : {}}>
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950 z-10" />
                            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#0ea5e9_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e9_1px,transparent_1px)] bg-[size:32px_32px]" />

                            <motion.div className="absolute inset-0 bg-cyan-500/10 h-1 w-full z-10" animate={{ top: ['0%', '100%'] }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} />

                            <div className="absolute top-6 w-full flex justify-center z-20">
                                <div className="px-10 py-1 bg-black/80 border-x-2 border-cyan-500 skew-x-[-20deg] shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                                    <span className="block skew-x-[20deg] text-2xl font-black italic tracking-[0.4em]">VERSUS</span>
                                </div>
                            </div>

                            <div className="absolute inset-x-0 bottom-0 top-12 flex items-center justify-around z-20 px-10">
                                <motion.div className="flex flex-col items-center" animate={isFighting ? { x: [0, 80, 0], scale: [1, 1.1, 1] } : {}}>
                                    <div className="relative w-44 h-44 flex items-center justify-center rounded-full bg-cyan-500/5 border border-cyan-500/20 shadow-2xl">
                                        <div className="absolute inset-0 rounded-full animate-ping bg-cyan-500/5" />
                                        {getUnitVisual(activeUser.level).image ? (
                                            <img src={getUnitVisual(activeUser.level).image} className="w-36 h-36 object-contain" />
                                        ) : (
                                            <span className="text-8xl">{getUnitVisual(activeUser.level).icon}</span>
                                        )}
                                        <div className="absolute -bottom-2 px-4 py-0.5 bg-cyan-600 rounded-full text-[9px] font-black tracking-widest uppercase">Lvl_{activeUser.level}</div>
                                    </div>
                                    <div className="mt-4 text-xs font-black tracking-[0.2em]">{activeUser.username}</div>
                                </motion.div>

                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <AnimatePresence>
                                        {lastHit && (
                                            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 2.5, opacity: 1 }} exit={{ scale: 4, opacity: 0 }} className="z-50 text-center">
                                                {attackType === 'MISSILE' ? <Swords className="w-24 h-24 text-cyan-400 mx-auto animate-bounce" /> : <Flame className="w-20 h-20 text-orange-500 mx-auto" />}
                                                <div className={`text-6xl font-black ${attackType === 'MISSILE' ? 'text-cyan-400' : 'text-orange-400'} drop-shadow-[0_0_15px_rgba(6,182,212,1)]`}>+{lastHit.damage.toLocaleString()}</div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {particles.map(p => (
                                        <div key={p.id} className="absolute rounded-full" style={{ left: `calc(50% + ${p.x - 500}px)`, top: `calc(50% + ${p.y - 100}px)`, width: p.size, height: p.size, backgroundColor: p.color, boxShadow: `0 0 10px ${p.color}` }} />
                                    ))}
                                    {/* Enemy / Defender */}
                                    <motion.div className="flex flex-col items-center group/enemy transition-all duration-700" animate={isFighting ? { x: [0, 20, 0] } : {}}>
                                        <div className="relative w-44 h-44 flex items-center justify-center rounded-full bg-red-500/5 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)] group-hover/enemy:border-red-500/40 transition-colors overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-red-950/20 to-transparent" />
                                            {COUNTRY_CONFIG[activeBattle.defender as CountryId] ? (
                                                <div className="flex flex-col items-center">
                                                    <img src={COUNTRY_CONFIG[activeBattle.defender as CountryId].flag} className="w-40 h-24 object-cover rounded-lg shadow-2xl transition-transform group-hover/enemy:scale-110" />
                                                    <div className="mt-2 text-[10px] font-black tracking-widest text-red-500 uppercase">{COUNTRY_CONFIG[activeBattle.defender as CountryId].name}</div>
                                                </div>
                                            ) : (
                                                <span className="text-8xl">🚜</span>
                                            )}
                                            <div className="absolute -bottom-2 px-4 py-0.5 bg-red-600 rounded-full text-[9px] font-black tracking-widest text-white uppercase shadow-lg">Defender</div>
                                        </div>
                                        <div className="mt-4 text-xs font-black tracking-[0.2em] text-slate-400">{activeBattle.defender}</div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Optimized Controls (Command Center) */}
                        <div className="bg-slate-900/40 rounded-3xl p-6 border border-cyan-500/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-md relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
                            <div className="relative z-10 grid grid-cols-12 gap-6 items-center">
                                <div className="col-span-3 space-y-4">
                                    <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black text-cyan-500/50 uppercase tracking-widest">Power_Core</span>
                                            <Zap size={14} className="text-yellow-400" />
                                        </div>
                                        <div className="flex items-end gap-2 mb-1">
                                            <span className="text-3xl font-black font-mono leading-none">{activeUser.energy}</span>
                                            <span className="text-xs font-bold text-slate-500 pb-0.5">/ {activeUser.maxEnergy}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                                                animate={{ width: `${(activeUser.energy / activeUser.maxEnergy) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="col-span-6 flex flex-col gap-4">
                                    <div className="flex justify-center gap-2 p-1 bg-black/60 rounded-2xl border border-white/10">
                                        <AttackTypeButton
                                            type="BARE"
                                            label="Hands"
                                            icon="🤜"
                                            stock={Infinity}
                                            bonus="1.0x"
                                            selected={attackType === 'BARE'}
                                            onClick={() => setAttackType('BARE')}
                                        />
                                        <AttackTypeButton
                                            type="WEAPON"
                                            label="Weapon"
                                            icon="⚔️"
                                            stock={weaponStock}
                                            bonus={bestWeapon ? `Q${bestWeapon.quality}` : 'N/A'}
                                            selected={attackType === 'WEAPON'}
                                            onClick={() => setAttackType('WEAPON')}
                                        />
                                        <AttackTypeButton
                                            type="MISSILE"
                                            label="Missile"
                                            icon="🚀"
                                            stock={missileStock}
                                            bonus={bestMissile ? `Q${bestMissile.quality}` : 'N/A'}
                                            selected={attackType === 'MISSILE'}
                                            onClick={() => setAttackType('MISSILE')}
                                        />
                                    </div>
                                    <motion.button
                                        onClick={handleFight}
                                        disabled={activeUser.energy < 10 || isFighting || (attackType === 'WEAPON' && weaponStock === 0 && !isDemoMode) || (attackType === 'MISSILE' && missileStock === 0 && !isDemoMode)}
                                        whileHover={!isFighting ? { scale: 1.02, y: -2 } : {}}
                                        whileTap={{ scale: 0.98 }}
                                        className={`group/btn relative h-16 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 ${activeUser.energy >= 10 && !isFighting ? 'bg-gradient-to-r from-red-600 via-red-500 to-red-600 shadow-[0_10px_30px_rgba(220,38,38,0.4)]' : 'bg-slate-800 text-slate-500 grayscale opacity-40 cursor-not-allowed'}`}
                                    >
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                                        <div className="relative flex items-center gap-4">
                                            {isFighting ? (
                                                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span className="text-xl font-black tracking-[0.2em] uppercase italic">Deploying...</span></>
                                            ) : (
                                                <><Swords className="w-6 h-6 animate-pulse" /><span className="text-2xl font-black tracking-[0.3em] uppercase italic">ENGAGE</span></>
                                            )}
                                        </div>
                                    </motion.button>
                                </div>
                                <div className="col-span-3 space-y-4">
                                    <div className="bg-black/40 p-3 rounded-2xl border border-white/5 text-center">
                                        <div className="text-[10px] font-black text-cyan-500/50 uppercase tracking-widest mb-1">Impact_Forecast</div>
                                        <div className="text-2xl font-black text-cyan-400 font-mono">+{previewDamage.toLocaleString()}</div>
                                        <div className="text-[9px] font-bold text-slate-600 uppercase mt-1">Estimated Influence</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="col-span-3 flex flex-col gap-4">
                        <div className="flex-1 bg-slate-950/40 backdrop-blur-md border border-cyan-500/10 rounded-xl p-4 overflow-hidden flex flex-col shadow-2xl">
                            <div className="flex items-center gap-2 mb-6">
                                <button onClick={() => setActiveTab('battle')} className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-all ${activeTab === 'battle' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Live_Feed</button>
                                <button onClick={() => setActiveTab('history')} className={`text-[10px] font-black uppercase tracking-[0.2em] pb-1 border-b-2 transition-all ${activeTab === 'history' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}>Archive</button>
                            </div>

                            {activeTab === 'battle' ? (
                                <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
                                    <div className="p-3 bg-white/5 rounded border border-white/5">
                                        <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase mb-2">
                                            <span>Round_{activeBattle.currentRound}</span>
                                            <span>Conflict_Status</span>
                                        </div>
                                        <div className="h-2 bg-slate-900 rounded-full overflow-hidden flex border border-white/5">
                                            <div className="h-full bg-red-600" style={{ width: `${activeBattle.wallPercentage}%` }} />
                                            <div className="h-full bg-blue-600" style={{ width: `${100 - activeBattle.wallPercentage}%` }} />
                                        </div>
                                        <div className="flex justify-between mt-2 text-[9px] font-black">
                                            <span className="text-red-500">{activeBattle.attackerPoints} PTS</span>
                                            <span className="text-blue-500">{activeBattle.defenderPoints} PTS</span>
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                                        {activeBattles.map(b => (
                                            <div key={b.id} onClick={() => setSelectedBattleId(b.id)} className={`p-3 rounded border border-white/5 transition-all cursor-pointer ${selectedBattleId === b.id ? 'bg-cyan-500/10 border-cyan-500' : 'bg-black/20 hover:border-white/20'}`}>
                                                <div className="flex justify-between text-[10px] font-black uppercase mb-2">
                                                    <span className="truncate w-24 text-cyan-400">{b.region}</span>
                                                    <span className="text-slate-500 font-mono italic">{formatTime(b.endTime)}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 uppercase">
                                                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                        {COUNTRY_CONFIG[b.attacker as CountryId] && (
                                                            <img src={COUNTRY_CONFIG[b.attacker as CountryId].flag} className="w-4 h-2.5 object-cover rounded-[1px]" alt="" />
                                                        )}
                                                        <span className="truncate text-red-500">{b.attacker}</span>
                                                    </div>
                                                    <span className="text-slate-700 font-black">vs</span>
                                                    <div className="flex items-center justify-end gap-1.5 flex-1 min-w-0">
                                                        <span className="truncate text-blue-500">{b.defender}</span>
                                                        {COUNTRY_CONFIG[b.defender as CountryId] && (
                                                            <img src={COUNTRY_CONFIG[b.defender as CountryId].flag} className="w-4 h-2.5 object-cover rounded-[1px]" alt="" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
                                    {(roundHistory[activeBattle.id] || []).length === 0 ? (
                                        <div className="text-center py-20 opacity-20"><Clock className="mx-auto mb-2" size={32} /><div className="text-[10px] font-black uppercase">No Archived Data</div></div>
                                    ) : (
                                        (roundHistory[activeBattle.id] || []).map((round: any, i: number) => (
                                            <div key={i} className="p-3 bg-white/5 rounded border border-white/5 hover:border-cyan-500/30 transition-all">
                                                <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                                                    <span>Round {round.roundNumber}</span>
                                                    <span className={round.winnerSide === 1 ? 'text-red-500' : 'text-blue-500'}>{round.winnerSide === 1 ? 'ATTACKER' : 'DEFENDER'} WON</span>
                                                </div>
                                                <div className="text-[8px] font-mono text-slate-400 uppercase mt-1">
                                                    Hero: {round.attackerTopAddr.substring(0, 10)}...
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* War Council (President Only - Simulation for now) */}
                <div className="bg-slate-900/40 rounded-xl border border-red-500/20 p-6 shadow-2xl backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-6">
                        <Swords className="text-red-500" />
                        <h2 className="text-xl font-bold uppercase tracking-widest text-red-100">War Council</h2>
                        <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-black border border-red-500/20 uppercase">
                            Presidential Authorization Required
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                As a leader, you have the authority to initiate military operations. Training wars help operatives gain XP without territorial loss, while real wars can expand your country's borders.
                            </p>
                            <div className="flex flex-col gap-4 max-w-sm">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Region ID</label>
                                    <input
                                        type="number"
                                        value={warRegionId}
                                        onChange={(e) => setWarRegionId(e.target.value)}
                                        placeholder="Enter Region ID (e.g. 1-100)"
                                        className="w-full bg-black/40 border border-slate-800 rounded-lg px-4 py-3 text-sm focus:border-red-500/50 transition-colors"
                                    />
                                </div>
                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            checked={isTrainingWar}
                                            onChange={() => setIsTrainingWar(true)}
                                            className="w-4 h-4 accent-red-500"
                                        />
                                        <span className={`text-xs font-bold uppercase tracking-wider ${isTrainingWar ? 'text-red-400' : 'text-slate-500 group-hover:text-slate-300'}`}>Training Grounds</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            checked={!isTrainingWar}
                                            onChange={() => setIsTrainingWar(false)}
                                            className="w-4 h-4 accent-red-500"
                                        />
                                        <span className={`text-xs font-bold uppercase tracking-wider ${!isTrainingWar ? 'text-red-400' : 'text-slate-500 group-hover:text-slate-300'}`}>Real Warfare</span>
                                    </label>
                                </div>
                                <Button
                                    onClick={() => {
                                        if (!warRegionId) { alert("Please enter a Region ID"); return; }
                                        declareWar(Number(warRegionId), isTrainingWar);
                                    }}
                                    className="h-12 bg-red-600 hover:bg-red-500 text-white font-black italic tracking-widest uppercase shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                                >
                                    AUTHORIZE OPERATION
                                </Button>
                            </div>
                        </div>

                        <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-3">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Council Log</h4>
                            <div className="space-y-2 font-mono text-[9px]">
                                <div className="text-slate-600">[SYSLOG]: Awaiting presidential directive...</div>
                                <div className="text-slate-600">[SYSLOG]: All systems standing by.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-950/40 backdrop-blur-md p-4 rounded-xl border border-cyan-500/20 shadow-2xl">
                    <MilitaryUnitManager />
                </div>
            </main>
        </div>
    );
}

function StatusItem({ label, value, color }: { label: string, value: string, color: 'cyan' | 'amber' }) {
    return (
        <div className="flex items-center justify-between py-1 border-b border-white/5">
            <span className={`text-[8px] font-black uppercase tracking-widest ${color === 'cyan' ? 'text-cyan-500' : 'text-amber-500'}`}>{label}</span>
            <span className="text-xs font-mono font-black text-white">{value}</span>
        </div>
    );
}

function AttackTypeButton({ type, label, icon, stock, bonus, selected, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-28 h-20 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${selected ? 'bg-cyan-600/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-slate-900/50 border-slate-800 text-slate-500 hover:bg-slate-800'}`}
        >
            <span className="text-2xl">{icon}</span>
            <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
            <div className="flex flex-col items-center">
                <span className={`text-[8px] font-bold ${stock === 0 ? 'text-red-500' : 'text-slate-400'}`}>Stock: {stock === Infinity ? '∞' : stock}</span>
                <span className="text-[8px] font-black text-cyan-500">{bonus}</span>
            </div>
        </button>
    );
}
