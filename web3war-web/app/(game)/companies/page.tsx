'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { Company, CompanyType, COMPANY_TYPES_CONFIG } from '@/lib/types';
import { Button } from '@/components/Button';
import {
    Building,
    Briefcase,
    Factory,
    Search,
    ChevronRight,
    SearchIcon,
    ArrowRightCircle,
    Building2,
    Users,
    Package,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MyCompanies from '@/components/game/MyCompanies';
import MyWorkplace from '@/components/game/MyWorkplace';

export default function JobMarketPage() {
    const { companies, fetchCompanies, fetchInventory, user, applyForJob } = useGameStore();
    const [activeTab, setActiveTab] = useState<'browser' | 'workplace' | 'mycompanies'>('mycompanies');
    const [searchQuery, setSearchQuery] = useState('');
    const [sectorFilter, setSectorFilter] = useState('ALL');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchCompanies();
        fetchInventory();
    }, []);

    const TABS = [
        { id: 'browser', name: 'Job Market', icon: Search },
        { id: 'workplace', name: 'My Workplace', icon: Briefcase },
        { id: 'mycompanies', name: 'My Industry', icon: Factory },
    ] as const;

    const handleApply = async (companyId: string) => {
        if (!confirm("Are you sure you want to apply for this job?")) return;
        setIsLoading(true);
        try {
            await applyForJob(companyId);
            setTimeout(() => setActiveTab('workplace'), 1000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12 px-4 md:px-8">
            {/* Industrial Style Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-800/60 backdrop-blur-md rounded-2xl p-8 border border-slate-700/50 shadow-xl mt-4">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-4 tracking-tighter">
                        <Building2 className="text-cyan-400" size={36} />
                        CORPORATE REGISTRY
                    </h1>
                    <p className="text-slate-400 mt-1 font-bold uppercase text-[10px] tracking-[0.2em] opacity-80">
                        National Enterprise Management & Employment Protocol
                    </p>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 opacity-60">Capital Balance</div>
                        <div className="text-2xl font-mono text-emerald-400 font-bold tracking-tighter">
                            {user?.credits.toFixed(2)} <span className="text-xs opacity-60 ml-1">CRED</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Industrial Style Tab Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-900/50 rounded-2xl border border-slate-700/50 shadow-inner">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-slate-700 text-white shadow-lg border border-white/5'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                            }`}
                    >
                        <tab.icon size={18} className={`${activeTab === tab.id ? 'text-cyan-400' : 'text-slate-500'} transition-colors`} />
                        <span className="uppercase tracking-widest text-[11px] font-black">{tab.name}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'browser' && (
                        <motion.div
                            key="browser"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search by company name or region..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-slate-900/40 border border-slate-700/50 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-cyan-500/50 font-bold transition-all"
                                    />
                                </div>
                                <div className="flex p-1 bg-slate-900/40 rounded-xl border border-slate-700/50">
                                    {['ALL', 'RAW', 'MFG'].map((opt) => (
                                        <button
                                            key={opt}
                                            onClick={() => setSectorFilter(opt)}
                                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${sectorFilter === opt ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {companies
                                    .filter(c => {
                                        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.region.toLowerCase().includes(searchQuery.toLowerCase());
                                        const matchesSector = sectorFilter === 'ALL' || (sectorFilter === 'RAW' ? c.type.includes('RAW') : c.type.includes('MFG'));
                                        const hasJob = c.jobOffer?.active && c.jobOffer.positions > 0;
                                        return matchesSearch && matchesSector && hasJob;
                                    })
                                    .map(company => (
                                        <JobListingCard key={company.id} company={company} onApply={handleApply} isLoading={isLoading} />
                                    ))
                                }
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'workplace' && (
                        <motion.div
                            key="workplace"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <MyWorkplace />
                        </motion.div>
                    )
                    }

                    {activeTab === 'mycompanies' && (
                        <motion.div
                            key="mycompanies"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <MyCompanies />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function JobListingCard({ company, onApply, isLoading }: { company: Company, onApply: (id: string) => void, isLoading: boolean }) {
    const config = COMPANY_TYPES_CONFIG[company.type];

    return (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all group">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-cyan-400 border border-slate-700 group-hover:bg-slate-800 group-hover:border-cyan-500/20 transition-all">
                        {company.type.includes('RAW') ? <Package size={24} /> : <Shield size={24} />}
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight">{company.name}</h3>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{company.region} Territory</div>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all">
                    <ArrowRightCircle size={18} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                    <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Wage</div>
                    <div className="text-lg font-mono text-emerald-400 font-bold leading-none">
                        {company.jobOffer?.salary.toFixed(1)} <span className="text-[10px] opacity-60">CRED</span>
                    </div>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                    <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Slots</div>
                    <div className="text-lg font-mono text-cyan-400 font-bold leading-none">
                        {company.jobOffer?.positions} <span className="text-[10px] opacity-60">FHD</span>
                    </div>
                </div>
            </div>

            <Button
                onClick={() => onApply(company.id)}
                disabled={isLoading}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl h-12 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-cyan-900/10"
            >
                Execute Contract
            </Button>
        </div>
    );
}
