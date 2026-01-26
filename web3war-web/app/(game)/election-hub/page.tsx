'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { ElectionHub } from '../politics/ElectionHub';
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRY_CONFIG, COUNTRY_IDS, CountryId, getCountryKey } from '@/lib/types';
import { CitizenService } from '@/lib/services/citizen.service';

export default function ElectionHubPage() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const {
        user,
        countryData,
        electionCandidates,
        fetchCountryData,
        fetchCandidates,
        fetchCongressElectionData,
        fetchCountryGovernance,
        fetchClaimableSalary,
        fetchCooldowns
    } = useGameStore();

    const [addressNames, setAddressNames] = useState<Record<string, string>>({});

    const countryId = user?.countryId || 1;
    const countryKey = getCountryKey(countryId);
    const currentCountryData = countryData[countryId] || null;
    const candidates = electionCandidates[countryId!] || [];

    const resolveAddress = async (address: string) => {
        if (!address || addressNames[address]) return;
        try {
            const profile = await CitizenService.getProfile(address);
            if (profile?.username) {
                setAddressNames(prev => ({ ...prev, [address]: profile.username }));
            }
        } catch (e) {
            console.error("Resolve failed:", e);
        }
    };

    const loadData = async () => {
        if (!countryId) return;
        try {
            await Promise.all([
                fetchCountryData(countryId),
                fetchCandidates(countryId),
                fetchCongressElectionData(countryId),
                fetchCountryGovernance(countryId),
                fetchCooldowns(countryId)
            ]);

            // Try to resolve candidates names
            candidates.forEach(c => resolveAddress(c.address));
            if (currentCountryData?.president) resolveAddress(currentCountryData.president);
        } catch (e) {
            console.error("Failed to load election data:", e);
        }
    };

    useEffect(() => {
        if (isMounted && countryId) {
            loadData();
            const interval = setInterval(loadData, 10000); // Poll every 10s for live results
            return () => clearInterval(interval);
        }
    }, [isMounted, countryId]);

    if (!isMounted) return null;

    return (
        <div className="space-y-8 pb-12">
            <ElectionHub
                countryId={countryId}
                currentCountryData={currentCountryData}
                candidates={candidates}
                addressNames={addressNames}
                resolveAddress={resolveAddress}
            />
        </div>
    );
}
