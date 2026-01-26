'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import {
    Search,
    Briefcase,
    Building2,
    Factory,
    Utensils,
    Package,
    Rocket,
    Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyService } from '@/lib/services/company.service';
import { useTranslation } from '@/lib/i18n';

// Company type icons and names
const COMPANY_TYPES: Record<number, { name: string; icon: string; color: string }> = {
    1: { name: 'Food Factory', icon: '/icons/food.webp', color: 'text-emerald-400' },
    2: { name: 'Weapons Factory', icon: '/icons/weapon.webp', color: 'text-red-400' },
    3: { name: 'Raw Materials', icon: '/icons/warehouse.webp', color: 'text-amber-400' },
    4: { name: 'Missile Factory', icon: '/icons/weapon.webp', color: 'text-cyan-400' },
};

// Quality filter options
const QUALITIES = [
    { id: 'all', name: 'All' },
    { id: '1', name: 'Q1' },
    { id: '2', name: 'Q2' },
    { id: '3', name: 'Q3' },
    { id: '4', name: 'Q4' },
    { id: '5', name: 'Q5' },
];

interface JobOffer {
    companyId: number;
    companyName: string;
    salary: number;
    positions: number;
    quality: number;
    type: number;
}

export default function CompaniesPage() {
    const { t } = useTranslation();
    const { user, fetchDashboardData } = useGameStore();
    const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<number | null>(null);

    // Category filters
    const CATEGORIES = [
        { id: 'all', name: t('jobs.all_industry', {}, 'All Jobs'), icon: '/icons/inventory.webp', typeId: null },
        { id: 'food', name: t('jobs.food_industry'), icon: '/icons/food.webp', typeId: 1 },
        { id: 'weapons', name: t('jobs.arms_industry'), icon: '/icons/weapon.webp', typeId: 2 },
        { id: 'raw', name: t('jobs.mining_industry'), icon: '/icons/warehouse.webp', typeId: 3 },
        { id: 'missile', name: t('jobs.aerospace_industry'), icon: '/icons/weapon.webp', typeId: 4 },
    ];

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [qualityFilter, setQualityFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [salaryFilter, setSalaryFilter] = useState<string>('');

    // Fetch job offers
    const fetchJobOffers = async () => {
        setLoading(true);
        try {
            const rawCompanies = await CompanyService.getAllCompanies();
            const offers = CompanyService.mapToJobOffers(rawCompanies);
            setJobOffers(offers);
        } catch (e) {
            console.error("Failed to fetch job offers:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobOffers();
    }, []);

    // Apply filters
    const filteredOffers = jobOffers.filter(job => {
        // Category filter
        const catInfo = CATEGORIES.find(c => c.id === selectedCategory);
        const matchesCategory = selectedCategory === 'all' || job.type === catInfo?.typeId;

        // Quality filter
        const matchesQuality = qualityFilter === 'all' || job.quality === Number(qualityFilter);

        // Salary filter (minimum salary)
        const matchesSalary = !salaryFilter || job.salary >= Number(salaryFilter);

        // Search filter (company name)
        const matchesSearch = !searchQuery ||
            job.companyName.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesQuality && matchesSalary && matchesSearch;
    });

    // Handle job application
    const handleApply = async (companyId: number) => {
        if (!user) {
            const { idsAlert } = useGameStore.getState();
            await idsAlert(t('common.login_required', {}, "Please login first!"), t('common.auth_required', {}, "Authentication Required"), "warning");
            return;
        }

        setApplying(companyId);
        try {
            await CompanyService.takeJob(companyId);
            const { idsAlert } = useGameStore.getState();
            await idsAlert(t('jobs.apply_success', {}, "Successfully applied for job!"), t('jobs.job_application', {}, "Job Application"), "success");
            await fetchJobOffers();
            await fetchDashboardData();
        } catch (e: any) {
            const { idsAlert } = useGameStore.getState();
            await idsAlert(e.message || t('common.error', {}, "Error"), t('common.error', {}, "Error"), "error");
        } finally {
            setApplying(null);
        }
    };

    // Get quality badge styling
    const getQualityStyle = (quality: number) => {
        if (quality >= 5) return 'bg-amber-500/10 border-amber-500/20 text-amber-500';
        if (quality >= 3) return 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400';
        return 'bg-slate-900 border-white/5 text-slate-500';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 mt-2">

            {/* Page Header */}
            <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-slate-800/60 rounded-xl border border-slate-700/50 flex items-center justify-center">
                    <Briefcase size={24} className="text-cyan-400" />
                </div>
                <div>
                    <h1 className="text-xl font-black text-white uppercase tracking-tight">{t('jobs.job_market')}</h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                        {t('jobs.active_positions', { count: filteredOffers.length })}
                    </p>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder={t('jobs.search_company')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-800/40 border-2 border-slate-700/50 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 backdrop-blur-sm"
                    />
                </div>

                {/* Min Salary Filter */}
                <div className="relative w-full lg:w-44">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-500">{t('jobs.min_salary')}</span>
                    <input
                        type="number"
                        placeholder={t('jobs.salary_label')}
                        value={salaryFilter}
                        onChange={(e) => setSalaryFilter(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-slate-800/40 border-2 border-slate-700/50 rounded-xl text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 backdrop-blur-sm font-mono"
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
                            {q.name}
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
                            {t('jobs.industries_label')}
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
                                    {cat.name}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Job Listings Table */}
                <div className="lg:col-span-4">
                    <div className="bg-slate-800/20 backdrop-blur-sm rounded-xl border-2 border-slate-700/50 overflow-hidden">

                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-900/40 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                            <div className="col-span-5">{t('jobs.company_label')}</div>
                            <div className="col-span-2">{t('jobs.quality_label', {}, 'Quality')}</div>
                            <div className="col-span-2">{t('jobs.salary_label')}</div>
                            <div className="col-span-1">{t('jobs.open_label')}</div>
                            <div className="col-span-2 text-right">{t('jobs.action_label')}</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-white/5 min-h-[400px] max-h-[600px] overflow-y-auto">
                            {loading ? (
                                <div className="py-24 text-center">
                                    <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                        {t('jobs.loading_jobs')}
                                    </p>
                                </div>
                            ) : filteredOffers.length === 0 ? (
                                <div className="py-24 text-center">
                                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-700 opacity-20">
                                        <Briefcase size={24} />
                                    </div>
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                                        {t('jobs.no_jobs')}
                                    </p>
                                    <p className="text-slate-600 text-[9px] mt-1 uppercase tracking-wide">
                                        {t('jobs.check_back')}
                                    </p>
                                </div>
                            ) : (
                                filteredOffers.map((job) => {
                                    const typeInfo = COMPANY_TYPES[job.type] || { name: 'Unknown', icon: '/icons/inventory.webp', color: 'text-slate-400' };

                                    return (
                                        <motion.div
                                            key={job.companyId}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors group"
                                        >
                                            {/* Company Info */}
                                            <div className="col-span-5 flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform border border-white/5 overflow-hidden p-2">
                                                    <img
                                                        src={typeInfo.icon}
                                                        className="w-full h-full object-contain filter drop-shadow-lg"
                                                        alt=""
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">
                                                        {job.companyName}
                                                    </div>
                                                    <div className={`text-[9px] font-black uppercase tracking-tighter mt-0.5 ${typeInfo.color}`}>
                                                        {t(`jobs.${typeInfo.name.toLowerCase().replace(' ', '_')}`, {}, typeInfo.name)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quality Badge */}
                                            <div className="col-span-2">
                                                <div className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black border ${getQualityStyle(job.quality)}`}>
                                                    Q{job.quality}
                                                </div>
                                            </div>

                                            {/* Salary */}
                                            <div className="col-span-2">
                                                <div className="text-amber-500 font-mono font-bold">
                                                    {job.salary.toFixed(2)}
                                                </div>
                                                <div className="text-[8px] text-slate-600 font-bold uppercase">
                                                    {t('jobs.cred_per_shift')}
                                                </div>
                                            </div>

                                            {/* Open Positions */}
                                            <div className="col-span-1 text-white font-mono font-bold">
                                                {job.positions}
                                            </div>

                                            {/* Action */}
                                            <div className="col-span-2 flex items-center justify-end">
                                                <button
                                                    onClick={() => handleApply(job.companyId)}
                                                    disabled={applying === job.companyId}
                                                    className="px-5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded text-[9px] font-black uppercase transition-all border border-emerald-500/20 disabled:opacity-50"
                                                >
                                                    {applying === job.companyId ? t('jobs.applying_status') : t('jobs.apply_action')}
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
