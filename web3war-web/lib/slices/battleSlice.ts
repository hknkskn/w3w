import { StateCreator } from 'zustand';
import { GameState } from '../store';
import { Battle, CountryId, RoundHistory } from '../types';

export interface BattleSlice {
    activeBattles: Battle[];
    roundHistory: Record<string, RoundHistory[]>;
    alliances: { a: CountryId, b: CountryId, expires: number }[];
    declareWar: (regionId: number, isTraining: boolean) => void;
    startResistanceWar: (regionId: number) => void;
    signMPP: (targetCountry: CountryId) => void;
    fetchBattles: () => Promise<void>;
    fetchRoundHistory: (battleId: string) => Promise<void>;
    fight: (battleId: string, itemId: number, quality?: number) => Promise<void>;
    endActiveRound: (battleId: string) => Promise<void>;
}

export const createBattleSlice: StateCreator<GameState, [], [], BattleSlice> = (set, get) => ({
    activeBattles: [],
    roundHistory: {},
    alliances: [],

    declareWar: (regionId, isTraining) => {
        const state = get();
        if (!state.user) return;

        const newBattle: Battle = {
            id: `b_${Date.now()}`,
            region: `Region ${regionId}`,
            regionId,
            attacker: state.user.citizenship,
            defender: 'BG',
            startTime: Date.now(),
            endTime: Date.now() + (isTraining ? 1000 * 60 * 60 : 1000 * 60 * 60 * 4),
            attackerDamage: 0,
            defenderDamage: 0,
            wallPercentage: 50,
            isTraining
        };

        set({ activeBattles: [...state.activeBattles, newBattle] });
        alert(`${isTraining ? 'Training' : 'War'} started in Region ${regionId}!`);
    },

    startResistanceWar: (regionId) => {
        const state = get();
        if (!state.user) return;

        const newBattle: Battle = {
            id: `res_${Date.now()}`,
            region: `Region ${regionId}`,
            regionId,
            attacker: state.user.citizenship,
            defender: 'Occupier',
            startTime: Date.now(),
            endTime: Date.now() + 1000 * 60 * 60 * 4,
            attackerDamage: 0,
            defenderDamage: 0,
            wallPercentage: 50,
            isResistance: true
        };

        set({ activeBattles: [...state.activeBattles, newBattle] });
        alert(`Resistance War started to liberate Region ${regionId}!`);
    },

    signMPP: (targetCountry) => {
        const state = get();
        if (!state.user) return;

        if (state.user.credits < 50) {
            alert("Not enough CRED to sign MPP!");
            return;
        }

        set({
            user: { ...state.user, credits: state.user.credits - 50 },
            alliances: [...state.alliances, {
                a: state.user.citizenship,
                b: targetCountry,
                expires: Date.now() + 1000 * 60 * 60 * 24 * 30
            }]
        });
        alert(`Signed Mutual Protection Pact with ${targetCountry}!`);
    },

    fetchBattles: async () => {
        try {
            const { ContractService } = await import('../contract-service');
            const data = await ContractService.getActiveBattleDetails();
            if (data && data[0]) {
                const mapped: Battle[] = await Promise.all(data[0].map(async (id: any, i: number) => {
                    const battleId = Number(id);
                    const roundDetails = await ContractService.getBattleRoundDetails(battleId);

                    return {
                        id: String(id),
                        regionId: Number(data[1][i]),
                        region: `Region ${data[1][i]}`,
                        attacker: String(data[2][i]),
                        defender: String(data[3][i]),
                        attackerDamage: roundDetails?.attackerDamage || 0,
                        defenderDamage: roundDetails?.defenderDamage || 0,
                        wallPercentage: Number(data[4][i]),
                        startTime: 0,
                        endTime: Number(data[5][i]) * 1000,
                        currentRound: roundDetails?.currentRound || 1,
                        attackerPoints: roundDetails?.attackerPoints || 0,
                        defenderPoints: roundDetails?.defenderPoints || 0,
                        roundEndTime: roundDetails?.roundEndTime ? roundDetails.roundEndTime * 1000 : undefined,
                        attackerTop: roundDetails?.attackerTopAddr ? {
                            address: roundDetails.attackerTopAddr,
                            influence: roundDetails.attackerTopInfluence
                        } : undefined,
                        defenderTop: roundDetails?.defenderTopAddr ? {
                            address: roundDetails.defenderTopAddr,
                            influence: roundDetails.defenderTopInfluence
                        } : undefined
                    };
                }));
                set({ activeBattles: mapped });
            }
        } catch (e) {
            console.error("Fetch battles error:", e);
        }
    },

    fetchRoundHistory: async (battleId) => {
        try {
            const { ContractService } = await import('../contract-service');
            // ID parsing logic matches battle.move IDs
            const numericId = Number(battleId.replace('b_', '').replace('res_', ''));
            const data = await ContractService.getBattleHistory(numericId);

            const mapped: RoundHistory[] = data.map((h: any) => ({
                roundNumber: Number(h.round_number),
                winnerSide: Number(h.winner_side),
                attackerTopAddr: h.attacker_top_addr,
                attackerTopInfluence: Number(h.attacker_top_influence),
                defenderTopAddr: h.defender_top_addr,
                defenderTopInfluence: Number(h.defender_top_influence)
            }));

            set(state => ({
                roundHistory: { ...state.roundHistory, [battleId]: mapped }
            }));
        } catch (e) {
            console.error("Fetch round history error:", e);
        }
    },

    fight: async (battleId, itemId, quality = 0) => {
        try {
            const { ContractService } = await import('../contract-service');
            const numericId = Number(battleId.replace('b_', '').replace('res_', ''));
            const tx = await ContractService.fight(numericId, itemId, quality);
            if (tx) {
                setTimeout(() => {
                    get().fetchBattles();
                    get().fetchDashboardData();
                    get().fetchInventory(); // Refresh after item consumption
                }, 2000);
            }
        } catch (e) {
            console.error("Fight error:", e);
        }
    },

    endActiveRound: async (battleId) => {
        try {
            const { ContractService } = await import('../contract-service');
            const numericId = Number(battleId.replace('b_', '').replace('res_', ''));
            const tx = await ContractService.endRound(numericId);
            if (tx) {
                alert("Round ended! Refreshing...");
                setTimeout(() => {
                    get().fetchBattles();
                    get().fetchRoundHistory(battleId);
                }, 2000);
            }
        } catch (e) {
            console.error("End round error:", e);
        }
    }
});
