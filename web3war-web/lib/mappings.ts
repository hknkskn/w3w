export const COUNTRY_ID_MAP: Record<number, string> = {
    1: 'TR',
    2: 'US',
    3: 'BG',
    4: 'GR',
    5: 'RU',
    6: 'CN',
    7: 'IN',
    8: 'PK',
    9: 'UA',
    10: 'PL'
};

export const REVERSE_COUNTRY_MAP: Record<string, number> = Object.entries(COUNTRY_ID_MAP).reduce(
    (acc, [id, code]) => ({ ...acc, [code]: parseInt(id) }),
    {}
);

export const COMPANY_TYPE_MAP: Record<number, string> = {
    1: 'RAW_GRAIN',
    2: 'RAW_IRON',
    3: 'RAW_OIL',
    11: 'MFG_FOOD',
    12: 'MFG_WEAPON'
};

export const RESOURCE_TYPE_MAP: Record<number, string> = {
    1: 'Grain',
    2: 'Iron',
    3: 'Oil',
    4: 'None'
};

export const MARKET_CATEGORY_MAP: Record<number, string> = {
    1: 'food',
    2: 'weapons',
    3: 'raw'
};
