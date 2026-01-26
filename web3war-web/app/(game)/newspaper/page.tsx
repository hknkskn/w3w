'use client';

import { useState, useEffect } from 'react';
import {
    Newspaper,
    ThumbsUp,
    MessageSquare,
    TrendingUp,
    PenTool,
    Search,
    Filter,
    Users,
    ChevronRight,
    Globe,
    Lock,
    Settings,
    Eye,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContractService } from '@/lib/contract-service';
import { TacticalAvatar } from '@/components/game/TacticalAvatar';
import { useTranslation } from '@/lib/i18n';

// Fallback Mock Articles (matching the on-chain Article struct)
const MOCK_ARTICLES = [
    { id: 0, title: "WAR_UPDATE: Southern Front Offensive", author: "0xGeneral_K", newspaper: "The War Journal", votes: 42, comments: 12, time: "2h ago", views: 1205, category: "Military" },
    { id: 1, title: "Economic Boom in Ankara: New Factories!", author: "0xMarketMaster", newspaper: "Trade Winds", votes: 38, comments: 8, time: "5h ago", views: 890, category: "Economy" },
    { id: 2, title: "Political Crisis: Impeachment Proposal?", author: "0xSenator_V", newspaper: "Capitol Pulse", votes: 65, comments: 45, time: "8h ago", views: 2500, category: "Politics" },
    { id: 3, title: "Citizen Guide: How to Optimize Strength", author: "0xCoach_Z", newspaper: "The Training Ground", votes: 29, comments: 15, time: "1d ago", views: 5600, category: "Guide" },
];

export default function NewspaperPage() {
    const { t } = useTranslation();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [articles, setArticles] = useState(MOCK_ARTICLES);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // In a real scenario, we'd fetch all newspapers then their articles
                // For now we'll simulate the call to show the "Based on Smart Contract" logic
                const papers = await ContractService.getAllNewspapers();
                if (papers && papers.length > 0) {
                    const allArticles: any = [];
                    for (const addr of papers.slice(0, 5)) {
                        const paperArticles = await ContractService.getNewspaperArticles(addr);
                        allArticles.push(...paperArticles);
                    }
                    if (allArticles.length > 0) {
                        setArticles(allArticles.map((a: any, idx: number) => ({
                            id: idx,
                            title: a.title,
                            author: a.author,
                            newspaper: "On-Chain Press",
                            votes: parseInt(a.votes),
                            comments: 0,
                            time: "Synced",
                            views: 0,
                            category: "Global"
                        })));
                    }
                }
            } catch (e) {
                console.log("On-chain fetch failed, using fallback intel", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const categories = ['All', 'Military', 'Politics', 'Economy', 'Social', 'Guides'];

    return (
        <div className="space-y-6 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
                        <Newspaper className="text-cyan-400" size={32} />
                        {t('newspaper.press_center')}
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 uppercase tracking-widest font-bold">
                        {t('newspaper.media_network')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm font-bold text-white transition-all">
                        <Users size={16} />
                        {t('newspaper.subscriptions')}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 border border-cyan-400/50 rounded-lg text-sm font-black text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
                        <PenTool size={16} />
                        {t('newspaper.create_newspaper_action', { cost: '2500.0' })}
                    </button>
                </div>
            </div>

            {/* Tactical Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                {/* Left Sidebar: Controls & Stats */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Search & Filter */}
                    <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-4 space-y-4 shadow-xl">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder={t('newspaper.search_intel')}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-xs text-white focus:border-cyan-500/50 focus:outline-none placeholder:text-slate-600"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${selectedCategory === cat
                                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent'
                                        }`}
                                >
                                    {t(`newspaper.${cat.toLowerCase()}`)}
                                    {selectedCategory === cat && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="bg-slate-900/40 border border-slate-800/50 rounded-xl p-4 shadow-lg">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">{t('newspaper.network_status')}</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">{t('newspaper.total_articles')}</span>
                                <span className="text-white font-mono">14,205</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">{t('newspaper.active_papers')}</span>
                                <span className="text-white font-mono">1,120</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400">{t('newspaper.cc_flow')}</span>
                                <span className="text-emerald-400 font-mono">+12.4K</span>
                            </div>
                        </div>
                    </div>

                    {/* Pending Update Alert */}
                    <div className="p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-xl flex items-center gap-3">
                        <Info size={20} className="text-cyan-500" />
                        <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">{t('newspaper.tactical_update_pending')}</span>
                    </div>
                </div>

                {/* Main Content: News Feed */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Trending Section */}
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} className="text-amber-500" />
                        <h2 className="text-xs font-black text-white uppercase tracking-widest italic">{t('newspaper.mission_critical')}</h2>
                        <div className="h-px bg-slate-800 flex-1 ml-2" />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {MOCK_ARTICLES.map((article, idx) => (
                            <motion.div
                                key={article.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative bg-slate-900/40 hover:bg-slate-800/60 transition-all border border-slate-800 hover:border-cyan-500/30 rounded-xl p-5 overflow-hidden shadow-lg"
                            >
                                {/* Category Badge */}
                                <div className="absolute top-0 right-0 px-3 py-1 bg-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-widest border-l border-b border-slate-700 rounded-bl-lg">
                                    {t(`newspaper.${article.category.toLowerCase()}`)}
                                </div>

                                <div className="flex items-start gap-4">
                                    {/* Author Mini Profile */}
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden shadow-inner flex-shrink-0 flex items-center justify-center">
                                            <TacticalAvatar
                                                seed={article.author}
                                                size={48}
                                                showBackground={false}
                                            />
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className={`px-1.5 py-0.5 rounded text-[8px] font-black ${idx === 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-500'}`}>
                                                {idx === 0 ? t('newspaper.elite_rank') : t('newspaper.citizen_rank')}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Article Preview */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                                            <span className="text-cyan-400">{article.newspaper}</span>
                                            <span>•</span>
                                            <span>{article.time}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2 leading-tight">
                                            {article.title}
                                        </h3>

                                        {/* Content Preview Snippet */}
                                        <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed italic">
                                            {t('newspaper.operational_reports')}
                                        </p>

                                        {/* Engagement Bar */}
                                        <div className="flex items-center gap-6 mt-4">
                                            <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/50 hover:bg-cyan-500/10 border border-slate-800 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 transition-all">
                                                <ThumbsUp size={14} />
                                                <span className="text-xs font-mono font-bold">{article.votes}</span>
                                            </button>
                                            <button className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors">
                                                <MessageSquare size={14} />
                                                <span className="text-xs font-mono">{article.comments}</span>
                                            </button>
                                            <div className="flex items-center gap-1.5 text-slate-600">
                                                <Eye size={14} />
                                                <span className="text-xs font-mono">{article.views}</span>
                                            </div>
                                            <button className="ml-auto flex items-center gap-1 text-xs font-black text-cyan-400 uppercase tracking-widest hover:translate-x-1 transition-transform">
                                                {t('newspaper.read_intel')} <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* UI Element: Tactical Corners */}
                                <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-slate-800" />
                                <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-slate-800" />
                            </motion.div>
                        ))}
                    </div>

                    {/* Load More */}
                    <button className="w-full py-3 bg-slate-900/20 hover:bg-slate-900/40 border border-slate-800/50 rounded-xl text-slate-500 hover:text-white text-xs font-black uppercase tracking-[0.3em] transition-all">
                        {t('newspaper.sync_intel_action')}
                    </button>
                </div>
            </div>
        </div>
    );
}
