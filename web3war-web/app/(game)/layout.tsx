'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { TopNavigation } from '@/components/game/TopNavigation';
import { Clock, Calendar, Search, Bell, Mail, Settings, Zap, Coins, Heart, Star, Wallet } from 'lucide-react';
import { Button } from '@/components/Button';
import { useGameStore } from '@/lib/store';
import LoginScreen from '@/components/game/LoginScreen';

export default function GameLayout({ children }: { children: ReactNode }) {
    const user = useGameStore(state => state.user);

    // Initial fallback if user is not loaded (though store has default mock data)
    if (!user) return <LoginScreen />;

    return (
        <div className="min-h-screen font-sans relative">
            {/* Top Resource Bar - Always Visible */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 overflow-visible">
                <div className="max-w-7xl mx-auto px-4 overflow-visible">
                    <div className="flex items-center justify-between h-14 overflow-visible">
                        {/* Logo */}
                        <div className="flex items-center gap-6">
                            <h1 className="text-2xl font-black text-white tracking-tight">
                                WEB3<span className="text-cyan-400">WAR</span>
                            </h1>

                            {/* Primary Resources */}
                            <div className="flex items-center gap-4 pl-6 border-l border-slate-700">
                                <ResourcePill icon={<Zap size={14} />} value={Math.floor(user.energy || 0)} label="Energy" color="cyan" />
                                <ResourcePill icon={<Heart size={14} />} value={(user.level || 1) * 100} label="Health" color="emerald" />
                                <ResourcePill icon={<Coins size={14} />} value={Number(((user.credits || 0)).toFixed(2))} label="CRED" color="amber" />
                                <ResourcePill icon={<span className="text-xs">💎</span>} value={Number(((user.walletBalance || 0)).toFixed(2))} label="SUPRA" color="purple" />
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-4">
                            {/* Search */}
                            <div className="relative hidden lg:block">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="w-48 pl-9 pr-3 py-2 bg-slate-800/60 border border-slate-700/50 rounded-lg text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 text-sm"
                                />
                            </div>

                            {/* Time */}
                            <div className="hidden md:flex items-center gap-1.5 text-slate-400 text-xs font-medium px-3 py-1.5 bg-slate-800/40 rounded-lg border border-slate-700/50">
                                <Clock size={12} />
                                <span className="text-white font-bold">Day {Math.floor(Date.now() / (1000 * 60 * 60 * 24)) - 19700}</span>
                            </div>

                            {/* Notifications */}
                            <div className="flex items-center gap-1">
                                <IconButton icon={<Mail size={16} />} badge={3} />
                                <IconButton icon={<Bell size={16} />} badge={5} />
                            </div>

                            {/* Connect Wallet / Profile */}
                            <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white gap-2 border border-cyan-400/20">
                                <Wallet size={14} />
                                {user.walletAddress ? `${user.walletAddress.slice(0, 6)}...` : 'Connect Wallet'}
                            </Button>

                            {/* Profile Avatar */}
                            <Link href="/profile">
                                <div className="w-9 h-9 bg-slate-800 rounded-lg border border-slate-600 overflow-hidden cursor-pointer hover:border-cyan-400 transition-colors">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="Avatar" className="w-full h-full object-cover" />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 pt-20 pb-8 overflow-visible">
                {/* Main Navigation - Elevated Z-Index for Dropdowns */}
                <div className="relative z-[100] overflow-visible mb-6">
                    <TopNavigation />
                </div>

                {/* Page Content */}
                <div className="relative z-0">
                    {children}
                </div>

                {/* Footer */}
                <footer className="mt-12 pt-6 border-t border-slate-800 text-center">
                    <div className="flex justify-center gap-6 text-xs text-slate-500 font-medium mb-3">
                        <a href="#" className="hover:text-cyan-400 transition-colors">Wiki</a>
                        <a href="#" className="hover:text-cyan-400 transition-colors">Blog</a>
                        <a href="#" className="hover:text-cyan-400 transition-colors">Discord</a>
                        <a href="#" className="hover:text-cyan-400 transition-colors">Twitter</a>
                        <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
                    </div>
                    <div className="text-xs text-slate-600">© 2025 Web3War - Built on Supra Network</div>
                </footer>
            </div>
        </div>
    );
}

function ResourcePill({ icon, value, label, color }: { icon: React.ReactNode, value: number, label: string, color: string }) {
    const colorMap: Record<string, string> = {
        cyan: 'text-cyan-400 bg-cyan-950 border-cyan-800/50',
        emerald: 'text-emerald-400 bg-emerald-950 border-emerald-800/50',
        amber: 'text-amber-400 bg-amber-950 border-amber-800/50',
        purple: 'text-purple-400 bg-purple-950 border-purple-800/50',
    };

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colorMap[color]}`}>
            {icon}
            <span className="text-white font-bold text-sm">{value.toLocaleString()}</span>
            <span className="text-xs text-slate-500 hidden xl:inline">{label}</span>
        </div>
    );
}

function IconButton({ icon, badge }: { icon: React.ReactNode, badge?: number }) {
    return (
        <button className="relative w-9 h-9 bg-slate-800/60 border border-slate-700/50 rounded-lg flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-colors">
            {icon}
            {badge && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {badge}
                </span>
            )}
        </button>
    );
}
