export type CountryId = 'NG' | 'UA' | 'RU' | 'US' | 'TR' | 'IN' | 'ES' | 'PL' | 'BR' | 'FR';

export const COUNTRY_CONFIG: Record<CountryId, { name: string, fullName: string, flag: string, color: string, capital: string }> = {
    'NG': { name: 'Nigeria', fullName: 'Federal Republic of Nigeria', flag: '/image/flags/Flag_of_Nigeria.svg', color: '#16a34a', capital: 'Abuja' },
    'UA': { name: 'Ukraine', fullName: 'Ukraine', flag: '/image/flags/Flag_of_Ukraine.svg', color: '#fbbf24', capital: 'Kyiv' },
    'RU': { name: 'Russia', fullName: 'Russian Federation', flag: '/image/flags/Flag_of_Russia.svg', color: '#f87171', capital: 'Moscow' },
    'US': { name: 'United States', fullName: 'United States of America', flag: '/image/flags/Flag_of_United_States.svg', color: '#3b82f6', capital: 'Washington D.C.' },
    'TR': { name: 'Turkey', fullName: 'Republic of Turkey', flag: '/image/flags/Flag_of_Turkey.svg', color: '#ef4444', capital: 'Ankara' },
    'IN': { name: 'India', fullName: 'Republic of India', flag: '/image/flags/Flag_of_India.svg', color: '#f97316', capital: 'New Delhi' },
    'ES': { name: 'Spain', fullName: 'Kingdom of Spain', flag: '/image/flags/Flag_of_Spain.svg', color: '#facc15', capital: 'Madrid' },
    'PL': { name: 'Poland', fullName: 'Republic of Poland', flag: '/image/flags/Flag_of_Poland.svg', color: '#f43f5e', capital: 'Warsaw' },
    'BR': { name: 'Brazil', fullName: 'Federative Republic of Brazil', flag: '/image/flags/Flag_of_Brazil.svg', color: '#22c55e', capital: 'Brasília' },
    'FR': { name: 'France', fullName: 'French Republic', flag: '/image/flags/Flag_of_France.svg', color: '#2563eb', capital: 'Paris' },
};

export const COUNTRY_IDS: Record<CountryId, number> = {
    'NG': 1, 'UA': 2, 'RU': 3, 'US': 4, 'TR': 5,
    'IN': 6, 'ES': 7, 'PL': 8, 'BR': 9, 'FR': 10
};

export const getCountryKey = (id: number): CountryId => {
    return (Object.keys(COUNTRY_IDS) as CountryId[]).find(key => COUNTRY_IDS[key] === id) || 'TR';
};

export interface Battle {
    id: string;
    region: string;
    regionId: number;
    attacker: CountryId | string;
    defender: CountryId | string;
    startTime: number;
    endTime: number;
    attackerDamage: number;
    defenderDamage: number;
    wallPercentage: number;
    wall?: number;
    isResistance?: boolean;
    isTraining?: boolean;

    // Phase 5: Rounds
    currentRound?: number;
    attackerPoints?: number;
    defenderPoints?: number;
    roundEndTime?: number;
    attackerTop?: RoundTopDamager;
    defenderTop?: RoundTopDamager;
}

export interface RegionId {
    id: number;
    name: string;
    country: CountryId;
}

export interface Item {
    id: string;
    name: string;
    type: string;
    quality: number;
    image: string;
    energyRestore?: number; // For food
    damage?: number; // For weapons
    durability?: number; // For weapons
}


export interface MarketItem extends Item {
    stock: number;
    price: number;
    seller: string;
    sellerCountry?: CountryId;
    category: string;
    originalItemId?: number;
}

export interface InventoryItem extends Item {
    quantity: number;
}

// --- Company & Economy Types ---

export type CompanyType =
    | 'RAW_GRAIN' | 'RAW_IRON' | 'RAW_OIL' | 'RAW_ALUMINUM'
    | 'MFG_FOOD' | 'MFG_WEAPON' | 'MFG_TRANSPORT' | 'MFG_MISSILE';

export const COMPANY_TYPES_CONFIG: Record<CompanyType, { id: number, name: string, input?: string, output: string }> = {
    'RAW_GRAIN': { id: 1, name: 'Grain Farm', output: 'Grain' },
    'RAW_IRON': { id: 2, name: 'Iron Mine', output: 'Iron' },
    'RAW_OIL': { id: 3, name: 'Oil Rig', output: 'Oil' },
    'RAW_ALUMINUM': { id: 4, name: 'Aluminum Mine', output: 'Aluminum' },
    'MFG_FOOD': { id: 11, name: 'Food Factory', input: 'Grain', output: 'Food' },
    'MFG_WEAPON': { id: 12, name: 'Weapon Factory', input: 'Iron', output: 'Weapon' },
    'MFG_TRANSPORT': { id: 13, name: 'Transport Hub', input: 'Oil', output: 'Ticket' },
    'MFG_MISSILE': { id: 14, name: 'Missile Factory', input: 'Aluminum', output: 'Missile' },
};

export interface JobOffer {
    id: string;
    companyId: string;
    companyName: string;
    salary: number; // CRED
    positions: number;
    minSkill: number;
    active: boolean;
}

export interface Company {
    id: string;
    ownerId: string;
    name: string;
    type: CompanyType;
    quality: number; // Q1-Q5
    region: string;

    // Finances
    funds: number; // CRED available for salaries

    // Internal Stocks (New System)
    rawStock?: number;
    productStock?: number;

    // Inventory Legacy (Keep for mock compatibility)
    inventory: {
        rawMaterial: number;
        products: number;
    };

    // HR
    employees: string[]; // Citizen IDs
    jobOffer?: JobOffer;
}

export interface Citizen {
    id: string;
    username: string;
    walletAddress?: string;
    level: number;
    xp: number; // Experience points
    nextLevelXp: number;

    // Core Attributes
    energy: number; // Max 200, regenerates
    maxEnergy: number;
    strength: number; // Increases damage
    rankPoints: number; // Military Rank

    // Citizenship
    citizenship: CountryId;
    location: RegionId;

    // Economy
    employerId?: number;
    credits: number; // Main currency (Game CRED)
    walletBalance?: number; // On-Chain CRED Balance (Wallet)
    militaryUnitId?: number;
    isAdmin?: boolean;
}

export interface TrainingInfo {
    quality: number;
    lastTrainTime: number;
    totalTrains: number;
}

export interface RoundTopDamager {
    addr: string;
    influence: number;
}

export interface BattleRound {
    current: number;
    attackerPoints: number;
    defenderPoints: number;
    attackerTop: RoundTopDamager;
    defenderTop: RoundTopDamager;
    endTime: number;
}

export interface MilitaryUnit {
    id: number;
    name: string;
    leader: string;
    members: string[];
    dailyOrderRegion: number;
}

// --- Governance Types ---

export interface Proposal {
    id: number;
    countryId: number;
    proposer: string;
    type: number; // 1=TaxChange, 2=Treasury
    data: number[]; // Bytes
    yesVotes: number;
    noVotes: number;
    executed: boolean;
    createdAt: number;
}

export interface ElectionCandidate {
    address: string;
    username: string;
    votes: number;
    strength?: number;
    level?: number;
}

export interface CountryData {
    id: number;
    name: string;
    president: string;
    incomeTax: number;
    importTax: number;
    vat: number;
    electionActive: boolean;
    electionEndTime: number;

    // Legislative data
    minWage?: number;
    maxCongress?: number;
    presidentSalary?: number;
    congressSalary?: number;
    atWarWith?: number[];
}

export interface RoundHistory {
    roundNumber: number;
    winnerSide: number; // 1 = Attacker, 2 = Defender
    attackerTopAddr: string;
    attackerTopInfluence: number;
    defenderTopAddr: string;
    defenderTopInfluence: number;
}

export interface PendingWarReward {
    battle_id: string; // From u64
    winner_country: number;
    amount: string; // From u64
    created_at: string; // From u64
    claimed: boolean;
}

export interface PendingHeroReward {
    battle_id: string; // From u64
    round: number;
    hero_addr: string;
    amount: string; // From u64
    claimed: boolean;
}


