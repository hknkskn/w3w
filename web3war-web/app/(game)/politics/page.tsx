'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGameStore } from '@/lib/store';
import {
    Flag,
    Users,
    Vote,
    Gavel,
    Shield,
    Clock,
    UserPlus,
    Landmark,
    CheckCircle2,
    AlertCircle,
    Activity,
    Search,
    FileText,
    Target,
    Settings,
    Wallet,
    Handshake,
    Crown
} from 'lucide-react';
import {
    Card,
    StatCard,
    Label,
    Badge,
    TYPOGRAPHY,
    ActionButton,
    EmptyState,
    TabBar,
    ListItem,
    Input,
    Modal
} from '@/lib/ui-kit';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRY_CONFIG, COUNTRY_IDS, CountryId, ElectionCandidate, getCountryKey } from '@/lib/types';
import { TerritoryService, RegionData } from '@/lib/services/territory.service';
import { useTranslation } from '@/lib/i18n';

export default function PoliticsPage() {
    const [isMounted, setIsMounted] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const {
        user,
        countryData,
        proposals,
        electionCandidates,
        isCongressMember,
        checkCongressMembership,
        registerAsCandidate,
        voteForCandidate,
        voteOnProposal,
        createProposal,
        declareWar,
        initiateImpeachment,
        executiveDecree,
        fetchTreasuryBalance,
        fetchCountryData,
        fetchProposals,
        fetchCandidates,
        treasuryBalance,
        claimableSalary,
        fetchClaimableSalary,
        claimSalary,
        countryGovernance,
        fetchCountryGovernance,
        warStatus,
        fetchWarStatus,
        finalizeProposal,
        startCongressElection,
        registerCongressCandidate,
        voteCongress,
        endCongressElection,
        congressElectionData,
        fetchCongressElectionData,
        donateToTreasury,
        fetchTopDonors,
        topDonors,
        isLandless,
        reclaimableRegions,
        fetchLandlessStatus,
        fetchReclaimableRegions,
        startResistance,
        cooldowns,
        fetchCooldowns
    } = useGameStore();

    const handleTaxAdjustment = (type: number, currentRate: number) => {
        setAdjustmentType(type);
        setAdjustmentRate(currentRate);
        setAdjustmentMethod('decree');
        setIsActionModalOpen(true);
    };

    const confirmAction = async () => {
        if (adjustmentRate < 0 || adjustmentRate > 100) return;

        setIsSubmitting(true);
        try {
            if (adjustmentMethod === 'decree') {
                if (adjustmentRate < 5 || adjustmentRate > 20) {
                    alert(t('politics.decree_range', {}, "Decree must be between 5% and 20%"));
                    setIsSubmitting(false);
                    return;
                }
                await executiveDecree(countryId!, adjustmentType, adjustmentRate);
                fetchCountryData(countryId!);
            } else {
                await createProposal(countryId!, 1, [adjustmentType, adjustmentRate]);
                fetchProposals();
            }
            setIsActionModalOpen(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<'leadership' | 'congress' | 'election-hub' | 'alliances' | 'admin'>('leadership');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['leadership', 'congress', 'election-hub', 'alliances', 'admin'].includes(tab)) {
            setActiveTab(tab as any);
        }
    }, [searchParams]);
    const [selectedProposalId, setSelectedProposalId] = useState<number | null>(null);
    const [selectedCandidateAddr, setSelectedCandidateAddr] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [population, setPopulation] = useState<number>(0);

    const packProposalData = (type: number, value: number, address?: string, role?: number) => {
        const bytes: number[] = [];
        if (type === 1) { // Tax
            bytes.push(role || 0);
            bytes.push(value);
        } else if (type === 2) { // Treasury
            const amount = BigInt(Math.floor(value * 100));
            for (let i = 0; i < 8; i++) {
                bytes.push(Number((amount >> BigInt(i * 8)) & BigInt(0xff)));
            }
            if (address) {
                const cleanAddr = address.replace('0x', '').padStart(64, '0');
                for (let i = 0; i < 32; i++) {
                    bytes.push(parseInt(cleanAddr.substr(i * 2, 2), 16));
                }
            } else {
                for (let i = 0; i < 32; i++) bytes.push(0);
            }
        } else if (type === 5) { // Min Wage
            const amount = BigInt(Math.floor(value * 100));
            for (let i = 0; i < 8; i++) {
                bytes.push(Number((amount >> BigInt(i * 8)) & BigInt(0xff)));
            }
        } else if (type === 6) { // Size
            bytes.push(value);
        } else if (type === 7) { // Salary
            bytes.push(role || 0);
            const amount = BigInt(Math.floor(value * 100));
            for (let i = 0; i < 8; i++) {
                bytes.push(Number((amount >> BigInt(i * 8)) & BigInt(0xff)));
            }
        } else if (type === 8 || type === 9) { // MPP
            bytes.push(value);
        }
        return bytes;
    };

    // Presidential Action Modal State
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [adjustmentType, setAdjustmentType] = useState<number>(0);
    const [adjustmentMethod, setAdjustmentMethod] = useState<'decree' | 'proposal'>('decree');
    const [adjustmentRate, setAdjustmentRate] = useState<number>(10);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // War Declaration Modal State
    const [isWarModalOpen, setIsWarModalOpen] = useState(false);
    const [warTargetCountry, setWarTargetCountry] = useState<number | null>(null);
    const [warTargetRegion, setWarTargetRegion] = useState<number | null>(null);
    const [warMethod, setWarMethod] = useState<'decree' | 'proposal'>('decree');
    const [allRegions, setAllRegions] = useState<RegionData[]>([]);

    // Donation State
    const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
    const [donationAmount, setDonationAmount] = useState<number>(100000);

    // Governance Proposition Modal State
    const [isGovModalOpen, setIsGovModalOpen] = useState(false);
    const [govProposalType, setGovProposalType] = useState<number>(5);
    const [govRoleType, setGovRoleType] = useState<number>(0);
    const [govTargetValue, setGovTargetValue] = useState<number>(0);

    // Alliance State
    const [isAllianceModalOpen, setIsAllianceModalOpen] = useState(false);
    const [allianceTargetCountry, setAllianceTargetCountry] = useState<number | null>(null);
    const [activeAlliances, setActiveAlliances] = useState<any[]>([]);
    const [pendingAlliances, setPendingAlliances] = useState<any[]>([]);
    const [govTargetAddress, setGovTargetAddress] = useState<string>('');
    const [hubView, setHubView] = useState<'presidential' | 'congressional'>('presidential');
    const [addressNames, setAddressNames] = useState<Record<string, string>>({});
    const [selectedCandidate, setSelectedCandidate] = useState<ElectionCandidate | null>(null);

    const countryId = user?.countryId ?? null;
    const currentCountryData = countryId !== null ? countryData[countryId] : null;
    const candidates = countryId !== null ? (electionCandidates[countryId] || []) : [];
    const selectedProposal = proposals.find(p => p.id === selectedProposalId);
    const countryBalance = countryId !== null ? ((treasuryBalance as any || {})[countryId] || 0) : 0;
    const isPres = user?.address?.toLowerCase() === currentCountryData?.president?.toLowerCase();

    const resolveAddress = async (address: string) => {
        if (!address || address === '0x0' || addressNames[address]) return;
        try {
            const { CitizenService } = await import('@/lib/services/citizen.service');
            const profile = await CitizenService.getProfile(address);
            if (profile?.username) {
                setAddressNames((prev: Record<string, string>) => ({ ...prev, [address]: profile.username }));
            }
        } catch (e) {
            console.warn(`Failed to resolve name for ${address}`);
        }
    };

    useEffect(() => {
        if (currentCountryData?.president) {
            resolveAddress(currentCountryData.president);
        }
        if (selectedProposal?.proposer) {
            resolveAddress(selectedProposal.proposer);
        }
    }, [currentCountryData?.president, selectedProposal?.proposer, addressNames]);

    // Initial Data Fetch
    useEffect(() => {
        if (!countryId) return;

        const loadData = async () => {
            try {
                // Sequence critical data fetching to avoid RPC flooding/rate-limits
                await fetchCountryData(countryId);
                await fetchTreasuryBalance(countryId);
                await fetchCountryGovernance(countryId);
                await fetchWarStatus(countryId);

                // Group non-critical but necessary data
                await Promise.all([
                    checkCongressMembership(countryId),
                    fetchProposals(),
                    fetchCandidates(countryId)
                ]);

                // Remaining secondary data
                await Promise.all([
                    fetchTopDonors(countryId),
                    fetchLandlessStatus(countryId),
                    fetchReclaimableRegions(countryId)
                ]);

                // Async dynamic imports and secondary fetches
                TerritoryService.getAllRegions().then(setAllRegions);

                if (user?.address) {
                    fetchClaimableSalary(user.address, countryId);

                    // Fetch Alliances
                    const { AllianceService } = await import('@/lib/services/alliance.service');
                    AllianceService.getMyPendingProposals(user.address).then(setPendingAlliances);
                    AllianceService.getActiveMpps().then(setActiveAlliances);
                }

                const { CitizenService } = await import('@/lib/services/citizen.service');
                const pop = await CitizenService.getPopulation(countryId);
                setPopulation(pop);

            } catch (e) {
                console.error("Politics: Failed to load national telemetry:", e);
            }
        };

        loadData();
    }, [countryId, user?.address]);

    // Elected Candidate Detail Fetch
    useEffect(() => {
        if (candidates.length === 0) return;
        const candidate = candidates.find(c => c.address === selectedCandidateAddr);
        if (candidate) {
            setSelectedCandidate(candidate);
            // Fetch detailed profile for strength/level if not present
            if (candidate.strength === undefined) {
                import('@/lib/services/citizen.service').then(({ CitizenService }) => {
                    CitizenService.getProfile(candidate.address).then(profile => {
                        if (profile) {
                            setSelectedCandidate((prev: ElectionCandidate | null) => prev?.address === candidate.address ? {
                                ...prev,
                                strength: Number(profile.strength),
                                level: Number(profile.level)
                            } : prev);
                        }
                    });
                });
            }
        } else {
            setSelectedCandidate(null);
        }
    }, [selectedCandidateAddr, candidates]);

    if (countryId === null) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('politics.awaiting_link', {}, 'Awaiting National Link...')}</p>
                </div>
            </div>
        );
    }


    if (!user) return null;


    const TABS = [
        { id: 'leadership', label: t('politics.leadership', {}, 'Leadership'), icon: <Shield size={18} /> },
        { id: 'congress', label: t('politics.congress'), icon: <Gavel size={18} /> },
        { id: 'alliances', label: t('politics.alliances', {}, 'Alliances'), icon: <Handshake size={18} /> },
        { id: 'admin', label: t('politics.system_admin', {}, 'System Admin'), icon: <Settings size={18} /> },
    ];

    function CabinetWidget({ user, currentCountryData, treasuryBalance, population }: { user: any, currentCountryData: any, treasuryBalance: number, population: number }) {
        if (!currentCountryData) return null;

        return (
            <Card variant="default" className="bg-slate-950/40 border-slate-800 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Users className="text-cyan-400" size={18} />
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('politics.cabinet_summary', {}, 'National Cabinet Summary')}</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <Label size="tiny">{t('politics.president')}</Label>
                        <div className="text-[10px] font-black text-white truncate italic uppercase tracking-wider">
                            {currentCountryData?.president ? (addressNames[currentCountryData.president] || `${currentCountryData.president.slice(0, 6)}...`) : t('politics.vacant', {}, "Vacant")}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label size="tiny">{t('profile.population', {}, 'Population')}</Label>
                        <div className="text-xs font-black text-white">{population.toLocaleString()} {t('common.units', {}, 'Units')}</div>
                    </div>
                    <div className="space-y-1">
                        <Label size="tiny">{t('politics.treasury')}</Label>
                        <div className="text-xs font-black text-emerald-400">{(treasuryBalance / 100).toLocaleString()} CRED</div>
                    </div>
                    <div className="space-y-1">
                        <Label size="tiny">{t('common.status', {}, 'Status')}</Label>
                        <div className="text-[10px] font-black uppercase text-cyan-500">{t('common.online', {}, 'Online')}</div>
                    </div>
                </div>
            </Card>
        );
    }

    const renderLeadership = () => {
        const isPres = user?.address?.toLowerCase() === currentCountryData?.president?.toLowerCase();

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                {/* Compact Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label={t('politics.president')}
                        value={currentCountryData?.president ? (addressNames[currentCountryData.president] || `${currentCountryData.president.substring(0, 4)}...${currentCountryData.president.substring(currentCountryData.president.length - 4)}`) : t('politics.vacant', {}, "VACANT")}
                        unit={isPres ? t('politics.your_term', {}, "YOUR TERM") : t('politics.office', {}, "OFFICE")}
                        icon={<Crown className="text-cyan-400" />}
                    />
                    <StatCard
                        label={t('politics.treasury')}
                        value={(countryBalance / 100).toLocaleString()}
                        unit="CRED"
                        icon={<Landmark className="text-cyan-400" />}
                    />
                    <StatCard
                        label={t('profile.citizenship', {}, 'CITIZENS')}
                        value={population.toLocaleString()}
                        unit={t('common.units', {}, 'UNITS').toUpperCase()}
                        icon={<Users className="text-cyan-400" />}
                    />
                    <StatCard
                        label={t('politics.min_wage')}
                        value={`${(countryGovernance[countryId!]?.minWage || 0) / 100}`}
                        unit="CRED"
                        icon={<Gavel className="text-cyan-400" />}
                    />
                </div>

                <div className="grid grid-cols-12 gap-6">
                    {/* Executive Control Panel */}
                    <div className="col-span-12 lg:col-span-8 space-y-4">
                        <Card variant="default" className="bg-slate-900/40 border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-cyan-400">
                                    <Target size={18} />
                                    <h3 className="text-xs font-black uppercase tracking-widest">{t('politics.executive_command')}</h3>
                                </div>
                                {isPres && <Badge variant="cyan">{t('politics.commander_in_chief')}</Badge>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4 p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                                    <Label size="tiny">{t('politics.strategic_directives')}</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <ActionButton
                                            label={t('politics.declare_war_action')}
                                            variant="danger"
                                            className="h-12 text-[10px]"
                                            disabled={!isPres}
                                            onClick={() => setIsWarModalOpen(true)}
                                        />
                                        <ActionButton
                                            label={t('politics.mpp_proposal')}
                                            variant="primary"
                                            className="h-12 text-[10px]"
                                            disabled={!isPres}
                                            onClick={() => setIsAllianceModalOpen(true)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                                    <Label size="tiny">{t('politics.economic_directives')}</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <ActionButton
                                            label={t('politics.inc_tax_action')}
                                            variant="primary"
                                            className="h-12 text-[8px]"
                                            disabled={!isPres}
                                            onClick={() => handleTaxAdjustment(0, currentCountryData?.incomeTax || 0)}
                                        />
                                        <ActionButton
                                            label={t('politics.imp_tax_action')}
                                            variant="primary"
                                            className="h-12 text-[8px]"
                                            disabled={!isPres}
                                            onClick={() => handleTaxAdjustment(1, currentCountryData?.importTax || 0)}
                                        />
                                        <ActionButton
                                            label={t('politics.set_vat_action')}
                                            variant="primary"
                                            className="h-12 text-[8px]"
                                            disabled={!isPres}
                                            onClick={() => handleTaxAdjustment(2, currentCountryData?.vat || 0)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                            <Card variant="default" className="bg-slate-900/40 border-slate-800 p-6">
                                <Label size="tiny">{t('politics.governance_metrics')}</Label>
                                <div className="mt-4 space-y-3">
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-slate-500 font-bold uppercase">{t('politics.pres_salary_net')}</span>
                                        <span className="text-white font-black">
                                            {((countryGovernance[countryId!]?.presSalary || 0) * (1 - (currentCountryData?.incomeTax || 0) / 100) / 100).toLocaleString()} CRED/D
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-slate-500 font-bold uppercase">{t('politics.cong_salary_net')}</span>
                                        <span className="text-white font-black">
                                            {((countryGovernance[countryId!]?.congSalary || 0) * (1 - (currentCountryData?.incomeTax || 0) / 100) / 100).toLocaleString()} CRED/D
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-slate-500 font-bold uppercase">{t('politics.vat_rate')}</span>
                                        <span className="text-white font-black">{currentCountryData?.vat || 0}%</span>
                                    </div>
                                </div>
                            </Card>

                            <Card variant="default" className="bg-slate-900/40 border-slate-800 p-6 flex flex-col justify-center items-center text-center">
                                <Landmark className="text-cyan-400 mb-2" size={32} />
                                <div className="text-xl font-black text-white italic">{(countryBalance / 100).toLocaleString()}</div>
                                <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">{t('politics.national_reserve')}</div>
                                <button
                                    onClick={() => setIsDonationModalOpen(true)}
                                    className="mt-4 text-[9px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest transition-colors"
                                >
                                    {t('politics.donate_cred_action')}
                                </button>
                            </Card>
                        </div>
                    </div>

                    {/* Right Panel: Cabinet & Actions */}
                    <div className="col-span-12 lg:col-span-4 space-y-4">
                        <CabinetWidget user={user} currentCountryData={currentCountryData} treasuryBalance={countryBalance} population={population} />

                        {(isPres || isCongressMember) && Number(claimableSalary[`${user.address}-${countryId}`] || 0) > 0 && (
                            <Card variant="default" className="bg-cyan-500/5 border-cyan-500/20 p-6">
                                <div className="text-[9px] text-cyan-400 font-black uppercase tracking-widest mb-4">{t('politics.salary_distribution')}</div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-2xl font-black text-white">
                                        {(Number(claimableSalary[`${user.address}-${countryId}`]) * (1 - (currentCountryData?.incomeTax || 0) / 100) / 100).toLocaleString()} <span className="text-xs text-slate-500">CRED</span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                                        <Wallet size={20} />
                                    </div>
                                </div>
                                <ActionButton
                                    label={t('politics.claim_accrued_salary')}
                                    variant="primary"
                                    className="w-full h-10"
                                    onClick={() => claimSalary(countryId)}
                                />
                            </Card>
                        )}

                        {!isPres && currentCountryData?.president && (
                            <Card variant="default" className="bg-red-500/5 border-red-500/20 p-6">
                                <div className="flex items-center gap-2 text-red-400 mb-2">
                                    <AlertCircle size={14} />
                                    <span className="text-[9px] font-black uppercase">{t('politics.opposition_terminal')}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed mb-4">
                                    {t('politics.impeachment_note')}
                                </p>
                                <button
                                    className="w-full py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 rounded-lg text-[9px] font-black text-red-500 uppercase tracking-widest transition-all"
                                    onClick={async () => {
                                        if (confirm(t('politics.confirm_impeachment', {}, "INITIATE IMPEACHMENT?"))) await initiateImpeachment(countryId);
                                    }}
                                >
                                    {t('politics.initiate_vote')}
                                </button>
                            </Card>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    };

    const renderAlliances = () => {
        const isPres = user?.address?.toLowerCase() === currentCountryData?.president?.toLowerCase();

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pending Proposals (Private) */}
                    <Card variant="default" className="bg-slate-950/40 border-slate-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Clock className="text-amber-500" size={18} />
                                <h3 className="text-sm font-black text-white uppercase tracking-widest">Pending MPP Proposals</h3>
                            </div>
                            {isPres && (
                                <button onClick={() => setIsAllianceModalOpen(true)} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black rounded-lg transition-all uppercase">
                                    PROPOSE ALLIANCE
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {pendingAlliances.length === 0 ? (
                                <p className="text-[10px] text-slate-600 font-bold uppercase py-4 text-center">{t('politics.no_pending_alliances')}</p>
                            ) : (
                                pendingAlliances.map((prop, i) => (
                                    <div key={i} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-500">
                                                <Handshake size={20} />
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-white">Proposal #{i + 1}</div>
                                                <div className="text-[9px] text-slate-500 font-bold uppercase">From: {prop.proposer_country}</div>
                                            </div>
                                        </div>
                                        {isPres && (
                                            <button
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black rounded-lg transition-all uppercase"
                                                onClick={async () => {
                                                    await createProposal(countryId!, 9, [prop.proposer_country]);
                                                }}
                                            >
                                                {t('politics.propose_acceptance')}
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Active Alliances (Public) */}
                    <Card variant="default" className="bg-slate-950/40 border-slate-800 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Shield className="text-cyan-400" size={18} />
                            <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('politics.active_alliances')}</h3>
                        </div>

                        <div className="space-y-3">
                            {activeAlliances.filter(a => Number(a.a) === countryId || Number(a.b) === countryId).length === 0 ? (
                                <p className="text-[10px] text-slate-600 font-bold uppercase py-4 text-center">{t('politics.no_active_mpps')}</p>
                            ) : (
                                activeAlliances.filter(a => Number(a.a) === countryId || Number(a.b) === countryId).map((alliance, i) => {
                                    const partnerId = Number(alliance.a) === countryId ? Number(alliance.b) : Number(alliance.a);
                                    const partnerKey = (Object.keys(COUNTRY_IDS) as CountryId[]).find(k => COUNTRY_IDS[k] === partnerId) || 'TR' as CountryId;
                                    const partnerConfig = COUNTRY_CONFIG[partnerKey];

                                    return (
                                        <div key={i} className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <img src={partnerConfig.flag} className="w-10 h-6 object-cover rounded shadow-sm border border-white/10" alt="" />
                                                <div>
                                                    <div className="text-xs font-black text-white uppercase italic">{partnerConfig.name}</div>
                                                    <div className="text-[9px] text-cyan-400 font-black uppercase tracking-tighter">{t('politics.mutual_defense_pakt')}</div>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                                <CheckCircle2 size={16} />
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </Card>
                </div>
            </motion.div>
        );
    };

    const renderAllianceModal = () => {
        const targetCountries = (Object.keys(COUNTRY_IDS) as CountryId[])
            .filter(cid => COUNTRY_IDS[cid] !== countryId);

        return (
            <Modal
                isOpen={isAllianceModalOpen}
                onClose={() => setIsAllianceModalOpen(false)}
                title={t('politics.diplomatic_proposal')}
            >
                <div className="space-y-6">
                    <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">
                        {t('politics.mpp_description')}
                    </p>

                    <div>
                        <Label size="tiny">Target Federation</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {targetCountries.map(cid => (
                                <button
                                    key={cid}
                                    onClick={() => setAllianceTargetCountry(COUNTRY_IDS[cid])}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${allianceTargetCountry === COUNTRY_IDS[cid] ? 'bg-cyan-500/10 border-cyan-500' : 'bg-slate-900 border-slate-800'}`}
                                >
                                    <img src={COUNTRY_CONFIG[cid].flag} className="w-8 h-5 object-cover rounded" alt="" />
                                    <span className="text-[10px] font-black text-white uppercase">{COUNTRY_CONFIG[cid].name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setIsAllianceModalOpen(false)} className="flex-1 px-4 py-3 bg-slate-800 rounded-xl text-[10px] font-black uppercase">Cancel</button>
                        <button
                            disabled={!allianceTargetCountry || isSubmitting}
                            onClick={async () => {
                                if (!allianceTargetCountry) return;
                                setIsSubmitting(true);
                                try {
                                    // Pivot to Type 8 Proposal as requested by user
                                    await createProposal(countryId!, 8, [allianceTargetCountry]);
                                    setIsAllianceModalOpen(false);
                                } catch (e) {
                                    console.error(e);
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            className="flex-1 px-4 py-3 bg-cyan-500 text-slate-950 rounded-xl text-[10px] font-black uppercase"
                        >
                            {isSubmitting ? t('common.sending', {}, 'Sending...') : t('common.send_proposal', {}, 'Send Proposal')}
                        </button>
                    </div>
                </div>
            </Modal>
        );
    };

    const renderCongress = () => (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-12 gap-6"
        >
            {/* Sidebar: Proposals List */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <Label size="small">{t('politics.legislative_queue')}</Label>
                    {isCongressMember && (
                        <button
                            className="text-[9px] font-black text-cyan-400 hover:text-cyan-300 uppercase tracking-widest flex items-center gap-1 transition-colors"
                            onClick={() => {
                                setGovProposalType(1);
                                setGovTargetValue(10);
                                setIsGovModalOpen(true);
                            }}
                        >
                            <UserPlus size={14} /> {t('politics.new_motion')}
                        </button>
                    )}
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                    {proposals.length === 0 ? (
                        <EmptyState
                            title={t('politics.no_active_proposals')}
                            description={t('politics.legislative_empty')}
                            icon={<Gavel size={32} className="opacity-10" />}
                        />
                    ) : (
                        proposals.filter(p => p.countryId === countryId).map(proposal => (
                            <ListItem
                                key={proposal.id}
                                selected={selectedProposalId === proposal.id}
                                onClick={() => setSelectedProposalId(proposal.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-colors ${selectedProposalId === proposal.id ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                                            <FileText size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-black text-white uppercase tracking-tight">{t('politics.motion_id', { id: proposal.id })}</div>
                                            <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                                {proposal.type === 1 ? t('politics.tax_amendment') :
                                                    proposal.type === 2 ? t('politics.treasury_direct') :
                                                        proposal.type === 3 ? t('politics.war_declaration') :
                                                            proposal.type === 4 ? t('politics.impeachment') :
                                                                proposal.type === 5 ? t('politics.min_wage_law') :
                                                                    proposal.type === 6 ? t('politics.congress_size') :
                                                                        proposal.type === 8 ? t('politics.initiate_mpp') :
                                                                            proposal.type === 9 ? t('politics.accept_mpp') : t('politics.salary_adj', {}, 'Salary Adj')}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant={proposal.executed ? "emerald" : ((Date.now() / 1000) > proposal.createdAt + 86400 ? "amber" : "cyan")}>
                                        {proposal.executed ? t('politics.pass_status') : ((Date.now() / 1000) > proposal.createdAt + 86400 ? t('politics.finalize_status') : t('politics.vote_status'))}
                                    </Badge>
                                </div>
                            </ListItem>
                        ))
                    )}
                </div>
            </div>

            {/* Right Side: Proposal Detail & Congress Elections */}
            <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* Election Management / Active Election */}
                {(congressElectionData[countryId]?.active || user.address === currentCountryData?.president) && (
                    <Card variant="default" className="bg-slate-950/40 border-slate-800 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase italic">
                                    {congressElectionData[countryId]?.active ? t('politics.active_election') : t('politics.management')}
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                    {congressElectionData[countryId]?.active
                                        ? `${t('politics.election_ends')}: ${Math.max(0, Math.floor((congressElectionData[countryId]?.endTime - Date.now() / 1000) / 60))} mins`
                                        : t('politics.initialize_term')}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                {congressElectionData[countryId]?.active ? (
                                    <>
                                        {!congressElectionData[countryId]?.candidates.includes(user.address) && isCongressMember && (
                                            <ActionButton
                                                label={t('politics.register_action')}
                                                variant="primary"
                                                onClick={() => registerCongressCandidate(countryId)}
                                                className="h-10 px-6"
                                            />
                                        )}
                                        {user.address === currentCountryData?.president && (
                                            <ActionButton
                                                label={t('politics.end_election_action', {}, "END ELECTION")}
                                                variant="danger"
                                                onClick={() => endCongressElection(countryId)}
                                                className="h-10 px-6"
                                            />
                                        )}
                                    </>
                                ) : (
                                    user.address === currentCountryData?.president && (
                                        <ActionButton
                                            label={t('politics.start_election_action', {}, "START ELECTION")}
                                            variant="primary"
                                            onClick={() => startCongressElection(countryId)}
                                            className="h-10 px-6"
                                        />
                                    )
                                )}
                            </div>
                        </div>

                        {congressElectionData[countryId]?.active && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                {congressElectionData[countryId]?.candidates.map((candidate, idx) => (
                                    <div key={candidate} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[8px] font-black text-cyan-400">
                                                ID
                                            </div>
                                            <div className="truncate">
                                                <div className="text-[10px] text-white font-black uppercase truncate">{candidate}</div>
                                                <div className="text-[8px] text-slate-500 font-bold">{congressElectionData[countryId]?.votes[idx]} VOTES</div>
                                            </div>
                                        </div>
                                        <button
                                            className="text-cyan-400 hover:text-cyan-300 transition-colors p-2"
                                            onClick={() => voteCongress(countryId, idx)}
                                        >
                                            <Vote size={18} />
                                        </button>
                                    </div>
                                ))}
                                {congressElectionData[countryId]?.candidates.length === 0 && (
                                    <p className="col-span-2 text-center text-[10px] text-slate-600 font-bold uppercase tracking-widest py-4">{t('politics.no_candidates', {}, 'No candidates registered yet.')}</p>
                                )}
                            </div>
                        )}
                    </Card>
                )}

                {/* Proposal Detail */}
                {selectedProposal ? (
                    <Card variant="default" className="bg-slate-950/40 border-slate-800 p-8 flex flex-col">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className={TYPOGRAPHY.h2}>{t('politics.legislative_review')}</h2>
                                    <Badge variant={selectedProposal.executed ? "emerald" : "amber"}>
                                        {selectedProposal.executed ? t('politics.pass_status') :
                                            (Date.now() / 1000) > selectedProposal.createdAt + 86400 ? t('politics.voting_finished', {}, 'Voting Finished') : t('common.active', {}, 'Active')}
                                    </Badge>
                                </div>
                                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">
                                    {t('politics.initiated_by')}: <span className="text-cyan-400 font-black">{addressNames[selectedProposal.proposer] || `${selectedProposal.proposer.slice(0, 6)}...${selectedProposal.proposer.slice(-4)}`}</span>
                                </p>
                            </div>
                            <div className="text-right">
                                <Label size="tiny">{t('politics.reference_id')}</Label>
                                <div className="text-2xl font-mono font-black text-white leading-none">#{selectedProposal.id}</div>
                                {!selectedProposal.executed && (Date.now() / 1000) > selectedProposal.createdAt + 86400 && (
                                    <ActionButton
                                        label={t('politics.execute')}
                                        variant="primary"
                                        onClick={() => finalizeProposal(selectedProposal.id)}
                                        className="h-8 px-4 mt-2 text-[10px]"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800">
                                <Label size="tiny">{t('politics.proposal_core')}</Label>
                                <div className="mt-4 text-sm text-slate-200 uppercase tracking-wide leading-relaxed">
                                    {selectedProposal.type === 1 ? (
                                        <>{t('politics.tax_amendment_desc')}</>
                                    ) : (
                                        t('politics.standard_directive')
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <Label size="tiny">{t('politics.affirmative_votes')}</Label>
                                        <div className="text-2xl font-black text-white mt-1">{selectedProposal.yesVotes}</div>
                                    </div>
                                    <div className="text-right">
                                        <Label size="tiny">{t('politics.dissenting_votes')}</Label>
                                        <div className="text-2xl font-black text-white mt-1">{selectedProposal.noVotes}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isMounted && !selectedProposal.executed && (Date.now() / 1000) <= selectedProposal.createdAt + 86400 && (
                            <div className="mt-8 pt-8 border-t border-slate-800 flex gap-4">
                                <ActionButton
                                    label={t('politics.vote_affirmative')}
                                    variant="success"
                                    className="flex-1 h-14"
                                    onClick={() => voteOnProposal(selectedProposal.id, true)}
                                />
                                <ActionButton
                                    label={t('politics.vote_dissent')}
                                    variant="danger"
                                    className="flex-1 h-14"
                                    onClick={() => voteOnProposal(selectedProposal.id, false)}
                                />
                            </div>
                        )}
                    </Card>
                ) : (
                    <div className="bg-slate-900/30 rounded-[2rem] border-2 border-dashed border-slate-800 h-full flex flex-col items-center justify-center text-center p-12">
                        <Search size={48} className="text-slate-800 mb-6 opacity-20" />
                        <h3 className="text-xl font-black text-slate-600 uppercase tracking-tighter">{t('politics.registry_key_required')}</h3>
                        <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.2em] mt-2">{t('politics.review_telemetry')}</p>
                    </div>
                )}
            </div>
        </motion.div>
    );



    const renderAdmin = () => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-cyan-400 mb-2">
                        <Flag size={20} />
                        <h3 className="font-black uppercase tracking-tighter">{t('politics.foundation_setup')}</h3>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">
                        {t('politics.setup_intro')}
                    </p>
                    <ActionButton
                        label={t('politics.initialize_governance')}
                        variant="primary"
                        className="w-full"
                        onClick={async () => {
                            if (confirm(t('politics.start_election_confirm'))) {
                                await (useGameStore.getState() as any).initializeGovernance();
                            }
                        }}
                    />
                </Card>

                <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-amber-500 mb-2">
                        <Vote size={20} />
                        <h3 className="font-black uppercase tracking-tighter">{t('politics.election_controller')}</h3>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">
                        {t('politics.election_controller_intro')}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                        <ActionButton
                            label={t('politics.start_election_action')}
                            variant="primary"
                            className="bg-slate-800"
                            onClick={() => (useGameStore.getState() as any).startElection(countryId)}
                        />
                        <ActionButton
                            label={t('politics.end_election_action')}
                            variant="primary"
                            className="bg-slate-800"
                            onClick={() => (useGameStore.getState() as any).endElection(countryId)}
                        />
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-emerald-500 mb-2">
                        <Users size={20} />
                        <h3 className="font-black uppercase tracking-tighter">{t('politics.authority_management')}</h3>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">
                        {t('politics.authority_management_intro')}
                    </p>
                    <div className="space-y-2">
                        <ActionButton
                            label={t('politics.appoint_president_self')}
                            variant="primary"
                            className="bg-cyan-600 hover:bg-cyan-500 w-full"
                            onClick={async () => {
                                if (user?.address) {
                                    await (useGameStore.getState() as any).appointPresident(countryId, user.address);
                                }
                            }}
                        />
                        <ActionButton
                            label={t('politics.appoint_congress_self')}
                            variant="success"
                            className="w-full"
                            onClick={async () => {
                                if (user?.address) {
                                    await (useGameStore.getState() as any).appointCongress(countryId, [user.address]);
                                }
                            }}
                        />
                    </div>
                </Card>
            </div>

            <Card className="p-8 border-dashed border-slate-800 bg-slate-900/20">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                        <Shield className="text-red-500" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">{t('politics.protocol_override')}</h3>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">{t('politics.admin_interface')}</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                        <Label size="tiny">{t('politics.system_status')}</Label>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-black text-white uppercase tracking-widest leading-none">{t('politics.admin_telemetry')}</span>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800">
                        <Label size="tiny">{t('politics.active_operative')}</Label>
                        <div className="text-xs font-mono text-cyan-400 mt-2 truncate">
                            {user?.address}
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );

    const renderActionModal = () => {
        const taxLabels = ['Income Tax', 'Import Tax', 'VAT Rate'];
        const isInvalidDecree = adjustmentMethod === 'decree' && (adjustmentRate < 5 || adjustmentRate > 20);

        return (
            <Modal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                title={t('politics.economic_directive')}
            >
                <div className="space-y-6">
                    <div>
                        <Label size="tiny">{t('politics.target_sector')}</Label>
                        <div className="flex gap-2 mt-2">
                            {taxLabels.map((lbl, idx) => (
                                <button
                                    key={lbl}
                                    onClick={() => setAdjustmentType(idx)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${adjustmentType === idx ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}
                                >
                                    {t(`politics.${lbl.toLowerCase().replace(' ', '_')}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setAdjustmentMethod('decree')}
                            className={`p-4 rounded-xl border text-left transition-all ${adjustmentMethod === 'decree' ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-slate-900 border-slate-800 opacity-50 hover:opacity-100'}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Activity size={14} className={adjustmentMethod === 'decree' ? 'text-cyan-400' : 'text-slate-500'} />
                                <span className="text-[10px] font-black uppercase text-white">{t('politics.decree')}</span>
                            </div>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">{t('politics.decree_intro')}</p>
                        </button>

                        <button
                            onClick={() => setAdjustmentMethod('proposal')}
                            className={`p-4 rounded-xl border text-left transition-all ${adjustmentMethod === 'proposal' ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-900 border-slate-800 opacity-50 hover:opacity-100'}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Gavel size={14} className={adjustmentMethod === 'proposal' ? 'text-emerald-400' : 'text-slate-500'} />
                                <span className="text-[10px] font-black uppercase text-white">{t('politics.proposal')}</span>
                            </div>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight leading-relaxed">{t('politics.proposal_intro')}</p>
                        </button>
                    </div>

                    <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <Label size="tiny">{t('politics.target_rate')}</Label>
                            <div className="text-xl font-mono font-black text-white">{adjustmentRate}%</div>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={adjustmentRate}
                            onChange={(e) => setAdjustmentRate(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <div className="flex justify-between mt-2">
                            <span className="text-[8px] text-slate-600 font-black uppercase">{t('politics.low')}</span>
                            <span className="text-[8px] text-slate-600 font-black uppercase">{t('politics.neutral')}</span>
                            <span className="text-[8px] text-slate-600 font-black uppercase">{t('politics.high')}</span>
                        </div>
                    </div>

                    {isInvalidDecree && (
                        <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex items-center gap-3">
                            <AlertCircle size={16} className="text-red-500 shrink-0" />
                            <p className="text-[9px] text-red-500 font-bold uppercase leading-tight">
                                {t('politics.range_violation')}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsActionModalOpen(false)}
                            className="flex-1 px-4 py-3 bg-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors"
                        >
                            {t('politics.abort')}
                        </button>
                        <button
                            disabled={isInvalidDecree || isSubmitting}
                            onClick={confirmAction}
                            className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${isInvalidDecree || isSubmitting ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'}`}
                        >
                            {isSubmitting ? t('politics.processing') : adjustmentMethod === 'decree' ? t('politics.issue_decree') : t('politics.submit_proposal')}
                        </button>
                    </div>
                </div>
            </Modal>
        );
    };

    const renderWarModal = () => {
        // Filter out current country
        const targetCountries = (Object.keys(COUNTRY_CONFIG) as CountryId[])
            .filter(cid => COUNTRY_IDS[cid] !== countryId);

        // Filter regions by selected country
        const countryRegions = allRegions.filter(r => r.ownerCountry === warTargetCountry);
        const isResistance = isLandless;

        return (
            <Modal
                isOpen={isWarModalOpen}
                onClose={() => setIsWarModalOpen(false)}
                title={isResistance ? t('politics.liberation_protocol') : t('politics.strategic_command')}
            >
                <div className="space-y-6">
                    {/* Method Selection (Only for Presidential Decree/Proposal) */}
                    {!isResistance && (
                        <div>
                            <Label size="tiny">{t('politics.authorization_method')}</Label>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <button
                                    onClick={() => setWarMethod('decree')}
                                    className={`p-4 rounded-xl border text-left transition-all ${warMethod === 'decree' ? 'bg-red-500/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-slate-900 border-slate-800'}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Shield size={14} className={warMethod === 'decree' ? 'text-red-400' : 'text-slate-500'} />
                                        <span className="text-[9px] font-black uppercase text-white">{t('politics.direct_decree')}</span>
                                    </div>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase leading-tight">{t('politics.presidential_action')}</p>
                                </button>

                                <button
                                    onClick={() => setWarMethod('proposal')}
                                    className={`p-4 rounded-xl border text-left transition-all ${warMethod === 'proposal' ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-slate-900 border-slate-800'}`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Gavel size={14} className={warMethod === 'proposal' ? 'text-emerald-400' : 'text-slate-500'} />
                                        <span className="text-[9px] font-black uppercase text-white">{t('politics.congress_proposal')}</span>
                                    </div>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase leading-tight">{t('politics.legislative_vote_note')}</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Country Selection */}
                    <div>
                        <Label size="tiny">{isResistance ? t('politics.federation_to_liberate') : t('politics.target_federation')}</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                            {targetCountries.map(cid => (
                                <button
                                    key={cid}
                                    onClick={() => {
                                        setWarTargetCountry(COUNTRY_IDS[cid]);
                                        setWarTargetRegion(null);
                                    }}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${warTargetCountry === COUNTRY_IDS[cid] ? 'bg-red-500/10 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-slate-900 border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'}`}
                                >
                                    <img src={COUNTRY_CONFIG[cid].flag} className="w-8 h-5 object-cover rounded shadow-sm" alt="" />
                                    <span className="text-[10px] font-black uppercase text-slate-300">{COUNTRY_CONFIG[cid].name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Region Selection */}
                    {warTargetCountry && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-3"
                        >
                            <Label size="tiny">{t('politics.target_region_select')}</Label>
                            <div className="grid grid-cols-1 gap-2">
                                {countryRegions.length > 0 ? (
                                    countryRegions.map(region => (
                                        <button
                                            key={region.id}
                                            onClick={() => setWarTargetRegion(region.id)}
                                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${warTargetRegion === region.id ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-cyan-400">
                                                    <Target size={14} />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-[10px] font-black text-white uppercase">{region.name}</div>
                                                    <div className="text-[8px] text-slate-500 font-bold uppercase">{t('politics.region_id', { id: region.id })}</div>
                                                </div>
                                            </div>
                                            {warTargetRegion === region.id && (
                                                <CheckCircle2 size={14} className="text-cyan-400" />
                                            )}
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 bg-slate-950/50 rounded-xl border border-dashed border-slate-800 text-center">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">{t('politics.no_targetable_regions')}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Operational Warning */}
                    <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-red-500">
                            <AlertCircle size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{t('politics.operational_alert')}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">
                            {isResistance ? (
                                <>{t('politics.resistance_warning', { cost: '250,000' })}</>
                            ) : (
                                <>{t('politics.war_warning', { cost: warMethod === 'decree' ? '1,000,000' : '800,000', timing: warMethod === 'decree' ? t('politics.immediate') : t('politics.after_approval') })}</>
                            )}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsWarModalOpen(false)}
                            className="flex-1 px-4 py-3 bg-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors"
                        >
                            {t('politics.aborted')}
                        </button>
                        <button
                            disabled={!warTargetCountry || !warTargetRegion || isSubmitting}
                            onClick={async () => {
                                if (!warTargetCountry || !warTargetRegion) return;
                                setIsSubmitting(true);
                                try {
                                    if (isResistance) {
                                        await startResistance(warTargetRegion);
                                    } else if (warMethod === 'decree') {
                                        await declareWar(countryId!, warTargetCountry, warTargetRegion);
                                    } else {
                                        await createProposal(countryId!, 3, [warTargetCountry]);
                                    }
                                    setIsWarModalOpen(false);
                                } catch (e) {
                                    console.error(e);
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${!warTargetCountry || !warTargetRegion || isSubmitting ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.3)]'}`}
                        >
                            {isSubmitting ? t('politics.commanding') : isResistance ? t('politics.start_revolution') : warMethod === 'decree' ? t('politics.confirm_mobilization') : t('politics.submit_proposal')}
                        </button>
                    </div>
                </div>
            </Modal>
        );
    };

    const renderDonationModal = () => {
        return (
            <Modal
                isOpen={isDonationModalOpen}
                onClose={() => setIsDonationModalOpen(false)}
                title={t('politics.patriotic_contribution')}
            >
                <div className="space-y-6">
                    <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-xl">
                        <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed text-center">
                            {t('politics.donation_note')}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Label size="tiny">{t('politics.donation_amount')}</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {[1000, 5000, 10000].map(amt => (
                                <button
                                    key={amt}
                                    onClick={() => setDonationAmount(amt)}
                                    className={`py-3 rounded-xl border text-[10px] font-black transition-all ${donationAmount === amt ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
                                >
                                    {amt.toLocaleString()}
                                </button>
                            ))}
                        </div>
                        <Input
                            type="number"
                            autoComplete="off"
                            value={donationAmount}
                            onChange={(e) => setDonationAmount(Number(e.target.value))}
                            placeholder={t('common.custom_amount', {}, 'Custom Amount')}
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsDonationModalOpen(false)}
                            className="flex-1 px-4 py-3 bg-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors"
                        >
                            {t('politics.abort')}
                        </button>
                        <button
                            disabled={donationAmount <= 0 || isSubmitting}
                            onClick={async () => {
                                setIsSubmitting(true);
                                try {
                                    await donateToTreasury(countryId!, donationAmount);
                                    setIsDonationModalOpen(false);
                                } catch (e) {
                                    console.error(e);
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${donationAmount <= 0 || isSubmitting ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'}`}
                        >
                            {isSubmitting ? t('common.sending', {}, 'Sending...') : t('politics.confirm_donation')}
                        </button>
                    </div>
                </div>
            </Modal>
        );
    };

    return (
        <div className="space-y-8 pb-12">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                <TabBar
                    tabs={TABS}
                    activeTab={activeTab}
                    onTabChange={(id) => setActiveTab(id as any)}
                    variant="pills"
                />
            </div>

            <div className="min-h-[650px]">
                <AnimatePresence mode="wait">
                    {activeTab === 'leadership' && renderLeadership()}
                    {activeTab === 'congress' && renderCongress()}
                    {activeTab === 'alliances' && renderAlliances()}
                    {activeTab === 'admin' && renderAdmin()}
                </AnimatePresence>
            </div>

            {renderActionModal()}
            {renderGovModal()}
            {renderWarModal()}
            {renderDonationModal()}
            {renderAllianceModal()}
        </div>
    );

    function renderGovModal() {
        const motionLabels: Record<number, string> = {
            1: t('politics.tax_amendment'),
            2: t('politics.treasury_withdrawal', {}, 'Treasury Withdrawal'),
            4: t('politics.impeachment'),
            5: t('politics.min_wage_law'),
            6: t('politics.congress_size_adjustment', {}, 'Congress Size Adjustment'),
            7: t('politics.official_salary_adjustment', {}, 'Official Salary Adjustment')
        };

        return (
            <Modal
                isOpen={isGovModalOpen}
                onClose={() => setIsGovModalOpen(false)}
                title={t('politics.legislative_motion', { motion: motionLabels[govProposalType] })}
            >
                <div className="space-y-6">
                    {/* Category Selection */}
                    <div>
                        <Label size="tiny">{t('politics.motion_category')}</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                            {[1, 2, 5, 6, 7, 8, 9].map(type => {
                                const cd = (cooldowns[countryId!] || []).find(c => c.topicType === type);
                                const onCooldown = cd && (Date.now() / 1000) < cd.lastTime + (isPres ? 259200 : 604800);
                                const timeLeft = cd ? Math.ceil((cd.lastTime + (isPres ? 259200 : 604800) - Date.now() / 1000) / 3600) : 0;

                                return (
                                    <button
                                        key={type}
                                        disabled={onCooldown}
                                        onClick={() => {
                                            setGovProposalType(type);
                                            // Reset values to safe defaults based on contract constraints
                                            if (type === 1) setGovTargetValue(10); // 10% Tax
                                            if (type === 2) setGovTargetValue(1000); // 1000 CRED
                                            if (type === 5) setGovTargetValue(50); // 50 CRED (Min 10)
                                            if (type === 6) setGovTargetValue(7); // 7 members (Min 4)
                                            if (type === 7) setGovTargetValue(100); // 100 CRED salary
                                        }}
                                        className={`relative px-2 py-3 rounded-lg text-[8px] font-black uppercase border transition-all ${govProposalType === type ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'} ${onCooldown ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    >
                                        {motionLabels[type]}
                                        {onCooldown && (
                                            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[6px] px-1 rounded-full font-mono">{timeLeft}h</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {govProposalType === 1 && (
                        <div>
                            <Label size="tiny">{t('politics.target_tax_sector')}</Label>
                            <div className="flex gap-2 mt-2">
                                {['Income', 'Import', 'VAT'].map((lbl, idx) => (
                                    <button
                                        key={lbl}
                                        onClick={() => setGovRoleType(idx)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${govRoleType === idx ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}
                                    >
                                        {t(`politics.${lbl.toLowerCase()}`)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {govProposalType === 2 && (
                        <div>
                            <Label size="tiny">{t('politics.recipient_address')}</Label>
                            <Input
                                value={govTargetAddress}
                                onChange={(e) => setGovTargetAddress(e.target.value)}
                                placeholder="0x..."
                                className="mt-2 text-xs font-mono"
                            />
                        </div>
                    )}

                    {govProposalType === 7 && (
                        <div>
                            <Label size="tiny">{t('politics.target_role', {}, 'Target Role')}</Label>
                            <div className="flex gap-2 mt-2">
                                {[
                                    { label: 'President', value: 0 },
                                    { label: 'Congress', value: 1 }
                                ].map((role) => (
                                    <button
                                        key={role.label}
                                        onClick={() => {
                                            setGovRoleType(role.value);
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all ${govRoleType === role.value ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}
                                    >
                                        {t(`politics.${role.label.toLowerCase()}`)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}


                    {(govProposalType === 1 || govProposalType === 2 || govProposalType === 5 || govProposalType === 6 || govProposalType === 7) && (
                        <div className="p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                            <div className="flex justify-between items-center mb-4">
                                <Label size="tiny">
                                    {govProposalType === 1 ? t('politics.proposed_rate') :
                                        govProposalType === 2 ? t('politics.amount_cred') :
                                            govProposalType === 6 ? t('politics.congress_size_label') : t('politics.target_amount_cred')}
                                </Label>
                                <div className="text-xl font-mono font-black text-white">
                                    {govTargetValue.toLocaleString()}{govProposalType === 1 ? "%" : ""}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <input
                                    type="range"
                                    min={
                                        govProposalType === 1 ? 0 :
                                            govProposalType === 5 ? 10 :
                                                govProposalType === 6 ? 4 : 0
                                    }
                                    max={
                                        govProposalType === 1 ? 100 :
                                            govProposalType === 2 ? Math.floor(countryBalance / 100) :
                                                govProposalType === 6 ? 25 : 1000
                                    }
                                    step={
                                        (govProposalType === 6 || govProposalType === 1) ? 1 : 5
                                    }
                                    value={govTargetValue}
                                    onChange={(e) => setGovTargetValue(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                />
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-[7px] font-black text-slate-600 uppercase tracking-tighter">
                                        {t('politics.min')}: {
                                            govProposalType === 1 ? "0%" :
                                                govProposalType === 5 ? `10 ${t('common.cred', {}, 'CRED')}` :
                                                    govProposalType === 6 ? `4 ${t('common.seats', {}, 'SEATS')}` : `0 ${t('common.cred', {}, 'CRED')}`
                                        }
                                    </span>
                                    <span className="text-[7px] font-black text-slate-600 uppercase tracking-tighter">
                                        {t('politics.max')}: {
                                            govProposalType === 1 ? "100%" :
                                                govProposalType === 2 ? `${Math.floor(countryBalance / 100).toLocaleString()} ${t('common.cred', {}, 'CRED')}` :
                                                    govProposalType === 6 ? `25 ${t('common.seats', {}, 'SEATS')}` : `1,000 ${t('common.cred', {}, 'CRED')}`
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-emerald-500">
                            <Gavel size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{t('politics.protocol_active')}</span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed">
                            {t('politics.majority_required')}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsGovModalOpen(false)}
                            className="flex-1 px-4 py-3 bg-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors"
                        >
                            {t('politics.abort')}
                        </button>
                        <button
                            disabled={isSubmitting}
                            onClick={async () => {
                                setIsSubmitting(true);
                                try {
                                    const args = packProposalData(
                                        govProposalType,
                                        govTargetValue,
                                        govTargetAddress,
                                        govRoleType
                                    );

                                    await createProposal(countryId!, govProposalType, args);
                                    fetchProposals();
                                    setIsGovModalOpen(false);
                                } catch (e) {
                                    console.error(e);
                                } finally {
                                    setIsSubmitting(false);
                                }
                            }}
                            className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${isSubmitting ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
                        >
                            {isSubmitting ? t('politics.commanding') : t('politics.initiate_vote_action')}
                        </button>
                    </div>
                </div>
            </Modal>
        );
    }

}
