/**
 * Domain Model for Training Facilities
 */
export interface TrainingFacility {
    id: number;
    name: string;
    image: string;
    quality: number; // 1-5
    efficiency: number; // e.g., 20, 40, 60, 80, 100
    baseStrength: number;
    currentStrengthGain: number; // baseStrength * quality
    baseEnergy: number;
    dailyCostCred: number;
    upgradeCostSupra: number | null;
    isMaxLevel: boolean;
}

/**
 * Static constants for Training Regimens
 * baseStrength values match the on-chain contract (training.move)
 */
export const REGIMEN_CONSTANTS = [
    {
        id: 0,
        name: 'Basic Training',
        image: '⛺',
        baseStrength: 5.0, // Contract: quality * 5
        baseEnergy: 5,
    },
    {
        id: 1,
        name: 'Military Academy',
        image: '🏫',
        baseStrength: 2.0, // Contract: quality * 2
        baseEnergy: 1,
    },
    {
        id: 2,
        name: 'Special Forces',
        image: '🏰',
        baseStrength: 5.0, // Contract: quality * 5
        baseEnergy: 1,
    },
    {
        id: 3,
        name: 'Top Secret Program',
        image: '💎',
        baseStrength: 10.0, // Contract: quality * 10
        baseEnergy: 1,
    }
] as const;
