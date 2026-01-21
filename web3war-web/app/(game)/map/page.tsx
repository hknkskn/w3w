'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { CountryId, COUNTRY_CONFIG, COUNTRY_IDS } from '@/lib/types';

// Dynamic import to avoid SSR issues with react-simple-maps
const WorldMapContainer = dynamic(
    () => import('@/components/game/world-map').then(mod => mod.WorldMapContainer),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-[650px] bg-slate-900 rounded-xl flex items-center justify-center border-2 border-slate-700">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                    <span className="text-slate-400 text-sm">Loading World Map...</span>
                </div>
            </div>
        )
    }
);

export default function MapPage() {
    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white">World Map</h1>
                    <p className="text-sm text-slate-400">View territories, plan attacks, and travel the world</p>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span>Live - 1,247 players online</span>
                    </div>
                </div>
            </div>

            {/* The Map */}
            <WorldMapContainer />

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4">
                <QuickStat label="Total Countries" value="195" />
                <QuickStat label="Controlled Territories" value="52" />
                <QuickStat label="Active Wars" value="12" />
                <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                    <div className="text-xs text-slate-400 mb-1">Your Location</div>
                    <div className="text-lg font-bold text-white flex items-center gap-2">
                        {useGameStore.getState().user?.countryId && COUNTRY_CONFIG[Object.keys(COUNTRY_IDS).find(k => COUNTRY_IDS[k as CountryId] === useGameStore.getState().user?.countryId) as CountryId] ? (
                            <>
                                <img src={COUNTRY_CONFIG[Object.keys(COUNTRY_IDS).find(k => COUNTRY_IDS[k as CountryId] === useGameStore.getState().user?.countryId) as CountryId].flag} className="w-5 h-3 object-cover rounded shadow-sm border border-white/10" alt="" />
                                <span>{COUNTRY_CONFIG[Object.keys(COUNTRY_IDS).find(k => COUNTRY_IDS[k as CountryId] === useGameStore.getState().user?.countryId) as CountryId].name}</span>
                            </>
                        ) : (
                            <span>Unknown Location</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function QuickStat({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <div className="text-xs text-slate-400 mb-1">{label}</div>
            <div className="text-xl font-bold text-white">{value}</div>
        </div>
    );
}
