// Country ID mappings - MUST match types.ts COUNTRY_IDS
// Updated to match territory.move contract
export const COUNTRY_ID_MAP: Record<number, string> = {
    1: 'NG',  // Nigeria
    2: 'UA',  // Ukraine
    3: 'RU',  // Russia
    4: 'US',  // United States
    5: 'TR',  // Turkey
    6: 'IN',  // India
    7: 'ES',  // Spain
    8: 'PL',  // Poland
    9: 'BR',  // Brazil
    10: 'FR'  // France
};

export const REVERSE_COUNTRY_MAP: Record<string, number> = Object.entries(COUNTRY_ID_MAP).reduce(
    (acc, [id, code]) => ({ ...acc, [code]: parseInt(id) }),
    {}
);

export const COMPANY_TYPE_MAP: Record<number, string> = {
    1: 'RAW_GRAIN',
    2: 'RAW_IRON',
    3: 'RAW_OIL',
    4: 'RAW_ALUMINUM',
    11: 'MFG_FOOD',
    12: 'MFG_WEAPON',
    13: 'MFG_TRANSPORT',
    14: 'MFG_MISSILE'
};

export const RESOURCE_TYPE_MAP: Record<number, string> = {
    0: 'None',
    1: 'Grain',
    2: 'Iron',
    3: 'Oil',
    4: 'Aluminum'
};

export const MARKET_CATEGORY_MAP: Record<number, string> = {
    1: 'food',
    2: 'weapons',
    3: 'raw'
};
