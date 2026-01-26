'use client';

import { useState, memo, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize, Map as MapIcon, Users, Shield, Coins, Swords, Flag, Plane } from 'lucide-react';
import { Button } from '@/components/Button';
import { useGameStore } from '@/lib/store';
import { Battle, CountryId, COUNTRY_CONFIG, COUNTRY_IDS } from '@/lib/types';
import { RegionSelector } from './RegionSelector';

// World map GeoJSON URL
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// Complete mapping from ISO_A3 (used in GeoJSON) to our CountryId
const ISO_TO_ID: Record<string, CountryId> = {
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

// Also create reverse lookup for numerical IDs from world-atlas TopoJSON
// The world-atlas countries-110m.json uses numerical IDs (ISO 3166-1 numeric)
const NUMERIC_TO_ID: Record<string, CountryId> = {
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

// Active countries set for quick lookup
const ACTIVE_COUNTRIES = new Set(Object.keys(COUNTRY_CONFIG));
const ACTIVE_ISO3 = new Set(Object.keys(ISO_TO_ID));
const ACTIVE_NUMERIC = new Set(Object.keys(NUMERIC_TO_ID));

// Faction colors for legend
const FACTIONS = [
    { name: 'NATO Alliance', color: '#3b82f6' },
    { name: 'Eastern Coalition', color: '#ef4444' },
    { name: 'Pacific Union', color: '#22c55e' },
    { name: 'Neutral Nations', color: '#f59e0b' },
    { name: 'Independent', color: '#8b5cf6' },
    { name: 'Nordic League', color: '#06b6d4' },
];

import { TerritoryService } from '@/lib/services/territory.service';

export function RealWorldMap() {
    const { activeBattles, alliances, user, isLandless, fetchLandlessStatus } = useGameStore();
    const [position, setPosition] = useState<{ coordinates: [number, number], zoom: number }>({
        coordinates: [20, 30],
        zoom: 1.5
    });
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
    const [showRegionSelector, setShowRegionSelector] = useState(false);
    const [isResistanceSelection, setIsResistanceSelection] = useState(false);
    const [occupiedCountries, setOccupiedCountries] = useState<Set<number>>(new Set());

    const fetchOccupation = async () => {
        try {
            const regions = await TerritoryService.getAllRegions();
            const occupied = new Set<number>();
            regions.forEach(r => {
                if (r.ownerCountry !== r.originalOwner) {
                    occupied.add(r.originalOwner);
                }
            });
            setOccupiedCountries(occupied);
        } catch (e) {
            console.error("Failed to fetch occupation status", e);
        }
    };

    useEffect(() => {
        fetchOccupation();
        const interval = setInterval(fetchOccupation, 60000); // 1 min refresh
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (user?.countryId) {
            fetchLandlessStatus(user.countryId);
        }
    }, [user?.countryId, fetchLandlessStatus]);

    const handleZoomIn = () => {
        if (position.zoom >= 8) return;
        setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
    };

    const handleZoomOut = () => {
        if (position.zoom <= 1) return;
        setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
    };

    const handleReset = () => {
        setPosition({ coordinates: [20, 30], zoom: 1.5 });
    };

    const getCountryColor = (geo: any) => {
        const isoA3 = geo.properties?.ISO_A3 || geo.properties?.iso_a3;
        const numericId = String(geo.id).padStart(3, '0');
        let countryId: CountryId | undefined = undefined;

        if (isoA3 && ISO_TO_ID[isoA3]) {
            countryId = ISO_TO_ID[isoA3];
        } else if (NUMERIC_TO_ID[numericId]) {
            countryId = NUMERIC_TO_ID[numericId];
        }

        // 1. Occupation Check (Strategic Priority)
        if (countryId && occupiedCountries.has(COUNTRY_IDS[countryId])) {
            return '#64748b'; // Slate 500 - indicating partially lost sovereignty
        }

        // 2. Active Battle Check
        if (countryId) {
            const hasBattle = activeBattles.some((b: Battle) =>
                b.defender === countryId || b.attacker === countryId
            );
            if (hasBattle) return '#ef4444'; // Red alert
        }

        // 3. Highlight selected country's allies
        if (selectedCountry && countryId) {
            const selectedId = ISO_TO_ID[selectedCountry] || NUMERIC_TO_ID[selectedCountry] || selectedCountry;

            const isAlly = alliances.some((a: { a: CountryId, b: CountryId }) =>
                (a.a === selectedId && a.b === countryId) ||
                (a.b === selectedId && a.a === countryId)
            );
            if (isAlly) return '#22d3ee'; // Cyan for allies
        }

        // 4. Active Country Color
        if (countryId && COUNTRY_CONFIG[countryId]) {
            return COUNTRY_CONFIG[countryId].color;
        }

        return '#1e293b';
    };

    const getCountryInfo = (geoIdOrCode: string) => {
        // Try ISO_A3 first
        let countryId = ISO_TO_ID[geoIdOrCode];

        // Try numeric ID
        if (!countryId) {
            const paddedId = String(geoIdOrCode).padStart(3, '0');
            countryId = NUMERIC_TO_ID[paddedId] || NUMERIC_TO_ID[geoIdOrCode];
        }

        // Try direct lookup
        if (!countryId && COUNTRY_CONFIG[geoIdOrCode as CountryId]) {
            countryId = geoIdOrCode as CountryId;
        }

        if (countryId && COUNTRY_CONFIG[countryId]) {
            return {
                ...COUNTRY_CONFIG[countryId],
                id: countryId
            };
        }
        return null;
    };

    const selectedInfo = selectedCountry ? getCountryInfo(selectedCountry) : null;
    const isConflictZone = selectedCountry && activeBattles.some((b: Battle) => b.defender === selectedCountry || b.attacker === selectedCountry || b.defender === (ISO_TO_ID[selectedCountry] || selectedCountry) || b.attacker === (ISO_TO_ID[selectedCountry] || selectedCountry));

    return (
        <div className="relative w-full h-[650px] bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl">
            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                <button
                    onClick={handleZoomIn}
                    className="p-2.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-lg shadow-lg border border-slate-600 transition-all hover:scale-105"
                >
                    <ZoomIn size={18} />
                </button>
                <button
                    onClick={handleZoomOut}
                    className="p-2.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-lg shadow-lg border border-slate-600 transition-all hover:scale-105"
                >
                    <ZoomOut size={18} />
                </button>
                <button
                    onClick={handleReset}
                    className="p-2.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-lg shadow-lg border border-slate-600 transition-all hover:scale-105"
                >
                    <Maximize size={18} />
                </button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-md rounded-xl p-4 z-20 border border-slate-700 shadow-xl">
                <h4 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2">
                    <Flag size={12} /> FACTIONS
                </h4>
                <div className="space-y-2">
                    {FACTIONS.map(faction => (
                        <div key={faction.name} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: faction.color }} />
                            <span className="text-xs text-slate-300">{faction.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hover Tooltip */}
            <AnimatePresence>
                {hoveredCountry && !selectedCountry && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-md rounded-xl p-3 z-20 border border-cyan-500/30 shadow-xl"
                    >
                        <div className="text-sm font-bold text-white">{hoveredCountry}</div>
                        {getCountryInfo(hoveredCountry) && (
                            <div className="text-xs text-cyan-400">Click for details</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* The Map */}
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{
                    scale: 150,
                    center: [0, 20]
                }}
                style={{ width: '100%', height: '100%' }}
            >
                <ZoomableGroup
                    zoom={position.zoom}
                    center={position.coordinates}
                    onMoveEnd={setPosition}
                >
                    <Geographies geography={GEO_URL}>
                        {({ geographies }: { geographies: any[] }) =>
                            geographies.map((geo) => {
                                const countryCode = geo.properties.ISO_A3 || geo.id;
                                const isSelected = selectedCountry === countryCode;
                                const isHovered = hoveredCountry === countryCode;

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={getCountryColor(geo)}
                                        stroke="#334155"
                                        strokeWidth={isSelected ? 1.5 : 0.5}
                                        className={activeBattles.some((b: Battle) => {
                                            const code = geo.properties.ISO_A3 || geo.properties.iso_a3 || geo.id;
                                            return b.defender === code || b.defender === ISO_TO_ID[code];
                                        }) ? 'animate-pulse' : ''}
                                        style={{
                                            default: {
                                                outline: 'none',
                                                transition: 'all 0.2s',
                                            },
                                            hover: {
                                                fill: isSelected ? getCountryColor(geo) : '#60a5fa',
                                                outline: 'none',
                                                cursor: 'pointer',
                                            },
                                            pressed: {
                                                outline: 'none',
                                            },
                                        }}
                                        onClick={() => {
                                            setSelectedCountry(isSelected ? null : countryCode);
                                        }}
                                        onMouseEnter={() => {
                                            setHoveredCountry(geo.properties.name || countryCode);
                                        }}
                                        onMouseLeave={() => {
                                            setHoveredCountry(null);
                                        }}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>

            {/* Selected Country Panel */}
            <AnimatePresence>
                {selectedCountry && selectedInfo && (
                    <motion.div
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 300, opacity: 0 }}
                        className="absolute top-4 right-16 w-72 bg-slate-900/95 backdrop-blur-md rounded-xl overflow-hidden z-20 border border-slate-700 shadow-2xl"
                    >
                        {/* Header */}
                        <div
                            className="p-4 border-b border-slate-700"
                            style={{ background: `linear-gradient(135deg, ${selectedInfo.color}33, ${selectedInfo.color}11)` }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={selectedInfo.flag} alt={selectedInfo.name} className="w-8 h-5 object-cover rounded shadow-sm border border-white/10" />
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{selectedInfo.name}</h3>
                                </div>
                                <button
                                    onClick={() => setSelectedCountry(null)}
                                    className="text-slate-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="text-[10px] font-mono text-slate-500 mt-2 flex items-center gap-2">
                                <span className="px-1.5 py-0.5 bg-white/5 rounded">ISO: {selectedCountry}</span>
                                <span className="px-1.5 py-0.5 bg-white/5 rounded">ID: {selectedInfo.id}</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="p-4 space-y-3">
                            <StatRow icon={<Users size={14} />} label="Citizens" value={"15,420"} color="cyan" />
                            <StatRow icon={<Shield size={14} />} label="Defense" value={`90%`} color="emerald" />
                            <StatRow icon={<Coins size={14} />} label="Tax Rate" value="15%" color="amber" />
                            <StatRow icon={<Swords size={14} />} label="Active Wars" value={activeBattles.filter((b: Battle) => b.defender === selectedCountry || b.attacker === selectedCountry || b.defender === selectedInfo.id || b.attacker === selectedInfo.id).length.toString()} color="red" />
                        </div>

                        {/* Defense Bar */}
                        <div className="px-4 pb-4">
                            <div className="text-xs text-slate-400 mb-2">Territory Defense</div>
                            <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-green-600"
                                    initial={{ width: 0 }}
                                    animate={{ width: `90%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t border-slate-700 space-y-2">
                            {isLandless && (COUNTRY_IDS[selectedInfo.id as CountryId] !== user?.countryId) && (
                                <Button
                                    onClick={() => {
                                        setIsResistanceSelection(true);
                                        setShowRegionSelector(true);
                                    }}
                                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 gap-2 font-black uppercase text-xs"
                                >
                                    <Swords size={14} /> Start Resistance
                                </Button>
                            )}
                            <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 gap-2 font-black uppercase text-xs">
                                <Plane size={14} /> Travel Here
                            </Button>
                            {!isLandless && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        if (isConflictZone) {
                                            // Handle join battle
                                        } else {
                                            setIsResistanceSelection(false);
                                            setShowRegionSelector(true);
                                        }
                                    }}
                                    className={`w-full gap-2 font-black uppercase text-xs ${isConflictZone ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' : 'border-red-500/30 text-red-400 hover:bg-red-500/10'}`}
                                >
                                    <Swords size={14} /> {isConflictZone ? 'Join Battle' : 'Declare War'}
                                </Button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showRegionSelector && (
                    <RegionSelector
                        targetCountryId={COUNTRY_IDS[selectedInfo?.id as CountryId] || 0}
                        isResistance={isResistanceSelection}
                        onClose={() => setShowRegionSelector(false)}
                        onSelect={(id) => {
                            console.log("Selected target:", id);
                            setShowRegionSelector(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function StatRow({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
    const colorMap: Record<string, string> = {
        cyan: 'text-cyan-400 bg-cyan-500/10',
        emerald: 'text-emerald-400 bg-emerald-500/10',
        amber: 'text-amber-400 bg-amber-500/10',
        red: 'text-red-400 bg-red-500/10',
    };

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
                <span className={colorMap[color]}>{icon}</span>
                <span className="text-xs">{label}</span>
            </div>
            <span className={`text-sm font-bold ${colorMap[color].split(' ')[0]}`}>{value}</span>
        </div>
    );
}

export default memo(RealWorldMap);
