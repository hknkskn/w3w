'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/store';
import { Company, CompanyType, COMPANY_TYPES_CONFIG } from '@/lib/types';
import { Button } from '@/components/Button';
import {
    Factory,
    Construction,
    TrendingUp,
    Users,
    Zap,
    Shield,
    Package,
    PlusCircle,
    Building2,
    ChevronRight,
    Trophy,
    Boxes
} from 'lucide-react';
import { CompanyManager } from './CompanyManager';

export default function MyCompanies() {
    const { companies, user, createCompany } = useGameStore();
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [newCompanyType, setNewCompanyType] = useState<CompanyType>('RAW_GRAIN');

    // Filter companies owned by the user
    const userCompanies = companies.filter(c => {
        const ownerLower = c.ownerId?.toLowerCase();
        const userIdLower = user?.id?.toLowerCase();
        const walletLower = user?.walletAddress?.toLowerCase();
        return ownerLower === userIdLower || ownerLower === walletLower;
    });

    const selectedCompany = companies.find(c => c.id === selectedCompanyId);

    const handleCreate = async () => {
        if (!newCompanyName) return;
        await createCompany(newCompanyName, newCompanyType);
        setIsCreateModalOpen(false);
        setNewCompanyName('');
    };

    return (
        <div className="grid grid-cols-12 gap-6 animate-in fade-in duration-500">
            {/* Left: Company Registry List */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Construction size={14} className="text-cyan-500" />
                        Operational Units
                    </h2>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="text-[10px] font-black text-cyan-400 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-1"
                    >
                        <PlusCircle size={14} /> New Entry
                    </button>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[700px] pr-2 custom-scrollbar">
                    {userCompanies.length === 0 ? (
                        <div className="bg-slate-900/40 rounded-2xl p-10 border border-dashed border-slate-700/50 text-center">
                            <Factory size={40} className="mx-auto text-slate-700 mb-4 opacity-50" />
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">No assets registered under this sector.</p>
                            <Button
                                className="mt-6 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                                onClick={() => setIsCreateModalOpen(true)}
                            >
                                START PRODUCTION
                            </Button>
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
                                            {company.type.includes('RAW') ? <Zap size={20} /> : <Shield size={20} />}
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black text-white uppercase tracking-tight">{company.name}</h3>
                                            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                                {COMPANY_TYPES_CONFIG[company.type].name} • Q{company.quality}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-xs font-mono font-bold ${selectedCompanyId === company.id ? 'text-cyan-400' : 'text-slate-300'}`}>
                                            {company.productStock || 0}
                                        </div>
                                        <div className="text-[8px] text-slate-600 font-black uppercase">STOCKS</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right: Management Interface */}
            <div className="col-span-12 lg:col-span-8">
                {selectedCompany ? (
                    <div className="animate-in slide-in-from-right-4 duration-500">
                        <CompanyManager company={selectedCompany} />
                    </div>
                ) : (
                    <div className="bg-slate-900/40 rounded-3xl border border-slate-700/50 border-dashed h-[600px] flex flex-col items-center justify-center text-slate-500 space-y-4">
                        <div className="w-20 h-20 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mb-2">
                            <Factory size={40} className="text-slate-600 opacity-20" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Registry ID Required</p>
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Select an operational unit to access systems.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Simple Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
                        onClick={() => setIsCreateModalOpen(false)}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="relative bg-slate-900 border border-slate-700 rounded-3xl p-10 w-full max-w-lg shadow-2xl"
                    >
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                                <Factory size={28} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">New Asset Registration</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Initial investment required for facility setup</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Company Designation</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-white font-bold focus:border-cyan-500/50 outline-none transition-all"
                                    value={newCompanyName}
                                    onChange={(e) => setNewCompanyName(e.target.value)}
                                    placeholder="Enter facility name..."
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 ml-1">Industry Sector</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {(Object.keys(COMPANY_TYPES_CONFIG) as CompanyType[]).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNewCompanyType(type)}
                                            className={`p-4 rounded-xl border text-left transition-all ${newCompanyType === type
                                                ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                                                : 'bg-slate-800/30 border-slate-700/50 text-slate-500 hover:bg-slate-800 hover:text-slate-300'
                                                }`}
                                        >
                                            <div className="text-[10px] font-black uppercase tracking-tight leading-none mb-1">
                                                {COMPANY_TYPES_CONFIG[type].name}
                                            </div>
                                            <div className="text-[8px] opacity-40 font-bold uppercase tracking-widest leading-none">
                                                {type.includes('RAW') ? 'Resource Extraction' : 'Manufacturing'}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-5 bg-slate-950/50 rounded-2xl border border-slate-800/50 flex items-center justify-between">
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Setup Cost</div>
                                <div className={`text-xl font-mono font-bold ${user?.isAdmin ? 'text-cyan-400' : 'text-emerald-400'}`}>
                                    {user?.isAdmin ? '0.00 CRED' : '1000.00 SUPRA'}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-slate-700 text-slate-500 hover:bg-slate-800 rounded-xl py-6 font-black uppercase text-[11px] tracking-widest"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-6 font-black uppercase text-[11px] tracking-widest shadow-xl shadow-emerald-900/10"
                                    onClick={handleCreate}
                                >
                                    Authorize Setup
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
