/**
 * Domain Model for Citizen Profile
 */
export interface CitizenProfile {
    address: string;
    username: string;
    level: number;
    xp: number;
    nextLevelXp: number;
    strength: number;
    energy: number;
    maxEnergy: number;
    credits: number; // Normalized CRED (2 decimals)
    supraBalance: number; // Normalized SUPRA (8 decimals)
    isAdmin: boolean;
    countryId: number;
    rankPoints: number;
    employerId?: number;
}
