'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGameStore } from '@/lib/store';
import { Button } from '@/components/Button';
import { SocialFeed } from '@/components/game/SocialFeed';
import { NewspaperWidget } from '@/components/game/NewspaperWidget';
import { DailyTasksWidget } from '@/components/game/DailyTasksWidget';
import { InventoryWidget } from '@/components/game/InventoryWidget';
import {
    MapPin, Calendar, Swords, Mail, Trophy,
    Shield, Zap, TrendingUp, Award, Heart, Coins, Star,
    Briefcase, Flag, User, Crown, Plane
} from 'lucide-react';
import { CountryId, COUNTRY_CONFIG } from '@/lib/types';

export default function DashboardPage() {
    const { user, login, activeBattles, trainingInfo, train } = useGameStore();
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
                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border-2 border-slate-700/50 overflow-hidden shadow-lg divide-y divide-slate-700/30">
                        <QuickLink icon={<span>🏛️</span>} label="Politics Dashboard" href="/politics" />
                        <QuickLink icon={<span>🎯</span>} label="Training Grounds" href="/training" />
                        <QuickLink icon={<span>🛍️</span>} label="Marketplace" href="/market" />
                        <QuickLink icon={<span>🏗️</span>} label="Industrial Center" href="/industrial" />
                        <QuickLink icon={<Briefcase size={14} />} label="Companies" href="/companies" />
                    </div>
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

                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border-2 border-slate-700/50 p-4 shadow-lg">
                        <h3 className="text-sm font-black text-white uppercase mb-3 flex items-center gap-2">
                            <span className="text-xl">📊</span> Market Trends
                        </h3>
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
                    </div>
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
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border-2 border-slate-700/50 overflow-hidden shadow-lg">
            {/* Header with Avatar */}
            <div className="relative bg-gradient-to-r from-slate-700 to-slate-800 p-3">
                <div className="flex items-center gap-3">
                    {/* Avatar with Country Badge */}
                    <div className="relative">
                        <div className="w-14 h-14 bg-slate-900 rounded-lg border-2 border-slate-600 overflow-hidden shadow-lg">
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="Avatar" className="w-full h-full" />
                        </div>
                        {countryConfig && (
                            <img
                                src={countryConfig.flag}
                                className="absolute -bottom-1 -right-1 w-5 h-4 object-cover rounded shadow-lg border border-white/20"
                                alt=""
                            />
                        )}
                        <div className="absolute -top-1 -left-1 bg-cyan-500 text-white text-[9px] font-black px-1 rounded shadow">
                            {user.level || 1}
                        </div>
                    </div>

                    {/* Quick Icons */}
                    <div className="flex gap-1.5">
                        <button className="w-8 h-8 bg-slate-700/80 hover:bg-slate-600 rounded-lg flex items-center justify-center text-slate-300 transition-colors border border-slate-600/50">
                            <span className="text-sm">🏠</span>
                        </button>
                        <button className="w-8 h-8 bg-slate-700/80 hover:bg-slate-600 rounded-lg flex items-center justify-center text-slate-300 transition-colors border border-slate-600/50">
                            <span className="text-sm">✉️</span>
                        </button>
                        <button className="w-8 h-8 bg-slate-700/80 hover:bg-slate-600 rounded-lg flex items-center justify-center text-slate-300 transition-colors border border-slate-600/50 relative">
                            <span className="text-sm">🔔</span>
                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-white font-bold flex items-center justify-center">1</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Energy Bar */}
            <div className="px-3 py-2 bg-slate-900/50">
                <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-sm">⚡</span>
                    <div className="flex-1 h-5 bg-slate-700 rounded-full overflow-hidden border border-slate-600/50 relative">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-yellow-400 rounded-full transition-all duration-300"
                            style={{ width: `${energyPercent}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow-md">
                            {energy} / {maxEnergy}
                        </span>
                    </div>
                    <button className="w-5 h-5 bg-green-500 hover:bg-green-400 rounded text-white text-xs font-bold transition-colors">+</button>
                </div>
            </div>

            {/* Currencies */}
            <div className="px-3 py-2 space-y-1.5 border-b border-slate-700/50">
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-yellow-500">💰</span>
                    <span className="font-bold text-white">{(user.walletBalance || 0).toFixed(2)}</span>
                    <span className="text-slate-500 font-medium">SUPRA</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-amber-500">💵</span>
                    <span className="font-bold text-white">{(user.credits || 0).toFixed(2)}</span>
                    <span className="text-slate-500 font-medium">CRED</span>
                </div>
            </div>

            {/* Daily Challenge */}
            <Link href="/training" className="block px-3 py-2 hover:bg-slate-700/30 transition-colors border-b border-slate-700/50">
                <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                        <span>📋</span>
                        <span className="text-slate-300 font-medium">Daily Challenge</span>
                    </div>
                    <span className="text-slate-500">▸</span>
                </div>
            </Link>

            {/* Missions Grid */}
            <div className="p-3">
                <div className="flex items-center gap-2 mb-2 text-xs">
                    <span>🎯</span>
                    <span className="text-slate-400 font-medium">Missions</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                    <MissionIcon icon="🏋️" progress={(trainingInfo?.qualities?.[0]) || 1} max={5} href="/training" />
                    <MissionIcon icon="💼" done={!!user.employerId} href="/companies" />
                    <MissionIcon icon="⚔️" href="/battles" />
                    <MissionIcon icon="🎖️" href="/profile" />
                </div>
            </div>
        </div>
    );
}

function MissionIcon({ icon, progress, max, done, href }: {
    icon: string, progress?: number, max?: number, done?: boolean, href: string
}) {
    return (
        <Link href={href}>
            <div className="relative w-full aspect-square bg-slate-700/50 rounded-lg border border-slate-600/50 flex items-center justify-center hover:bg-slate-600/50 transition-colors cursor-pointer">
                <span className="text-xl">{icon}</span>
                {progress !== undefined && max && (
                    <span className="absolute bottom-0.5 right-0.5 text-[8px] font-bold text-cyan-400 bg-slate-900/80 px-1 rounded">
                        {progress}/{max}
                    </span>
                )}
                {done && (
                    <span className="absolute top-0.5 right-0.5 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center text-[8px] text-white">✓</span>
                )}
            </div>
        </Link>
    );
}

function ResourcePill({ icon, value, color, label, hasPlus, isImage }: {
    icon: React.ReactNode | string, value: string, color: string, label?: string, hasPlus?: boolean, isImage?: boolean
}) {
    const colorMap: Record<string, string> = {
        cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
        emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
        green: 'bg-green-500/10 border-green-500/20 text-green-400',
    };

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colorMap[color]}`}>
            {isImage && typeof icon === 'string' ? (
                <img src={icon} alt={label || "resource"} className="w-5 h-5 object-contain drop-shadow-md" />
            ) : (
                <span className="flex items-center justify-center">{icon as React.ReactNode}</span>
            )}
            <span className="font-bold text-sm text-white">{value}</span>
            {label && <span className="text-[10px] text-slate-500 font-black uppercase">{label}</span>}
            {hasPlus && (
                <button className="w-5 h-5 bg-emerald-500/20 border border-emerald-500/40 rounded text-emerald-400 text-xs font-bold hover:bg-emerald-500/40 transition-colors">
                    +
                </button>
            )}
        </div>
    );
}

function QuickLink({ icon, label, badge, hasArrow, isAction, disabled, href }: {
    icon: React.ReactNode, label: string, badge?: string, hasArrow?: boolean, isAction?: boolean, disabled?: boolean, href?: string
}) {
    const content = (
        <div className={`flex items-center gap-3 px-4 py-3 ${disabled ? 'opacity-50' : 'cursor-pointer hover:bg-slate-700/30'} transition-colors`}>
            <span className="text-slate-400">{icon}</span>
            <span className={`flex-1 text-sm ${isAction ? 'text-cyan-400' : disabled ? 'text-slate-500' : 'text-slate-300'}`}>
                {label}
            </span>
            {badge && <span className="text-sm">{badge}</span>}
            {hasArrow && <span className="text-slate-500">›</span>}
        </div>
    );

    if (href && !disabled) {
        return <a href={href} className="block">{content}</a>;
    }

    return content;
}
