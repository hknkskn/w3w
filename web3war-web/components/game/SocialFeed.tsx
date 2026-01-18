'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Flag, Shield, MessageCircle, Heart, Send, MoreHorizontal, UserPlus } from 'lucide-react';

interface FeedPost {
    id: number;
    author: string;
    avatar: string;
    content: string;
    timestamp: string;
    likes: number;
    comments: number;
    isLiked?: boolean;
    type?: 'message' | 'join' | 'achievement';
    badge?: string;
}

const MOCK_POSTS: Record<string, FeedPost[]> = {
    friends: [
        { id: 1, author: 'DragonSlayer', avatar: 'Dragon', content: 'Just hit 1M damage in the Aegean battle! 💪🔥', timestamp: '2m ago', likes: 12, comments: 3 },
        { id: 2, author: 'NightHawk', avatar: 'Hawk', content: 'Anyone selling Q5 weapons? Need 50 units.', timestamp: '15m ago', likes: 4, comments: 8 },
        { id: 3, author: 'ThunderBolt', avatar: 'Thunder', content: 'Türk Ordusu is recruiting! Join us for the war!', timestamp: '1h ago', likes: 28, comments: 5 },
    ],
    country: [
        { id: 4, author: 'Türk Ordusu', avatar: 'TurkArmy', badge: '🇹🇷', content: 'Fight for Turkey in Marmara!', timestamp: '5m ago', likes: 45, comments: 12, type: 'message' },
        { id: 5, author: 'Türk Ordusu', avatar: 'TurkArmy', badge: '🇹🇷', content: 'storm52 joined eRepublik and Türk Ordusu.', timestamp: '28m ago', likes: 8, comments: 1, type: 'join' },
        { id: 6, author: 'Government', avatar: 'Gov', badge: '🏛️', content: 'New taxes announced: Income Tax reduced to 10%!', timestamp: '2h ago', likes: 156, comments: 34 },
    ],
    army: [
        { id: 7, author: 'Commander Alpha', avatar: 'Commander', badge: '⚔️', content: 'All soldiers report to Aegean Coast NOW! We need backup!', timestamp: '1m ago', likes: 22, comments: 5 },
        { id: 8, author: 'General Kemal', avatar: 'Kemal', badge: '🎖️', content: 'Great victory yesterday! 50M total damage dealt.', timestamp: '3h ago', likes: 89, comments: 15 },
        { id: 9, author: 'Türk Ordusu', avatar: 'TurkArmy', badge: '🇹🇷', content: 'Mahmudiyye and Mimozachsen joined Türk Ordusu.', timestamp: '1d ago', likes: 12, comments: 2, type: 'join' },
    ]
};

export function SocialFeed() {
    const [activeTab, setActiveTab] = useState<'friends' | 'country' | 'army'>('friends');
    const [newPost, setNewPost] = useState('');
    const [posts, setPosts] = useState(MOCK_POSTS);

    const tabs = [
        { id: 'friends', label: 'Friends', icon: <Users size={14} /> },
        { id: 'country', label: 'Turkey', icon: <Flag size={14} />, flag: '🇹🇷' },
        { id: 'army', label: 'Türk Ordusu', icon: <Shield size={14} /> },
    ];

    const handleLike = (postId: number) => {
        setPosts(prev => ({
            ...prev,
            [activeTab]: prev[activeTab].map(post =>
                post.id === postId
                    ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
                    : post
            )
        }));
    };

    const handlePost = () => {
        if (!newPost.trim()) return;

        const newPostObj: FeedPost = {
            id: Date.now(),
            author: 'You',
            avatar: 'Commander',
            content: newPost,
            timestamp: 'Just now',
            likes: 0,
            comments: 0,
        };

        setPosts(prev => ({
            ...prev,
            [activeTab]: [newPostObj, ...prev[activeTab]]
        }));
        setNewPost('');
    };

    return (
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border-2 border-slate-700/50 overflow-hidden shadow-lg">
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

            {/* Quick Action Banner */}
            {activeTab === 'country' && (
                <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-b border-red-500/30 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">⚔️</span>
                        <div>
                            <div className="text-xs font-bold text-white">Fight for 🇹🇷 Turkey in Marmara</div>
                            <div className="text-[10px] text-slate-400">0/25 daily fights</div>
                        </div>
                    </div>
                    <button className="px-4 py-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold rounded-lg hover:from-red-400 hover:to-orange-400 transition-all">
                        Battlefield ▸
                    </button>
                </div>
            )}

            {/* Post Input */}
            <div className="p-3 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Commander" alt="You" className="w-full h-full" />
                    </div>
                    <input
                        type="text"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handlePost()}
                        placeholder="Say something..."
                        className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                    />
                    <button
                        onClick={handlePost}
                        className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>

            {/* Feed */}
            <div className="max-h-[400px] overflow-y-auto">
                <AnimatePresence mode="popLayout">
                    {posts[activeTab].map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-3 border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors"
                        >
                            <div className="flex gap-3">
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-10 h-10 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.avatar}`}
                                            alt={post.author}
                                            className="w-full h-full"
                                        />
                                    </div>
                                    {post.badge && (
                                        <div className="absolute -bottom-1 -right-1 text-xs">{post.badge}</div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-sm text-white truncate">{post.author}</span>
                                        <span className="text-xs text-slate-500">{post.timestamp}</span>
                                    </div>

                                    {post.type === 'join' ? (
                                        <div className="flex items-center gap-2 text-sm text-slate-300">
                                            <UserPlus size={14} className="text-emerald-400" />
                                            <span>{post.content}</span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-300 break-words">{post.content}</p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-4 mt-2">
                                        <button
                                            onClick={() => handleLike(post.id)}
                                            className={`flex items-center gap-1 text-xs transition-colors ${post.isLiked ? 'text-red-400' : 'text-slate-500 hover:text-red-400'
                                                }`}
                                        >
                                            <Heart size={14} fill={post.isLiked ? 'currentColor' : 'none'} />
                                            {post.likes}
                                        </button>
                                        <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-400 transition-colors">
                                            <MessageCircle size={14} />
                                            {post.comments}
                                        </button>
                                        <button className="ml-auto text-slate-500 hover:text-slate-300">
                                            <MoreHorizontal size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* See More */}
            <div className="p-3 text-center border-t border-slate-700/50">
                <button className="text-xs text-cyan-400 hover:text-cyan-300 font-bold">
                    See more ▸
                </button>
            </div>
        </div>
    );
}

export default SocialFeed;
