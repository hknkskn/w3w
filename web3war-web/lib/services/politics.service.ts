import { BaseService, WE3WAR_MODULES, parseMoveString } from './base.service';
import { BCS } from 'supra-l1-sdk';

export const PoliticsService = {
    getCountryData: async (countryId: number) => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.GOVERNANCE}::get_country_data`, [], [countryId]);
            return result?.result?.[0] || result?.[0];
        } catch (e) {
            return null;
        }
    },

    getProposals: async () => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.GOVERNANCE}::get_proposals`, [], []);
            return result?.result?.[0] || result?.[0] || [];
        } catch (e) {
            return [];
        }
    },

    checkCongressMember: async (address: string, countryId: number) => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.GOVERNANCE}::is_congress_member`, [], [address, countryId]);
            const val = result?.result?.[0] || result?.[0];
            return val === true;
        } catch (e) {
            return false;
        }
    },

    getCandidates: async (countryId: number) => {
        try {
            const data = await BaseService.view(`${WE3WAR_MODULES.GOVERNANCE}::get_candidates`, [], [countryId]);
            if (!data || !Array.isArray(data)) return { addresses: [], votes: [] };
            return {
                addresses: data[0] || [],
                votes: data[1] || []
            };
        } catch (e) {
            return { addresses: [], votes: [] };
        }
    },

    getTaxRates: async (countryId: number) => {
        try {
            const data = await BaseService.view(`${WE3WAR_MODULES.GOVERNANCE}::get_tax_rates`, [], [countryId]);
            if (!data || !Array.isArray(data)) return null;
            return {
                incomeTax: Number(data[0]),
                importTax: Number(data[1]),
                vat: Number(data[2])
            };
        } catch (e) {
            return null;
        }
    },

    registerCandidate: async (countryId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "register_candidate",
            [],
            [Array.from(BCS.bcsSerializeU8(countryId))]
        );
    },

    vote: async (countryId: number, candidateIdx: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "vote",
            [],
            [
                Array.from(BCS.bcsSerializeU8(countryId)),
                Array.from(BCS.bcsSerializeUint64(candidateIdx))
            ]
        );
    },

    createProposal: async (countryId: number, type: number, data: number[]): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "create_proposal",
            [],
            [
                Array.from(BCS.bcsSerializeU8(countryId)),
                Array.from(BCS.bcsSerializeU8(type)),
                Array.from(BCS.bcsSerializeBytes(new Uint8Array(data)))
            ]
        );
    },

    voteProposal: async (proposalId: number, approve: boolean): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "vote_proposal",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(proposalId)),
                Array.from(BCS.bcsSerializeBool(approve))
            ]
        );
    },

    setupCountry: async (id: number, name: string): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "setup_country",
            [],
            [
                Array.from(BCS.bcsSerializeU8(id)),
                Array.from(BCS.bcsSerializeBytes(new TextEncoder().encode(name)))
            ]
        );
    }
};
