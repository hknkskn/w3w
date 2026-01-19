import { BaseService, WE3WAR_MODULES, parseMoveString, hexToUint8Array } from './base.service';
import { BCS } from 'supra-l1-sdk';

export const BattleService = {
    // --- Training ---

    train: async (regimenId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.TRAINING.split('::')[0],
            WE3WAR_MODULES.TRAINING.split('::')[1],
            "train",
            [],
            [Array.from(BCS.bcsSerializeUint64(regimenId))]
        );
    },

    trainMulti: async (regimenIds: number[]): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.TRAINING.split('::')[0],
            WE3WAR_MODULES.TRAINING.split('::')[1],
            "train_multi",
            [],
            [
                Array.from(BCS.bcsSerializeBytes(new Uint8Array(regimenIds)))
            ]
        );
    },

    upgradeTrainingGrounds: async (regimenId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.TRAINING.split('::')[0],
            WE3WAR_MODULES.TRAINING.split('::')[1],
            "upgrade_building",
            [],
            [Array.from(BCS.bcsSerializeU8(regimenId))]
        );
    },

    getTrainingInfo: async (address: string) => {
        try {
            const data = await BaseService.view(`${WE3WAR_MODULES.TRAINING}::get_training_info`, [], [address]);
            if (!data || !Array.isArray(data) || data.length < 3) return null;

            let qualities = data[0];
            if (typeof qualities === 'string') {
                qualities = hexToUint8Array(qualities);
            }

            return {
                qualities: Array.isArray(qualities) ? qualities.map(v => Number(v)) : [1, 1, 1, 1],
                lastTrainTime: Number(data[1]),
                totalTrains: Number(data[2])
            };
        } catch (e) {
            console.error("Failed to fetch training info:", e);
            return null;
        }
    },

    getTrainingPricing: async () => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.TRAINING}::get_pricing_info`, [], []);
            const data = result?.result || result;
            if (!data || !Array.isArray(data) || data.length < 2) return null;

            return {
                upgradeCosts: data[0],
                regimenCosts: data[1]
            };
        } catch (e) {
            console.error("Failed to fetch training pricing:", e);
            return null;
        }
    },

    // --- Battle ---

    fight: async (battleId: number, itemId: number, quality: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.BATTLE.split('::')[0],
            WE3WAR_MODULES.BATTLE.split('::')[1],
            "fight",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(battleId)),
                Array.from(BCS.bcsSerializeUint64(itemId)),
                Array.from(BCS.bcsSerializeU8(quality))
            ]
        );
    },

    joinBattle: async (battleId: number, side: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.BATTLE.split('::')[0],
            WE3WAR_MODULES.BATTLE.split('::')[1],
            "join_battle",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(battleId)),
                Array.from(BCS.bcsSerializeU8(side))
            ]
        );
    },

    declareWar: async (regionId: number, attackerCountry: number, isTraining: boolean): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.BATTLE.split('::')[0],
            WE3WAR_MODULES.BATTLE.split('::')[1],
            "declare_war",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(regionId)),
                Array.from(BCS.bcsSerializeU8(attackerCountry)),
                Array.from(BCS.bcsSerializeBool(isTraining))
            ]
        );
    },

    endBattle: async (battleId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.BATTLE.split('::')[0],
            WE3WAR_MODULES.BATTLE.split('::')[1],
            "end_battle",
            [],
            [Array.from(BCS.bcsSerializeUint64(battleId))]
        );
    },

    endRound: async (battleId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.BATTLE.split('::')[0],
            WE3WAR_MODULES.BATTLE.split('::')[1],
            "end_round",
            [],
            [Array.from(BCS.bcsSerializeUint64(battleId))]
        );
    },

    getBattleInfo: async (battleId: number) => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.BATTLE}::get_battle_info`, [], [battleId]);
            return result?.result?.[0] || result?.[0];
        } catch (e) {
            console.error("Failed to fetch battle info:", e);
            return null;
        }
    },

    getBattleHistory: async (battleId: number) => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.BATTLE}::get_battle_history`, [], [battleId]);
            return result?.result?.[0] || result?.[0] || [];
        } catch (e) {
            return [];
        }
    },

    getActiveBattleDetails: async () => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.BATTLE}::get_active_battles`, [], []);
            return result?.result?.[0] || result?.[0] || [];
        } catch (e) {
            return [];
        }
    },

    getBattleRoundDetails: async (battleId: number) => {
        try {
            const data = await BaseService.view(`${WE3WAR_MODULES.BATTLE}::get_battle_round_details`, [], [battleId]);
            if (!data || !Array.isArray(data)) return null;
            return {
                currentRound: Number(data[0]),
                attackerPoints: Number(data[1]),
                defenderPoints: Number(data[2]),
                roundEndTime: Number(data[3]),
                attackerDamage: Number(data[4]),
                defenderDamage: Number(data[5]),
                attackerTopAddr: data[6],
                attackerTopInfluence: Number(data[7]),
                defenderTopAddr: data[8],
                defenderTopInfluence: Number(data[9])
            };
        } catch (e) {
            return null;
        }
    },

    getRoundData: async (battleId: number) => {
        try {
            const data = await BaseService.view(`${WE3WAR_MODULES.BATTLE}::get_round_data`, [], [battleId]);
            if (!data || !Array.isArray(data)) return null;
            return {
                currentRound: Number(data[0]),
                attackerPoints: Number(data[1]),
                defenderPoints: Number(data[2]),
                attackerTopAddr: data[3],
                attackerTopInfluence: Number(data[4]),
                defenderTopAddr: data[5],
                defenderTopInfluence: Number(data[6])
            };
        } catch (e) {
            return null;
        }
    },

    // --- Military Units ---

    createMilitaryUnit: async (name: string): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.MILITARY_UNIT.split('::')[0],
            WE3WAR_MODULES.MILITARY_UNIT.split('::')[1],
            "create_unit",
            [],
            [
                Array.from(BCS.bcsSerializeStr(name))
            ]
        );
    },

    joinMilitaryUnit: async (unitId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.MILITARY_UNIT.split('::')[0],
            WE3WAR_MODULES.MILITARY_UNIT.split('::')[1],
            "join_unit",
            [],
            [Array.from(BCS.bcsSerializeUint64(unitId))]
        );
    },

    setDailyOrder: async (regionId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.MILITARY_UNIT.split('::')[0],
            WE3WAR_MODULES.MILITARY_UNIT.split('::')[1],
            "set_daily_order",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(regionId))
            ]
        );
    },

    getMemberUnit: async (address: string) => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.MILITARY_UNIT}::get_member_unit`, [], [address]);
            return result?.result?.[0] || result?.[0];
        } catch (e) {
            return null;
        }
    }
};
