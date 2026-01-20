'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGameStore } from '@/lib/store';

export function useTraining() {
    const {
        user,
        facilities,
        train,
        fetchTraining,
        upgradeTrainingGrounds
    } = useGameStore();

    const [selectedIds, setSelectedIds] = useState<number[]>([0]);
    const [isTraining, setIsTraining] = useState(false);
    const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

    useEffect(() => {
        fetchTraining();

        const interval = setInterval(() => {
            setCurrentTime(Math.floor(Date.now() / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [fetchTraining]);

    const toggleRegimen = useCallback((id: number) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    }, []);

    const getRegimenData = useCallback((id: number) => {
        return facilities.find(f => f.id === id);
    }, [facilities]);

    // Totals
    const totalCost = useMemo(() =>
        user?.isAdmin ? 0 : selectedIds.reduce((sum, id) => {
            const f = getRegimenData(id);
            return sum + (f?.dailyCostCred || 0);
        }, 0),
        [selectedIds, user?.isAdmin, getRegimenData]);

    const totalEnergy = useMemo(() =>
        user?.isAdmin ? 0 : selectedIds.reduce((sum, id) => {
            const f = getRegimenData(id);
            const energyCost = id === 0 ? (5 + (user?.level || 0)) : (f?.baseEnergy || 0);
            return sum + energyCost;
        }, 0),
        [selectedIds, user?.level, user?.isAdmin, getRegimenData]);

    const totalStrength = useMemo(() =>
        selectedIds.reduce((sum, id) => {
            const f = getRegimenData(id);
            return sum + (f?.currentStrengthGain || 0);
        }, 0),
        [selectedIds, getRegimenData]);

    // Cooldown - This logic would eventually move to a service/model too
    // For now keeping it here as it depends on store facilities which might need lastTrainTime
    // Actually, let's keep it simple for now as we don't have lastTrainTime in the mock TrainingFacility yet.
    // I should probably add it to TrainingFacility if needed for per-facility cooldowns,
    // but the current contract has a global cooldown.

    // For now, let's assume a global cooldown for simplicity until we refine the model further.
    // In Phase 1, we focus on normalizing the structures we have.

    // Placeholder for global cooldown (if we had it in the model)
    const cooldownActive = false;

    const handleTrainAction = async () => {
        if (selectedIds.length === 0 || isTraining) return;

        const regimensToProcess = selectedIds.map(id => {
            const f = getRegimenData(id);
            return {
                id,
                cost: f?.dailyCostCred || 0,
                strengthBonus: f?.currentStrengthGain || 0,
                energyCost: id === 0 ? (5 + (user?.level || 0)) : (f?.baseEnergy || 1)
            };
        });

        if (user && user.energy < totalEnergy) {
            throw new Error("Not enough energy!");
        }
        if (user && user.credits < totalCost) {
            throw new Error("Not enough CRED!");
        }

        setIsTraining(true);
        try {
            await train(regimensToProcess);
            setTimeout(() => setIsTraining(false), 1500);
        } catch (e) {
            setIsTraining(false);
            throw e;
        }
    };

    const handleUpgradeAction = async (id: number) => {
        const f = getRegimenData(id);
        console.log(`[DEBUG] handleUpgradeAction called with id=${id}`, f);

        if (!f) {
            console.error('[handleUpgradeAction] Facility not found for id:', id);
            return;
        }
        if (f.isMaxLevel) {
            console.warn('[handleUpgradeAction] Facility is already at max level');
            return;
        }
        if (f.upgradeCostSupra === null) {
            console.warn('[handleUpgradeAction] No upgrade cost available (null)');
            return;
        }

        console.log(`[DEBUG] Calling upgradeTrainingGrounds(${id})...`);
        await upgradeTrainingGrounds(id);
    };

    return {
        user,
        facilities,
        selectedIds,
        isTraining,
        cooldownActive,
        timeRemaining: { h: 0, m: 0, s: 0 }, // Global cooldown handling will be Phase 2 refinement
        totals: {
            cost: totalCost,
            energy: totalEnergy,
            strength: totalStrength
        },
        methods: {
            toggleRegimen,
            getRegimenCost: (id: number) => getRegimenData(id)?.dailyCostCred || 0,
            getRegimenStrength: (id: number) => getRegimenData(id)?.currentStrengthGain || 0,
            handleTrainAction,
            handleUpgradeAction
        }
    };
}
