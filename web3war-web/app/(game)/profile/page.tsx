'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { Shield, MapPin, Wallet, Trophy, Coins, LogOut, Users, Newspaper, Home, Flag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CountryId, COUNTRY_CONFIG, COUNTRY_IDS } from '@/lib/types';
import Link from 'next/link';

export default function ProfilePage() {
    const user = useGameStore(state => state.user);
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'profile' | 'friends' | 'edit'>('profile');

    if (!user) {
        router.push('/');
        return null;
    }

    const countryCode = (Object.entries(COUNTRY_IDS).find(([_, v]) => v === user.countryId)?.[0] || 'TR') as CountryId;
    const countryConfig = COUNTRY_CONFIG[countryCode];

    const handleDisconnect = () => {
        window.location.reload();
    };

    // Mock achievements data
    const achievements = [
        { id: 1, icon: '🏆', name: 'First Victory', count: 2 },
        { id: 2, icon: '⚔️', name: 'Battle Hero', count: 0 },
        { id: 3, icon: '🎖️', name: 'War Medal', count: 0 },
        { id: 4, icon: '🏅', name: 'Resistance', count: 0 },
        { id: 5, icon: '💪', name: 'Super Soldier', count: 0 },
        { id: 6, icon: '🌟', name: 'Campaign Hero', count: 0 },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-24">
            {/* Two Column Layout */}
            <div className="grid grid-cols-12 gap-6">

                {/* Left Sidebar */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    {/* Location Card */}
                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <MapPin size={14} className="text-slate-500" />
                                <div className="text-xs">
                                    <span className="text-slate-500">Location:</span>
                                    <span className="text-cyan-400 ml-1 font-medium">change</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                {countryConfig && <img src={countryConfig.flag} className="w-5 h-3 rounded" alt="" />}
                                <span className="text-white font-medium">{countryConfig?.name || 'Unknown Sector'}</span>
                            </div>

                            <div className="border-t border-slate-700/50 pt-3">
                                <div className="flex items-center gap-3">
                                    <Flag size={14} className="text-slate-500" />
                                    <div className="text-xs">
                                        <span className="text-slate-500">Citizenship:</span>
                                        <span className="text-cyan-400 ml-1 font-medium">change</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm mt-1">
                                    {countryConfig && <img src={countryConfig.flag} className="w-5 h-3 rounded" alt="" />}
                                    <span className="text-cyan-400 font-bold">{countryConfig?.name || countryCode}</span>
                                </div>
                            </div>

                            <div className="border-t border-slate-700/50 pt-3 text-xs text-slate-400">
                                <div className="font-medium text-slate-300">Young Citizen</div>
                                <div>Joined: {new Date().toLocaleDateString()}</div>
                                <div className="mt-1">
                                    National rank: <span className="text-cyan-400 font-bold">#{user.address.slice(2, 6).toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Cards */}
                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 divide-y divide-slate-700/50">
                        <div className="p-3 flex items-center gap-3 text-sm">
                            <span className="text-slate-500">🏛️</span>
                            <span className="text-slate-400">No political activity</span>
                        </div>
                        <div className="p-3 flex items-center gap-3 text-sm">
                            <span className="text-slate-500">🎖️</span>
                            <span className="text-slate-300">Soldier</span>
                        </div>
                        <Link href="/military" className="block p-3 flex items-center gap-3 text-sm hover:bg-slate-700/30 transition-colors">
                            <span className="text-lg">⚔️</span>
                            <span className="text-cyan-400 font-medium">Join Military Unit</span>
                        </Link>
                        <Link href="/newspaper" className="block p-3 flex items-center gap-3 text-sm hover:bg-slate-700/30 transition-colors">
                            <Newspaper size={16} className="text-slate-500" />
                            <span className="text-cyan-400">Create newspaper</span>
                        </Link>
                        <div className="p-3 flex items-center gap-3 text-sm">
                            <Home size={16} className="text-slate-500" />
                            <span className="text-slate-300">Resident</span>
                        </div>
                    </div>

                    {/* Friends */}
                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-cyan-400 mb-3">
                            <Users size={14} />
                            Friends (0)
                        </div>
                        <p className="text-xs text-slate-500 italic">No friends yet</p>
                        <button className="text-xs text-cyan-400 hover:underline mt-2">view all</button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-span-12 lg:col-span-9 space-y-6">
                    {/* Profile Header */}
                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                        <div className="flex items-start gap-6">
                            {/* Avatar */}
                            <div className="w-24 h-24 bg-slate-700 rounded-xl overflow-hidden border-2 border-slate-600">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                    alt="Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Name and Tabs */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="text-cyan-400 font-bold text-lg">{user.level}</span>
                                    <h1 className="text-2xl font-black text-white">{user.username}</h1>
                                </div>

                                {/* Tabs */}
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`px-6 py-2 text-sm font-bold rounded-t-lg transition-colors ${activeTab === 'profile' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Profile
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('friends')}
                                        className={`px-6 py-2 text-sm font-bold rounded-t-lg transition-colors ${activeTab === 'friends' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Friends
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('edit')}
                                        className={`px-6 py-2 text-sm font-bold rounded-t-lg transition-colors ${activeTab === 'edit' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        Edit Profile
                                    </button>
                                </div>
                            </div>

                            {/* Wallet */}
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-lg text-xs">
                                    <Wallet size={14} className="text-slate-400" />
                                    <span className="font-mono text-slate-300">
                                        {user.address.slice(0, 6)}...{user.address.slice(-4)}
                                    </span>
                                </div>
                                <button
                                    onClick={handleDisconnect}
                                    className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                                >
                                    <LogOut size={12} /> Disconnect
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Achievements</h3>
                        <div className="grid grid-cols-6 gap-4">
                            {achievements.map((ach) => (
                                <div key={ach.id} className="flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${ach.count > 0 ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-700/50 border border-slate-600/50 grayscale opacity-50'}`}>
                                        {ach.icon}
                                    </div>
                                    <span className="text-xs text-slate-400 mt-1">{ach.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Military Attributes */}
                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Military Attributes</h3>

                        <div className="grid grid-cols-3 gap-6">
                            {/* Ground */}
                            <div className="text-center">
                                <div className="text-3xl mb-2">🎖️</div>
                                <div className="text-xs text-slate-500 uppercase">Ground</div>
                                <div className="text-sm font-bold text-white">Division 1</div>
                            </div>

                            {/* Strength */}
                            <div className="text-center">
                                <div className="text-3xl mb-2">💪</div>
                                <div className="text-xs text-slate-500 uppercase">Strength</div>
                                <div className="text-lg font-black text-amber-400">{(user.strength || 0).toFixed(2)}</div>
                            </div>

                            {/* Military Rank */}
                            <div>
                                <div className="text-xs text-slate-500 uppercase mb-1">Military Rank</div>
                                <div className="text-sm font-bold text-cyan-400 mb-2">Private *</div>
                                <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                        style={{ width: `${(user.rankPoints % 100)}%` }}
                                    />
                                </div>
                                <div className="text-[10px] text-slate-500 mt-1">{Math.floor(user.rankPoints)} / 100</div>
                            </div>
                        </div>
                    </div>

                    {/* Economy Stats */}
                    <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Economy</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-700/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <Coins size={16} className="text-amber-500" />
                                    <span className="text-xs text-slate-500 uppercase">Credits</span>
                                </div>
                                <div className="text-xl font-black text-amber-400">{(user.credits || 0).toFixed(2)} CRED</div>
                            </div>
                            <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-700/30">
                                <div className="flex items-center gap-2 mb-1">
                                    <Trophy size={16} className="text-cyan-500" />
                                    <span className="text-xs text-slate-500 uppercase">Job Status</span>
                                </div>
                                <div className="text-lg font-bold text-white">
                                    {user.employerId ? 'Employed' : 'Unemployed'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
