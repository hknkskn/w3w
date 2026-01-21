import { BaseService, WE3WAR_MODULES, parseMoveString } from './base.service';
import { BCS } from 'supra-l1-sdk';
import { TxnBuilderTypes } from 'supra-l1-sdk-core';

export const PoliticsService = {
    getCountryData: async (countryId: number) => {
        try {
            const data = await BaseService.view(`${WE3WAR_MODULES.GOVERNANCE}::get_country_data`, [], [countryId]);
            if (!data || !Array.isArray(data)) return null;
            return {
                name: parseMoveString(data[0]),
                president: data[1],
                incomeTax: Number(data[2]),
                importTax: Number(data[3]),
                vat: Number(data[4]),
                electionActive: data[5] === true
            };
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
    },

    getTreasuryBalance: async (countryId: number): Promise<number> => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.TREASURY}::get_balance`, [], [countryId]);
            return Number(result?.result?.[0] || result?.[0] || 0);
        } catch (e) {
            return 0;
        }
    },

    startElection: async (countryId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "start_election",
            [],
            [Array.from(BCS.bcsSerializeU8(countryId))]
        );
    },

    endElection: async (countryId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "end_election",
            [],
            [Array.from(BCS.bcsSerializeU8(countryId))]
        );
    },

    appointCongress: async (countryId: number, members: string[]): Promise<string> => {
        const membersArr = members.map(m => TxnBuilderTypes.AccountAddress.fromHex(m));
        const serializer = new BCS.Serializer();
        BCS.serializeVector(membersArr, serializer);

        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "appoint_congress",
            [],
            [
                Array.from(BCS.bcsSerializeU8(countryId)),
                Array.from(serializer.getBytes())
            ]
        );
    },

    appointPresident: async (countryId: number, president: string): Promise<string> => {
        const presidentAddr = TxnBuilderTypes.AccountAddress.fromHex(president);
        const serializer = new BCS.Serializer();
        presidentAddr.serialize(serializer);

        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "appoint_president",
            [],
            [
                Array.from(BCS.bcsSerializeU8(countryId)),
                Array.from(serializer.getBytes())
            ]
        );
    },

    initiateWarDeclaration: async (countryId: number, targetCountryId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "declare_war",
            [],
            [
                Array.from(BCS.bcsSerializeU8(countryId)),
                Array.from(BCS.bcsSerializeU8(targetCountryId))
            ]
        );
    },

    initiateImpeachment: async (countryId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "initiate_impeachment",
            [],
            [Array.from(BCS.bcsSerializeU8(countryId))]
        );
    },

    executiveDecree: async (countryId: number, taxType: number, newRate: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "executive_decree",
            [],
            [
                Array.from(BCS.bcsSerializeU8(countryId)),
                Array.from(BCS.bcsSerializeU8(taxType)),
                Array.from(BCS.bcsSerializeU8(newRate))
            ]
        );
    }
};
