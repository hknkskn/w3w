'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Flag, MessageCircle, Heart, Send, MoreHorizontal } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { SocialService } from '@/lib/services/social.service';
import { getCountryFlag } from '@/lib/regions';
import { TacticalAvatar } from './TacticalAvatar';
import { useTranslation } from '@/lib/i18n';
import { Button } from '@/components/Button';

interface FeedPost {
    id: number;
    author: string;
    avatar: string;
    content: string;
    timestamp: string;
    likes: number;
    comments: number;
    isLiked?: boolean;
    countryId: number;
}

export function SocialFeed() {
    const { user } = useGameStore();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'global' | 'local'>('global');
    const [newPost, setNewPost] = useState('');
    const [posts, setPosts] = useState<FeedPost[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(7);

    const countryId = user?.countryId || 1;
    const countryFlag = getCountryFlag(countryId);

    const tabs = [
        { id: 'global', label: t('social_feed.global'), icon: <Globe size={14} /> },
        { id: 'local', label: t('social_feed.local'), icon: <Flag size={14} />, flag: countryFlag },
    ];

    const fetchShouts = async () => {
        setIsLoading(true);
        try {
            const rawShouts = activeTab === 'global'
                ? await SocialService.getGlobalShouts()
                : await SocialService.getLocalShouts(countryId);

            const mapped: FeedPost[] = rawShouts.map((s: any) => ({
                id: Number(s.id),
                author: s.author.slice(0, 8) + '...',
                avatar: s.author,
                content: s.content,
                timestamp: new Date(Number(s.timestamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                likes: 0,
                comments: 0,
                countryId: Number(s.country_id)
            })).reverse(); // Newest first

            setPosts(mapped);
        } catch (e) {
            console.error("Failed to fetch shouts", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchShouts();
        const interval = setInterval(fetchShouts, 15000); // Poll every 15s
        return () => clearInterval(interval);
    }, [activeTab, countryId]);

    const handlePost = async () => {
        if (!newPost.trim()) return;
        try {
            const tx = await SocialService.shout(newPost);
            if (tx) {
                setNewPost('');
                setTimeout(fetchShouts, 2000); // Refresh after TX
            }
        } catch (e) {
            console.error("Shout failed", e);
        }
    };

    return (
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border-2 border-slate-700/50 overflow-hidden shadow-lg flex flex-col h-[800px]">
            {/* Tabs */}
            <div className="flex border-b border-slate-700/50">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 px-4 py-3 text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === tab.id
                            ? 'bg-cyan-500/10 text-cyan-400 border-b-2 border-cyan-500'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                            }`}
                    >
                        {tab.flag && <span>{tab.flag}</span>}
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Post Input */}
            <div className="p-3 border-b border-slate-700/50 bg-slate-900/20">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-900 rounded-full overflow-hidden border border-slate-700 shrink-0 flex items-center justify-center">
                        <TacticalAvatar
                            seed={user?.avatarSeed || user?.username || "anon"}
                            size={36}
                            showBackground={false}
                        />
                    </div>
                    <input
                        type="text"
                        placeholder={t('social_feed.shout_placeholder')}
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePost()}
                        className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                    />
                    <Button
                        size="sm"
                        disabled={!newPost.trim() || isLoading}
                        onClick={handlePost}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white"
                    >
                        {t('social_feed.shout_button')}
                    </Button>
                </div>
            </div>

            {/* Feed */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isLoading && posts.length === 0 ? (
                    <div className="p-10 text-center text-slate-500 text-xs animate-pulse">
                        Connecting to on-chain feed...
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {posts.slice(0, visibleCount).map((post, index) => (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(index * 0.05, 0.5) }}
                                className="p-3 border-b border-slate-700/20 hover:bg-slate-700/10 transition-colors group"
                            >
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shrink-0 flex items-center justify-center">
                                        <TacticalAvatar
                                            seed={post.avatar.includes('#') ? post.avatar.split('#')[1] : post.avatar}
                                            size={40}
                                            showBackground={false}
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-bold text-xs text-white truncate">{post.author.split('#')[0]}</span>
                                            <span className="text-[10px] text-slate-500">{post.timestamp}</span>
                                            <span className="text-[10px] ml-auto text-slate-600 group-hover:text-slate-400">{getCountryFlag(post.countryId)}</span>
                                        </div>

                                        <p className="text-sm text-slate-300 break-words leading-relaxed">{post.content}</p>

                                        <div className="flex items-center gap-4 mt-2">
                                            <button className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-red-400 transition-colors">
                                                <Heart size={12} />
                                                0
                                            </button>
                                            <button className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-cyan-400 transition-colors">
                                                <MessageCircle size={12} />
                                                0
                                            </button>
                                            <button className="ml-auto text-slate-600 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal size={12} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {posts.length === 0 && !isLoading && (
                    <div className="py-10 text-center text-slate-500 text-xs italic">
                        {t('social_feed.no_posts')}
                    </div>
                )}

                {posts.length > visibleCount && (
                    <button
                        onClick={() => setVisibleCount(prev => prev + 10)}
                        className="w-full py-3 text-[10px] font-black uppercase tracking-tighter text-slate-500 hover:text-cyan-400 hover:bg-slate-700/10 transition-all border-t border-slate-700/30 flex items-center justify-center gap-2"
                    >
                        <MoreHorizontal size={14} />
                        {t('social_feed.load_more')}
                    </button>
                )}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
            `}</style>
        </div>
    );
}

export default SocialFeed;
