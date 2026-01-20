'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { CompanyProfile, COMPANY_TYPES } from '@/lib/models/CompanyModel';
import { Button } from '@/components/Button';
import {
    Factory,
    Construction,
    Users,
    Zap,
    Shield,
    Warehouse,
    PlusCircle,
    Layers,
} from 'lucide-react';
import { CompanyManager } from '@/components/game/CompanyManager';
import MyWorkplace from '@/components/game/MyWorkplace';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Search as SearchIcon, ArrowRightCircle, Package } from 'lucide-react';

export default function IndustrialPage() {
    const { companies, user, createCompany, applyForJob, fetchCompanies, fetchInventory } = useGameStore();
    const [activeTab, setActiveTab] = useState<'production' | 'workforce' | 'logistics' | 'research'>('production');
    const [activeWorkforceTab, setActiveWorkforceTab] = useState<'market' | 'workplace'>('workplace');
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [newCompanyType, setNewCompanyType] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [sectorFilter, setSectorFilter] = useState<'ALL' | 'RAW' | 'MFG'>('ALL');
    const [isLoading, setIsLoading] = useState(false);

    const userCompanies = companies.filter(c => {
        const ownerLower = c.owner?.toLowerCase();
        const addressLower = user?.address?.toLowerCase();
        return ownerLower === addressLower;
    });

    const selectedCompany = companies.find(c => c.id === selectedCompanyId);

    const handleCreate = async () => {
        if (!newCompanyName) return;
        await createCompany(newCompanyName, newCompanyType);
        setIsCreateModalOpen(false);
        setNewCompanyName('');
    };

    const TABS = [
        { id: 'production', name: 'Production', icon: Factory },
        { id: 'workforce', name: 'Workforce', icon: Users },
        { id: 'logistics', name: 'Logistics', icon: Warehouse },
        { id: 'research', name: 'R&D Lab', icon: Layers },
    ] as const;

    const handleApply = async (companyId: number) => {
        const { idsConfirm } = useGameStore.getState();
        const confirmed = await idsConfirm("Are you sure you want to apply for this job?", "Job Application", "info");
        if (!confirmed) return;

        setIsLoading(true);
        try {
            await applyForJob(companyId);
            setTimeout(() => setActiveWorkforceTab('workplace'), 1000);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">

            {/* Tab Navigation */}
            <div className="flex items-center gap-1 p-1 bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-x-auto no-scrollbar">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-slate-700 text-white shadow-lg'
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                            }`}
                    >
                        <tab.icon size={18} className={activeTab === tab.id ? 'text-cyan-400' : 'text-slate-500'} />
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[600px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'production' && (
                        <motion.div
                            key="production"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid grid-cols-12 gap-6"
                        >
                            {/* Left: Company List */}
                            <div className="col-span-12 lg:col-span-4 space-y-4">
                                <div className="flex items-center justify-between mb-2 px-2">
                                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Construction size={14} className="text-cyan-500" /> Operational Units
                                    </h2>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-8 text-[9px] border-cyan-500/20 text-cyan-400 font-black uppercase hover:bg-cyan-500/5 transition-all"
                                        onClick={() => setIsCreateModalOpen(true)}
                                    >
                                        <PlusCircle size={14} className="mr-1" /> New Entry
                                    </Button>
                                </div>

                                <div className="space-y-3 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
                                    {userCompanies.length === 0 ? (
                                        <div className="bg-slate-900/40 rounded-2xl p-10 border border-dashed border-slate-700/50 text-center">
                                            <Factory size={40} className="mx-auto text-slate-700 mb-4 opacity-50" />
                                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No assets registered.</p>
                                            <Button className="mt-6 bg-slate-800 text-[9px] font-black uppercase tracking-widest" onClick={() => setIsCreateModalOpen(true)}>Start Production</Button>
                                        </div>
                                    ) : (
                                        userCompanies.map(company => (
                                            <div
                                                key={company.id}
                                                onClick={() => setSelectedCompanyId(company.id)}
                                                className={`group cursor-pointer p-5 rounded-xl border transition-all ${selectedCompanyId === company.id
                                                    ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.05)]'
                                                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/30 hover:border-slate-600'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${selectedCompanyId === company.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-900 text-slate-500 group-hover:bg-slate-800'}`}>
                                                            {company.type < 10 ? <Zap size={20} /> : <Shield size={20} />}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xs font-black text-white uppercase tracking-tight">{company.name}</h3>
                                                            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                                                {COMPANY_TYPES[company.type]?.name || 'Unit'} • Q{company.quality}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`text-xs font-mono font-bold ${selectedCompanyId === company.id ? 'text-cyan-400' : 'text-slate-300'}`}>{company.stocks.product}</div>
                                                        <div className="text-[8px] text-slate-600 font-black uppercase">STOCKS</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Right: Company Management View */}
                            <div className="col-span-12 lg:col-span-8">
                                {selectedCompany ? (
                                    <CompanyManager company={selectedCompany} />
                                ) : (
                                    <div className="bg-slate-900/40 rounded-[2rem] border-2 border-dashed border-slate-700/50 h-[700px] flex flex-col items-center justify-center text-slate-500 space-y-4">
                                        <Factory size={48} className="opacity-10 translate-y-2 text-slate-600" />
                                        <div className="text-center">
                                            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Registry ID Required</p>
                                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Select an operational unit to access systems.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'workforce' && (
                        <motion.div
                            key="workforce"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Inner Sub-tabs */}
                            <div className="flex p-1.5 bg-slate-950/40 rounded-xl border border-slate-800 w-fit mx-auto shadow-inner">
                                <button
                                    onClick={() => setActiveWorkforceTab('workplace')}
                                    className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeWorkforceTab === 'workplace' ? 'bg-slate-800 text-white shadow-lg border border-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    My Workplace
                                </button>
                                <button
                                    onClick={() => setActiveWorkforceTab('market')}
                                    className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeWorkforceTab === 'market' ? 'bg-slate-800 text-white shadow-lg border border-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    Job Market
                                </button>
                            </div>

                            {activeWorkforceTab === 'workplace' ? (
                                <MyWorkplace />
                            ) : (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex flex-col md:flex-row gap-4">
                                        <div className="relative flex-1">
                                            <SearchIcon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" />
                                            <input
                                                type="text"
                                                placeholder="SEARCH EMPLOYMENT CONTRACTS..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-xs font-bold text-white focus:outline-none focus:border-cyan-500/30 transition-all uppercase tracking-wider"
                                            />
                                        </div>
                                        <div className="flex p-1.5 bg-slate-950/50 rounded-xl border border-slate-800 shadow-inner">
                                            {(['ALL', 'RAW', 'MFG'] as const).map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setSectorFilter(opt)}
                                                    className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${sectorFilter === opt ? 'bg-slate-800 text-white shadow-md border border-white/5' : 'text-slate-500 hover:text-slate-300'}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {companies
                                            .filter(c => {
                                                const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || String(c.id).includes(searchQuery.toLowerCase());
                                                const matchesSector = sectorFilter === 'ALL' || (sectorFilter === 'RAW' ? c.type < 10 : c.type >= 11);
                                                return matchesSearch && matchesSector;
                                            })
                                            .map(company => (
                                                <JobListingCard key={company.id} company={company} onApply={handleApply} isLoading={isLoading} />
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'logistics' && (
                        <motion.div
                            key="logistics"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-slate-900/40 rounded-[2rem] border border-slate-700/50 p-20 text-center shadow-inner"
                        >
                            <Warehouse className="mx-auto text-slate-700 mb-6 opacity-20" size={48} />
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Regional Logistics Vault</h3>
                            <p className="text-[10px] text-slate-500 mt-2 max-w-sm mx-auto font-bold uppercase tracking-widest leading-relaxed">Secure asset vault for inter-regional trade and industrial surplus. Systems are currently under maintenance.</p>
                            <Button className="mt-10 bg-slate-800/50 text-slate-600 border border-slate-700/50 h-12 px-10 text-[10px] uppercase font-black tracking-widest cursor-not-allowed" disabled>LOCKED BY GOVERNANCE</Button>
                        </motion.div>
                    )}

                    {activeTab === 'research' && (
                        <motion.div
                            key="research"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-slate-900/40 rounded-[2rem] border border-slate-700/50 p-20 text-center shadow-inner"
                        >
                            <Layers className="mx-auto text-slate-700 mb-6 opacity-20" size={48} />
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Advanced Infrastructure R&D</h3>
                            <p className="text-[10px] text-slate-500 mt-2 max-w-sm mx-auto font-bold uppercase tracking-widest leading-relaxed">Construct Hospitals, Defense Satellites, and Research Complexes. Blueprint authorization required.</p>
                            <Button className="mt-10 bg-slate-800/50 text-slate-600 border border-slate-700/50 h-12 px-10 text-[10px] uppercase font-black tracking-widest cursor-not-allowed" disabled>BLUEPRINT REQUIRED</Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Create Company Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    {/* ... existing modal code ... */}
                    <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-black text-white mb-6">Create New Company</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Company Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-cyan-500 transition-colors"
                                    value={newCompanyName}
                                    onChange={(e) => setNewCompanyName(e.target.value)}
                                    placeholder="Enter company name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Business Type</label>
                                <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                                    {Object.entries(COMPANY_TYPES).map(([id, info]) => (
                                        <button
                                            key={id}
                                            onClick={() => setNewCompanyType(Number(id))}
                                            className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${newCompanyType === Number(id)
                                                ? 'bg-cyan-500/20 border-cyan-500 text-white'
                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                                }`}
                                        >
                                            <span className="text-lg">{info.icon}</span>
                                            {info.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                                <span className="text-slate-400 text-sm">Initial Investment:</span>
                                <span className={`float-right font-mono font-bold ${user?.isAdmin ? 'text-cyan-400 animate-pulse' : 'text-emerald-400'}`}>
                                    {user?.isAdmin ? 'FREE (ADMIN)' : '1000.00 SUPRA'}
                                </span>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Button className="flex-1 bg-slate-700 hover:bg-slate-600" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500 font-black uppercase text-[10px] tracking-widest" onClick={handleCreate}>Create Company</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function JobListingCard({ company, onApply, isLoading }: { company: CompanyProfile, onApply: (id: number) => void, isLoading: boolean }) {
    const typeInfo = COMPANY_TYPES[company.type];

    return (
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/30 transition-all group shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-cyan-400 border border-slate-700 group-hover:bg-slate-800 group-hover:border-cyan-500/20 transition-all">
                        {company.type < 10 ? <Package size={24} /> : <Shield size={24} />}
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight">{company.name}</h3>
                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Region {company.regionId}</div>
                    </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-all">
                    <ArrowRightCircle size={18} />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                    <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Sector</div>
                    <div className="text-xs font-mono text-cyan-400 font-bold leading-none uppercase">
                        {typeInfo?.name || 'Industrial'}
                    </div>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                    <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1">Quality</div>
                    <div className="text-xs font-mono text-amber-500 font-bold leading-none uppercase">
                        Grade {company.quality}
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
