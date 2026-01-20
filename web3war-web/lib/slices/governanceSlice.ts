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
    initializeGovernance: () => Promise<void>;
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
        if (!user || !user.address) return;
        try {
            const { ContractService } = await import('../contract-service');
            const isMember = await (ContractService as any).checkCongressMember(user.address, countryId);
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
                await get().idsAlert("Candidate registration sent!", "Election Bureau", "success");
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
                await get().idsAlert("Vote casted successfully!", "Election Bureau", "success");
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
                await get().idsAlert("Proposal created!", "Congress Registry", "success");
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
                await get().idsAlert("Vote on proposal sent!", "Congress Registry", "success");
                setTimeout(() => get().fetchProposals(), 3000);
            }
        } catch (e) {
            console.error("Proposal voting failed:", e);
        }
    },

    initializeGovernance: async () => {
        try {
            const { ContractService } = await import('../contract-service');
            const countries = [
                { id: 1, name: 'Nigeria' },
                { id: 2, name: 'Ukraine' },
                { id: 3, name: 'Russia' },
                { id: 4, name: 'United States' },
                { id: 5, name: 'Turkey' },
                { id: 6, name: 'India' },
                { id: 7, name: 'Spain' },
                { id: 8, name: 'Poland' },
                { id: 9, name: 'Brazil' },
                { id: 10, name: 'France' }
            ];

            for (const country of countries) {
                console.log(`Setting up ${country.name}...`);
                await ContractService.setupCountry(country.id, country.name);
                // Mini delay to avoid sequence number issues if not handled by SDK
                await new Promise(r => setTimeout(r, 500));
            }

            await get().idsAlert("Governance initialized with 10 countries!", "Foundation Protocol", "success");
        } catch (e) {
            console.error("Governance initialization failed:", e);
            await get().idsAlert("Failed to initialize governance", "System Error", "error");
        }
    }
});
