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
    ArrowRightLeft,
    Briefcase,
    Package,
    PlusCircle,
    Warehouse,
    Dumbbell,
    Layers,
    ChevronRight,
    Search
} from 'lucide-react';
import { CompanyManager } from '@/components/game/CompanyManager';

export default function IndustrialPage() {
    const { companies, user, createCompany } = useGameStore();
    const [activeTab, setActiveTab] = useState<'companies' | 'storage' | 'advanced'>('companies');
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');
    const [newCompanyType, setNewCompanyType] = useState<CompanyType>('RAW_GRAIN');

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

    const TABS = [
        { id: 'companies', name: 'Companies', icon: Factory },
        { id: 'storage', name: 'Storage', icon: Warehouse },
        { id: 'advanced', name: 'Advanced buildings', icon: Layers },
    ] as const;

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Factory className="text-cyan-400" size={32} />
                        INDUSTRIAL CENTER
                    </h1>
                    <p className="text-slate-400 mt-1">Manage your production lines and logistics network.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-black uppercase">Total Assets</div>
                        <div className="text-xl font-mono text-emerald-400 font-bold">{user?.credits.toFixed(2)} CRED</div>
                    </div>
                </div>
            </div>

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
                {activeTab === 'companies' && (
                    <div className="grid grid-cols-12 gap-6 animate-in fade-in duration-300">
                        {/* Left: Company List */}
                        <div className="col-span-12 lg:col-span-4 space-y-4">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Construction size={16} /> My Companies
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-[10px] border-cyan-500/30 text-cyan-400 font-black uppercase"
                                    onClick={() => setIsCreateModalOpen(true)}
                                >
                                    <PlusCircle size={14} className="mr-1" /> New Company
                                </Button>
                            </div>

                            {userCompanies.length === 0 ? (
                                <div className="bg-slate-800/40 rounded-xl p-8 border border-dashed border-slate-700 text-center">
                                    <p className="text-slate-500 text-sm">You don't own any companies yet.</p>
                                    <Button className="mt-4 bg-cyan-600" onClick={() => setIsCreateModalOpen(true)}>Invest in Production</Button>
                                </div>
                            ) : (
                                userCompanies.map(company => (
                                    <div
                                        key={company.id}
                                        onClick={() => setSelectedCompanyId(company.id)}
                                        className={`group cursor-pointer p-4 rounded-xl border transition-all ${selectedCompanyId === company.id
                                            ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.1)]'
                                            : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/30 hover:border-slate-600'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${selectedCompanyId === company.id ? 'bg-cyan-500/20' : 'bg-slate-900 group-hover:bg-slate-800'}`}>
                                                    {company.type.includes('RAW') ? <Zap size={20} className="text-amber-400" /> : <Shield size={20} className="text-cyan-400" />}
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-white uppercase tracking-tight">{company.name}</h3>
                                                    <div className="text-[10px] text-slate-500 font-bold uppercase">{COMPANY_TYPES_CONFIG[company.type].name} • Q{company.quality}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-mono text-cyan-500 font-bold">{company.productStock || 0} units</div>
                                                <div className="text-[9px] text-emerald-500 font-black uppercase">PRODUCING</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Right: Company Management View */}
                        <div className="col-span-12 lg:col-span-8">
                            {selectedCompany ? (
                                <CompanyManager company={selectedCompany} />
                            ) : (
                                <div className="bg-slate-800/20 rounded-2xl border-2 border-dashed border-slate-700/50 h-[500px] flex flex-col items-center justify-center text-slate-500 space-y-4">
                                    <Factory size={48} className="opacity-20 translate-y-2" />
                                    <p className="text-sm font-medium">Select a company to view operations and logistics.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'storage' && (
                    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-12 text-center animate-in slide-in-from-right-4 duration-300">
                        <Warehouse className="mx-auto text-slate-600 mb-4" size={48} />
                        <h3 className="text-xl font-black text-white uppercase">Regional Storage</h3>
                        <p className="text-slate-400 mt-2 max-w-sm mx-auto">Access your global assets, resources, and special items stored in this region.</p>
                        <Button className="mt-8 bg-slate-700" disabled>Coming Soon</Button>
                    </div>
                )}

                {activeTab === 'advanced' && (
                    <div className="bg-slate-800/40 rounded-2xl border border-slate-700/50 p-12 text-center animate-in slide-in-from-right-4 duration-300">
                        <Layers className="mx-auto text-slate-600 mb-4" size={48} />
                        <h3 className="text-xl font-black text-white uppercase">Advanced Infrastructure</h3>
                        <p className="text-slate-400 mt-2 max-w-sm mx-auto">Build hospitals, defense systems, and research centers to boost regional productivity.</p>
                        <Button className="mt-8 bg-slate-700" disabled>Coming Soon</Button>
                    </div>
                )}
            </div>

            {/* Create Company Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-black text-white mb-6">Create New Company</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Company Name</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
                                    value={newCompanyName}
                                    onChange={(e) => setNewCompanyName(e.target.value)}
                                    placeholder="Enter company name"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Business Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.keys(COMPANY_TYPES_CONFIG) as CompanyType[]).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNewCompanyType(type)}
                                            className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${newCompanyType === type
                                                ? 'bg-cyan-500/20 border-cyan-500 text-white'
                                                : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                                }`}
                                        >
                                            {COMPANY_TYPES_CONFIG[type].name}
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
                                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-500" onClick={handleCreate}>Create Company</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
