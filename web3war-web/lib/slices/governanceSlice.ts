import { StateCreator } from 'zustand';
import { GameState } from '../store';
import { Proposal, ElectionCandidate, CountryData } from '../types';

export interface GovernanceSlice {
    countryData: Record<number, CountryData>;
    proposals: Proposal[];
    electionCandidates: Record<number, ElectionCandidate[]>;
    isCongressMember: boolean;

    fetchCountryData: (countryId: number) => Promise<void>;
    fetchProposals: () => Promise<void>;
    fetchCandidates: (countryId: number) => Promise<void>;
    checkCongressMembership: (countryId: number) => Promise<void>;

    registerAsCandidate: (countryId: number) => Promise<void>;
    voteForCandidate: (countryId: number, candidateIdx: number) => Promise<void>;
    createProposal: (countryId: number, type: number, data: number[]) => Promise<void>;
    voteOnProposal: (proposalId: number, support: boolean) => Promise<void>;
}

export const createGovernanceSlice: StateCreator<GameState, [], [], GovernanceSlice> = (set, get) => ({
    countryData: {},
    proposals: [],
    electionCandidates: {},
    isCongressMember: false,

    fetchCountryData: async (countryId) => {
        try {
            const { ContractService } = await import('../contract-service');
            const data = await ContractService.getCountryData(countryId);
            if (data) {
                set(state => ({
                    countryData: { ...state.countryData, [countryId]: { ...data, id: countryId } }
                }));
            }
        } catch (e) {
            console.error("Store: Failed to fetch country data", e);
        }
    },

    checkCongressMembership: async (countryId) => {
        const { user } = get();
        if (!user || !user.walletAddress) return;
        try {
            const { ContractService } = await import('../contract-service');
            const isMember = await ContractService.checkCongressMember(user.walletAddress, countryId);
            set({ isCongressMember: !!isMember });
        } catch (e) {
            console.error("Store: Failed to check congress membership", e);
        }
    },

    fetchProposals: async () => {
        try {
            const { ContractService } = await import('../contract-service');
            const chainProposals = await ContractService.getProposals();

            const mapped: Proposal[] = chainProposals.map((p: any) => ({
                id: Number(p.id),
                countryId: Number(p.country_id),
                proposer: p.proposer,
                type: Number(p.proposal_type),
                data: p.data,
                yesVotes: Number(p.yes_votes),
                noVotes: Number(p.no_votes),
                executed: p.executed,
                createdAt: Number(p.created_at)
            }));

            set({ proposals: mapped });
        } catch (e) {
            console.error("Store: Failed to fetch proposals", e);
        }
    },

    fetchCandidates: async (countryId) => {
        try {
            const { ContractService } = await import('../contract-service');
            const data = await ContractService.getCandidates(countryId);

            // Note: We don't have username yet in this call, we might need a separate profile fetch or assume it for now
            const candidates: ElectionCandidate[] = data.addresses.map((addr: string, idx: number) => ({
                address: addr,
                username: `Candidate ${addr.substring(0, 6)}`,
                votes: data.votes[idx]
            }));

            set(state => ({
                electionCandidates: { ...state.electionCandidates, [countryId]: candidates }
            }));
        } catch (e) {
            console.error("Store: Failed to fetch candidates", e);
        }
    },

    registerAsCandidate: async (countryId) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.registerCandidate(countryId);
            if (tx) {
                alert("Candidate registration sent!");
                setTimeout(() => get().fetchCandidates(countryId), 3000);
            }
        } catch (e) {
            console.error("Registration failed:", e);
        }
    },

    voteForCandidate: async (countryId, candidateIdx) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.vote(countryId, candidateIdx);
            if (tx) {
                alert("Vote casted successfully!");
                setTimeout(() => get().fetchCandidates(countryId), 3000);
            }
        } catch (e) {
            console.error("Voting failed:", e);
        }
    },

    createProposal: async (countryId, type, data) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.createProposal(countryId, type, data);
            if (tx) {
                alert("Proposal created!");
                setTimeout(() => get().fetchProposals(), 3000);
            }
        } catch (e) {
            console.error("Proposal creation failed:", e);
        }
    },

    voteOnProposal: async (proposalId, support) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.voteProposal(proposalId, support);
            if (tx) {
                alert("Vote on proposal sent!");
                setTimeout(() => get().fetchProposals(), 3000);
            }
        } catch (e) {
            console.error("Proposal voting failed:", e);
        }
    }
});
