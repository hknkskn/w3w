import { BaseService, WE3WAR_MODULES, parseMoveString, hexToUint8Array } from './base.service';
import { BCS } from 'supra-l1-sdk';
import { TrainingFacility, REGIMEN_CONSTANTS } from '../models/TrainingModel';

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
        console.log(`[DEBUG] BattleService.upgradeTrainingGrounds called with regimenId=${regimenId}`);
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
            const result = await BaseService.view(`${WE3WAR_MODULES.TRAINING}::get_training_info`, [], [address]);
            let data = result?.result || result;

            // Robust unwrapping for nested array formats
            if (Array.isArray(data) && data.length === 1 && Array.isArray(data[0])) {
                data = data[0];
            }

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
            const result = await BaseService.view(`${WE3WAR_MODULES.TRAINING}::get_training_pricing`, [], []);
            let data = result?.result || result;

            console.log(`[DEBUG] Raw Training Pricing RPC:`, JSON.stringify(data));

            // Robust unwrapping for nested array formats
            if (Array.isArray(data) && data.length === 1 && Array.isArray(data[0])) {
                data = data[0];
            }

            // The contract might return [ [upgrade_costs], [regimen_costs] ]
            // or if it's a single tuple/struct return, it might just be the array itself
            if (!data || !Array.isArray(data)) return null;

            if (data.length >= 2) {
                return {
                    upgradeCosts: data[0],
                    regimenCosts: data[1]
                };
            }

            // Fallback: If it returned a single array, it might be just one of them, but usually it's a tuple.
            // Let's check if the first element is also an array (meaning it's the first vector of the tuple)
            if (Array.isArray(data[0])) {
                return {
                    upgradeCosts: data[0],
                    regimenCosts: data[1] || []
                };
            }

            return null;
        } catch (e) {
            console.error("Failed to fetch training pricing:", e);
            return null;
        }
    },

    /**
     * DDS Mapper: Normalizes raw on-chain training data into TrainingFacility domain models
     */
    mapToTrainingFacilities: (info: any, pricing: any): TrainingFacility[] => {
        const facilities: TrainingFacility[] = [];

        // info: { qualities: number[], lastTrainTime: number, totalTrains: number }
        // pricing: { upgradeCosts: number[], regimenCosts: number[] }

        // Fallback values matching contract init_module (training.move lines 65-74)
        // SUPRA costs are in 8 decimals, CRED costs are in 2 decimals
        const FALLBACK_UPGRADE_COSTS = [
            2500 * 100000000,  // Q1→Q2: 2500 SUPRA
            5000 * 100000000,  // Q2→Q3: 5000 SUPRA
            10000 * 100000000, // Q3→Q4: 10000 SUPRA
            20000 * 100000000  // Q4→Q5: 20000 SUPRA
        ];
        const FALLBACK_REGIMEN_COSTS = [19, 89, 179]; // Advanced, Elite, Special Ops in CRED (2 decimals)

        const regimenCosts = pricing?.regimenCosts || FALLBACK_REGIMEN_COSTS;
        const upgradeCosts = pricing?.upgradeCosts || FALLBACK_UPGRADE_COSTS;
        const qualities = info?.qualities || [1, 1, 1, 1];

        for (const data of REGIMEN_CONSTANTS) {
            const id = data.id;
            const quality = Number(qualities[id] || 1);

            // Cost calculation (id 0 is free, others use pricing array)
            const dailyCostCred = id === 0 ? 0 : (Number(regimenCosts[id - 1] || 0) / 100);

            // Upgrade cost: use current quality to find next cost
            const upgradeCostRaw = quality < 5 ? upgradeCosts[quality - 1] : null;
            const upgradeCostSupra = upgradeCostRaw !== null && upgradeCostRaw !== undefined
                ? (Number(upgradeCostRaw) / 100000000)
                : null;

            facilities.push({
                id,
                name: data.name,
                image: data.image,
                quality,
                efficiency: quality * 20,
                baseStrength: data.baseStrength,
                currentStrengthGain: data.baseStrength * quality,
                baseEnergy: data.baseEnergy,
                dailyCostCred,
                upgradeCostSupra,
                isMaxLevel: quality >= 5
            });
        }

        return facilities;
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

    startNextRound: async (battleId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.BATTLE.split('::')[0],
            WE3WAR_MODULES.BATTLE.split('::')[1],
            "start_next_round",
            [],
            [Array.from(BCS.bcsSerializeUint64(battleId))]
        );
    },

    hasActiveBattleForRegion: async (regionId: number): Promise<boolean> => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.BATTLE}::has_active_battle_for_region`, [], [String(regionId)]);
            return result?.[0] === true;
        } catch (e) {
            return false;
        }
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

    // --- Admin Functions ---

    adminEndBattle: async (battleId: number, winnerSide: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.BATTLE.split('::')[0],
            WE3WAR_MODULES.BATTLE.split('::')[1],
            "admin_end_battle",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(battleId)),
                Array.from(BCS.bcsSerializeU8(winnerSide))
            ]
        );
    },

    adminCancelBattle: async (battleId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.BATTLE.split('::')[0],
            WE3WAR_MODULES.BATTLE.split('::')[1],
            "admin_cancel_battle",
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
            const result = await BaseService.view(`${WE3WAR_MODULES.BATTLE}::get_battle_info`, [], [String(battleId)]);
            return result?.result?.[0] || result?.[0];
        } catch (e) {
            console.error("Failed to fetch battle info:", e);
            return null;
        }
    },

    getBattleHistory: async (battleId: number) => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.BATTLE}::get_battle_history`, [], [String(battleId)]);
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
            const data = await BaseService.view(`${WE3WAR_MODULES.BATTLE}::get_battle_round_details`, [], [String(battleId)]);
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
            const data = await BaseService.view(`${WE3WAR_MODULES.BATTLE}::get_round_data`, [], [String(battleId)]);
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
