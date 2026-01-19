'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGameStore } from '@/lib/store';

export function useMarket() {
    const searchParams = useSearchParams();
    const { inventory, listMarketItem } = useGameStore();

    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(1);

    // Initial item selection from URL
    useEffect(() => {
        const preSelected = searchParams.get('item');
        if (preSelected && inventory.some(i => i.id === preSelected)) {
            setSelectedItemId(preSelected);
        }
    }, [searchParams, inventory]);

    const selectedItem = inventory.find(i => i.id === selectedItemId);

    const selectItem = useCallback((id: string) => {
        setSelectedItemId(id);
        setQuantity(1);
    }, []);

    const updateQuantity = useCallback((val: number) => {
        if (!selectedItem) return;
        const newQty = Math.max(1, Math.min(selectedItem.quantity, val));
        setQuantity(newQty);
    }, [selectedItem]);

    const updatePrice = useCallback((val: number) => {
        setPrice(Math.max(0.01, val));
    }, []);

    const handleListAction = async () => {
        if (!selectedItemId || !selectedItem) return;
        if (quantity > selectedItem.quantity) {
            throw new Error("Insufficient quantity in inventory!");
        }

        try {
            await listMarketItem(selectedItemId, quantity, price);
            setSelectedItemId(null);
            setQuantity(1);
            setPrice(1);
        } catch (e) {
            throw e;
        }
    };

    return {
        inventory,
        selectedItemId,
        selectedItem,
        form: {
            quantity,
            price
        },
        methods: {
            selectItem,
            updateQuantity,
            updatePrice,
            handleListAction
        }
    };
}
