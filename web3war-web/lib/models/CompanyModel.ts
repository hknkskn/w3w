/**
 * Domain Model for Companies and Job Market
 */

export type CompanyType = number;

export interface CompanyProfile {
    id: number;
    name: string;
    type: CompanyType;
    regionId: number;
    owner: string;
    quality: number;
    funds: number; // Normalized CRED balance
    stocks: {
        raw: number;
        product: number;
    };
    employeeCount: number;
    employees?: string[];
    isPublic?: boolean;
}

export interface JobOffer {
    companyId: number;
    companyName: string;
    salary: number; // Normalized daily wage
    positions: number;
    quality: number;
    type: CompanyType;
}

/**
 * Company Type Mapping
 */
export const COMPANY_TYPES: Record<number, { name: string, icon: string, rawItem: string, productItem: string }> = {
    11: { name: 'Food Factory', icon: '🍱', rawItem: 'Grain', productItem: 'Food' },
    12: { name: 'Weapon Factory', icon: '⚔️', rawItem: 'Iron', productItem: 'Weapon' },
    13: { name: 'Ticket Agency', icon: '🎫', rawItem: 'Paper', productItem: 'Ticket' },
    14: { name: 'Missile Factory', icon: '🚀', rawItem: 'Aluminum', productItem: 'Missile' },
    1: { name: 'Grain Farm', icon: '🌾', rawItem: 'None', productItem: 'Grain' },
    2: { name: 'Iron Mine', icon: '⛏️', rawItem: 'None', productItem: 'Iron' },
    3: { name: 'Oil Rig', icon: '🛢️', rawItem: 'None', productItem: 'Oil' },
    4: { name: 'Aluminum Mine', icon: '🧱', rawItem: 'None', productItem: 'Aluminum' },
};
