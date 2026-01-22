'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import {
    Trophy,
    Coins,
    Timer,
    ChevronRight,
    Shield,
    Medal,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    CheckCircle2,
    Calendar,
    ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function formatTimeRemaining(ms: number) {
    if (ms <= 0) return 'Expired';
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} days left`;
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (hours > 0) return `${hours} hours left`;
    return 'Less than an hour left';
}

export function ClaimCenter() {
    const {
        pendingWarRewards,
        pendingHeroRewards,
        gameTreasuryBalance,
        fetchPendingRewards,
        claimWarReward,
        claimHeroReward,
        user
    } = useGameStore();

    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            await fetchPendingRewards();
            setLoading(false);
        };
        load();
        const interval = setInterval(fetchPendingRewards, 30000);
        return () => clearInterval(interval);
    }, [fetchPendingRewards]);

    const handleClaimWar = async (battleId: string) => {
        setClaimingId(`war_${battleId}`);
        await claimWarReward(Number(battleId));
        setClaimingId(null);
    };

    const handleClaimHero = async (battleId: string, round: number) => {
        setClaimingId(`hero_${battleId}_${round}`);
        await claimHeroReward(Number(battleId), round);
        setClaimingId(null);
    };

    if (loading && pendingWarRewards.length === 0 && pendingHeroRewards.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Medal className="w-12 h-12 text-slate-700 animate-pulse" />
                <p className="text-slate-400 font-medium">Fetching your rewards...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Game Treasury</p>
                            <h3 className="text-2xl font-black text-white mt-1">{(gameTreasuryBalance / 100).toLocaleString()} CRED</h3>
                        </div>
                        <div className="p-3 bg-cyan-500/10 rounded-xl">
                            <Coins className="w-6 h-6 text-cyan-500" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500">
                        <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                        <span>Available for rewards and development</span>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Pending Rewards</p>
                            <h3 className="text-2xl font-black text-white mt-1">
                                {pendingHeroRewards.length} Items
                            </h3>
                        </div>
                        <div className="p-3 bg-amber-500/10 rounded-xl">
                            <Trophy className="w-6 h-6 text-amber-500" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500">
                        <Timer className="w-3 h-3 text-amber-500" />
                        <span>30-day claim window after battle ends</span>
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700/50">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">National Spoils</p>
                            <h3 className="text-2xl font-black text-white mt-1">
                                {pendingWarRewards.length} Collections
                            </h3>
                        </div>
                        <div className="p-3 bg-indigo-500/10 rounded-xl">
                            <Shield className="w-6 h-6 text-indigo-500" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-500">
                        <Medal className="w-3 h-3 text-indigo-500" />
                        <span>Authorized citizens can claim for treasury</span>
                    </div>
                </Card>
            </div>

            {/* Main Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Hero Rewards Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <Medal className="w-5 h-5 text-amber-500" />
                        <h2 className="text-lg font-black text-white uppercase italic">Hero Service Rewards</h2>
                    </div>

                    {pendingHeroRewards.length === 0 ? (
                        <div className="p-12 text-center bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                            <Medal className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">No hero rewards pending. Join active battles!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingHeroRewards.map((reward) => (
                                <RewardItem
                                    key={`hero_${reward.battle_id}_${reward.round}`}
                                    type="hero"
                                    data={reward}
                                    onClaim={() => handleClaimHero(reward.battle_id, reward.round)}
                                    isClaiming={claimingId === `hero_${reward.battle_id}_${reward.round}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Country Rewards Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 px-2">
                        <Shield className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-lg font-black text-white uppercase italic">National War Spoils</h2>
                    </div>

                    {pendingWarRewards.length === 0 ? (
                        <div className="p-12 text-center bg-slate-900/30 rounded-2xl border border-dashed border-slate-800">
                            <Shield className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">No national spoils currently available for collection.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {pendingWarRewards.map((reward) => (
                                <RewardItem
                                    key={`war_${reward.battle_id}`}
                                    type="war"
                                    data={reward}
                                    onClaim={() => handleClaimWar(reward.battle_id)}
                                    isClaiming={claimingId === `war_${reward.battle_id}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Help / Info Footer */}
            <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800 flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-slate-500 shrink-0 mt-1" />
                <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-400">Important Collection Rules</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                        Rewards must be claimed within 30 days of battle completion. Unclaimed rewards will be returned to the Game Treasury.
                        Hero rewards are sent directly to your character's wallet. National spoils are sent to your national treasury for public projects and defense.
                    </p>
                </div>
            </div>
        </div>
    );
}

function RewardItem({ type, data, onClaim, isClaiming }: {
    type: 'hero' | 'war',
    data: any,
    onClaim: () => void,
    isClaiming: boolean
}) {
    const expiresAt = (Number(data.created_at) + (30 * 24 * 60 * 60)) * 1000;
    const isExpired = Date.now() > expiresAt;
    const timeRemaining = formatTimeRemaining(expiresAt - Date.now());

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`group relative overflow-hidden bg-slate-800/40 hover:bg-slate-800/60 rounded-xl border ${isExpired ? 'border-red-900/30 grayscale' : 'border-slate-700/50'} transition-all duration-300`}
        >
            <div className="p-4 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${type === 'hero' ? 'bg-amber-500/10' : 'bg-indigo-500/10'}`}>
                        {type === 'hero' ? (
                            <Trophy className="w-6 h-6 text-amber-500" />
                        ) : (
                            <Shield className="w-6 h-6 text-indigo-500" />
                        )}
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-white uppercase italic">
                                {type === 'hero' ? `Battle #${data.battle_id} Round ${data.round}` : `Battle #${data.battle_id} Spoils`}
                            </h4>
                            {isExpired && (
                                <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 text-[8px] font-bold rounded border border-red-500/20 uppercase tracking-tighter">
                                    Expired
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                <Coins className="w-3 h-3" />
                                <span className="font-bold text-slate-300">{(Number(data.amount) / 100).toLocaleString()} CRED</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                <Calendar className="w-3 h-3" />
                                <span>Expires {timeRemaining}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={onClaim}
                    disabled={isClaiming || isExpired}
                    className={`min-w-[100px] h-9 text-[10px] font-black uppercase tracking-widest ${type === 'hero'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                        : 'bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700'
                        }`}
                >
                    {isClaiming ? 'Claiming...' : (isExpired ? 'Lost' : 'Claim Now')}
                </Button>
            </div>

            {/* Progress/Expiration Bar */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-slate-700 w-full opacity-30" />
            <motion.div
                className={`absolute bottom-0 left-0 h-0.5 ${type === 'hero' ? 'bg-amber-500' : 'bg-indigo-500'}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 60, repeat: Infinity }}
            />
        </motion.div>
    );
}
