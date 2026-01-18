'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Flag, Users, Vote, Gavel,
    Trophy, Clock, UserPlus,
    CheckCircle2, XCircle, AlertCircle,
    ChevronRight, Info
} from 'lucide-react';
import { Button } from '@/components/Button';

import { useGameStore } from '@/lib/store';
import { CountryId, COUNTRY_CONFIG } from '@/lib/types';

export default function PoliticsPage() {
    const {
        user,
        countryData,
        proposals,
        electionCandidates,
        isCongressMember,
        fetchCountryData,
        fetchProposals,
        fetchCandidates,
        checkCongressMembership,
        registerAsCandidate,
        voteForCandidate,
        voteOnProposal,
        createProposal
    } = useGameStore();

    const countryId = user?.citizenship === 'TR' ? 1
        : user?.citizenship === 'US' ? 2
            : 1; // Default fallback

    const data = countryData[countryId];
    const candidates = electionCandidates[countryId] || [];

    // Check if user is president
    const isPresident = user && data && data.president === user.walletAddress;

    const [hasVoted, setHasVoted] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [showProposeModal, setShowProposeModal] = useState(false);

    useEffect(() => {
        if (countryId) {
            fetchCountryData(countryId);
            fetchProposals();
            fetchCandidates(countryId);
            checkCongressMembership(countryId);
        }
    }, [countryId]);

    const handleRegister = () => {
        registerAsCandidate(countryId);
        setIsRegistered(true);
    };

    const handleVoteCandidate = (idx: number) => {
        voteForCandidate(countryId, idx);
        setHasVoted(true);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-white flex items-center gap-4">
                    {COUNTRY_CONFIG[user?.citizenship as CountryId] ? (
                        <img src={COUNTRY_CONFIG[user?.citizenship as CountryId].flag} className="w-12 h-7 object-cover rounded-md shadow-lg border-2 border-white/10" alt="" />
                    ) : (
                        <Flag className="text-cyan-400" size={32} />
                    )}
                    Politics of {COUNTRY_CONFIG[user?.citizenship as CountryId]?.name || 'Your Country'}
                </h1>
                <p className="text-slate-400 mt-2">Manage your country's leadership, taxes, and diplomatic relations.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Current Leadership & Elections */}
                <div className="lg:col-span-2 space-y-8">

                    {/* President Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-800/60 backdrop-blur-md rounded-2xl border-2 border-slate-700/50 overflow-hidden shadow-2xl"
                    >
                        <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-slate-700 border-2 border-cyan-500 flex items-center justify-center text-3xl">
                                    🤴
                                </div>
                                <div>
                                    <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Current President</div>
                                    <div className="text-2xl font-black text-white">{data?.president ? `${data.president.substring(0, 10)}...` : 'NONE'}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-slate-400">Term Status</div>
                                <div className="text-sm font-bold text-white flex items-center gap-1 justify-end">
                                    <Clock size={14} className="text-amber-400" />
                                    {data?.electionActive ? 'Election Ongoing' : 'Stable'}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-3 gap-4">
                            <SmallStat label="Income Tax" value={`${data?.incomeTax || 0}%`} />
                            <SmallStat label="Import Tax" value={`${data?.importTax || 0}%`} />
                            <SmallStat label="VAT" value={`${data?.vat || 0}%`} />
                        </div>
                    </motion.div>

                    {/* Election Section */}
                    {data?.electionActive && (
                        <Card title="Presidential Elections" icon={<Vote className="text-orange-400" />}>
                            <div className="space-y-6">
                                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Clock className="text-orange-400" size={20} />
                                        <div>
                                            <div className="text-sm font-bold text-white">Election is LIVE</div>
                                            <div className="text-xs text-slate-400">Cast your vote for the next term.</div>
                                        </div>
                                    </div>
                                    {!isRegistered && user && user.level >= 10 && (
                                        <Button
                                            onClick={handleRegister}
                                            className="bg-orange-500 hover:bg-orange-600 gap-2"
                                        >
                                            <UserPlus size={16} /> Register as Candidate
                                        </Button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <h4 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Running Candidates</h4>
                                    {candidates.map((candidate, idx) => (
                                        <div key={candidate.address} className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50 flex items-center justify-between hover:border-cyan-500/30 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-500">
                                                    #{idx + 1}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">{candidate.address.substring(0, 10)}...</div>
                                                    <div className="text-[10px] text-slate-500 font-mono">{candidate.address}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <div className="text-lg font-black text-white">{candidate.votes}</div>
                                                    <div className="text-[10px] text-slate-500 uppercase">Votes</div>
                                                </div>
                                                <Button
                                                    disabled={hasVoted}
                                                    onClick={() => handleVoteCandidate(idx)}
                                                    variant={hasVoted ? "outline" : "default"}
                                                    size="sm"
                                                    className={hasVoted ? "border-slate-700 text-slate-500" : "bg-cyan-600 hover:bg-cyan-500"}
                                                >
                                                    {hasVoted ? "Voted" : "Vote"}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Column: News & Proposals */}
                <div className="space-y-8">
                    {/* Congress Proposals */}
                    <Card title="Congress Proposals" icon={<Gavel className="text-amber-400" />}>
                        <div className="space-y-4">
                            {proposals.filter(p => p.countryId === countryId).map(proposal => (
                                <div key={proposal.id} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black rounded uppercase">
                                            {proposal.type === 1 ? 'Tax Change' : 'Treasury'}
                                        </span>
                                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                            <Clock size={10} /> {proposal.executed ? 'Executed' : 'Pending'}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        Proposal #{proposal.id} created by {proposal.proposer.substring(0, 10)}...
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[10px] font-bold">
                                            <span className="text-emerald-400">{proposal.yesVotes} YES</span>
                                            <span className="text-rose-400">{proposal.noVotes} NO</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                                            <div
                                                className="h-full bg-emerald-500"
                                                style={{ width: `${(proposal.yesVotes / (Math.max(1, proposal.yesVotes + proposal.noVotes))) * 100}%` }}
                                            />
                                            <div
                                                className="h-full bg-rose-500"
                                                style={{ width: `${(proposal.noVotes / (Math.max(1, proposal.yesVotes + proposal.noVotes))) * 100}%` }}
                                            />
                                        </div>
                                    </div>

                                    {!proposal.executed && (
                                        <div className="flex gap-2 pt-2">
                                            <button
                                                onClick={() => voteOnProposal(proposal.id, true)}
                                                className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20 transition-all"
                                            >
                                                VOTE YES
                                            </button>
                                            <button
                                                onClick={() => voteOnProposal(proposal.id, false)}
                                                className="flex-1 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-lg border border-rose-500/20 transition-all"
                                            >
                                                VOTE NO
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isCongressMember && (
                                <Button
                                    onClick={() => {
                                        const taxType = prompt("Tax Type: 0=Income, 1=Import, 2=VAT");
                                        const rate = prompt("New Rate (0-100):");
                                        if (taxType !== null && rate !== null) {
                                            createProposal(countryId, 1, [parseInt(taxType), parseInt(rate)]);
                                        }
                                    }}
                                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold mb-2"
                                >
                                    PROPOSE NEW LAW
                                </Button>
                            )}
                            <Button variant="outline" className="w-full border-slate-700 text-slate-400 hover:text-white mt-2 text-xs">
                                View Archive
                            </Button>
                        </div>
                    </Card>

                    {/* Info Card */}
                    <div className="p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                                <Info size={20} />
                            </div>
                            <h3 className="font-bold text-white">How it works?</h3>
                        </div>
                        <ul className="space-y-3 text-xs text-slate-400 leading-relaxed">
                            <li className="flex gap-2">
                                <span className="text-indigo-400">•</span>
                                Elections occur every 30 days. Anyone with Level 10+ can run as a candidate.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-indigo-400">•</span>
                                Citizens vote for the President. The President manages taxes and wars.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-indigo-400">•</span>
                                Congress members (Top 20 XP) can create and vote on economic proposals.
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Card({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden shadow-xl"
        >
            <div className="p-5 border-b border-slate-700/50 flex items-center gap-3">
                {icon}
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">{title}</h3>
            </div>
            <div className="p-6">
                {children}
            </div>
        </motion.div>
    );
}

function SmallStat({ label, value }: { label: string, value: string }) {
    return (
        <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/30 text-center">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">{label}</div>
            <div className="text-xl font-black text-cyan-400">{value}</div>
        </div>
    );
}
