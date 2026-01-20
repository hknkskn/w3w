import { StateCreator } from 'zustand';
import { GameState } from '../store';
import { Battle, CountryId, RoundHistory, COUNTRY_IDS } from '../types';

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

    declareWar: async (regionId, isTraining) => {
        try {
            const { ContractService } = await import('../contract-service');
            const user = get().user;
            if (!user) return;

            const countryCode = user.countryId || 1;
            // Get the string code for the UI/State consistency
            const countryString = Object.keys(COUNTRY_IDS).find(key => COUNTRY_IDS[key as CountryId] === countryCode) as CountryId;

            const tx = await ContractService.declareWar(regionId, countryCode, isTraining);
            if (tx) {
                await get().idsAlert(`${isTraining ? 'Training' : 'War'} declaration sent! Waiting for confirmation...`, "Ministry of Defense", "success");
                setTimeout(() => get().fetchBattles(), 4000);
            }
        } catch (e) {
            console.error("Declare war error:", e);
            await get().idsAlert("Failed to declare war.", "Military Intelligence", "error");
        }
    },

    startResistanceWar: async (regionId) => {
        const state = get();
        if (!state.user) return;

        const countryCode = state.user.countryId || 1;
        const countryString = Object.keys(COUNTRY_IDS).find(key => COUNTRY_IDS[key as CountryId] === countryCode) as CountryId;

        const newBattle: Battle = {
            id: `res_${Date.now()}`,
            region: `Region ${regionId}`,
            regionId,
            attacker: countryString || '??',
            defender: 'Occupier',
            startTime: Date.now(),
            endTime: Date.now() + 1000 * 60 * 60 * 4,
            attackerDamage: 0,
            defenderDamage: 0,
            wallPercentage: 50,
            isResistance: true
        };

        set({ activeBattles: [...state.activeBattles, newBattle] });
        await get().idsAlert(`Resistance War started to liberate Region ${regionId}!`, "Resistance Movement", "warning");
    },

    signMPP: async (targetCountry) => {
        const state = get();
        if (!state.user) return;

        if (state.user.credits < 50) {
            await get().idsAlert("Not enough CRED to sign MPP!", "Diplomatic Funds", "error");
            return;
        }

        const countryCode = state.user.countryId || 1;
        const countryString = Object.keys(COUNTRY_IDS).find(key => COUNTRY_IDS[key as CountryId] === countryCode) as CountryId;

        set({
            user: { ...state.user, credits: state.user.credits - 50 },
            alliances: [...state.alliances, {
                a: countryString || 'NG',
                b: targetCountry,
                expires: Date.now() + 1000 * 60 * 60 * 24 * 30
            }]
        });
        await get().idsAlert(`Signed Mutual Protection Pact with ${targetCountry}!`, "Diplomatic Success", "success");
    },

    fetchBattles: async () => {
        try {
            const { ContractService } = await import('../contract-service');
            const data = await ContractService.getActiveBattleDetails();
            if (data && data[0]) {
                const mapped: Battle[] = await Promise.all(data[0].map(async (id: any, i: number) => {
                    const battleId = Number(id);
                    // getBattleInfo returns the full Battle struct including current_round
                    const roundDetails = await ContractService.getBattleInfo(battleId);

                    return {
                        id: String(id),
                        regionId: Number(data[1][i]),
                        region: `Region ${data[1][i]}`,
                        attacker: String(data[2][i]),
                        defender: String(data[3][i]),
                        attackerDamage: roundDetails?.attacker_damage || 0, // Properties might be snake_case in Move response
                        defenderDamage: roundDetails?.defender_damage || 0,
                        wallPercentage: Number(data[4][i]),
                        startTime: 0,
                        endTime: Number(data[5][i]) * 1000,
                        currentRound: roundDetails?.current_round || 1,
                        attackerPoints: 0, // BattleInfo might not have round points directly?
                        defenderPoints: 0,
                        roundEndTime: undefined, // BattleInfo logic differs
                        attackerTop: undefined,
                        defenderTop: undefined
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
                    // Optional: refresh user data if slice allows
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
                await get().idsAlert("Round ended! Refreshing...", "Combat Log", "info");
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
