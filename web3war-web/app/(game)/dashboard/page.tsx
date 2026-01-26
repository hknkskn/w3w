'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { Button } from '@/components/Button';
import { SocialFeed } from '@/components/game/SocialFeed';
import { NewspaperWidget } from '@/components/game/NewspaperWidget';
import { DailyTasksWidget } from '@/components/game/DailyTasksWidget';
import { InventoryWidget } from '@/components/game/InventoryWidget';
import { AdminToolkit } from '@/components/game/AdminToolkit';
import {
    Briefcase,
    TrendingUp,
    Swords,
    Shield,
    Clock,
    Trophy,
    Target,
    Users,
    AlertTriangle
} from 'lucide-react';
import { CountryId, COUNTRY_CONFIG, COUNTRY_IDS } from '@/lib/types';
import {
    IDSCard,
    IDSLabel,
    IDSQuickLink,
    IDSMissionIcon
} from '@/components/ui/ids';
import { TacticalAvatar } from '@/components/game/TacticalAvatar';
import { AllianceService } from '@/lib/services/alliance.service';
import { MarketService } from '@/lib/services/market.service';
import { useTranslation } from '@/lib/i18n';

export default function DashboardPage() {
    const { user, login, facilities } = useGameStore();
    const { t } = useTranslation();
    const [isMounted, setIsMounted] = useState(false);
    const [pendingAlliances, setPendingAlliances] = useState<any[]>([]);
    const [allMarketItems, setAllMarketItems] = useState<any[]>([]);
    const [marketTrends, setMarketTrends] = useState<any[]>([]);
    const prevPricesRef = useRef<Record<number, number>>({});
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        setIsMounted(true);
        if (!user) {
            login('Haknsken', 'TR', '0xMockWalletAddress');
        }
    }, [user, login]);

    const fetchDashboardIntelligence = async () => {
        if (!user?.address) return;
        try {
            // 0. Load price history from storage on first run if Ref is empty
            if (Object.keys(prevPricesRef.current).length === 0) {
                const saved = localStorage.getItem('w3w_market_prices');
                if (saved) prevPricesRef.current = JSON.parse(saved);
            }

            // 1. Fetch Political Alerts (MPPs)
            const pending = await AllianceService.getMyPendingProposals(user.address);
            setPendingAlliances(pending || []);

            // 2. Fetch ALL Market Categories (Live Data)
            const categories = [1, 2, 3, 4]; // Food, Weapon, Raw, Ticket
            const allPromises = categories.map(cat => MarketService.getMarketListingsByCategory(cat));
            const categoryResults = await Promise.all(allPromises);

            // Normalize using the service mapper to ensure correct field names (item.id instead of item_id)
            const allListings = categoryResults.flatMap(res => MarketService.mapToMarketListings(res));

            // 3. Aggregate Lowest Prices by Item ID
            const itemMap: Record<number, { name: string, price: number, id: number }> = {};

            allListings.forEach((listing: any) => {
                const itemId = Number(listing.item?.id);
                const price = Number(listing.pricePerUnit);

                if (!itemId || isNaN(itemId)) return;

                if (!itemMap[itemId] || price < itemMap[itemId].price) {
                    itemMap[itemId] = {
                        id: itemId,
                        name: listing.item?.name || `Item ${itemId}`,
                        price: price
                    };
                }
            });

            // Map item IDs to readable names based on common game IDs
            const itemNames: Record<number, string> = {
                101: t('items.grain'), 102: t('items.iron_ore'), 103: t('items.oil'), 104: t('items.aluminum'),
                201: t('items.food_q1'), 202: t('items.weapon_q1'), 203: t('items.flight_ticket'), 204: t('items.weapon_q2')
            };

            const items = Object.values(itemMap).map(item => {
                const prevPrice = prevPricesRef.current[item.id];
                let changeStr = '+0.00%';

                if (prevPrice && prevPrice !== item.price) {
                    const diff = ((item.price - prevPrice) / prevPrice) * 100;
                    const sign = diff >= 0 ? '+' : '';
                    changeStr = `${sign}${diff.toFixed(2)}%`;
                }

                return {
                    ...item,
                    name: itemNames[item.id] || item.name,
                    change: changeStr
                };
            });

            // Update price history for next session comparison
            const newPriceMap: Record<number, number> = {};
            Object.values(itemMap).forEach(item => { newPriceMap[item.id] = item.price; });
            prevPricesRef.current = newPriceMap;
            localStorage.setItem('w3w_market_prices', JSON.stringify(newPriceMap));

            // Final fallback if market is empty - show some baseline mock data
            if (items.length === 0) {
                setAllMarketItems([
                    { id: 201, name: 'Food Q1', price: 0.50, change: '+0%' },
                    { id: 202, name: 'Weapon Q1', price: 1.25, change: '+0%' },
                    { id: 102, name: 'Iron Ore', price: 0.18, change: '+0%' }
                ]);
            } else {
                setAllMarketItems(items);
            }
        } catch (e) {
            console.error("Dashboard intel failed", e);
        }
    };

    // Rotation Logic: Every 10 seconds, move to next 3 items
    useEffect(() => {
        if (allMarketItems.length === 0) return;

        const rotate = () => {
            setCurrentIndex(prev => (prev + 3) % allMarketItems.length);
        };

        const timer = setInterval(rotate, 10000);
        return () => clearInterval(timer);
    }, [allMarketItems.length]);

    // Update currently visible trends
    useEffect(() => {
        if (allMarketItems.length > 0) {
            const end = currentIndex + 3;
            let slice = allMarketItems.slice(currentIndex, end);

            // Wrap around if not enough items
            if (slice.length < 3) {
                slice = [...slice, ...allMarketItems.slice(0, 3 - slice.length)];
            }

            setMarketTrends(slice);
        }
    }, [currentIndex, allMarketItems]);

    useEffect(() => {
        if (user?.address) {
            fetchDashboardIntelligence();
            const interval = setInterval(fetchDashboardIntelligence, 30000); // 30s
            return () => clearInterval(interval);
        }
    }, [user?.address]);

    if (!isMounted || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen text-slate-400 font-mono text-sm">
                {t('common.loading')}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Political Alerts Layer */}
            {pendingAlliances.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-500/10 border-2 border-amber-500/30 rounded-xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(245,158,11,0.1)]"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 animate-pulse">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <div className="text-sm font-black text-white uppercase tracking-wider">{t('dashboard.diplomatic_emergency', {}, 'Diplomatic Emergency')}</div>
                            <div className="text-xs text-amber-200/70">{t('dashboard.pending_proposals', { count: pendingAlliances.length }, `You have ${pendingAlliances.length} pending Alliance (MPP) proposals.`)}</div>
                        </div>
                    </div>
                    <Link href="/politics">
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-500 text-white border-amber-400/20 shadow-lg">
                            {t('dashboard.review_proposals')}
                        </Button>
                    </Link>
                </motion.div>
            )}

            {/* Main 3-Column Layout */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left Sidebar - Profile & Inventory */}
                <div className="col-span-12 lg:col-span-3 space-y-6">
                    <ProfileCard user={user} facilities={facilities} />
                    <InventoryWidget />

                    <IDSCard noPadding className="overflow-hidden divide-y divide-slate-700/30">
                        <IDSQuickLink icon={<span>🏛️</span>} label={t('nav.politics')} href="/politics" hasArrow />
                        <IDSQuickLink icon={<span>🎯</span>} label={t('nav.training_grounds')} href="/training" hasArrow />
                        <IDSQuickLink icon={<Swords size={14} />} label={t('nav.wars_campaigns')} href="/wars" hasArrow />
                        <IDSQuickLink icon={<span>🏗️</span>} label={t('nav.industrial_center')} href="/industrial" hasArrow />
                        <IDSQuickLink icon={<Trophy size={14} />} label={t('nav.reward_center')} href="/rewards" hasArrow />
                        <IDSQuickLink icon={<Briefcase size={14} />} label={t('nav.companies')} href="/companies" hasArrow />
                    </IDSCard>

                    <AdminToolkit />
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
                    <IDSCard className="bg-slate-900/40 border-slate-700/50 shadow-inner">
                        <IDSLabel color="bright" size="sm" className="mb-4 flex items-center gap-2">
                            <TrendingUp size={14} className="text-cyan-400" />
                            {t('dashboard.market_intelligence')}
                        </IDSLabel>
                        <div className="space-y-4">
                            {(marketTrends.length > 0 ? marketTrends : [
                                { name: 'Food Q1', price: 0.45, change: '+0%' },
                                { name: 'Weapon Q1', price: 1.20, change: '+0%' },
                                { name: 'Iron Ore', price: 0.15, change: '+0%' }
                            ]).map((trend, i) => (
                                <div key={i} className="flex justify-between items-center group">
                                    <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">{trend.name}</span>
                                    <div className="text-right">
                                        <div className="text-xs font-mono font-bold text-white">{trend.price.toFixed(2)} CRED</div>
                                        <div className={`text-right text-[10px] font-black ${trend.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {trend.change}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="ghost" size="sm" className="w-full mt-4 text-[10px] uppercase tracking-tighter text-slate-500 hover:text-cyan-400">
                            {t('dashboard.full_analysis')}
                        </Button>
                    </IDSCard>

                    <SocialFeed />
                </div>

            </div>
        </div>
    );
}

function ProfileCard({ user, facilities }: { user: any, facilities: any[] }) {
    const { t } = useTranslation();
    if (!user) return null;

    const energy = user.energy || 0;
    const maxEnergy = user.maxEnergy || 200;
    const energyPercent = maxEnergy > 0 ? (energy / maxEnergy) * 100 : 0;

    const countryCode = (Object.keys(COUNTRY_IDS) as CountryId[]).find(k => COUNTRY_IDS[k] === user.countryId) || 'TR' as CountryId;
    const countryConfig = COUNTRY_CONFIG[countryCode];

    return (
        <IDSCard noPadding className="overflow-hidden shadow-2xl">
            {/* Header with Avatar */}
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-950 p-4">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 bg-slate-950 rounded-2xl border-2 border-slate-700/50 overflow-hidden shadow-xl flex items-center justify-center">
                            <TacticalAvatar
                                seed={user.avatarSeed || user.username}
                                size={64}
                                showBackground={false}
                            />
                        </div>
                        {countryConfig && (
                            <img
                                src={countryConfig.flag}
                                className="absolute -bottom-1 -right-1 w-6 h-4 object-cover rounded shadow-lg border border-white/20"
                                alt=""
                            />
                        )}
                        <div className="absolute -top-1 -left-1 bg-cyan-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg border border-cyan-400/30">
                            {user.level || 1}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button className="w-9 h-9 bg-slate-900/80 hover:bg-slate-800/80 hover:text-cyan-400 rounded-lg flex items-center justify-center text-slate-500 transition-all border border-slate-700/50 shadow-sm active:scale-90">
                            <img src="/icons/dashboard.webp" className="w-4 h-4 object-contain opacity-50 hover:opacity-100" alt="" />
                        </button>
                        <button className="w-9 h-9 bg-slate-900/80 hover:bg-slate-800/80 hover:text-cyan-400 rounded-lg flex items-center justify-center text-slate-500 transition-all border border-slate-700/50 shadow-sm active:scale-90">
                            <img src="/icons/Training.webp" className="w-4 h-4 object-contain opacity-50 hover:opacity-100" alt="" />
                        </button>
                        <button className="w-9 h-9 bg-slate-900/80 hover:bg-slate-800/80 hover:text-cyan-400 rounded-lg flex items-center justify-center text-slate-500 transition-all border border-slate-700/50 shadow-sm active:scale-90 relative">
                            <img src="/icons/industrial2.webp" className="w-4 h-4 object-contain opacity-50 hover:opacity-100" alt="" />
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-600 rounded-full text-[9px] text-white font-black flex items-center justify-center ring-2 ring-slate-800 shadow-lg">1</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Energy Section */}
            <div className="px-4 py-3 bg-slate-900/50 border-y border-slate-700/30">
                <div className="flex items-center gap-3">
                    <img src="/icons/energie.webp" className="w-5 h-5 object-contain" alt="Energy" />
                    <div className="flex-1 h-5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative shadow-inner">
                        <motion.div
                            className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-orange-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${energyPercent}%` }}
                            transition={{ duration: 1 }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow-md tracking-widest font-mono">
                            {energy} / {maxEnergy}
                        </span>
                    </div>
                </div>
            </div>

            {/* Currencies */}
            <div className="px-4 py-3 space-y-2.5 bg-slate-900/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 shadow-inner">
                            <img src="/icons/supralogo.webp" className="w-4 h-4 object-contain" alt="" />
                        </span>
                        <span className="font-black text-white font-mono leading-none">{(user.supraBalance || 0).toFixed(2)}</span>
                    </div>
                    <IDSLabel color="dim" size="xs">SUPRA</IDSLabel>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                            <img src="/icons/money.png" className="w-4 h-4 object-contain" alt="" />
                        </span>
                        <span className="font-black text-white font-mono leading-none">{(user.credits || 0).toFixed(2)}</span>
                    </div>
                    <IDSLabel color="dim" size="xs">CRED</IDSLabel>
                </div>
            </div>

            <IDSQuickLink icon={<span>📋</span>} label={t('dashboard.daily_challenge')} href="/training" hasArrow className="bg-slate-950/30 border-t border-slate-700/30" />

            <div className="p-4 bg-slate-950/20">
                <IDSLabel color="dim" size="xs" className="mb-3">{t('dashboard.missions_status')}</IDSLabel>
                <div className="grid grid-cols-4 gap-2.5">
                    <IDSMissionIcon icon={<img src="/icons/Training.webp" className="w-4 h-4 object-contain" alt="" />} progress={facilities[0]?.quality || 1} max={5} href="/training" />
                    <IDSMissionIcon icon={<img src="/icons/industrial2.webp" className="w-4 h-4 object-contain" alt="" />} done={!!user.employerId} href="/companies" />
                    <IDSMissionIcon icon={<img src="/icons/weapon.webp" className="w-4 h-4 object-contain" alt="" />} href="/wars" />
                    <IDSMissionIcon icon={<img src="/icons/Worldmap.webp" className="w-4 h-4 object-contain" alt="" />} href="/profile" />
                </div>
            </div>
        </IDSCard>
    );
}
