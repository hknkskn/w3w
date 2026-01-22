import { BaseService, WE3WAR_MODULES } from './base.service';
import { BCS } from 'supra-l1-sdk';
import { TxnBuilderTypes } from 'supra-l1-sdk-core';

export const GameTreasuryService = {
    getBalance: async () => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.GAME_TREASURY}::get_balance`, [], []);
            return Number(result?.[0] || 0);
        } catch (e) {
            return 0;
        }
    },

    getStats: async () => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.GAME_TREASURY}::get_stats`, [], []);
            if (!result) return null;
            return {
                balance: Number(result[0]),
                totalReceived: Number(result[1]),
                totalDistributed: Number(result[2]),
                totalDeflated: Number(result[3])
            };
        } catch (e) {
            return null;
        }
    },

    getPendingWarRewards: async (countryId: number) => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.GAME_TREASURY}::get_pending_war_rewards`, [], [String(countryId)]);
            return result?.[0] || [];
        } catch (e) {
            return [];
        }
    },

    getPendingHeroRewards: async (address: string) => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.GAME_TREASURY}::get_pending_hero_rewards`, [], [address]);
            return result?.[0] || [];
        } catch (e) {
            return [];
        }
    },

    claimWarReward: async (battleId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GAME_TREASURY.split('::')[0],
            WE3WAR_MODULES.GAME_TREASURY.split('::')[1],
            "claim_war_reward",
            [],
            [Array.from(BCS.bcsSerializeUint64(battleId))]
        );
    },

    claimHeroReward: async (battleId: number, round: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GAME_TREASURY.split('::')[0],
            WE3WAR_MODULES.GAME_TREASURY.split('::')[1],
            "claim_hero_reward",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(battleId)),
                Array.from(BCS.bcsSerializeU8(round))
            ]
        );
    },

    // --- Admin Functions ---

    adminDeposit: async (amount: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GAME_TREASURY.split('::')[0],
            WE3WAR_MODULES.GAME_TREASURY.split('::')[1],
            "admin_deposit",
            [],
            [Array.from(BCS.bcsSerializeUint64(amount))]
        );
    },

    adminForceClaimWar: async (battleId: number, targetCountryId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GAME_TREASURY.split('::')[0],
            WE3WAR_MODULES.GAME_TREASURY.split('::')[1],
            "admin_force_claim_war",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(battleId)),
                Array.from(BCS.bcsSerializeU8(targetCountryId))
            ]
        );
    },

    adminCancelWarReward: async (battleId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GAME_TREASURY.split('::')[0],
            WE3WAR_MODULES.GAME_TREASURY.split('::')[1],
            "admin_cancel_war_reward",
            [],
            [Array.from(BCS.bcsSerializeUint64(battleId))]
        );
    },

    cleanupExpiredRewards: async (): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.GAME_TREASURY.split('::')[0],
            WE3WAR_MODULES.GAME_TREASURY.split('::')[1],
            "cleanup_expired_rewards",
            [],
            []
        );
    }
};
