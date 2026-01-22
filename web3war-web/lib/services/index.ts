export * from './base.service';
export * from './citizen.service';
export * from './company.service';
export * from './market.service';
export * from './battle.service';
export * from './politics.service';
export * from './social.service';
export * from './admin.service';
export * from './game_treasury.service';
export * from './territory.service';

import { CitizenService } from './citizen.service';
import { CompanyService } from './company.service';
import { MarketService } from './market.service';
import { BattleService } from './battle.service';
import { PoliticsService } from './politics.service';
import { SocialService } from './social.service';
import { AdminService } from './admin.service';
import { GameTreasuryService } from './game_treasury.service';
import { TerritoryService } from './territory.service';
import { BaseService } from './base.service';

// Unified Service for backwards compatibility
export const ContractService = {
    ...BaseService,
    ...CitizenService,
    ...CompanyService,
    ...MarketService,
    ...BattleService,
    ...PoliticsService,
    ...SocialService,
    ...AdminService,
    ...GameTreasuryService,
    ...TerritoryService
};
