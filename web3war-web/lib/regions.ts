// Region data for frontend - matches territory.move contract
// 10 Countries × 4 Regions = 40 Total

export interface RegionData {
    id: number;
    name: string;
    countryId: number;
    resourceType: number;  // 0=None, 1=Grain, 2=Iron, 3=Oil, 4=Aluminum
    resourceBonus: number; // 0-35%
}

export const RESOURCE_NAMES: Record<number, string> = {
    0: 'None',
    1: 'Grain',
    2: 'Iron',
    3: 'Oil',
    4: 'Aluminum'
};

export const RESOURCE_ICONS: Record<number, string> = {
    0: '🏙️',
    1: '🌾',
    2: '⚒️',
    3: '🛢️',
    4: '💎'
};

export const REGIONS: RegionData[] = [
    // 🇳🇬 Nigeria (Country 1)
    { id: 1, name: 'Lagos', countryId: 1, resourceType: 0, resourceBonus: 0 },
    { id: 2, name: 'Niger Delta', countryId: 1, resourceType: 3, resourceBonus: 30 },
    { id: 3, name: 'Kano', countryId: 1, resourceType: 1, resourceBonus: 20 },
    { id: 4, name: 'Abuja', countryId: 1, resourceType: 0, resourceBonus: 0 },

    // 🇺🇦 Ukraine (Country 2)
    { id: 5, name: 'Kyiv', countryId: 2, resourceType: 0, resourceBonus: 0 },
    { id: 6, name: 'Donbas', countryId: 2, resourceType: 2, resourceBonus: 25 },
    { id: 7, name: 'Kherson', countryId: 2, resourceType: 1, resourceBonus: 30 },
    { id: 8, name: 'Odessa', countryId: 2, resourceType: 0, resourceBonus: 0 },

    // 🇷🇺 Russia (Country 3)
    { id: 9, name: 'Moscow', countryId: 3, resourceType: 0, resourceBonus: 0 },
    { id: 10, name: 'Siberia', countryId: 3, resourceType: 3, resourceBonus: 35 },
    { id: 11, name: 'Ural', countryId: 3, resourceType: 2, resourceBonus: 30 },
    { id: 12, name: 'St Petersburg', countryId: 3, resourceType: 0, resourceBonus: 0 },

    // 🇺🇸 USA (Country 4)
    { id: 13, name: 'Texas', countryId: 4, resourceType: 3, resourceBonus: 30 },
    { id: 14, name: 'California', countryId: 4, resourceType: 1, resourceBonus: 20 },
    { id: 15, name: 'Pennsylvania', countryId: 4, resourceType: 2, resourceBonus: 20 },
    { id: 16, name: 'Nevada', countryId: 4, resourceType: 4, resourceBonus: 25 },

    // 🇹🇷 Turkey (Country 5)
    { id: 17, name: 'Marmara', countryId: 5, resourceType: 1, resourceBonus: 20 },
    { id: 18, name: 'Karadeniz', countryId: 5, resourceType: 2, resourceBonus: 25 },
    { id: 19, name: 'Guneydogu', countryId: 5, resourceType: 3, resourceBonus: 20 },
    { id: 20, name: 'Ic Anadolu', countryId: 5, resourceType: 4, resourceBonus: 15 },

    // 🇮🇳 India (Country 6)
    { id: 21, name: 'Gujarat', countryId: 6, resourceType: 3, resourceBonus: 15 },
    { id: 22, name: 'Punjab', countryId: 6, resourceType: 1, resourceBonus: 25 },
    { id: 23, name: 'Jharkhand', countryId: 6, resourceType: 2, resourceBonus: 20 },
    { id: 24, name: 'Delhi', countryId: 6, resourceType: 0, resourceBonus: 0 },

    // 🇪🇸 Spain (Country 7)
    { id: 25, name: 'Madrid', countryId: 7, resourceType: 0, resourceBonus: 0 },
    { id: 26, name: 'Andalusia', countryId: 7, resourceType: 1, resourceBonus: 15 },
    { id: 27, name: 'Basque', countryId: 7, resourceType: 2, resourceBonus: 15 },
    { id: 28, name: 'Catalonia', countryId: 7, resourceType: 0, resourceBonus: 0 },

    // 🇵🇱 Poland (Country 8)
    { id: 29, name: 'Silesia', countryId: 8, resourceType: 2, resourceBonus: 25 },
    { id: 30, name: 'Masovia', countryId: 8, resourceType: 1, resourceBonus: 20 },
    { id: 31, name: 'Pomerania', countryId: 8, resourceType: 0, resourceBonus: 0 },
    { id: 32, name: 'Krakow', countryId: 8, resourceType: 4, resourceBonus: 10 },

    // 🇧🇷 Brazil (Country 9)
    { id: 33, name: 'Sao Paulo', countryId: 9, resourceType: 0, resourceBonus: 0 },
    { id: 34, name: 'Amazonas', countryId: 9, resourceType: 3, resourceBonus: 25 },
    { id: 35, name: 'Minas Gerais', countryId: 9, resourceType: 2, resourceBonus: 30 },
    { id: 36, name: 'Rio Grande', countryId: 9, resourceType: 1, resourceBonus: 15 },

    // 🇫🇷 France (Country 10)
    { id: 37, name: 'Paris', countryId: 10, resourceType: 0, resourceBonus: 0 },
    { id: 38, name: 'Lorraine', countryId: 10, resourceType: 2, resourceBonus: 20 },
    { id: 39, name: 'Provence', countryId: 10, resourceType: 1, resourceBonus: 15 },
    { id: 40, name: 'Aquitaine', countryId: 10, resourceType: 3, resourceBonus: 10 },
];

// Helper functions
export const getRegionById = (id: number): RegionData | undefined =>
    REGIONS.find(r => r.id === id);

export const getRegionsByCountry = (countryId: number): RegionData[] =>
    REGIONS.filter(r => r.countryId === countryId);

export const getRegionName = (id: number): string =>
    getRegionById(id)?.name || `Region ${id}`;

export const getResourceInfo = (resourceType: number) => ({
    name: RESOURCE_NAMES[resourceType] || 'Unknown',
    icon: RESOURCE_ICONS[resourceType] || '❓'
});

export const getCountryFlag = (countryId: number): string => {
    const flags: Record<number, string> = {
        1: '🇳🇬', 2: '🇺🇦', 3: '🇷🇺', 4: '🇺🇸', 5: '🇹🇷',
        6: '🇮🇳', 7: '🇪🇸', 8: '🇵🇱', 9: '🇧🇷', 10: '🇫🇷'
    };
    return flags[countryId] || '🏳️';
};

export const getCountryName = (countryId: number): string => {
    const names: Record<number, string> = {
        1: 'Nigeria', 2: 'Ukraine', 3: 'Russia', 4: 'USA', 5: 'Turkey',
        6: 'India', 7: 'Spain', 8: 'Poland', 9: 'Brazil', 10: 'France'
    };
    return names[countryId] || `Country ${countryId}`;
};
