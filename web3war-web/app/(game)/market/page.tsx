'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import {
    ShoppingCart,
    TrendingUp,
    Package,
    Search,
    Hash
} from 'lucide-react';
import { MarketSell } from '@/components/game/MarketSell';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n';

// ============================================================
//  MARKETPLACE - Inventory Style Layout with Advanced Filters
// ============================================================

// Main view tabs
const TABS = [
    { id: 'buy', name: 'Buy', icon: TrendingUp },
    { id: 'sell', name: 'Sell', icon: ShoppingCart },
    { id: 'my_offers', name: 'My Offers', icon: Package },
] as const;

// Category filters with icons matching ITEMS_CATALOG.md
const CATEGORIES = [
    { id: 'all', name: 'All Items', icon: '/icons/inventory.webp', catId: null },
    { id: 'weapons', name: 'Armory', icon: '/icons/weapon.webp', catId: 2 },
    { id: 'food', name: 'Consumables', icon: '/icons/food.webp', catId: 1 },
    { id: 'raw', name: 'Raw Goods', icon: '/icons/warehouse.webp', catId: 3 },
    { id: 'tickets', name: 'Access Keys', icon: '/icons/inventory.webp', catId: 4 },
];

// Quality filter options
const QUALITIES = [
    { id: 'all', name: 'All' },
    { id: '1', name: 'Q1' },
    { id: '2', name: 'Q2' },
    { id: '3', name: 'Q3' },
    { id: '4', name: 'Q4' },
    { id: '5', name: 'Q5' },
];

export default function MarketPage() {
    const searchParams = useSearchParams();
    const { t } = useTranslation();
    const {
        marketItems,
        myListings,
        buyItem,
        user,
        cancelMarketListing,
        fetchMarketItems,
        fetchMyListings,
        fetchInventory
    } = useGameStore();

    // View state
    const initialView = searchParams.get('view') as 'buy' | 'sell' | 'my_offers' || 'buy';
    const [view, setView] = useState<'buy' | 'sell' | 'my_offers'>(initialView);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [qualityFilter, setQualityFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [itemIdFilter, setItemIdFilter] = useState<string>('');

    // Fetch data on mount
    useEffect(() => {
        fetchMarketItems();
        fetchInventory();
    }, []);

    // Fetch my listings when switching to escrow view
    useEffect(() => {
        if (view === 'my_offers') {
            fetchMyListings();
        }
    }, [view]);

    // Filter out items with ID 0 (Unknown/Invalid items)
    const validMarketItems = marketItems.filter(l => l.item.id > 0);
    const validMyListings = myListings.filter(l => l.item.id > 0);

    // Apply all filters
    const filteredItems = (view === 'buy' ? validMarketItems : validMyListings).filter(listing => {
        // Category filter
        const catInfo = CATEGORIES.find(c => c.id === selectedCategory);
        const matchesCategory = selectedCategory === 'all' || listing.item.category === catInfo?.catId;

        // Quality filter
        const matchesQuality = qualityFilter === 'all' || listing.item.quality === Number(qualityFilter);

        // Item ID filter (exact match when provided)
        const matchesId = !itemIdFilter || listing.item.id === Number(itemIdFilter);

        // Search filter (name-based)
        const matchesSearch = !searchQuery ||
            listing.item.name.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesQuality && matchesId && matchesSearch;
    });

    // Handle buy action
    const handleBuy = async (listing: any, quantity: number) => {
        if (!user) {
            const { idsAlert } = useGameStore.getState();
            await idsAlert(t('market.login_first'), t('market.auth_required'), "warning");
            return;
        }
        await buyItem(listing.listingId, quantity);
    };

    // Get quality badge styling
    const getQualityStyle = (quality: number) => {
        if (quality >= 5) return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
        if (quality >= 3) return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
        return 'bg-slate-900 border-white/5 text-slate-500';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 mt-2">

            {/* Main Tab Navigation */}
            <div className="flex items-center gap-1 p-1 bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-x-auto no-scrollbar">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setView(tab.id)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${view === tab.id
                            ? 'bg-slate-700 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                            }`}
                    >
                        <tab.icon size={18} className={view === tab.id ? 'text-cyan-400' : 'text-slate-500'} />
                        {t(`market.${tab.id}`)}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                {view === 'sell' ? (
                    <motion.div
                        key="sell"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <MarketSell />
                    </motion.div>
                ) : (
                    <motion.div
                        key="market"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Search & Filter Bar */}
                        <div className="flex flex-col lg:flex-row gap-4">
                            {/* Search Input */}
                            <div className="relative flex-1">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder={t('market.search_placeholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-800/40 border-2 border-slate-700/50 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 backdrop-blur-sm"
                                />
                            </div>

                            {/* Item ID Filter */}
                            <div className="relative w-full lg:w-40">
                                <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="number"
                                    placeholder={t('market.item_id')}
                                    value={itemIdFilter}
                                    onChange={(e) => setItemIdFilter(e.target.value)}
                                    className="w-full pl-10 pr-4 py-4 bg-slate-800/40 border-2 border-slate-700/50 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 backdrop-blur-sm font-mono"
                                />
                            </div>

                            {/* Quality Filter */}
                            <div className="flex items-center gap-1 p-1 bg-slate-800/40 border-2 border-slate-700/50 rounded-xl">
                                {QUALITIES.map((q) => (
                                    <button
                                        key={q.id}
                                        onClick={() => setQualityFilter(q.id)}
                                        className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all ${qualityFilter === q.id
                                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                            : 'text-slate-500 hover:text-white hover:bg-slate-700/50'
                                            }`}
                                    >
                                        {q.id === 'all' ? t('common.all') : q.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                            {/* Categories Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border-2 border-slate-700/50 p-4">
                                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">
                                        {t('market.categories')}
                                    </h3>
                                    <nav className="space-y-1">
                                        {CATEGORIES.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setSelectedCategory(cat.id)}
                                                className={`w-full text-left px-4 py-3 text-sm font-bold rounded-lg transition-all flex items-center gap-3 ${selectedCategory === cat.id
                                                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                                                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                                    }`}
                                            >
                                                <img src={cat.icon} className="w-5 h-5 object-contain" alt="" />
                                                {t(`market.${cat.id}`, {}, cat.name)}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </div>

                            {/* Listings Table */}
                            <div className="lg:col-span-4">
                                <div className="bg-slate-800/20 backdrop-blur-sm rounded-xl border-2 border-slate-700/50 overflow-hidden">

                                    {/* Table Header */}
                                    <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-900/40 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                        <div className="col-span-5">{t('market.asset_specification')}</div>
                                        <div className="col-span-2">{t('market.quality')}</div>
                                        <div className="col-span-1">{t('market.qty')}</div>
                                        <div className="col-span-2">{t('market.price')}</div>
                                        <div className="col-span-2 text-right">{t('market.action')}</div>
                                    </div>

                                    {/* Table Body */}
                                    <div className="divide-y divide-white/5 min-h-[400px] max-h-[600px] overflow-y-auto">
                                        {filteredItems.length === 0 ? (
                                            <div className="py-24 text-center">
                                                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-700 opacity-20">
                                                    <Package size={24} />
                                                </div>
                                                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                                    {t('market.no_listings')}
                                                </p>
                                                <p className="text-slate-600 text-[9px] mt-1 uppercase tracking-wide">
                                                    {t('market.adjust_filters')}
                                                </p>
                                            </div>
                                        ) : (
                                            filteredItems.map((listing) => (
                                                <motion.div
                                                    key={listing.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors group"
                                                >
                                                    {/* Asset Specification */}
                                                    <div className="col-span-5 flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform border border-white/5 overflow-hidden p-2">
                                                            <img
                                                                src={listing.item.image}
                                                                className="w-full h-full object-contain filter drop-shadow-lg"
                                                                alt={listing.item.name}
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                                                                {listing.item.name}
                                                            </div>
                                                            <div className="text-[9px] text-slate-500 font-black uppercase tracking-tighter mt-0.5">
                                                                ID: #{listing.item.id} • {listing.seller?.slice(0, 6)}...
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Quality Badge */}
                                                    <div className="col-span-2">
                                                        <div className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black border ${getQualityStyle(listing.item.quality)}`}>
                                                            Q{listing.item.quality}
                                                        </div>
                                                    </div>

                                                    {/* Quantity */}
                                                    <div className="col-span-1 text-white font-mono font-bold">
                                                        {listing.item.quantity.toLocaleString()}
                                                    </div>

                                                    {/* Price */}
                                                    <div className="col-span-2">
                                                        <div className="text-amber-500 font-mono font-bold">
                                                            {listing.pricePerUnit.toFixed(2)}
                                                        </div>
                                                        <div className="text-[8px] text-slate-600 font-bold uppercase">
                                                            {t('market.cred_per_unit')}
                                                        </div>
                                                    </div>

                                                    {/* Action */}
                                                    <div className="col-span-2 flex items-center justify-end gap-2">
                                                        {view === 'buy' ? (
                                                            <>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    max={listing.item.quantity}
                                                                    defaultValue="1"
                                                                    id={`qty-${listing.id}`}
                                                                    className="w-12 h-8 bg-slate-900 border border-white/5 rounded text-center text-sm font-mono text-white focus:outline-none focus:border-cyan-500/30"
                                                                />
                                                                <button
                                                                    onClick={() => {
                                                                        const qty = (document.getElementById(`qty-${listing.id}`) as HTMLInputElement)?.value;
                                                                        handleBuy(listing, Number(qty));
                                                                    }}
                                                                    className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded text-[9px] font-black uppercase transition-all border border-emerald-500/20"
                                                                >
                                                                    {t('market.buy_action')}
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() => cancelMarketListing(listing.id)}
                                                                className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded text-[9px] font-black uppercase transition-all border border-red-500/20"
                                                            >
                                                                {t('market.cancel_listing')}
                                                            </button>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
