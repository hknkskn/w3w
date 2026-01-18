'use client';

import { useState, memo, useCallback } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { Battle, CountryId, COUNTRY_CONFIG } from '@/lib/types';

// Import sub-components
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { CountryPanel } from './CountryPanel';
import { HoverTooltip } from './HoverTooltip';
import { GEO_URL, getCountryId, ISO_TO_ID, NUMERIC_TO_ID } from './config';

// Types
interface MapPosition {
    coordinates: [number, number];
    zoom: number;
}

export function WorldMapContainer() {
    const { activeBattles, alliances, user } = useGameStore();

    // Map state
    const [position, setPosition] = useState<MapPosition>({
        coordinates: [20, 30],
        zoom: 1.5
    });
    const [selectedCountry, setSelectedCountry] = useState<{ id: CountryId; numericCode: string } | null>(null);
    const [hoveredCountry, setHoveredCountry] = useState<{ name: string; isActive: boolean } | null>(null);

    // Zoom handlers
    const handleZoomIn = useCallback(() => {
        if (position.zoom >= 8) return;
        setPosition(pos => ({ ...pos, zoom: pos.zoom * 1.5 }));
    }, [position.zoom]);

    const handleZoomOut = useCallback(() => {
        if (position.zoom <= 1) return;
        setPosition(pos => ({ ...pos, zoom: pos.zoom / 1.5 }));
    }, [position.zoom]);

    const handleReset = useCallback(() => {
        setPosition({ coordinates: [20, 30], zoom: 1.5 });
    }, []);

    // Get country color based on state
    const getCountryColor = useCallback((geo: any) => {
        const countryId = getCountryId(geo);

        // 1. Active Battle Check - Red for countries at war
        if (countryId) {
            const hasBattle = activeBattles.some((b: Battle) =>
                b.defender === countryId || b.attacker === countryId
            );
            if (hasBattle) return '#ef4444';
        }

        // 2. Highlight selected country's allies - Cyan
        if (selectedCountry && countryId) {
            const isAlly = alliances.some((a: { a: CountryId, b: CountryId }) =>
                (a.a === selectedCountry.id && a.b === countryId) ||
                (a.b === selectedCountry.id && a.a === countryId)
            );
            if (isAlly) return '#22d3ee';
        }

        // 3. Active Country - Use country color
        if (countryId && COUNTRY_CONFIG[countryId]) {
            return COUNTRY_CONFIG[countryId].color;
        }

        // 4. Default for inactive regions
        return '#1e293b';
    }, [activeBattles, alliances, selectedCountry]);

    // Handle country click
    const handleCountryClick = useCallback((geo: any) => {
        const countryId = getCountryId(geo);
        if (countryId) {
            if (selectedCountry?.id === countryId) {
                setSelectedCountry(null);
            } else {
                setSelectedCountry({ id: countryId, numericCode: String(geo.id) });
            }
        }
    }, [selectedCountry]);

    // Handle country hover
    const handleCountryHover = useCallback((geo: any, isEnter: boolean) => {
        if (isEnter) {
            const countryId = getCountryId(geo);
            setHoveredCountry({
                name: geo.properties?.name || String(geo.id),
                isActive: countryId !== undefined
            });
        } else {
            setHoveredCountry(null);
        }
    }, []);

    return (
        <div className="relative w-full h-[650px] bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl">
            {/* Map Controls */}
            <MapControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onReset={handleReset}
                className="absolute top-4 right-4 z-20"
            />

            {/* Legend */}
            <MapLegend className="absolute bottom-4 left-4 z-20" />

            {/* Hover Tooltip */}
            <HoverTooltip
                countryName={hoveredCountry?.name || null}
                isActive={hoveredCountry?.isActive || false}
                visible={!!hoveredCountry && !selectedCountry}
            />

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
                                const countryId = getCountryId(geo);
                                const isSelected = selectedCountry?.id === countryId;

                                return (
                                    <Geography
                                        key={geo.rsmKey}
                                        geography={geo}
                                        fill={getCountryColor(geo)}
                                        stroke="#334155"
                                        strokeWidth={isSelected ? 1.5 : 0.5}
                                        className={activeBattles.some((b: Battle) =>
                                            b.defender === countryId || b.attacker === countryId
                                        ) ? 'animate-pulse' : ''}
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
                                        onClick={() => handleCountryClick(geo)}
                                        onMouseEnter={() => handleCountryHover(geo, true)}
                                        onMouseLeave={() => handleCountryHover(geo, false)}
                                    />
                                );
                            })
                        }
                    </Geographies>
                </ZoomableGroup>
            </ComposableMap>

            {/* Selected Country Panel */}
            <AnimatePresence>
                {selectedCountry && (
                    <div className="absolute top-4 right-16 z-20">
                        <CountryPanel
                            countryId={selectedCountry.id}
                            numericCode={selectedCountry.numericCode}
                            activeBattles={activeBattles}
                            onClose={() => setSelectedCountry(null)}
                            onTravel={() => console.log('Travel to', selectedCountry.id)}
                            onDeclareWar={() => console.log('Declare war on', selectedCountry.id)}
                        />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default memo(WorldMapContainer);
