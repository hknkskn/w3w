'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { Button } from '@/components/Button';
import { ShoppingCart, TrendingUp, Package, Search, Filter, Star, Coins } from 'lucide-react';
import { MarketSell } from '@/components/game/MarketSell';
import { CountryId, COUNTRY_CONFIG } from '@/lib/types';

export default function MarketPage() {
    const { marketItems, myListings, buyItem, user, cancelMarketListing, fetchMarketItems, fetchMyListings, fetchInventory } = useGameStore();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [view, setView] = useState<'buy' | 'sell' | 'my_offers'>('buy');

    useEffect(() => {
        fetchMarketItems();
        fetchInventory(); // Ensure user has items to sell
    }, []);

    useEffect(() => {
        if (view === 'my_offers') {
            fetchMyListings();
        }
    }, [view]);

    const categories = [
        { id: 'all', name: 'All Items', icon: <Package size={16} /> },
        { id: 'weapons', name: 'Weapons', icon: <span>🔫</span> },
        { id: 'food', name: 'Food', icon: <span>🍞</span> },
        { id: 'tickets', name: 'Tickets', icon: <span>🎫</span> },
        { id: 'houses', name: 'Houses', icon: <span>🏠</span> },
        { id: 'raw', name: 'Raw Materials', icon: <span>⛏️</span> },
    ];

    const filteredItems = view === 'buy'
        ? (selectedCategory === 'all' ? marketItems : marketItems.filter(item => item.category === selectedCategory))
        : myListings;

    const handleBuy = (item: any) => {
        if (!user) {
            alert("Please login first!");
            return;
        }
        buyItem(item.id, item.quantity || 1);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        {view === 'buy' ? 'Global Marketplace' : view === 'sell' ? 'Seller Command' : 'My Offers'}
                    </h1>
                    <p className="text-slate-400 mt-1">
                        {view === 'buy' ? 'Trade goods with commanders worldwide' : view === 'sell' ? 'List your surplus goods for CRED' : 'Manage your active listings and escrow'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant={view === 'buy' ? "default" : "outline"}
                        onClick={() => setView('buy')}
                        className={view === 'buy' ? "bg-gradient-to-r from-cyan-500 to-blue-600" : "border-slate-700"}
                    >
                        <TrendingUp size={16} className="mr-2" /> Buy Items
                    </Button>
                    <Button
                        variant={view === 'sell' ? "default" : "outline"}
                        onClick={() => setView('sell')}
                        className={view === 'sell' ? "bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "border-slate-700"}
                    >
                        <ShoppingCart size={16} className="mr-2" /> Sell Items
                    </Button>
                    <Button
                        variant={view === 'my_offers' ? "default" : "outline"}
                        onClick={() => setView('my_offers')}
                        className={view === 'my_offers' ? "bg-gradient-to-r from-amber-500 to-orange-600 shadow-[0_0_15px_rgba(245,158,11,0.2)]" : "border-slate-700"}
                    >
                        <Package size={16} className="mr-2" /> My Offers
                    </Button>
                </div>
            </div>

            {view === 'sell' ? (
                <MarketSell />
            ) : (
                <>
                    {/* Search Bar (Only for Buy view) */}
                    {view === 'buy' && (
                        <div className="relative mb-6">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search items, sellers, or categories..."
                                className="w-full pl-12 pr-4 py-4 bg-slate-800/60 border-2 border-slate-700/50 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 backdrop-blur-sm"
                            />
                            <button className="absolute right-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg flex items-center gap-2 text-sm transition-colors">
                                <Filter size={14} /> Filters
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* Categories Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border-2 border-slate-700/50 p-4">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Package size={14} /> Categories
                                </h3>
                                <nav className="space-y-1">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-all flex items-center gap-3 ${selectedCategory === cat.id
                                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                                : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                                }`}
                                        >
                                            {cat.icon}
                                            {cat.name}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Listings Grid */}
                        <div className="lg:col-span-4">
                            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border-2 border-slate-700/50 overflow-hidden">
                                {/* Table Header */}
                                <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-700/50">
                                    <div className="col-span-4">Product</div>
                                    <div className="col-span-2">Stock</div>
                                    <div className="col-span-2">{view === 'buy' ? 'Seller' : 'Status'}</div>
                                    <div className="col-span-2">Price</div>
                                    <div className="col-span-2 text-right">Action</div>
                                </div>

                                {/* Table Body */}
                                <div className="divide-y divide-slate-700/30">
                                    {filteredItems.length === 0 ? (
                                        <div className="py-20 text-center text-slate-500 font-medium">
                                            No active listings {view === 'my_offers' ? 'for you.' : 'in this category.'}
                                        </div>
                                    ) : (
                                        filteredItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-700/20 transition-colors group"
                                            >
                                                <div className="col-span-4 flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-slate-900/50 border border-slate-700 rounded-lg flex items-center justify-center text-2xl group-hover:border-cyan-500/30 transition-colors">
                                                        {item.image}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                                                            {item.name}
                                                        </div>
                                                        <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 font-bold uppercase">
                                                            Q{item.quality} • {item.type}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-span-2 text-slate-400 font-medium font-mono">
                                                    {item.stock.toLocaleString()}
                                                </div>

                                                <div className="col-span-2">
                                                    <div className="flex items-center gap-2">
                                                        {view === 'buy' && item.sellerCountry && COUNTRY_CONFIG[item.sellerCountry] && (
                                                            <img src={COUNTRY_CONFIG[item.sellerCountry].flag} className="w-4 h-2.5 object-cover rounded shadow-sm border border-white/10" alt="" />
                                                        )}
                                                        <span className={`${view === 'buy' ? 'text-cyan-400 underline decoration-cyan-500/30' : 'text-emerald-400'} font-medium text-sm truncate`}>
                                                            {view === 'buy' ? item.seller : 'ESCROW ACTIVE'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="col-span-2">
                                                    <div className="flex items-center gap-1.5 font-bold text-amber-400">
                                                        <Coins size={14} />
                                                        {item.price.toFixed(2)}
                                                    </div>
                                                </div>

                                                <div className="col-span-2 text-right flex items-center justify-end gap-2">
                                                    {view === 'buy' ? (
                                                        <>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                max={item.stock}
                                                                className="w-12 h-8 bg-slate-900 border border-slate-700 rounded text-center text-xs font-mono text-cyan-400"
                                                                defaultValue="1"
                                                                id={`qty-${item.id}`}
                                                            />
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    const qty = (document.getElementById(`qty-${item.id}`) as HTMLInputElement)?.value;
                                                                    handleBuy({ ...item, quantity: Number(qty) });
                                                                }}
                                                                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 shadow-lg shadow-emerald-500/10 h-8 px-3 text-[10px]"
                                                            >
                                                                BUY (CRED)
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => cancelMarketListing(item.id)}
                                                            className="bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 transition-all font-bold text-[10px]"
                                                        >
                                                            CANCEL
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-4 text-sm">
                                <span className="text-slate-500">Showing {filteredItems.length} items</span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
