'use client';

import { CountryId, COUNTRY_CONFIG } from '@/lib/types';

// World map GeoJSON URL (TopoJSON format from world-atlas)
export const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Complete mapping from ISO_A3 (ISO 3166-1 alpha-3) to our CountryId
export const ISO_TO_ID: Record<string, CountryId> = {
    'TUR': 'TR',   // Turkey
    'USA': 'US',   // United States
    'ESP': 'ES',   // Spain
    'POL': 'PL',   // Poland
    'BRA': 'BR',   // Brazil
    'FRA': 'FR',   // France
    'RUS': 'RU',   // Russia
    'IND': 'IN',   // India
    'NGA': 'NG',   // Nigeria
    'UKR': 'UA',   // Ukraine
};

// Numeric ID lookup (ISO 3166-1 numeric codes used by world-atlas TopoJSON)
export const NUMERIC_TO_ID: Record<string, CountryId> = {
    '792': 'TR',  // Turkey
    '840': 'US',  // United States
    '724': 'ES',  // Spain
    '616': 'PL',  // Poland
    '076': 'BR',  // Brazil
    '250': 'FR',  // France
    '643': 'RU',  // Russia
    '356': 'IN',  // India
    '566': 'NG',  // Nigeria
    '804': 'UA',  // Ukraine
};

// Faction definitions for the world map legend
export const FACTIONS = [
    { id: 'nato', name: 'NATO Alliance', color: '#3b82f6' },
    { id: 'eastern', name: 'Eastern Coalition', color: '#ef4444' },
    { id: 'pacific', name: 'Pacific Union', color: '#22c55e' },
    { id: 'neutral', name: 'Neutral Nations', color: '#f59e0b' },
    { id: 'independent', name: 'Independent', color: '#8b5cf6' },
    { id: 'nordic', name: 'Nordic League', color: '#06b6d4' },
];

// Type for country data that can come from on-chain
export interface OnChainCountry {
    id: CountryId;
    numericId: number;
    name: string;
    citizenCount: number;
    defensePoints: number;
    taxRate: number;
    factionId?: string;
    isAtWar: boolean;
    controlledRegions: number;
}

// Helper function to get CountryId from any geo identifier
export function getCountryId(geo: any): CountryId | undefined {
    const isoA3 = geo.properties?.ISO_A3 || geo.properties?.iso_a3;
    const numericId = String(geo.id).padStart(3, '0');

    if (isoA3 && ISO_TO_ID[isoA3]) {
        return ISO_TO_ID[isoA3];
    }
    if (NUMERIC_TO_ID[numericId]) {
        return NUMERIC_TO_ID[numericId];
    }
    if (NUMERIC_TO_ID[String(geo.id)]) {
        return NUMERIC_TO_ID[String(geo.id)];
    }
    return undefined;
}

// Helper to get country config from geo
export function getCountryConfig(geo: any) {
    const countryId = getCountryId(geo);
    if (countryId && COUNTRY_CONFIG[countryId]) {
        return {
            ...COUNTRY_CONFIG[countryId],
            id: countryId
        };
    }
    return null;
}

// Check if a country is active in the game
export function isActiveCountry(geo: any): boolean {
    return getCountryId(geo) !== undefined;
}

// Get all active country IDs
export function getActiveCountryIds(): CountryId[] {
    return Object.keys(COUNTRY_CONFIG) as CountryId[];
}
