import { create } from 'zustand';
import { UserSlice, createUserSlice } from './slices/userSlice';
import { InventorySlice, createInventorySlice } from './slices/inventorySlice';
import { CompanySlice, createCompanySlice } from './slices/companySlice';
import { MarketSlice, createMarketSlice } from './slices/marketSlice';
import { BattleSlice, createBattleSlice } from './slices/battleSlice';
import { GovernanceSlice, createGovernanceSlice } from './slices/governanceSlice';

export type GameState = UserSlice & InventorySlice & CompanySlice & MarketSlice & BattleSlice & GovernanceSlice;

export const useGameStore = create<GameState>((...a) => ({
    ...createUserSlice(...a),
    ...createInventorySlice(...a),
    ...createCompanySlice(...a),
    ...createMarketSlice(...a),
    ...createBattleSlice(...a),
    ...createGovernanceSlice(...a),
}));
