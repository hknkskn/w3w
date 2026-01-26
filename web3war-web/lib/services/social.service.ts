import { BaseService, WE3WAR_MODULES, parseMoveString } from './base.service';
import { BCS } from 'supra-l1-sdk';

export const SocialService = {
    // --- Newspaper Functions ---
    createNewspaper: async (name: string): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.NEWSPAPER.split('::')[0],
            WE3WAR_MODULES.NEWSPAPER.split('::')[1],
            "create_newspaper",
            [],
            [Array.from(BCS.bcsSerializeStr(name))]
        );
    },

    publishArticle: async (title: string, contentHash: string): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.NEWSPAPER.split('::')[0],
            WE3WAR_MODULES.NEWSPAPER.split('::')[1],
            "publish_article",
            [],
            [
                Array.from(BCS.bcsSerializeStr(title)),
                Array.from(BCS.bcsSerializeStr(contentHash))
            ]
        );
    },

    endorseArticle: async (newspaperAddr: string, articleId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.NEWSPAPER.split('::')[0],
            WE3WAR_MODULES.NEWSPAPER.split('::')[1],
            "endorse_article",
            [],
            [
                Array.from(BCS.bcsSerializeUint8(0)), // Placeholder if needed by sdk
                Array.from(BCS.bcsSerializeUint64(BigInt(articleId)))
            ]
        );
    },

    // --- Shout Functions ---
    shout: async (content: string): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.SOCIAL.split('::')[0],
            WE3WAR_MODULES.SOCIAL.split('::')[1],
            "shout",
            [],
            [Array.from(BCS.bcsSerializeStr(content))]
        );
    },

    getGlobalShouts: async () => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.SOCIAL}::get_global_shouts`, [], []);
            return result?.[0] || [];
        } catch (e) {
            return [];
        }
    },

    getLocalShouts: async (countryId: number) => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.SOCIAL}::get_local_shouts`, [], [countryId]);
            return result?.[0] || [];
        } catch (e) {
            return [];
        }
    },

    // --- View Functions ---
    getAllNewspapers: async () => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.NEWSPAPER}::get_all_newspapers`, [], []);
            return result?.[0] || [];
        } catch (e) {
            return [];
        }
    },

    getNewspaperInfo: async (ownerAddr: string) => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.NEWSPAPER}::get_newspaper_info`, [], [ownerAddr]);
            if (!result) return null;
            return {
                name: parseMoveString(result[0]),
                subscribers: Number(result[1]),
                articleCount: Number(result[2])
            };
        } catch (e) {
            return null;
        }
    },

    getNewspaperArticles: async (ownerAddr: string) => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.NEWSPAPER}::get_articles`, [], [ownerAddr]);
            return result?.[0] || [];
        } catch (e) {
            return [];
        }
    }
};
