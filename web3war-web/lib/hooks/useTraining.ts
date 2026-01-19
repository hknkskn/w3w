'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGameStore } from '@/lib/store';

export const REGIMEN_DATA = [
    {
        id: 0,
        name: 'Basic Training',
        image: '⛺',
        baseStrength: 1.0,
        baseEnergy: 5,
    },
    {
        id: 1,
        name: 'Military Academy',
        image: '🏫',
        baseStrength: 2.5,
        baseEnergy: 1,
    },
    {
        id: 2,
        name: 'Special Forces',
        image: '🏰',
        baseStrength: 5.0,
        baseEnergy: 1,
    },
    {
        id: 3,
        name: 'Top Secret Program',
        image: '💎',
        baseStrength: 10.0,
        baseEnergy: 1,
    }
];

export function useTraining() {
    const {
        user,
        train,
        trainingInfo,
        trainingPricing,
        fetchTraining,
        fetchTrainingPricing,
        upgradeTrainingGrounds
    } = useGameStore();

    const [selectedIds, setSelectedIds] = useState<number[]>([0]);
    const [isTraining, setIsTraining] = useState(false);
    const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

    useEffect(() => {
        fetchTraining();
        fetchTrainingPricing();

        const interval = setInterval(() => {
            setCurrentTime(Math.floor(Date.now() / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [fetchTraining, fetchTrainingPricing]);

    const toggleRegimen = useCallback((id: number) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    }, []);

    const getRegimenCost = useCallback((id: number) => {
        if (id === 0) return 0;
        if (!trainingPricing) return 0;
        return trainingPricing.regimenCosts[id - 1] / 100;
    }, [trainingPricing]);

    const getRegimenStrength = useCallback((id: number) => {
        const item = REGIMEN_DATA.find(r => r.id === id);
        const quality = Number(trainingInfo?.qualities[id] || 1);
        if (isNaN(quality)) return item?.baseStrength || 1.0;
        return (item?.baseStrength || 0) * quality;
    }, [trainingInfo]);

    // Totals
    const totalCost = useMemo(() =>
        user?.isAdmin ? 0 : selectedIds.reduce((sum, id) => sum + getRegimenCost(id), 0),
        [selectedIds, user?.isAdmin, getRegimenCost]);

    const totalEnergy = useMemo(() =>
        user?.isAdmin ? 0 : selectedIds.reduce((sum, id) => {
            const item = REGIMEN_DATA.find(r => r.id === id);
            const energyCost = id === 0 ? (5 + (user?.level || 0)) : (item?.baseEnergy || 0);
            return sum + energyCost;
        }, 0),
        [selectedIds, user?.level, user?.isAdmin]);

    const totalStrength = useMemo(() =>
        selectedIds.reduce((sum, id) => {
            const val = getRegimenStrength(id);
            return sum + (isNaN(val) ? 0 : val);
        }, 0),
        [selectedIds, getRegimenStrength]);

    // Cooldown
    const lastTrain = Number(trainingInfo?.lastTrainTime || 0);
    const cooldownActive = !user?.isAdmin && lastTrain > 0 && currentTime < lastTrain + 86400;
    const timeRemaining = Math.max(0, (lastTrain + 86400) - currentTime);

    const hoursRemaining = Math.floor(timeRemaining / 3600);
    const minutesRemaining = Math.floor((timeRemaining % 3600) / 60);
    const secondsRemaining = timeRemaining % 60;

    const handleTrainAction = async () => {
        if (selectedIds.length === 0 || cooldownActive) return;

        const regimensToProcess = selectedIds.map(id => ({
            id,
            cost: getRegimenCost(id),
            strengthBonus: getRegimenStrength(id),
            energyCost: id === 0 ? (5 + (user?.level || 0)) : (REGIMEN_DATA.find(r => r.id === id)?.baseEnergy || 1)
        }));

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
        const quality = trainingInfo?.qualities[id] || 1;
        if (quality >= 5) return;

        const upgradeCost = trainingPricing?.upgradeCosts[quality - 1] || 250000000000;
        const supraCost = upgradeCost / 100000000;

        if (confirm(`Upgrade this facility to Q${quality + 1} for ${supraCost.toLocaleString()} SUPRA?`)) {
            await upgradeTrainingGrounds(id);
        }
    };

    return {
        user,
        trainingInfo,
        trainingPricing,
        selectedIds,
        isTraining,
        cooldownActive,
        timeRemaining: {
            h: hoursRemaining,
            m: minutesRemaining,
            s: secondsRemaining
        },
        totals: {
            cost: totalCost,
            energy: totalEnergy,
            strength: totalStrength
        },
        methods: {
            toggleRegimen,
            getRegimenCost,
            getRegimenStrength,
            handleTrainAction,
            handleUpgradeAction
        }
    };
}
