import { BCS } from 'supra-l1-sdk';
import { WE3WAR_MODULES } from '../chain-config';

// --- Constants ---
export const RPC_URL = "https://rpc-testnet.supra.com";

export { WE3WAR_MODULES };


// --- Utils ---

export const parseMoveString = (value: any) => {
    if (typeof value === 'string') {
        if (value.startsWith('0x')) {
            const hex = value.slice(2);
            let str = '';
            for (let i = 0; i < hex.length; i += 2) {
                str += String.fromCharCode(parseInt(hex.substring(i, i + 2), 16));
            }
            return str;
        }
        return value;
    }
    if (Array.isArray(value)) {
        return String.fromCharCode(...value);
    }
    return '';
};

export const hexToUint8Array = (hex: string): number[] => {
    if (typeof hex !== 'string') return [];
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    const bytes = [];
    for (let i = 0; i < cleanHex.length; i += 2) {
        bytes.push(parseInt(cleanHex.substring(i, i + 2), 16));
    }
    return bytes;
};

// --- Base Service ---

export const BaseService = {
    getProvider: () => {
        if (typeof window !== 'undefined' && window.starkey) {
            return window.starkey;
        }
        return null;
    },

    getAccount: async () => {
        const provider = BaseService.getProvider();
        if (!provider) throw new Error("Wallet not found");
        const accounts = await provider.supra.account();
        if (!accounts || accounts.length === 0) throw new Error("No account connected");
        return { provider, account: accounts[0] };
    },

    /**
     * Helper to send a transaction
     * Note: Sequence number is now managed by the wallet SDK internally
     * to avoid TOO_OLD/TOO_NEW race conditions with RPC.
     */
    sendTransaction: async (
        moduleAddress: string,
        moduleName: string,
        functionName: string,
        typeArgs: any[],
        args: any[]
    ): Promise<string> => {
        const { provider, account } = await BaseService.getAccount();
        const chainIdObject = await provider.supra.getChainId();
        const chainId = (chainIdObject as any).chainId || chainIdObject;

        // Let the wallet SDK handle sequence number internally
        // This avoids the TOO_OLD/TOO_NEW race conditions with stale RPC data
        const rawTxPayload = [
            account,
            0, // Placeholder - StarKey SDK will override this with correct value
            moduleAddress,
            moduleName,
            functionName,
            typeArgs,
            args,
            { txExpiryTime: Math.floor(Date.now() / 1000) + 60 } // 60 seconds, short timeout for faster retries
        ];

        console.log(`[BaseService] Sending TX: ${moduleName}::${functionName}`, rawTxPayload);

        const data = await provider.supra.createRawTransactionData(rawTxPayload);
        if (!data) throw new Error("Failed to create raw transaction data");

        return await provider.supra.sendTransaction({
            data,
            from: account,
            to: moduleAddress,
            chainId,
            value: ""
        });
    },

    /**
     * Helper for VIEW functions
     */
    view: async (functionFullname: string, typeArgs: any[] = [], args: any[] = []) => {
        try {
            const response = await fetch(`${RPC_URL}/rpc/v1/view`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    function: functionFullname,
                    type_arguments: typeArgs,
                    arguments: args
                })
            });

            const result = await response.json();
            return result?.result || result; // Handle variable RPC formats
        } catch (e) {
            console.error(`View call failed for ${functionFullname}:`, e);
            throw e;
        }
    }
};
