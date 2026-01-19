'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { Button } from '@/components/Button';
import { SocialFeed } from '@/components/game/SocialFeed';
import { NewspaperWidget } from '@/components/game/NewspaperWidget';
import { DailyTasksWidget } from '@/components/game/DailyTasksWidget';
import { InventoryWidget } from '@/components/game/InventoryWidget';
import { AdminToolkit } from '@/components/game/AdminToolkit';
import {
    Briefcase,
    Flame,
    TrendingUp,
    Sword,
    Shield,
    Clock,
    Trophy
} from 'lucide-react';
import { CountryId, COUNTRY_CONFIG } from '@/lib/types';
import {
    IDSCard,
    IDSLabel,
    IDSQuickLink,
    IDSMissionIcon
} from '@/components/ui/ids';

export default function DashboardPage() {
    const { user, login } = useGameStore();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (!user) {
            login('Haknsken', 'TR', '0xMockWalletAddress');
        }
    }, [user, login]);

    if (!isMounted || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen text-slate-400 font-mono text-sm">
                Initializing Command Center...
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Main 3-Column Layout */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left Sidebar - Profile & Inventory */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <ProfileCard />
                    <InventoryWidget />

                    <IDSCard noPadding className="overflow-hidden divide-y divide-slate-700/30">
                        <IDSQuickLink icon={<span>🏛️</span>} label="Politics Dashboard" href="/politics" hasArrow />
                        <IDSQuickLink icon={<span>🎯</span>} label="Training Grounds" href="/training" hasArrow />
                        <IDSQuickLink icon={<span>🛍️</span>} label="Marketplace" href="/market" hasArrow />
                        <IDSQuickLink icon={<span>🏗️</span>} label="Industrial Center" href="/industrial" hasArrow />
                        <IDSQuickLink icon={<Briefcase size={14} />} label="Companies" href="/companies" hasArrow />
                    </IDSCard>

                    <AdminToolkit />
                </div>

                {/* Center Column - Personal Progress & Economy */}
                <div className="col-span-12 lg:col-span-6 space-y-6">
                    {/* Mission Control / Daily Tasks */}
                    <DailyTasksWidget />

                    {/* Active Market Listings Preview */}
                    <NewspaperWidget />
                </div>

                {/* Right Column - Social & Community */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <SocialFeed />

                    <IDSCard>
                        <IDSLabel color="bright" size="sm" className="mb-4 flex items-center gap-2">
                            📊 Market Trends
                        </IDSLabel>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">Food Q1</span>
                                <span className="text-emerald-400 font-bold">▲ 0.45 CRED</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">Weapon Q1</span>
                                <span className="text-red-400 font-bold">▼ 1.20 CRED</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">Iron Ore</span>
                                <span className="text-emerald-400 font-bold">▲ 0.15 CRED</span>
                            </div>
                        </div>
                    </IDSCard>
                </div>

            </div>
        </div>
    );
}

function ProfileCard() {
    const { user, trainingInfo } = useGameStore();
    if (!user) return null;

    const energy = user.energy || 0;
    const maxEnergy = user.maxEnergy || 200;
    const energyPercent = maxEnergy > 0 ? (energy / maxEnergy) * 100 : 0;
    const countryConfig = COUNTRY_CONFIG[user.citizenship as CountryId];

    return (
        <IDSCard noPadding className="overflow-hidden shadow-2xl">
            {/* Header with Avatar */}
            <div className="relative bg-gradient-to-br from-slate-700 to-slate-900 p-4">
                <div className="flex items-center gap-4">
                    {/* Avatar with Country Badge */}
                    <div className="relative">
                        <div className="w-16 h-16 bg-slate-950 rounded-xl border-2 border-slate-700/50 overflow-hidden shadow-xl">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="Avatar" className="w-full h-full" />
                        </div>
                        {countryConfig && (
                            <img
                                src={countryConfig.flag}
                                className="absolute -bottom-1 -right-1 w-6 h-4 object-cover rounded shadow-lg border border-white/20"
                                alt=""
                            />
                        )}
                        <div className="absolute -top-1 -left-1 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg">
                            {user.level || 1}
                        </div>
                    </div>

                    {/* Quick Action Icons */}
                    <div className="flex gap-2">
                        <button className="w-9 h-9 bg-slate-800/80 hover:bg-slate-700/80 hover:text-white rounded-lg flex items-center justify-center text-slate-400 transition-all border border-slate-700/50 shadow-sm active:scale-90">
                            <span className="text-sm">🏠</span>
                        </button>
                        <button className="w-9 h-9 bg-slate-800/80 hover:bg-slate-700/80 hover:text-white rounded-lg flex items-center justify-center text-slate-400 transition-all border border-slate-700/50 shadow-sm active:scale-90">
                            <span className="text-sm">✉️</span>
                        </button>
                        <button className="w-9 h-9 bg-slate-800/80 hover:bg-slate-700/80 hover:text-white rounded-lg flex items-center justify-center text-slate-400 transition-all border border-slate-700/50 shadow-sm active:scale-90 relative">
                            <span className="text-sm">🔔</span>
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full text-[9px] text-white font-black flex items-center justify-center ring-2 ring-slate-800 shadow-lg">1</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Energy Section */}
            <div className="px-4 py-3 bg-slate-900/50 border-y border-slate-700/30">
                <div className="flex items-center gap-3">
                    <span className="text-amber-500">⚡</span>
                    <div className="flex-1 h-5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative shadow-inner">
                        <motion.div
                            className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${energyPercent}%` }}
                            transition={{ duration: 1 }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow-md tracking-widest font-mono">
                            {energy} / {maxEnergy}
                        </span>
                    </div>
                    <button className="w-6 h-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-black transition-all shadow-sm active:scale-90 border border-emerald-400/20">+</button>
                </div>
            </div>

            {/* Currencies */}
            <div className="px-4 py-3 space-y-2.5 bg-slate-900/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 text-sm border border-amber-500/20 shadow-inner">💰</span>
                        <span className="font-black text-white font-mono leading-none">{(user.walletBalance || 0).toFixed(2)}</span>
                    </div>
                    <IDSLabel color="dim" size="xs">SUPRA</IDSLabel>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 text-sm border border-emerald-500/20 shadow-inner">💵</span>
                        <span className="font-black text-white font-mono leading-none">{(user.credits || 0).toFixed(2)}</span>
                    </div>
                    <IDSLabel color="dim" size="xs">CRED</IDSLabel>
                </div>
            </div>

            {/* Daily Challenge Link */}
            <IDSQuickLink
                icon={<span>📋</span>}
                label="Daily Challenge"
                href="/training"
                hasArrow
                className="bg-slate-950/30 border-t border-slate-700/30"
            />

            {/* Missions Grid */}
            <div className="p-4 bg-slate-950/20">
                <IDSLabel color="dim" size="xs" className="mb-3">Missions Status</IDSLabel>
                <div className="grid grid-cols-4 gap-2.5">
                    <IDSMissionIcon icon="🏋️" progress={(trainingInfo?.qualities?.[0]) || 1} max={5} href="/training" />
                    <IDSMissionIcon icon="💼" done={!!user.employerId} href="/companies" />
                    <IDSMissionIcon icon="⚔️" href="/battles" />
                    <IDSMissionIcon icon="🎖️" href="/profile" />
                </div>
            </div>
        </IDSCard>
    );
}
