import { create } from 'zustand';

// Types mimicking the Move Structs
export interface Commander {
    name: string;
    rank: number; // 0=Squad, 1=Platoon...
    rankPoints: number;
    strength: number;
    energy: number;
    maxEnergy: number;
    gold: number;
    supra: number;
}

export interface ResourceWallet {
    wood: number;
    iron: number;
    oil: number;
    grain: number;
    food: number;
    weapons: number;
}

export interface Region {
    id: number;
    name: string;
    ownerId: number; // 0=Neutral, 1=Turkey, 2=Greece
    defense: number;
    resourceType: 'Iron' | 'Oil' | 'Grain' | 'None';
}

interface GameState {
    commander: Commander;
    resources: ResourceWallet;
    regions: Region[];

    // Actions (Simulating Move Functions)
    work: () => void;
    train: () => void;
    recoverEnergy: () => void;
    fight: (damage: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
    commander: {
        name: 'Cmdr. Haknk',
        rank: 3, // Battalion
        rankPoints: 850,
        strength: 12450,
        energy: 100,
        maxEnergy: 100,
        gold: 50.0,
        supra: 1200,
    },
    resources: {
        wood: 100,
        iron: 50,
        oil: 20,
        grain: 200,
        food: 15,
        weapons: 5,
    },
    regions: [
        { id: 1, name: 'Aegean Coast', ownerId: 1, defense: 45, resourceType: 'Iron' },
        { id: 2, name: 'Anatolian Plateau', ownerId: 1, defense: 100, resourceType: 'Grain' },
        { id: 3, name: 'Crete', ownerId: 2, defense: 80, resourceType: 'Oil' },
        { id: 4, name: 'Attica', ownerId: 2, defense: 95, resourceType: 'Iron' },
        { id: 5, name: 'Thrace', ownerId: 1, defense: 60, resourceType: 'Grain' },
    ],

    work: () => set((state: GameState) => {
        if (state.commander.energy < 10) return state; // Error: Insufficient Energy

        return {
            commander: {
                ...state.commander,
                energy: state.commander.energy - 10,
                rankPoints: state.commander.rankPoints + 1,
                gold: state.commander.gold + 5, // Salary
            },
            resources: {
                ...state.resources,
                iron: state.resources.iron + 5, // Resources gathered
                grain: state.resources.grain + 5,
            }
        };
    }),

    train: () => set((state: GameState) => {
        if (state.commander.energy < 10) return state;

        return {
            commander: {
                ...state.commander,
                energy: state.commander.energy - 10,
                strength: state.commander.strength + 5,
                rankPoints: state.commander.rankPoints + 2,
            }
        };
    }),

    recoverEnergy: () => set((state: GameState) => {
        // Simulating eating food
        if (state.resources.food < 1) return state;

        return {
            resources: { ...state.resources, food: state.resources.food - 1 },
            commander: { ...state.commander, energy: Math.min(state.commander.energy + 20, state.commander.maxEnergy) }
        }
    }),

    fight: (_damage: number) => set((state: GameState) => {
        if (state.commander.energy < 10 || state.resources.weapons < 1) return state;

        return {
            resources: { ...state.resources, weapons: state.resources.weapons - 1 },
            commander: {
                ...state.commander,
                energy: state.commander.energy - 10,
                rankPoints: state.commander.rankPoints + 5
            }
        }
    })

}));
