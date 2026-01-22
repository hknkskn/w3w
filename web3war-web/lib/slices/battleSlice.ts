import { StateCreator } from 'zustand';
import { GameState } from '../store';
import { Battle, CountryId, RoundHistory, COUNTRY_IDS, getCountryKey } from '../types';

export interface BattleSlice {
    activeBattles: Battle[];
    roundHistory: Record<string, RoundHistory[]>;
    alliances: { a: CountryId, b: CountryId, expires: number }[];
    pendingWarRewards: any[];
    pendingHeroRewards: any[];
    gameTreasuryBalance: number;
    lastHit: { damage: number, side: string, timestamp: number } | null;

    declareWar: (countryId: number, targetCountryId: number, regionId: number) => Promise<void>;
    startResistanceWar: (regionId: number) => Promise<void>;
    startNextRound: (battleId: string) => Promise<void>;
    signMPP: (targetCountry: CountryId) => void;
    fetchBattles: () => Promise<void>;
    fetchRoundHistory: (battleId: string) => Promise<void>;
    fetchPendingRewards: () => Promise<void>;
    claimWarReward: (battleId: number) => Promise<void>;
    claimHeroReward: (battleId: number, round: number) => Promise<void>;
    fight: (battleId: string, itemId: number, quality?: number) => Promise<void>;
    fightMulti: (battleId: string, itemId: number, quality: number, count: number) => Promise<void>;
    endActiveRound: (battleId: string) => Promise<void>;
}

export const createBattleSlice: StateCreator<GameState, [], [], BattleSlice> = (set, get) => ({
    activeBattles: [],
    roundHistory: {},
    alliances: [],
    pendingWarRewards: [],
    pendingHeroRewards: [],
    gameTreasuryBalance: 0,
    lastHit: null,

    declareWar: async (countryId, targetCountryId, regionId) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.declareWar(countryId, targetCountryId, regionId);
            if (tx) {
                await get().idsAlert("War declaration sent! Awaiting confirmation...", "Department of War", "success");
                setTimeout(() => get().fetchBattles(), 4000);
            }
        } catch (e) {
            console.error("Declare war error:", e);
            await get().idsAlert("Failed to declare war.", "Military Intelligence", "error");
        }
    },

    startResistanceWar: async (regionId) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.startResistance(regionId);
            if (tx) {
                await get().idsAlert(`Resistance movement started in Region ${regionId}!`, "Resistance Movement", "warning");
                setTimeout(() => get().fetchBattles(), 4000);
            }
        } catch (e) {
            console.error("Resistance start error:", e);
        }
    },

    startNextRound: async (battleId) => {
        try {
            const { ContractService } = await import('../contract-service');
            const numericId = Number(battleId.replace('b_', '').replace('res_', ''));
            const tx = await ContractService.startNextRound(numericId);
            if (tx) {
                await get().idsAlert("Next round initialized!", "Combat Command", "success");
                setTimeout(() => get().fetchBattles(), 3000);
            }
        } catch (e) {
            console.error("Start next round error:", e);
        }
    },

    fetchPendingRewards: async () => {
        try {
            const { ContractService } = await import('../contract-service');
            const { user } = get();
            if (!user) return;

            const [warRewards, heroRewards, balance] = await Promise.all([
                ContractService.getPendingWarRewards(user.countryId || 1),
                ContractService.getPendingHeroRewards(user.address || ''),
                ContractService.getBalance()
            ]);

            set({
                pendingWarRewards: warRewards,
                pendingHeroRewards: heroRewards,
                gameTreasuryBalance: balance
            });
        } catch (e) {
            console.error("Fetch rewards error:", e);
        }
    },

    claimWarReward: async (battleId) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.claimWarReward(battleId);
            if (tx) {
                await get().idsAlert("War spoils transferred to national treasury!", "Treasury", "success");
                setTimeout(() => get().fetchPendingRewards(), 3000);
            }
        } catch (e) {
            console.error("Claim war reward error:", e);
        }
    },

    claimHeroReward: async (battleId, round) => {
        try {
            const { ContractService } = await import('../contract-service');
            const tx = await ContractService.claimHeroReward(battleId, round);
            if (tx) {
                await get().idsAlert("Hero reward claimed!", "Veteran Affairs", "success");
                setTimeout(() => {
                    get().fetchPendingRewards();
                    get().fetchDashboardData();
                }, 3000);
            }
        } catch (e) {
            console.error("Claim hero reward error:", e);
        }
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
                // Ensure all data columns are arrays to avoid crashes if single values are returned
                const ids = Array.isArray(data[0]) ? data[0] : [data[0]];
                const regionIds = Array.isArray(data[1]) ? data[1] : [data[1]];
                const attackers = Array.isArray(data[2]) ? data[2] : [data[2]];
                const defenders = Array.isArray(data[3]) ? data[3] : [data[3]];
                const wallPercentages = Array.isArray(data[4]) ? data[4] : [data[4]];
                const endTimes = Array.isArray(data[5]) ? data[5] : [data[5]];

                const mapped: Battle[] = await Promise.all(ids.map(async (id: any, i: number) => {
                    const battleId = Number(id);
                    // Use getBattleRoundDetails for comprehensive round data including heroes
                    const roundDetails = await ContractService.getBattleRoundDetails(battleId);

                    console.log(`[DEBUG] Battle ${battleId} - endTimes[${i}]:`, endTimes[i], 'roundDetails:', roundDetails);

                    // Use endTimes from get_active_battle_details, fallback to roundEndTime from roundDetails
                    const battleEndTime = endTimes[i] ? Number(endTimes[i]) * 1000 : (roundDetails?.roundEndTime ? roundDetails.roundEndTime * 1000 : 0);
                    const roundEndTimeMs = roundDetails?.roundEndTime ? roundDetails.roundEndTime * 1000 : battleEndTime;

                    return {
                        id: String(id),
                        regionId: Number(regionIds[i]),
                        region: `Region ${regionIds[i]}`,
                        attacker: getCountryKey(Number(attackers[i])),
                        defender: getCountryKey(Number(defenders[i])),
                        attackerDamage: roundDetails?.attackerDamage || 0,
                        defenderDamage: roundDetails?.defenderDamage || 0,
                        wallPercentage: Number(wallPercentages[i]),
                        startTime: 0,
                        endTime: battleEndTime,
                        currentRound: roundDetails?.currentRound || 1,
                        attackerPoints: roundDetails?.attackerPoints || 0,
                        defenderPoints: roundDetails?.defenderPoints || 0,
                        roundEndTime: roundEndTimeMs,
                        attackerTop: roundDetails?.attackerTopAddr ? {
                            addr: roundDetails.attackerTopAddr,
                            influence: roundDetails.attackerTopInfluence || 0
                        } : undefined,
                        defenderTop: roundDetails?.defenderTopAddr ? {
                            addr: roundDetails.defenderTopAddr,
                            influence: roundDetails.defenderTopInfluence || 0
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
            const { BattleService } = await import('../services/battle.service');
            const numericId = Number(battleId.replace('b_', '').replace('res_', ''));

            const tx = await BattleService.fight(numericId, itemId, quality);
            if (tx) {
                set({ lastHit: { damage: 1000, side: 'attacker', timestamp: Date.now() } });
                setTimeout(() => set({ lastHit: null }), 1000);

                setTimeout(() => {
                    get().fetchBattles();
                    get().fetchDashboardData();
                }, 2000);
            }
        } catch (e) {
            console.error("Fight error:", e);
        }
    },

    fightMulti: async (battleId, itemId, quality, count) => {
        try {
            const { BattleService } = await import('../services/battle.service');
            const numericId = Number(battleId.replace('b_', '').replace('res_', ''));

            const tx = await BattleService.fightMulti(numericId, itemId, quality, count);
            if (tx) {
                // UI Feedback for batch attack
                set({ lastHit: { damage: 1000 * count, side: 'attacker', timestamp: Date.now() } });
                setTimeout(() => set({ lastHit: null }), 1500);

                setTimeout(() => {
                    get().fetchBattles();
                    get().fetchDashboardData();
                }, 2000);
            }
        } catch (e) {
            console.error("FightMulti error:", e);
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
