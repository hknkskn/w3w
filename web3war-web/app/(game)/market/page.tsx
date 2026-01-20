'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import { ShoppingCart, TrendingUp, Package, Search, Filter, Star, Coins, Sword, Beef, Ticket, Home, Pickaxe } from 'lucide-react';
import { MarketSell } from '@/components/game/MarketSell';
import { CountryId, COUNTRY_CONFIG } from '@/lib/types';

export default function MarketPage() {
    const searchParams = useSearchParams();
    const { marketItems, myListings, buyItem, user, cancelMarketListing, fetchMarketItems, fetchMyListings, fetchInventory } = useGameStore();
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Initialize view from URL param
    const initialView = searchParams.get('view') as 'buy' | 'sell' | 'my_offers' || 'buy';
    const [view, setView] = useState<'buy' | 'sell' | 'my_offers'>(initialView);

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
        { id: 'all', name: 'All Items', icon: <Package size={18} /> },
        { id: 'weapons', name: 'Weapons', icon: <Sword size={18} />, catId: 12 },
        { id: 'food', name: 'Food', icon: <Beef size={18} />, catId: 11 },
        { id: 'tickets', name: 'Tickets', icon: <Ticket size={18} />, catId: 13 },
        { id: 'raw', name: 'Raw Materials', icon: <Pickaxe size={18} /> },
    ];

    const filteredItems = view === 'buy'
        ? (selectedCategory === 'all'
            ? marketItems
            : marketItems.filter(l => {
                const catInfo = categories.find(c => c.id === selectedCategory);
                if (selectedCategory === 'raw') return l.item.category <= 4;
                return l.item.category === catInfo?.catId;
            }))
        : myListings;

    const handleBuy = (listing: any, quantity: number) => {
        if (!user) {
            alert("Please login first!");
            return;
        }
        buyItem(listing.listingId, quantity);
    };

    return (
        <div className="space-y-4 animate-in fade-in duration-500 pb-12 mt-2">

            {/* HD Tab Navigation */}
            <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-lg border border-slate-800 overflow-x-auto no-scrollbar">
                {[
                    { id: 'buy', label: 'Procurement', icon: <TrendingUp size={14} />, color: 'text-cyan-400' },
                    { id: 'sell', label: 'Liquidation', icon: <ShoppingCart size={14} />, color: 'text-emerald-400' },
                    { id: 'my_offers', label: 'Escrow', icon: <Package size={14} />, color: 'text-amber-400' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setView(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-2 rounded-md font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${view === tab.id
                            ? 'bg-slate-800 text-white shadow-lg border border-slate-700'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                            }`}
                    >
                        <span className={view === tab.id ? tab.color : 'text-slate-600'}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {view === 'sell' ? (
                <div className="animate-in fade-in duration-300">
                    <MarketSell />
                </div>
            ) : (
                <div className="grid grid-cols-12 gap-4 items-start">
                    {/* Compact Categories Sidebar */}
                    <div className="col-span-12 lg:col-span-3 space-y-3">
                        <h2 className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] px-2">Facility Registry</h2>
                        <div className="space-y-0.5">
                            {categories.map((cat) => (
                                <div
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-md border transition-all cursor-pointer group ${selectedCategory === cat.id
                                        ? 'bg-cyan-500/5 border-cyan-500/30'
                                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-md flex items-center justify-center text-sm transition-all ${selectedCategory === cat.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-950 text-slate-600'}`}>
                                        {cat.icon}
                                    </div>
                                    <span className={`text-[11px] font-black uppercase tracking-tight ${selectedCategory === cat.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                        {cat.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* HD Listings Grid */}
                    <div className="col-span-12 lg:col-span-9 space-y-4">
                        {/* Search Bar - HD */}
                        <div className="relative group">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyan-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="SEARCH MARKET INVENTORY..."
                                className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-black text-white placeholder:text-slate-700 tracking-widest focus:outline-none focus:border-cyan-500/30 transition-all shadow-inner uppercase"
                            />
                        </div>

                        {/* HD Registry Table */}
                        <div className="bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
                            <div className="grid grid-cols-12 px-6 py-2 bg-slate-900 border-b border-slate-800 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                                <div className="col-span-5">Product Matrix</div>
                                <div className="col-span-2 text-center">Available</div>
                                <div className="col-span-2 text-center">Price (CRED)</div>
                                <div className="col-span-3 text-right">Verification</div>
                            </div>

                            <div className="divide-y divide-slate-800/50">
                                {filteredItems.length === 0 ? (
                                    <div className="py-20 text-center">
                                        <Package size={32} className="mx-auto text-slate-800 mb-2 opacity-20" />
                                        <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.3em]">No Active Listings</p>
                                    </div>
                                ) : (
                                    filteredItems.map((listing) => (
                                        <div
                                            key={listing.id}
                                            className="grid grid-cols-12 px-6 py-3.5 items-center hover:bg-slate-800/40 transition-all group h-18"
                                        >
                                            <div className="col-span-5 flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center text-3xl group-hover:border-cyan-500/20 transition-all">
                                                    {listing.item.image}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[13px] font-black text-white uppercase tracking-tight truncate leading-none mb-1 group-hover:text-cyan-400 transition-colors">
                                                        {listing.item.name}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest leading-none border border-slate-800 px-1 py-0.5 rounded-sm">Q{listing.item.quality} • {listing.item.category}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-span-2 text-center">
                                                <div className="text-sm font-bold font-mono text-white tabular-nums">
                                                    {listing.item.quantity.toLocaleString()}
                                                </div>
                                                <div className="text-[8px] text-slate-600 font-black uppercase">UNITS</div>
                                            </div>

                                            <div className="col-span-2 text-center">
                                                <div className="flex items-center justify-center gap-1.5 font-black text-amber-500 tabular-nums text-base font-mono">
                                                    {listing.pricePerUnit.toFixed(2)}
                                                </div>
                                            </div>

                                            <div className="col-span-3 flex items-center justify-end gap-2">
                                                {view === 'buy' ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            max={listing.item.quantity}
                                                            className="w-10 h-8 bg-slate-950 border border-slate-800 rounded text-center text-[11px] font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-500/30"
                                                            defaultValue="1"
                                                            id={`qty-${listing.id}`}
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const qty = (document.getElementById(`qty-${listing.id}`) as HTMLInputElement)?.value;
                                                                handleBuy(listing, Number(qty));
                                                            }}
                                                            className="h-8 px-5 bg-emerald-600 hover:bg-emerald-500 text-[10px] font-black text-white rounded active:scale-95 transition-all uppercase tracking-widest shadow-lg"
                                                        >
                                                            BUY
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => cancelMarketListing(listing.id)}
                                                        className="h-8 px-4 bg-slate-800 hover:bg-red-600 text-[9px] font-black text-slate-400 hover:text-white border border-slate-700 hover:border-red-500 rounded transition-all uppercase tracking-widest"
                                                    >
                                                        CANCEL
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
