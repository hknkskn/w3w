import { BaseService, WE3WAR_MODULES } from './base.service';
import { BCS } from 'supra-l1-sdk';

export const AllianceService = {
    proposeMpp: async (targetCountry: number, durationDays: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.ALLIANCE.split('::')[0],
            WE3WAR_MODULES.ALLIANCE.split('::')[1],
            "propose_mpp",
            [],
            [
                Array.from(BCS.bcsSerializeU8(targetCountry)),
                Array.from(BCS.bcsSerializeUint64(BigInt(durationDays)))
            ]
        );
    },

    acceptMpp: async (proposerCountry: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.ALLIANCE.split('::')[0],
            WE3WAR_MODULES.ALLIANCE.split('::')[1],
            "accept_mpp",
            [],
            [Array.from(BCS.bcsSerializeU8(proposerCountry))]
        );
    },

    getMyPendingProposals: async (callerAddress: string) => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.ALLIANCE}::get_my_pending_proposals`, [], [callerAddress]);
            return result?.[0] || [];
        } catch (e) {
            return [];
        }
    },

    getActiveMpps: async () => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.ALLIANCE}::get_active_mpps`, [], []);
            return result?.[0] || [];
        } catch (e) {
            return [];
        }
    },

    hasMpp: async (countryA: number, countryB: number): Promise<boolean> => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.ALLIANCE}::has_mpp`, [], [countryA, countryB]);
            return result?.[0] === true;
        } catch (e) {
            return false;
        }
    }
};
