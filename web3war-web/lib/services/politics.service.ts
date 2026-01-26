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
                electionActive: data[5] === true,
                electionEndTime: Number(data[6] || 0)
            };
        } catch (e) {
            return null;
        }
    },

    getProposals: async () => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.GOVERNANCE}::get_all_proposals`, [], []);
            return result?.[0] || [];
        } catch (e) {
            console.error("Failed to fetch proposals", e);
            return [];
        }
    },

    isCongressMember: async (address: string, countryId: number) => {
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
                Array.from(BCS.bcsSerializeUint64(BigInt(proposalId))),
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

    getCountryGovernanceData: async (countryId: number) => {
        try {
            const data = await BaseService.view(`${WE3WAR_MODULES.GOVERNANCE}::get_country_governance_data`, [], [countryId]);
            if (!data || !Array.isArray(data)) return null;
            return {
                minWage: Number(data[0]),
                maxCongress: Number(data[1]),
                presSalary: Number(data[2]),
                congSalary: Number(data[3])
            };
        } catch (e) {
            return null;
        }
    },

    getWarStatus: async (countryId: number) => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.GOVERNANCE}::get_war_status`, [], [countryId]);
            return result?.result?.[0] || result?.[0] || [];
        } catch (e) {
            return [];
        }
    },

    getClaimableSalary: async (addr: string, countryId: number) => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.GOVERNANCE}::get_claimable_salary`, [], [addr, countryId]);
            return Number(result?.result?.[0] || result?.[0] || 0);
        } catch (e) {
            return 0;
        }
    },

    getCongressElectionData: async (countryId: number) => {
        try {
            const data = await BaseService.view(`${WE3WAR_MODULES.GOVERNANCE}::get_congress_election_data`, [], [countryId]);
            if (!data || !Array.isArray(data)) return null;
            return {
                active: data[0] === true,
                endTime: Number(data[1]),
                candidates: data[2] || [],
                votes: data[3] || []
            };
        } catch (e) {
            return null;
        }
    },

    claimSalary: async (countryId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "claim_salary",
            [],
            [Array.from(BCS.bcsSerializeU8(countryId))]
        );
    },

    startCongressElection: async (countryId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "start_congress_election",
            [],
            [Array.from(BCS.bcsSerializeU8(countryId))]
        );
    },

    registerCongressCandidate: async (countryId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "register_congress_candidate",
            [],
            [Array.from(BCS.bcsSerializeU8(countryId))]
        );
    },

    voteCongress: async (countryId: number, candidateIdx: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "vote_congress",
            [],
            [
                Array.from(BCS.bcsSerializeU8(countryId)),
                Array.from(BCS.bcsSerializeUint64(candidateIdx))
            ]
        );
    },

    endCongressElection: async (countryId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "end_congress_election",
            [],
            [Array.from(BCS.bcsSerializeU8(countryId))]
        );
    },

    finalizeProposal: async (proposalId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "finalize_proposal",
            [],
            [Array.from(BCS.bcsSerializeUint64(BigInt(proposalId)))]
        );
    },

    declareWar: async (countryId: number, targetCountryId: number, targetRegionId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "declare_war",
            [],
            [
                Array.from(BCS.bcsSerializeU8(countryId)),
                Array.from(BCS.bcsSerializeU8(targetCountryId)),
                Array.from(BCS.bcsSerializeUint64(BigInt(targetRegionId)))
            ]
        );
    },

    startResistance: async (targetRegionId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GOVERNANCE.split('::')[0],
            WE3WAR_MODULES.GOVERNANCE.split('::')[1],
            "start_resistance",
            [],
            [Array.from(BCS.bcsSerializeUint64(BigInt(targetRegionId)))]
        );
    },

    isCountryLandless: async (countryId: number): Promise<boolean> => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.TERRITORY}::is_country_landless`, [], [countryId]);
            return result?.[0] === true;
        } catch (e) {
            return false;
        }
    },

    getReclaimableRegions: async (countryId: number): Promise<number[]> => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.TERRITORY}::get_reclaimable_regions`, [], [countryId]);
            return result?.[0] || [];
        } catch (e) {
            return [];
        }
    },

    getCountryTerritoryCount: async (countryId: number): Promise<number> => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.TERRITORY}::get_country_territory_count`, [], [countryId]);
            return Number(result?.[0] || 0);
        } catch (e) {
            return 0;
        }
    },

    initiateImpeachment: async (countryId: number) => {
        try {
            const tx = await (PoliticsService as any).sendDeclareImpeachment(countryId); // Fixed reference
            return tx;
        } catch (e) {
            throw e;
        }
    },

    sendDeclareImpeachment: async (countryId: number): Promise<string> => {
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
    },

    donateToTreasury: async (countryId: number, amount: number): Promise<string> => {
        // CRED has 2 decimals, scale by 100
        const rawAmount = BigInt(Math.floor(amount * 100));
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.TREASURY.split('::')[0],
            WE3WAR_MODULES.TREASURY.split('::')[1],
            "donate_to_treasury",
            [],
            [
                Array.from(BCS.bcsSerializeU8(countryId)),
                Array.from(BCS.bcsSerializeUint64(rawAmount))
            ]
        );
    },

    getTopDonors: async (countryId: number) => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.TREASURY}::get_top_donors`, [], [countryId]);
            return result?.[0] || [];
        } catch (e) {
            return [];
        }
    },

    getCooldowns: async (countryId: number) => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.GOVERNANCE}::get_cooldowns`, [], [countryId]);
            return result || [[], []];
        } catch (e) {
            return [[], []];
        }
    }
};
