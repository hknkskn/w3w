import { BaseService, WE3WAR_MODULES, parseMoveString } from './base.service';
import { BCS } from 'supra-l1-sdk';

export const SocialService = {
    createNewspaper: async (name: string, countryId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.NEWSPAPER.split('::')[0],
            WE3WAR_MODULES.NEWSPAPER.split('::')[1],
            "create_newspaper",
            [],
            [
                Array.from(BCS.bcsSerializeStr(name)),
                Array.from(BCS.bcsSerializeUint64(countryId))
            ]
        );
    },

    publishArticle: async (newspaperId: number, title: string, content: string): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.NEWSPAPER.split('::')[0],
            WE3WAR_MODULES.NEWSPAPER.split('::')[1],
            "publish_article",
            [],
            [
                Array.from(BCS.bcsSerializeUint64(newspaperId)),
                Array.from(BCS.bcsSerializeStr(title)),
                Array.from(BCS.bcsSerializeStr(content))
            ]
        );
    },

    endorseArticle: async (articleId: number): Promise<string> => {
        return await BaseService.sendTransaction(
            WE3WAR_MODULES.NEWSPAPER.split('::')[0],
            WE3WAR_MODULES.NEWSPAPER.split('::')[1],
            "endorse",
            [],
            [Array.from(BCS.bcsSerializeUint64(articleId))]
        );
    },

    getAllNewspapers: async () => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.NEWSPAPER}::get_all_newspapers`, [], []);
            return result?.result?.[0] || result?.[0] || [];
        } catch (e) {
            return [];
        }
    },

    getNewspaperArticles: async (newspaperId: number) => {
        try {
            const result = await BaseService.view(`${WE3WAR_MODULES.NEWSPAPER}::get_articles`, [], [newspaperId]);
            return result?.result?.[0] || result?.[0] || [];
        } catch (e) {
            return [];
        }
    }
};
