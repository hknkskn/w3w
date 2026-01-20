'use client';

import { useState } from 'react';
import { Newspaper, ThumbsUp, MessageSquare, Eye, TrendingUp, PenTool, ChevronRight } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { CountryId, COUNTRY_CONFIG, COUNTRY_IDS } from '@/lib/types';

interface Article {
    id: number;
    title: string;
    author: string;
    authorAvatar: string;
    votes: number;
    comments: number;
    day: number;
    category: 'political' | 'military' | 'social' | 'business';
}

const MOCK_ARTICLES: Article[] = [
    { id: 1, title: '[MEB] 25 Kasım - 9 Aralık 2025 Dağıtımı', author: 'CauchySchwarz', authorAvatar: 'Cauchy', votes: 26, comments: 9, day: 6598, category: 'political' },
    { id: 2, title: 'Görev Destek 3/3 - Quest Sup 3/3 - 25 YORUM', author: 'Santral TR', authorAvatar: 'Santral', votes: 25, comments: 32, day: 6585, category: 'military' },
    { id: 3, title: 'Görev Destek 3/2 - Quest Sup 3/2', author: 'Santral TR', authorAvatar: 'Santral', votes: 20, comments: 28, day: 6582, category: 'military' },
    { id: 4, title: 'Görev Destek - Quest Sup.', author: 'Santral TR', authorAvatar: 'Santral', votes: 41, comments: 38, day: 6577, category: 'social' },
    { id: 5, title: 'Bir Aceminin Kaleminden: Web3War Dünyasında İlk ...', author: 'Tamuhann', authorAvatar: 'Tamu', votes: 48, comments: 36, day: 6567, category: 'social' },
];

const CATEGORY_ICONS = [
    { icon: '🏛️', label: 'Political' },
    { icon: '⚔️', label: 'Military' },
    { icon: '💬', label: 'Social' },
    { icon: '💰', label: 'Business' },
    { icon: '📰', label: 'News' },
    { icon: '🎮', label: 'Gaming' },
    { icon: '🌍', label: 'World' },
];

export function NewspaperWidget() {
    const { user } = useGameStore();
    const [articles] = useState(MOCK_ARTICLES);
    const countryCode = (Object.keys(COUNTRY_IDS) as CountryId[]).find(k => COUNTRY_IDS[k] === user?.countryId) || 'TR' as CountryId;
    const countryInfo = user ? COUNTRY_CONFIG[countryCode] : null;

    return (
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border-2 border-slate-700/50 overflow-hidden shadow-lg">
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Newspaper size={16} className="text-cyan-400" />
                    <h3 className="font-bold text-white text-sm">Top Rated Articles</h3>
                    <span className="text-xs text-slate-400">in</span>
                    <div className="flex items-center gap-1.5">
                        {countryInfo ? (
                            <img src={countryInfo.flag} className="w-4 h-2.5 object-cover rounded shadow-sm" alt={countryInfo.name} />
                        ) : (
                            <span>🌍</span>
                        )}
                        <span className="text-xs font-bold text-red-400 uppercase">{countryInfo?.name || 'Global'}</span>
                    </div>
                </div>
                <button className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1">
                    <PenTool size={12} /> Write Article
                </button>
            </div>

            {/* Category Filter */}
            <div className="px-4 py-2 border-b border-slate-700/30 flex items-center gap-2 overflow-x-auto">
                {CATEGORY_ICONS.map((cat, i) => (
                    <button
                        key={i}
                        className="flex items-center gap-1 px-2 py-1 bg-slate-900/50 rounded text-xs text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors whitespace-nowrap"
                    >
                        {cat.icon}
                    </button>
                ))}
            </div>

            {/* Articles List */}
            <div className="divide-y divide-slate-700/30">
                {articles.map((article, index) => (
                    <div
                        key={article.id}
                        className="px-4 py-3 hover:bg-slate-700/20 cursor-pointer transition-colors group"
                    >
                        <div className="flex items-start gap-3">
                            {/* Author Avatar */}
                            <div className="w-10 h-10 bg-slate-700 rounded-lg overflow-hidden border border-slate-600 flex-shrink-0">
                                <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${article.authorAvatar}`}
                                    alt={article.author}
                                    className="w-full h-full"
                                />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                                    {article.title}
                                </h4>
                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                    <span className="text-cyan-400 font-medium">{article.author}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <ThumbsUp size={10} />
                                        {article.votes}
                                    </div>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <MessageSquare size={10} />
                                        {article.comments}
                                    </div>
                                    <span>•</span>
                                    <span>Day {article.day}</span>
                                </div>
                            </div>

                            {/* Rank Badge */}
                            {index < 3 && (
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${index === 0 ? 'bg-cyan-500 text-slate-950' :
                                    index === 1 ? 'bg-slate-500/50 text-white' :
                                        'bg-slate-700/50 text-slate-400'
                                    }`}>
                                    {index + 1}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-700/50 flex items-center justify-between">
                <button className="text-xs text-slate-400 hover:text-white transition-colors">
                    more news ▸
                </button>
                <button className="text-xs text-cyan-400 hover:text-cyan-300 font-bold">
                    See all
                </button>
            </div>
        </div>
    );
}

export default NewspaperWidget;
