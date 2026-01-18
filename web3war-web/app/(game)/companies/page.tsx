'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { Button } from '@/components/Button';
import { Briefcase, Building, Coins, Users } from 'lucide-react';

export default function JobMarketPage() {
    const { companies, user, applyForJob, work } = useGameStore();
    const [isLoading, setIsLoading] = useState(false);

    // Filter companies with active job offers
    const hiringCompanies = companies.filter(c => c.jobOffer && c.jobOffer.positions > 0);
    const myEmployer = companies.find(c => c.id === user?.employerId);

    const handleApply = async (companyId: string) => {
        if (!confirm("Are you sure you want to apply for this job?")) return;
        setIsLoading(true);
        try {
            // TODO: Call contract
            // For now using store action which updates local state, 
            // but we need to eventually wire this to ContractService.takeJob
            // The store.applyForJob currently is mock.
            applyForJob(companyId);
        } finally {
            setIsLoading(false);
        }
    };

    const handleWork = async () => {
        setIsLoading(true);
        try {
            work(); // Calls store action
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/60 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <Briefcase className="text-emerald-400" size={32} />
                        JOB MARKET
                    </h1>
                    <p className="text-slate-400 mt-1">Find employment and earn a daily salary.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Current Employment Status */}
                <div className="md:col-span-1">
                    <div className="bg-slate-900/60 rounded-2xl p-6 border border-slate-700/50">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">My Employment</h3>

                        {myEmployer ? (
                            <div className="space-y-6">
                                <div>
                                    <div className="text-2xl font-black text-white">{myEmployer.name}</div>
                                    <div className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                                        <Building size={14} /> {myEmployer.region}
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/30">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs text-slate-400 uppercase font-bold">Daily Salary</span>
                                        <span className="text-emerald-400 font-mono font-bold">{myEmployer.jobOffer?.salary || 0} CRED</span>
                                    </div>
                                    <Button
                                        className="w-full bg-emerald-600 hover:bg-emerald-500"
                                        onClick={handleWork}
                                        disabled={isLoading || (user?.energy || 0) < 10}
                                    >
                                        WORK SHIFT (-10 Energy)
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500 italic text-sm">
                                You are currently unemployed.
                            </div>
                        )}
                    </div>
                </div>

                {/* Job Offers */}
                <div className="md:col-span-2 space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Available Positions</h3>

                    {hiringCompanies.length === 0 ? (
                        <div className="text-center py-12 bg-slate-800/20 rounded-xl border border-dashed border-slate-700 text-slate-500">
                            No job offers available at the moment.
                        </div>
                    ) : (
                        hiringCompanies.map(company => (
                            <div key={company.id} className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 flex items-center justify-between group hover:border-cyan-500/30 transition-all">
                                <div>
                                    <div className="font-bold text-white text-lg">{company.name}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                                        <span className="flex items-center gap-1"><Users size={12} /> {company.jobOffer?.positions} Openings</span>
                                        <span className="flex items-center gap-1"><Building size={12} /> {company.region}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-emerald-400 font-mono font-bold text-xl">{company.jobOffer?.salary} CRED</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-black">Daily Salary</div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleApply(company.id)}
                                        disabled={!!user?.employerId || isLoading}
                                        className="bg-cyan-600 hover:bg-cyan-500"
                                    >
                                        Apply Now
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
